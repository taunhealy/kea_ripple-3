import prisma from "@/lib/prisma";
import { Cart, CartItem, PriceType } from "@prisma/client";
import { stripe } from "@/lib/stripe";
import { lemonSqueezy } from "@/lib/lemonsqueezy";

type CartItemWithDetails = CartItem & {
  preset?: {
    id: string;
    title: string;
    priceType: PriceType;
    price: number;
    user: {
      id: string;
      stripeAccountId: string | null;
      lemonSqueezyStoreId: string | null;
    };
  } | null;
  pack?: {
    id: string;
    title: string;
    price: number;
    user: {
      id: string;
      stripeAccountId: string | null;
      lemonSqueezyStoreId: string | null;
    };
  } | null;
};

export async function createCheckout(
  cart: Cart & { items: CartItemWithDetails[] },
  userId: string
) {
  // Check if all items are free
  const allItemsFree = cart.items.every(
    item => item.preset?.priceType === PriceType.FREE || item.pack?.price === 0
  );

  if (allItemsFree) {
    return await handleFreeCheckout(cart, userId);
  }

  // Get the seller from the first paid item
  const firstPaidItem = cart.items.find(
    item => item.preset?.priceType === PriceType.PREMIUM || item.pack?.price! > 0
  );
  const seller = firstPaidItem?.preset?.user || firstPaidItem?.pack?.user;

  if (!seller) {
    throw new Error("No seller found for paid items");
  }

  // Handle paid checkout based on seller's payment processor
  if (seller.lemonSqueezyStoreId) {
    return await createLemonSqueezyCheckout(seller, cart.items, cart, userId);
  } else if (seller.stripeAccountId) {
    return await createStripeCheckout(seller, cart.items, cart, userId);
  }

  throw new Error("Seller has not configured any payment processor");
}

async function handleFreeCheckout(
  cart: Cart & { items: CartItemWithDetails[] },
  userId: string
) {
  return await prisma.$transaction(async (tx) => {
    // Create downloads using upsert to handle existing records
    const downloads = await Promise.all(
      cart.items.map(async (item) => {
        if (item.preset?.id) {
          return tx.presetDownload.upsert({
            where: {
              userId_presetId: {
                userId,
                presetId: item.preset.id,
              },
            },
            update: {}, // No updates needed if it exists
            create: {
              userId,
              presetId: item.preset.id,
              amount: 0,
            },
          });
        } else if (item.pack?.id) {
          return tx.presetPackDownload.upsert({
            where: {
              userId_packId: {
                userId,
                packId: item.pack.id,
              },
            },
            update: {}, // No updates needed if it exists
            create: {
              userId,
              packId: item.pack.id,
              amount: 0,
            },
          });
        }
        return null;
      })
    );

    // Clear the cart within the same transaction
    await tx.cart.delete({
      where: {
        id: cart.id
      }
    });

    return {
      url: `/dashboard/downloads`,
      downloads
    };
  });
}

async function createLemonSqueezyCheckout(
  seller: CartItemWithDetails["preset"]["user"],
  items: CartItemWithDetails[],
  cart: Cart,
  userId: string
) {
  if (!seller.lemonSqueezyStoreId) {
    throw new Error("Seller has not configured LemonSqueezy");
  }

  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.preset?.price || item.pack?.price || 0);
  }, 0);

  const checkout = await lemonSqueezy.createCheckout({
    storeId: seller.lemonSqueezyStoreId,
    variantId: process.env.LEMON_SQUEEZY_VARIANT_ID!,
    customPrice: totalAmount,
    checkoutData: {
      custom: {
        cartId: cart.id,
        userId: userId
      }
    }
  });

  return { url: checkout.url };
}

async function createStripeCheckout(
  seller: CartItemWithDetails["preset"]["user"],
  items: CartItemWithDetails[],
  cart: Cart,
  userId: string
) {
  if (!seller.stripeAccountId) {
    throw new Error("Seller has not configured Stripe");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.preset?.title || item.pack?.title || "Unknown Item",
        },
        unit_amount: Math.round((item.preset?.price || item.pack?.price || 0) * 100),
      },
      quantity: 1,
    })),
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    metadata: {
      cartId: cart.id,
      userId: userId
    },
    application_fee_amount: 0, // Set your fee here
    stripe_account: seller.stripeAccountId,
  });

  return { url: session.url! };
}

export async function processSuccessfulCheckout(
  sessionId: string,
  userId: string,
  cartId: string
) {
  return await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { cartId },
      include: { preset: true, pack: true },
    });

    // Create downloads using upsert to handle existing records
    const downloads = await Promise.all(
      cartItems.map(async (item) => {
        if (item.itemType === "PRESET" && item.presetId) {
          return tx.presetDownload.upsert({
            where: {
              userId_presetId: {
                userId,
                presetId: item.presetId,
              },
            },
            update: {}, // No updates needed if it exists
            create: {
              userId,
              presetId: item.presetId,
              amount: item.preset?.price || 0,
            },
          });
        } else if (item.itemType === "PACK" && item.packId) {
          return tx.presetPackDownload.upsert({
            where: {
              userId_packId: {
                userId,
                packId: item.packId,
              },
            },
            update: {}, // No updates needed if it exists
            create: {
              userId,
              packId: item.packId,
              amount: item.pack?.price || 0,
            },
          });
        }
        return null;
      })
    );

    // Cleanup cart
    await tx.cartItem.deleteMany({ where: { cartId } });
    await tx.cart.delete({ where: { id: cartId } });

    return downloads;
  });
}
