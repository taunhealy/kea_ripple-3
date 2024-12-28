import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SubscriptionService } from "@/services/subscription"
import { z } from "zod"

const subscriptionService = new SubscriptionService()

const subscriptionSchema = z.object({
  planId: z.string()
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const { planId } = subscriptionSchema.parse(json)

    const subscription = await subscriptionService.createSubscription(
      session.user.id,
      planId
    )

    return NextResponse.json(subscription)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await subscriptionService.cancelSubscription(session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    )
  }
} 