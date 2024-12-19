import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { createPaymentIntent } from "@/app/services/stripe";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get cart items with creator info
    const cart = await prisma.cart.findUnique({
      where: {
        userId_type: {
          userId: session.user.id,
          type: "CART",
        },
      },
      include: {
        items: {
          include: {
            preset: {
              include: {
                user: {
                  select: {
                    username: true,
                    stripeAccountId: true,
                  }
                },
              },
            },
            pack: {
              include: {
                user: {
                  select: {
                    username: true,
                    stripeAccountId: true,
                  }
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Check if all creators have Stripe accounts
    const creators = cart.items.map(item => item.preset?.user || item.pack?.user);
    const unconnectedCreators = creators.filter(creator => !creator?.stripeAccountId);
    
    if (unconnectedCreators.length > 0) {
      console.log("Unconnected creators:", unconnectedCreators.map(c => ({
        username: c?.username,
        id: c?.id
      })));
      
      return NextResponse.json({ 
        error: "Some creators haven't connected their Stripe accounts yet",
        unconnectedCreators: unconnectedCreators.map(c => c?.username || 'Unknown creator'),
        actionRequired: "CONNECT_STRIPE",
        settingsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
      }, { status: 400 });
    }

    // Group items by creator
    const itemsByCreator = cart.items.reduce((acc, item) => {
      const creator = item.preset?.user || item.pack?.user;
      const amount = item.preset?.price || item.pack?.price || 0;
      
      if (creator) {
        if (!acc[creator.id]) {
          acc[creator.id] = { items: [], total: 0 };
        }
        acc[creator.id].items.push(item);
        acc[creator.id].total += Number(amount) * 100; // Convert to cents
      }
      return acc;
    }, {} as Record<string, { items: any[], total: number }>);

    // Calculate total amount
    const total = cart.items.reduce((sum, item) => {
      const amount = item.preset?.price || item.pack?.price || 0;
      return sum + Math.round(Number(amount) * 100);
    }, 0);

    // Get first item's user (creator)
    const firstItem = cart.items[0];
    const user = firstItem.preset?.user || firstItem.pack?.user;
    
    if (!user?.stripeAccountId) {
      return NextResponse.json({ error: "Creator not connected to Stripe" }, { status: 400 });
    }

    // Create Stripe Checkout session with multiple payment intents
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: cart.items.map(item => {
        const product = item.preset || item.pack;
        const creator = item.preset?.user || item.pack?.user;
        
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product?.title || "",
              description: product?.description || undefined,
            },
            unit_amount: Math.round(Number(product?.price) * 100),
          },
          quantity: 1,
        };
      }),
      payment_intent_data: {
        application_fee_amount: Math.round(total * 0.3), // 30% platform fee
        transfer_data: {
          destination: creator.stripeAccountId,
        },
        on_behalf_of: creator.stripeAccountId, // Makes the connected account the merchant of record
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        cartId: cart.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
