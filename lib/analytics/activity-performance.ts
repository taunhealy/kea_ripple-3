/**
 * Activity Performance Analytics Utilities
 * 
 * Provides functions for calculating and analyzing activity performance metrics:
 * - Time slot popularity analysis
 * - Capacity utilization calculations
 * - Revenue per activity metrics
 * - Performance trends and comparisons
 * - Activity-specific insights generation
 */

import prisma from "@/lib/prisma"
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  parseISO,
  eachHourOfInterval,
} from "date-fns"

export async function calculateActivityPerformance(
  userId: string,
  activityId: string | null,
  startDate: Date,
  endDate: Date
) {
  const currentPeriodQuery = {
    providerId: userId,
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
    ...(activityId !== "all" && {
      schedule: {
        activityId,
      },
    }),
  }

  const previousPeriodQuery = {
    ...currentPeriodQuery,
    createdAt: {
      gte: subMonths(startDate, 1),
      lte: subMonths(endDate, 1),
    },
  }

  const [currentMetrics, previousMetrics] = await Promise.all([
    calculatePeriodMetrics(currentPeriodQuery),
    calculatePeriodMetrics(previousPeriodQuery),
  ])

  return [
    {
      metric: "Booking Rate",
      value: currentMetrics.bookingRate,
      previous: previousMetrics.bookingRate,
    },
    {
      metric: "Capacity Utilization",
      value: currentMetrics.capacityUtilization,
      previous: previousMetrics.capacityUtilization,
    },
    {
      metric: "Revenue per Booking",
      value: currentMetrics.revenuePerBooking,
      previous: previousMetrics.revenuePerBooking,
    },
    {
      metric: "Customer Satisfaction",
      value: currentMetrics.satisfaction,
      previous: previousMetrics.satisfaction,
    },
  ]
}

async function calculatePeriodMetrics(query: any) {
  const bookings = await prisma.booking.findMany({
    where: query,
    include: {
      schedule: true,
      reviews: true,
    },
  })

  const schedules = await prisma.schedule.findMany({
    where: {
      bookings: {
        some: query,
      },
    },
  })

  const totalBookings = bookings.length
  const totalSchedules = schedules.length
  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalPrice),
    0
  )
  const totalCapacity = schedules.reduce(
    (sum, schedule) => sum + schedule.maxParticipants,
    0
  )
  const totalParticipants = bookings.reduce(
    (sum, booking) => sum + booking.participants,
    0
  )
} 