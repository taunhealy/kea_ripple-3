import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { payfast } from "@/lib/payfast"
import { notificationService } from "@/services/notifications"
import { emailService } from "@/services/email"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Cancel subscription with payment provider
    await payfast.cancelSubscription(session.user.id)

    // Update subscription status in database
    const subscription = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason: data.reason,
        cancellationFeedback: data.feedback
      }
    })

    // Create cancellation record
    await prisma.subscriptionCancellation.create({
      data: {
        userId: session.user.id,
        reason: data.reason,
        feedback: data.feedback,
        subscriptionTier: subscription.tier
      }
    })

    // Send cancellation email
    await emailService.sendEmail({
      to: session.user.email!,
      subject: "Subscription Cancelled",
      html: `
        <h2>Subscription Cancellation Confirmed</h2>
        <p>Hi ${session.user.name},</p>
        <p>Your subscription has been cancelled as requested. You'll continue to have access to your current features until ${subscription.nextBillingDate.toLocaleDateString()}.</p>
        <p>We're sorry to see you go. If you change your mind, you can reactivate your subscription at any time.</p>
      `
    })

    // Create notification
    await notificationService.createNotification({
      userId: session.user.id,
      type: "SUBSCRIPTION_CANCELLED",
      title: "Subscription Cancelled",
      message: `Your subscription will end on ${subscription.nextBillingDate.toLocaleDateString()}`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Subscription cancellation error:", error)
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    )
  }
} 