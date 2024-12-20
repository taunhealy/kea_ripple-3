import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log the current user and Stripe setup
    console.log("Creating Connect account for user:", session.user.id);
    console.log("Stripe API Key configured:", !!process.env.STRIPE_API_KEY);

    // Create Stripe Connect account link
    const accountLink = await stripe.accountLinks.create({
      account: session.user.stripeAccountId || await createStripeAccount(session.user.id),
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Connect error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });
    
    return NextResponse.json(
      { 
        error: "Failed to create connect account",
        details: error.message
      },
      { status: error.statusCode || 500 }
    );
  }
}

async function createStripeAccount(userId: string) {
  try {
    // Create a basic Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        userId,
      },
    });

    // Update user with Stripe account ID
    await prisma.user.update({
      where: { id: userId },
      data: { stripeAccountId: account.id },
    });

    return account.id;
  } catch (error: any) {
    console.error("Failed to create Stripe account:", error);
    throw error;
  }
}

