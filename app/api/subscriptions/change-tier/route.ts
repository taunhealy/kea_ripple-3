import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { payfast } from "@/lib/payfast"
import { notificationService } from "@/services/notifications"
import { addMonths } from "date-fns"

const TIER_PRICES = {
  BASIC: 299,
  PROFESSIONAL: 599,
  ENTERPRISE: 999
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { newTier } = data

    // Validate tier
    if (!TIER_PRICES[newTier]) {
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

    // Calculate prorated amount if downgrading
    const proratedCredit = currentSubscription.tier !== newTier ? 
      calculateProratedAmount(
        currentSubscription.amount,
        currentSubscription.lastBillingDate,
        currentSubscription.nextBillingDate
      ) : 0

    // Update subscription with payment provider
    await payfast.updateSubscription({
      userId: session.user.id,
      tier: newTier,
      amount: TIER_PRICES[newTier]
    })

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        tier: newTier,
        amount: TIER_PRICES[newTier],
        updatedAt: new Date()
      }
    })

    // Create tier change record
    await prisma.subscriptionTierChange.create({
      data: {
        userId: session.user.id,
        fromTier: currentSubscription.tier,
        toTier: newTier,
        proratedCredit
      }
    })

    // Send notifications
    await notificationService.createNotification({
      userId: session.user.id,
      type: "SUBSCRIPTION_UPDATED",
      title: "Subscription Updated",
      message: `Your subscription has been updated to ${newTier}`
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
    (nextBillingDate.getTime() - lastBillingDate.getTime()) / (1000 * 
} 