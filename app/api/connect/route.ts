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

    // Create Stripe Connect account link
    const accountLink = await stripe.accountLinks.create({
      account: session.user.stripeAccountId || await createStripeAccount(session.user.id),
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Connect error:", error);
    return NextResponse.json(
      { error: "Failed to create connect account" },
      { status: 500 }
    );
  }
}

async function createStripeAccount(userId: string) {
  const account = await stripe.accounts.create({
    type: "express",
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
}

