import prisma from "@/lib/prisma"
import { startOfMonth, endOfMonth } from "date-fns"

export class RecommendationsService {
  async getSubscriptionRecommendation(userId: string) {
    // Get current month's usage
    const currentMonth = new Date()
    const startDate = startOfMonth(currentMonth)
    const endDate = endOfMonth(currentMonth)

    const bookingsCount = await prisma.booking.count({
      where: {
        providerId: userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    })

    if (!user) throw new Error("User not found")

    // Determine recommended tier based on usage patterns
    if (user.subscriptionTier === 'BASIC') {
      if (bookingsCount >= 40) { // 80% of Basic limit
        return {
          recommendedTier: 'PROFESSIONAL',
          reason: "You're approaching your monthly booking limit. Upgrade to Professional for more bookings and features."
        }
      }
    } else if (user.subscriptionTier === 'PROFESSIONAL') {
      if (bookingsCount >= 160) { // 80% of Professional limit
        return {
          recommendedTier: 'ENTERPRISE',
          reason: "Your business is growing! Upgrade to Enterprise for unlimited bookings and premium features."
        }
      }
    }

    return {
      recommendedTier: user.subscriptionTier,
      reason: "Your current plan suits your usage well."
    }
  }
}

export const recommendationsService = new RecommendationsService() 