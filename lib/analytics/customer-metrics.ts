/**
 * Customer Analytics Utilities
 * 
 * Provides functions for analyzing customer behavior and value:
 * - Customer lifetime value calculations
 * - Segmentation analysis
 * - Retention metrics
 * - Booking patterns
 * - Risk analysis
 */

import prisma from "@/lib/prisma"
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInMonths,
} from "date-fns"

export async function calculateCustomerLifetimeValue(userId: string) {
  const customers = await prisma.user.findMany({
    where: {
      bookings: {
        some: {
          providerId: userId,
        },
      },
    },
    include: {
      bookings: {
        where: {
          providerId: userId,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  return customers.map((customer) => {
    const firstBooking = customer.bookings[0]
    const lastBooking = customer.bookings[customer.bookings.length - 1]
    const lifespanMonths = Math.max(
      1,
      differenceInMonths(
        lastBooking.createdAt,
        firstBooking.createdAt
      ) + 1
    )

    const totalSpent = customer.bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice),
      0
    )

    return {
      customerId: customer.id,
      name: customer.name,
      totalBookings: customer.bookings.length,
      totalSpent,
      monthlyValue: totalSpent / lifespanMonths,
      lifespanMonths,
      lastBooking: lastBooking.createdAt,
    }
  })
}

export async function getSegmentDetails(
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
        include: {
          schedule: {
            include: {
              activity: true,
            },
          },
        },
      },
    },
  })

  const segments = {
    new: { customers: 0, revenue: 0, retention: 0 },
    returning: { customers: 0, revenue: 0, retention: 0 },
    frequent: { customers: 0, revenue: 0, retention: 0 },
  }

  customers.forEach((customer) => {
    const bookingCount = customer.bookings.length
    const revenue = customer.bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice),
      0
    )

    const segment =
      bookingCount === 1
        ? "new"
        : bookingCount <= 3
        ? "returning"
        : "frequent"

    segments[segment].customers++
    segments[segment].revenue += revenue
  })

  // Calculate retention rates
  for (const segment of Object.keys(segments)) {
    const retainedCustomers = await calculateRetention(
      userId,
      segment as keyof typeof segments,
      startDate,
      endDate
    )
    segments[segment as keyof typeof segments].retention = retainedCustomers
  }

  return Object.entries(segments).map(([name, data]) => ({
    name,
    customers: data.customers,
    revenue: data.revenue,
    retention: data.retention,
    averageValue: data.customers > 0 ? data.revenue / data.customers : 0,
  }))
}

async function calculateRetention(
  userId: string,
  segment: string,
  startDate: Date,
  endDate: Date
) {
  const previousPeriodStart = subMonths(startDate, 1)
  const previousPeriodEnd = subMonths(endDate, 1)

  const previousCustomers = await prisma.user.findMany({
    where: {
      bookings: {
        some: {
          providerId: userId,
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd,
          },
        },
      },
    },
    include: {
      bookings: {
        where: {
          providerId: userId,
          createdAt: {
            gte: previousPeriodStart,
            lte: endDate,
          },
        },
      },
    },
  })

  const retainedCount = previousCustomers.filter((customer) => {
    const previousBookings = customer.bookings.filter(
      (booking) =>
        booking.createdAt >= previousPeriodStart &&
        booking.createdAt <= previousPeriodEnd
    ).length
    const currentBookings = customer.bookings.filter(
      (booking) =>
        booking.createdAt >= startDate &&
        booking.createdAt <= endDate
    ).length

    return (
      (segment === "new" && previousBookings === 1) ||
      (segment === "returning" &&
        previousBookings > 1 &&
        previousBookings <= 3) ||
      (segment === "frequent" && previousBookings > 3)
    ) && currentBookings > 0
  }).length

  return previousCustomers.length > 0
    ? (retainedCount / previousCustomers.length) * 100
    : 0
} 