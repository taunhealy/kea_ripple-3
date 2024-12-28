import prisma from "@/lib/prisma"
import { payfast } from "@/lib/payfast"
import { notificationService } from "./notifications"
import { emailService } from "./email"
import { addDays, addMonths, isBefore } from "date-fns"

export class RenewalService {
  async processRenewal(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: true
      }
    })

    if (!subscription || !subscription.user) {
      throw new Error("Subscription or user not found")
    }

    try {
      // Process payment with PayFast
      const payment = await payfast.processSubscriptionPayment({
        userId,
        amount: subscription.amount
      })

      // Update subscription dates
      await prisma.subscription.update({
        where: { userId },
        data: {
          lastBillingDate: new Date(),
          nextBillingDate: addMonths(new Date(), 1),
          status: "ACTIVE"
        }
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          userId,
          amount: subscription.amount,
          status: "PAID",
          type: "SUBSCRIPTION",
          paymentMethodId: payment.paymentMethodId,
          description: `Subscription renewal - ${subscription.tier} plan`
        }
      })

      // Send success notification
      await notificationService.sendPaymentSuccess(userId, subscription.amount)

      return { success: true, payment }
    } catch (error) {
      console.error("Renewal processing error:", error)

      // Update subscription status
      await prisma.subscription.update({
        where: { userId },
        data: {
          status: "PAYMENT_FAILED"
        }
      })

      // Send failure notification
      await notificationService.sendPaymentFailure(userId, error.message)

      // Start grace period handling
      await this.handleGracePeriod(userId)

      return { success: false, error }
    }
  }

  private async handleGracePeriod(userId: string) {
    const GRACE_PERIOD_DAYS = 3
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: true
      }
    })

    if (!subscription || !subscription.user) return

    const gracePeriodEnd = addDays(new Date(), GRACE_PERIOD_DAYS)

    // Update subscription with grace period
    await prisma.subscription.update({
      where: { userId },
      data: {
        gracePeriodEnd,
        status: "GRACE_PERIOD"
      }
    })

    // Send grace period notification
    await notificationService.createNotification({
      userId,
      type: "GRACE_PERIOD",
      title: "Payment Failed - Grace Period Started",
      message: `Your subscription is in a grace period until ${gracePeriodEnd.toLocaleDateString()}. Please update your payment method.`
    })

    // Send grace period email
    await emailService.sendEmail({
      to: subscription.user.email,
      subject: "Action Required: Subscription Payment Failed",
      html: `
        <h2>Subscription Payment Failed</h2>
        <p>Hi ${subscription.user.name},</p>
        <p>We were unable to process your subscription renewal payment.</p>
        <p>Your account is now in a ${GRACE_PERIOD_DAYS}-day grace period until ${gracePeriodEnd.toLocaleDateString()}.</p>
        <p>Please update your payment method to avoid service interruption:</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/subscription">Update Payment Method</a></p>
      `
    })
  }

  async checkGracePeriods() {
    const expiredGracePeriods = await prisma.subscription.findMany({
      where: {
        status: "GRACE_PERIOD",
        gracePeriodEnd: {
          lt: new Date()
        }
      },
      include: {
        user: true
      }
    })

    for (const subscription of expiredGracePeriods) {
      // Suspend subscription
      await prisma.subscription.update({
        where: { userId: subscription.userId },
        data: {
          status: "SUSPENDED"
        }
      })

      // Send suspension notification
      await notificationService.createNotification({
        userId: subscription.userId,
        type: "SUBSCRIPTION_SUSPENDED",
        title: "Subscription Suspended",
        message: "Your subscription has been suspended due to payment failure. Please update your payment method to restore access."
      })

      // Send suspension email
      await emailService.sendEmail({
        to: subscription.user.email,
        subject: "Subscription Suspended",
        html: `
          <h2>Subscription Suspended</h2>
          <p>Hi ${subscription.user.name},</p>
          <p>Your subscription has been suspended due to payment failure. Please update your payment method to restore access.</p>
          <p>Thank you for your understanding.</p>
        `
      })
    }
  }
} 