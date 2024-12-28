import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
  format
} from "date-fns"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    const sixMonthsAgo = subMonths(today, 6)

    // Get daily bookings for the current month
    const dailyBookings = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        providerId: session.user.id,
        createdAt: {
          gte: startOfMonth(today),
          lte: endOfMonth(today)
        }
      },
      _count: true
    })

    // Get monthly bookings for the last 6 months
    const monthlyBookings = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        providerId: session.user.id,
        createdAt: {
          gte: sixMonthsAgo,
          lte: today
        }
      },
      _count: true
    })

    // Get today's bookings
    const todayBookings = await prisma.booking.count({
      where: {
        providerId: session.user.id,
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today)
        }
      }
    })

    // Calculate statistics
    const dailyData = eachDayOfInterval({
      start: startOfMonth(today),
      end: today
    }).map(date => ({
      date: format(date, 'yyyy-MM-dd'),
      bookings: dailyBookings.find(b => 
        format(b.createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )?._count || 0
    }))

    const monthlyData = eachMonthOfInterval({
      start: sixMonthsAgo,
      end: today
    }).map(date => ({
      month: format(date, 'yyyy-MM'),
      bookings: monthlyBookings.filter(b => 
        format(b.createdAt, 'yyyy-MM') === format(date, 'yyyy-MM')
      ).reduce((sum, b) => sum + b._count, 0)
    }))

    const weeklyAverage = Math.round(
      dailyData.reduce((sum, day) => sum + day.bookings, 0) / 7
    )

    const monthlyAverage = Math.round(
      monthlyData.reduce((sum, month) => sum + month.bookings, 0) / 
      monthlyData.length
    )

    const peakDay = dailyData.reduce((max, day) => 
      day.bookings > max.bookings ? day : max
    )

    // Get subscription usage
    const usage = await prisma.subscriptionUsage.findFirst({
      where: {
        userId: session.user.id,
        month: startOfMonth(today)
      }
    })

    return NextResponse.json({
      daily: dailyData,
      monthly: monthlyData,
      today: todayBookings,
      weeklyAverage,
      monthlyAverage,
      monthlyTotal: monthlyData[monthlyData.length - 1].bookings,
      peakDay: `${peakDay.bookings} (${format(new Date(peakDay.date), 'MMM d')})`,
      usagePercentage: usage?.usagePercentage.toFixed(1) || 0
    })
  } catch (error) {
    console.error("Usage analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    )
  }
} 