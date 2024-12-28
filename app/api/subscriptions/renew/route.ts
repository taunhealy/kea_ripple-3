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
    const { autoRenew } = data

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      )
    }

    // Update auto-renewal settings with payment provider
    await payfast.updateSubscriptionRenewal({
      userId: session.user.id,
      autoRenew
    })

    // Update subscription in database
    const updated = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        autoRenew,
        updatedAt: new Date()
      }
    })

    // Create notification
    await notificationService.createNotification({
      userId: session.user.id,
      type: "SUBSCRIPTION_UPDATE",
      title: "Auto-Renewal Settings Updated",
      message: autoRenew 
        ? "Your subscription will automatically renew" 
        : "Auto-renewal has been disabled"
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Subscription renewal error:", error)
    return NextResponse.json(
      { error: "Failed to update renewal settings" },
      { status: 500 }
    )
  }
} 