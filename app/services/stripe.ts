import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function createStripeAccount(userId: string, email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
  });

  // Save Stripe account ID to user record
  await prisma.user.update({
    where: { id: userId },
    data: { stripeAccountId: account.id },
  });

  return account;
}

export async function createPaymentIntent(amount: number, creatorId: string) {
  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
    select: { stripeAccountId: true },
  });

  if (!creator?.stripeAccountId) {
    throw new Error("Creator has no connected Stripe account");
  }

  // Calculate platform fee (30%)
  const platformFee = Math.round(amount * 0.3);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    application_fee_amount: platformFee,
    transfer_data: {
      destination: creator.stripeAccountId,
    },
  });

  return paymentIntent;
}