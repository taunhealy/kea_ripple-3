import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import prisma from "@/lib/prisma"
import { BookingStatus, PaymentStatus } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature")!
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object
      
      await prisma.booking.update({
        where: { paymentIntent: paymentIntent.id },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID
        }
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    )
  }
}