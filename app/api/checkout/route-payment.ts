import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { lemonSqueezy } from "@/lib/lemonsqueezy";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { Cart, CartItem, Pack, Preset } from "@prisma/client";

type CartItemWithDetails = CartItem & {
  preset?: (Preset & {
    user: {
      id: string;
      stripeAccountId: string | null;
      lemonSqueezyStoreId: string | null;
    };
  }) | null;
  pack?: (Pack & {
    user: {
      id: string;
      stripeAccountId: string | null;
      lemonSqueezyStoreId: string | null;
    };
  }) | null;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId_type: {
          userId: session.user.id,
          type: "CART"
        }
      },
      include: {
        items: {
          include: {
            preset: {
              include: {
                user: {
                  select: {
                    id: true,
                    stripeAccountId: true,
                    lemonSqueezyStoreId: true
                  }
                }
              }
            },
            pack: {
              include: {
                user: {
                  select: {
                    id: true,
                    stripeAccountId: true,
                    lemonSqueezyStoreId: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    const seller = cart.items[0].preset?.user || cart.items[0].pack?.user;
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 400 });
    }

    // Check which payment processor is configured
    if (seller.lemonSqueezyStoreId && typeof seller.lemonSqueezyStoreId === 'string') {
      const checkout = await createLemonSqueezyCheckout(
        { lemonSqueezyStoreId: seller.lemonSqueezyStoreId },
        cart.items as CartItemWithDetails[],
        cart,
        session.user.id
      );
      return NextResponse.json({ url: checkout.data.attributes.url });
    } else if (seller.stripeAccountId && typeof seller.stripeAccountId === 'string') {
      const checkout = await createStripeCheckout(
        { stripeAccountId: seller.stripeAccountId },
        cart.items as CartItemWithDetails[],
        cart,
        session.user.id
      );
      return NextResponse.json({ url: checkout.url });
    }

    return NextResponse.json({ 
      error: "Seller has not configured any payment processor" 
    }, { status: 400 });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
async function createLemonSqueezyCheckout(
  seller: { lemonSqueezyStoreId: string },
  items: CartItemWithDetails[],
  cart: Cart,
  userId: string
) {
  // Validate required environment variables
  if (!process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID) {
    throw new Error("LemonSqueezy store ID not configured");
  }
  if (!process.env.NEXT_PUBLIC_LEMONSQUEEZY_TEMPLATE_VARIANT_ID) {
    throw new Error("LemonSqueezy template variant ID not configured");
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("App URL not configured");
  }

  // Calculate total in cents, or use minimum price if total is 0
  const totalAmount = items.reduce((sum, item) => {
    const price = item.preset?.price || item.pack?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Get the first item for the main product details
  const firstItem = items[0];
  const productName = firstItem.preset?.title || firstItem.pack?.title || 'Wave Park Preset';

  try {
    const checkout = await lemonSqueezy.createCheckout({
      storeId: seller.lemonSqueezyStoreId, // Each seller uses their own store ID from the database
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_TEMPLATE_VARIANT_ID,
      custom: {
        cartId: cart.id,
        userId: userId,
        items: items.map(item => ({
          id: item.id,
          type: item.itemType,
          price: item.preset?.price || item.pack?.price || 0,
          quantity: item.quantity,
          name: item.preset?.title || item.pack?.title
        }))
      },
      checkoutData: {
        custom_price: Math.max(Math.round(totalAmount * 100), 0), // Allow $0 minimum
        product_options: {
          name: items.length > 1 
            ? `${items.length} items from Wave Park (Pay What You Want)` 
            : `${productName} (Pay What You Want)`,
          description: `Support the creator! Suggested price: $${totalAmount.toFixed(2)}\n\n${
            items.map(item => 
              `${item.preset?.title || item.pack?.title || 'Preset'} ${
                item.quantity > 1 ? `(x${item.quantity})` : ''
              }`
            ).join('\n')
          }`
        }
      },
      checkoutOptions: {
        dark: true,
        media: false,
        enableCustomPrice: true,
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    });

    if (!checkout?.data?.attributes?.url) {
      throw new Error("Failed to create LemonSqueezy checkout");
    }

    return checkout;
  } catch (error) {
    console.error("LemonSqueezy checkout error:", error);
    throw error;
  }
}

async function createStripeCheckout(
  seller: { stripeAccountId: string },
  items: CartItemWithDetails[],
  cart: Cart,
  userId: string
) {
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.preset?.title || item.pack?.title || 'Unknown Product',
      },
      unit_amount: (item.preset?.price || item.pack?.price || 0) * 100,
    },
    quantity: item.quantity,
  }));

  const checkoutOptions = {
    mode: 'payment' as const,
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    metadata: {
      cartId: cart.id,
      userId: userId,
    },
  };

  // Only add payment_intent_data if the seller has a connected account
  try {
    const account = await stripe.accounts.retrieve(seller.stripeAccountId);
    if (account.capabilities?.transfers === 'active') {
      Object.assign(checkoutOptions, {
        payment_intent_data: {
          application_fee_amount: Math.round(calculateTotal(items) * 0.3 * 100),
          transfer_data: {
            destination: seller.stripeAccountId,
          },
        },
      });
    }
  } catch (error) {
    console.error('Error checking Stripe account capabilities:', error);
  }

  return await stripe.checkout.sessions.create(checkoutOptions);
}

function calculateTotal(items: CartItemWithDetails[]): number {
  return items.reduce((sum, item) => {
    return sum + (item.preset?.price || item.pack?.price || 0) * item.quantity;
  }, 0);
}

