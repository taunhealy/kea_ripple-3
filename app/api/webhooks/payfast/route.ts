import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { payfast } from "@/lib/payfast"
import prisma from "@/lib/prisma"
import { BookingStatus, PaymentStatus, SubscriptionStatus } from "@prisma/client"
import { NotificationService } from "@/services/notification"
import { EmailService } from "@/services/email"
import { SubscriptionService } from "@/services/subscription"

const notificationService = new NotificationService()
const emailService = new EmailService()
const subscriptionService = new SubscriptionService()

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get("payfast-signature")
    
    // Verify PayFast signature
    if (!payfast.validateSignature(body, signature!)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    const data = payfast.parseNotification(body)
    const paymentId = data.m_payment_id

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true
      }
    })

    if (!payment) {
      throw new Error("Payment not found")
    }

    switch (data.payment_status) {
      case "COMPLETE":
        await prisma.$transaction(async (tx) => {
          // Update payment status
          await tx.payment.update({
            where: { id: paymentId },
            data: { status: PaymentStatus.PAID }
          })

          if (payment.type === "SUBSCRIPTION") {
            // Handle subscription payment
            const nextBillingDate = addMonths(new Date(), 1)
            await tx.user.update({
              where: { id: payment.userId },
              data: {
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                subscriptionEnds: nextBillingDate
              }
            })

            // Send notifications
            await notificationService.create({
              userId: payment.userId,
              type: "PAYMENT_RECEIVED",
              title: "Subscription Payment Successful",
              message: `Your subscription payment of R${payment.amount} has been processed`
            })

            await emailService.sendPaymentConfirmation(payment.user.email, {
              name: payment.user.name || "",
              amount: Number(payment.amount),
              description: payment.description,
              invoiceUrl: payment.invoiceUrl
            })

            // Track initial usage
            await subscriptionService.trackUsage(payment.userId)
          } else {
            // Handle booking payment
            await tx.booking.update({
              where: { paymentId },
              data: {
                status: BookingStatus.CONFIRMED,
                paymentStatus: PaymentStatus.PAID
              }
            })
          }
        })
        break

      case "FAILED":
      case "CANCELLED":
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.FAILED }
        })

        // Send failure notification
        await notificationService.create({
          userId: payment.userId,
          type: "PAYMENT_FAILED",
          title: "Payment Failed",
          message: `Your payment of R${payment.amount} for ${payment.description} has failed`
        })
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("PayFast webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    )
  }
}