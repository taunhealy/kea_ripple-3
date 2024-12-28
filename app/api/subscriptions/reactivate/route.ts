import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { payfast } from "@/lib/payfast"
import { notificationService } from "@/services/notifications"
import { addMonths } from "date-fns"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { tier, paymentMethodId } = data

    // Verify previous subscription
    const oldSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    })

    if (!oldSubscription || !["CANCELLED", "SUSPENDED"].includes(oldSubscription.status)) {
      return NextResponse.json(
        { error: "Invalid subscription status" },
        { status: 400 }
      )
    }

    // Process initial payment with PayFast
    const payment = await payfast.processSubscriptionPayment({
      userId: session.user.id,
      paymentMethodId,
      amount: getTierPrice(tier)
    })

    // Create new subscription
    const subscription = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        status: "ACTIVE",
        tier,
        amount: getTierPrice(tier),
        paymentMethodId,
        startDate: new Date(),
        lastBillingDate: new Date(),
        nextBillingDate: addMonths(new Date(), 1),
        autoRenew: true,
        gracePeriodEnd: null,
        cancelledAt: null
      }
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: getTierPrice(tier),
        status: "PAID",
        type: "SUBSCRIPTION_REACTIVATION",
        paymentMethodId,
        description: `Subscription reactivation - ${tier} plan`
      }
    })

    // Send notifications
    await notificationService.sendReactivationSuccess(session.user.id)

    return NextResponse.json(subscription)
  } catch (error) {
    console.error("Subscription reactivation error:", error)
    return NextResponse.json(
      { error: "Failed to reactivate subscription" },
      { status: 500 }
    )
  }
}

function getTierPrice(tier: string): number {
  const prices = {
    BASIC: 299,
    PROFESSIONAL: 599,
    ENTERPRISE: 999
  }
  return prices[tier] || prices.BASIC
} 