import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get cart items from the database
    const cart = await prisma.cart.findUnique({
      where: {
        userId_type: {
          userId: session.user.id, // Use session user ID directly
          type: "CART",
        },
      },
      include: {
        items: {
          include: {
            preset: true,
            pack: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Format line items for Stripe
    const lineItems = cart.items.map((item) => {
      const product = item.preset || item.pack;
      if (!product) throw new Error("Invalid item in cart");

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title,
            description: product.description || undefined,
            metadata: {
              presetId: product.id,
            },
          },
          unit_amount: Math.round(Number(product.price) * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email || undefined, // Use email from session
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        cartId: cart.id,
        userId: session.user.id, // Use session user ID
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
