import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  eachDayOfInterval,
  format,
  startOfDay,
  endOfDay
} from "date-fns"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get date ranges
    const now = new Date()
    const currentMonth = {
      start: startOfMonth(now),
      end: now
    }
    const lastMonth = {
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1))
    }

    // Fetch current month's data
    const currentMonthBookings = await prisma.booking.count({
      where: {
        providerId: session.user.id,
        createdAt: {
          gte: currentMonth.start,
          lte: currentMonth.end
        }
      }
    })

    const currentMonthRevenue = await prisma.payment.aggregate({
      where: {
        userId: session.user.id,
        status: "PAID",
        createdAt: {
          gte: currentMonth.start,
          lte: currentMonth.end
        }
      },
      _sum: {
        amount: true
      }
    })

    // Fetch last month's data for comparison
    const lastMonthBookings = await prisma.booking.count({
      where: {
        providerId: session.user.id,
        createdAt: {
          gte: lastMonth.start,
          lte: lastMonth.end
        }
      }
    })

    const lastMonthRevenue = await prisma.payment.aggregate({
      where: {
        userId: session.user.id,
        status: "PAID",
        createdAt: {
          gte: lastMonth.start,
          lte: lastMonth.end
        }
      },
      _sum: {
        amount: true
      }
    })

    // Calculate trends
    const bookingsTrend = calculateTrend(currentMonthBookings, lastMonthBookings)
    const revenueTrend = calculateTrend(
      currentMonthRevenue._sum.amount || 0,
      lastMonthRevenue._sum.amount || 0
    )

    // Get historical data
    const bookingsHistory = await getBookingsHistory(session.user.id)
    const revenueHistory = await getRevenueHistory(session.user.id)
    const usageHistory = await getUsageHistory(session.user.id)

    // Get activity stats
    const popularActivities = await getPopularActivities(session.user.id)
    const peakTimes = await getPeakBookingTimes(session.user.id)

    return NextResponse.json({
      totalBookings: currentMonthBookings,
      bookingsTrend,
      revenue: currentMonthRevenue._sum.amount || 0,
      revenueTrend,
      activeUsers: await getActiveUsers(session.user.id),
      usersTrend: 0, // Calculate based on your user activity metrics
      usagePercentage: (currentMonthBookings / 50) * 100, // Assuming Basic tier limit
      usageTrend: 0, // Calculate based on your usage metrics
      bookingsHistory,
      revenueHistory,
      usageHistory,
      popularActivities,
      peakTimes
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 100
  return ((current - previous) / previous) * 100
}

async function getBookingsHistory(userId: string) {
  const days = eachDayOfInterval({
    start: startOfMonth(subMonths(new Date(), 1)),
    end: new Date()
  })

  return await Promise.all(days.map(async (date) => {
    const bookings = await prisma.booking.count({
      where: {
        providerId: userId,
        createdAt: {
          gte: startOfDay(date),
          lte: endOfDay(date)
        }
      }
    })

    return {
      date: format(date, 'yyyy-MM-dd'),
      bookings
    }
  }))
}

async function getRevenueHistory(userId: string) {
  const days = eachDayOfInterval({
    start: startOfMonth(subMonths(new Date(), 1)),
    end: new Date()
  })

  return await Promise.all(days.map(async (date) => {
    const revenue = await prisma.payment.aggregate({
      where: {
        userId,
        status: "PAID",
        createdAt: {
          gte: startOfDay(date),
          lte: endOfDay(date)
        }
      },
      _sum: {
        amount: true
      }
    })

    return {
      date: format(date, 'yyyy-MM-dd'),
      revenue: revenue._sum.amount || 0
    }
  }))
}

async function getUsageHistory(userId: string) {
  // Similar to bookings history but calculate usage percentage
  return []
}

async function getActiveUsers(userId: string) {
  // Calculate based on your user activity metrics
  return 0
}

async function getPopularActivities(userId: string) {
  const activities = await prisma.booking.groupBy({
    by: ['scheduleId'],
    where: {
      providerId: userId,
      createdAt: {
        gte: startOfMonth(new Date())
      }
    },
    _count: true,
    orderBy: {
      _count: {
        sche
} 