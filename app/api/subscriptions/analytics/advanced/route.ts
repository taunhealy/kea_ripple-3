import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  addMonths,
  eachMonthOfInterval,
  format,
  differenceInMonths
} from "date-fns"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Calculate retention trend
    const retentionTrend = await calculateRetentionTrend(session.user.id)

    // Get churn reasons
    const churnReasons = await getChurnReasons(session.user.id)

    // Calculate subscription lifetime
    const subscriptionLifetime = await calculateSubscriptionLifetime(session.user.id)

    // Generate cohort analysis
    const cohortAnalysis = await generateCohortAnalysis(session.user.id)

    // Predict churn risk
    const churnRiskUsers = await predictChurnRisk(session.user.id)

    // Generate revenue forecast
    const revenueForecast = await generateRevenueForecast(session.user.id)

    return NextResponse.json({
      retentionTrend,
      churnReasons,
      subscriptionLifetime,
      cohortAnalysis,
      churnRiskUsers,
      revenueForecast
    })
  } catch (error) {
    console.error("Advanced analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch advanced analytics" },
      { status: 500 }
    )
  }
}

async function calculateRetentionTrend(userId: string) {
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 6),
    end: new Date()
  })

  return await Promise.all(months.map(async (month) => {
    const startDate = startOfMonth(month)
    const endDate = endOfMonth(month)

    const activeSubscriptions = await prisma.subscription.count({
      where: {
        userId,
        startDate: {
          lte: endDate
        },
        OR: [
          { endDate: null },
          { endDate: { gt: endDate } }
        ]
      }
    })

    const totalSubscriptions = await prisma.subscription.count({
      where: {
        userId,
        startDate: {
          lte: endDate
        }
      }
    })

    return {
      month: format(month, 'yyyy-MM-dd'),
      rate: totalSubscriptions > 0 
        ? (activeSubscriptions / totalSubscriptions) * 100 
        : 0
    }
  }))
}

async function getChurnReasons(userId: string) {
  const reasons = await prisma.subscriptionCancellation.groupBy({
    by: ['reason'],
    where: {
      userId
    },
    _count: true
  })

  return reasons.map(reason => ({
    reason: reason.reason || 'Other'
  }))
} 