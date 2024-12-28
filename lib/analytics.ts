/**
 * Analytics Utility Functions
 * 
 * Provides functions for:
 * - Calculating business metrics
 * - Processing analytics data
 * - Generating insights
 * - Formatting statistics
 */

import {
  startOfMonth,
  endOfMonth,
  subMonths,
  eachDayOfInterval,
  format,
  isSameDay,
} from "date-fns"
import prisma from "@/lib/prisma"

interface MetricsInput {
  bookings: any[]
  startDate: Date
  endDate: Date
  userId: string
}

export async function calculateMetrics({
  bookings,
  startDate,
  endDate,
  userId,
}: MetricsInput) {
  // Calculate current period metrics
  const currentPeriodMetrics = calculatePeriodMetrics(bookings)

  // Fetch and calculate previous period metrics
  const previousPeriodStart = subMonths(startDate, 1)
  const previousPeriodEnd = subMonths(endDate, 1)
  const previousBookings = await prisma.booking.findMany({
    where: {
      providerId: userId,
      createdAt: {
        gte: previousPeriodStart,
        lte: previousPeriodEnd,
      },
    },
    include: {
      schedule: {
        include: {
          activity: true,
        },
      },
      customer: true,
    },
  })
  const previousPeriodMetrics = calculatePeriodMetrics(previousBookings)

  // Calculate trends
  const trends = calculateTrends(currentPeriodMetrics, previousPeriodMetrics)

  // Generate daily data points
  const dailyData = generateDailyData(bookings, startDate, endDate)

  // Calculate customer metrics
  const customerMetrics = await calculateCustomerMetrics(userId, startDate, endDate)

  return {
    currentPeriod: currentPeriodMetrics,
    previousPeriod: previousPeriodMetrics,
    trends,
    dailyData,
    customerMetrics,
  }
}

function calculatePeriodMetrics(bookings: any[]) {
  const totalBookings = bookings.length
  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalPrice),
    0
  )
  const uniqueCustomers = new Set(
    bookings.map((booking) => booking.customerId)
  ).size
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

  const activityMetrics = bookings.reduce((acc: any, booking) => {
    const activityId = booking.schedule.activity.id
    if (!acc[activityId]) {
      acc[activityId] = {
        id: activityId,
        title: booking.schedule.activity.title,
        bookings: 0,
        revenue: 0,
      }
    }
    acc[activityId].bookings++
    acc[activityId].revenue += Number(booking.totalPrice)
    return acc
  }, {})

  return {
    totalBookings,
    totalRevenue,
    uniqueCustomers,
    avgBookingValue,
    activityMetrics: Object.values(activityMetrics),
  }
}

function calculateTrends(current: any, previous: any) {
  return {
    bookings:
      previous.totalBookings > 0
        ? ((current.totalBookings - previous.totalBookings) /
            previous.totalBookings) *
          100
        : 0,
    revenue:
      previous.totalRevenue > 0
        ? ((current.totalRevenue - previous.totalRevenue) /
            previous.totalRevenue) *
          100
        : 0,
    customers:
      previous.uniqueCustomers > 0
        ? ((current.uniqueCustomers - previous.uniqueCustomers) /
            previous.uniqueCustomers) *
          100
        : 0,
  }
}

function generateDailyData(
  bookings: any[],
  startDate: Date,
  endDate: Date
) {
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  return days.map((day) => {
    const dayBookings = bookings.filter((booking) =>
      isSameDay(new Date(booking.createdAt), day)
    )
    return {
      date: format(day, "yyyy-MM-dd"),
      bookings: dayBookings.length,
      revenue: dayBookings.reduce(
        (sum, booking) => sum + Number(booking.totalPrice),
        0
      ),
    }
  })
}

async function calculateCustomerMetrics(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const customers = await prisma.user.findMany({
    where: {
      bookings: {
        some: {
          providerId: userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
    include: {
      bookings: {
        where: {
          providerId: userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
  })

  const segments = {
    new: 0,
    returning: 0,
    frequent: 0,
  }

  customers.forEach((customer) => {
    const bookingCount = customer.bookings.length
    if (bookingCount === 1) segments.new++
    else if (bookingCount <= 3) segments.returning++
    else segments.frequent++
  })

  return {
    totalCustomers: customers.length,
    segments,
    averageBookingsPerCustomer:
      customers.reduce(
        (sum, customer) => sum + customer.bookings.length,
        0
      ) / customers.length,
  }
} 