import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { payfast } from "@/lib/payfast"
import { notificationService } from "@/services/notifications"
import { SUBSCRIPTION_TIERS } from "@/lib/constants/subscription"
import { addMonths } from "date-fns"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { newTier } = data

    if (!SUBSCRIPTION_TIERS[newTier]) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      )
    }

    const currentSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    })

    if (!currentSubscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      )
    }

    const isUpgrade = SUBSCRIPTION_TIERS[newTier].price > SUBSCRIPTION_TIERS[currentSubscription.tier].price

    // Calculate prorated amount for downgrades
    const proratedCredit = !isUpgrade ? 
      calculateProratedAmount(
        currentSubscription.amount,
        currentSubscription.lastBillingDate,
        currentSubscription.nextBillingDate
      ) : 0

    // Update subscription with payment provider
    if (isUpgrade) {
      await payfast.processSubscriptionPayment({
        userId: session.user.id,
        amount: SUBSCRIPTION_TIERS[newTier].price - SUBSCRIPTION_TIERS[currentSubscription.tier].price
      })
    }

    await payfast.updateSubscription({
      userId: session.user.id,
      tier: newTier,
      amount: SUBSCRIPTION_TIERS[newTier].price
    })

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        tier: newTier,
        amount: SUBSCRIPTION_TIERS[newTier].price,
        updatedAt: new Date()
      }
    })

    // Record the change
    await prisma.subscriptionTierChange.create({
      data: {
        userId: session.user.id,
        fromTier: currentSubscription.tier,
        toTier: newTier,
        proratedCredit,
        type: isUpgrade ? 'UPGRADE' : 'DOWNGRADE'
      }
    })

    // Send notification
    await notificationService.createNotification({
      userId: session.user.id,
      type: isUpgrade ? "SUBSCRIPTION_UPGRADED" : "SUBSCRIPTION_DOWNGRADED",
      title: `Subscription ${isUpgrade ? 'Upgraded' : 'Downgraded'}`,
      message: `Your subscription has been changed to ${SUBSCRIPTION_TIERS[newTier].name}`
    })

    return NextResponse.json({
      subscription: updatedSubscription,
      proratedCredit
    })
  } catch (error) {
    console.error("Subscription change error:", error)
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    )
  }
}

function calculateProratedAmount(
  currentAmount: number,
  lastBillingDate: Date,
  nextBillingDate: Date
): number {
  const totalDays = Math.ceil(
    (nextBillingDate.getTime() - lastBillingDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const remainingDays = Math.ceil(
    (nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.round((currentAmount / totalDays) * remainingDays)
} 