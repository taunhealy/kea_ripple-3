import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { SubscriptionStatus } from "@prisma/client"
import { addDays } from "date-fns"
import { addMonths, startOfMonth, endOfMonth } from "date-fns"

const TIER_LIMITS = {
  BASIC: 50,
  PROFESSIONAL: 200,
  ENTERPRISE: Infinity
}

export class SubscriptionService {
  async createSubscription(userId: string, planId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) throw new Error("User not found")

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeAccountId!,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    })

    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionEnds: new Date(subscription.current_period_end * 1000)
      }
    })

    return subscription
  }

  async cancelSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user?.stripeAccountId) throw new Error("No active subscription")

    // Cancel Stripe subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeAccountId
    })

    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.cancel(subscription.id)
    }

    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: SubscriptionStatus.CANCELLED,
        subscriptionEnds: new Date()
      }
    })
  }

  async handleWebhook(event: any) {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handleSuccessfulPayment(event.data.object)
        break
      case 'invoice.payment_failed':
        await this.handleFailedPayment(event.data.object)
        break
    }
  }

  private async handleSuccessfulPayment(invoice: any) {
    await prisma.user.update({
      where: { stripeAccountId: invoice.customer },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionEnds: new Date(invoice.lines.data[0].period.end * 1000)
      }
    })
  }

  private async handleFailedPayment(invoice: any) {
    await prisma.user.update({
      where: { stripeAccountId: invoice.customer },
      data: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE
      }
    })
  }

  async trackUsage(userId: string) {
    const currentMonth = new Date()
    const startDate = startOfMonth(currentMonth)
    const endDate = endOfMonth(currentMonth)

    // Get current month's bookings
    const bookingsCount = await prisma.booking.count({
      where: {
        providerId: userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true
      }
    })

    if (!user) throw new Error("User not found")

    const limit = TIER_LIMITS[user.subscriptionTier]
    const usagePercentage = (bookingsCount / limit) * 100

    // Update usage metrics
    await prisma.subscriptionUsage.upsert({
      where: {
        userId_month: {
          userId,
          month: startDate
        }
      },
      update: {
        bookingsCount,
        usagePercentage
      },
      create: {
        userId,
        month: startDate,
        bookingsCount,
        usagePercentage
      }
    })

    // Send notification if usage is high
    if (usagePercentage >= 80 && usagePercentage < 90) {
      await this.sendUsageAlert(userId, "WARNING", usagePercentage)
    } else if (usagePercentage >= 90) {
      await this.sendUsageAlert(userId, "CRITICAL", usagePercentage)
    }

    return {
      current: bookingsCount,
      limit,
      percentage: usagePercentage
    }
  }

  private async sendUsageAlert(userId: string, level: "WARNING" | "CRITICAL", percentage: number) {
    const message = level === "WARNING"
      ? `You've used ${percentage.toFixed(0)}% of your monthly booking limit`
      : `Critical: ${percentage.toFixed(0)}% of your monthly booking limit used`

    await prisma.notification.create({
      data: {
        userId,
        type: "USAGE_ALERT",
        title: `${level} Usage Alert`,
        message
      }
    })
  }
} 