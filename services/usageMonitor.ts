import prisma from "@/lib/prisma"
import { emailService } from "./email"
import { render } from '@react-email/render'
import { UsageAlertEmail } from "@/emails/UsageAlertEmail"
import { addDays, differenceInDays } from "date-fns"

const TIER_LIMITS = {
  BASIC: 50,
  PROFESSIONAL: 200,
  ENTERPRISE: Infinity
}

const NEXT_TIER = {
  BASIC: 'PROFESSIONAL',
  PROFESSIONAL: 'ENTERPRISE'
}

export class UsageMonitorService {
  async checkUsageAndNotify(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationPreferences: true,
        subscription: true
      }
    })

    if (!user || !user.subscription) return

    const { currentBookings, usagePercentage } = await this.calculateUsage(userId)
    const daysRemaining = differenceInDays(
      user.subscription.nextBillingDate,
      new Date()
    )

    // Check if we should send notification based on preferences
    if (
      user.notificationPreferences?.usageAlerts &&
      usagePercentage >= user.notificationPreferences.usageThreshold
    ) {
      // Check if we've already notified recently
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'USAGE_ALERT',
          createdAt: {
            gte: addDays(new Date(), -1) // Don't notify more than once per day
          }
        }
      })

      if (!recentNotification) {
        await this.sendUsageAlert({
          user,
          usagePercentage,
          currentBookings,
          maxBookings: TIER_LIMITS[user.subscriptionTier],
          daysRemaining
        })
      }
    }
  }

  private async calculateUsage(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    })

    if (!user) throw new Error("User not found")

    const currentBookings = await prisma.booking.count({
      where: {
        providerId: userId,
        createdAt: {
          gte: new Date(new Date().setDate(1)) // Start of current month
        }
      }
    })

    const maxBookings = TIER_LIMITS[user.subscriptionTier]
    const usagePercentage = (currentBookings / maxBookings) * 100

    return { currentBookings, usagePercentage }
  }

  private async sendUsageAlert({
    user,
    usagePercentage,
    currentBookings,
    maxBookings,
    daysRemaining
  }: {
    user: any
    usagePercentage: number
    currentBookings: number
    maxBookings: number
    daysRemaining: number
  }) {
    // Create notification in database
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'USAGE_ALERT',
        title: usagePercentage >= 90 
          ? 'Critical Usage Alert'
          : 'Usage Warning',
        message: `You've used ${usagePercentage.toFixed(1)}% of your monthly booking limit`
      }
    })

    // Send email if enabled
    if (user.notificationPreferences?.emailNotifications) {
      const emailHtml = render(UsageAlertEmail({
        name: user.name,
        usagePercentage,
        currentBookings,
        maxBookings,
        daysRemaining,
        tier: user.subscriptionTier,
        nextTier: NEXT_TIER[user.subscriptionTier]
      }))

      await emailService.sendEmail({
        to: user.email,
        subject: usagePercentage >= 90 
          ? 'Critical Usage Alert: Action Required'
          : 'Usage Warning: Approaching Limit',
        html: emailHtml
      })
    }
  }
}

export const usageMonitor = new UsageMonitorService() 