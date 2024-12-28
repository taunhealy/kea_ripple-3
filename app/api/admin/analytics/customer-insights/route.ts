/**
 * API Route: Customer Insights Analytics
 * 
 * Provides detailed customer analytics including:
 * - Customer retention analysis
 * - Customer segmentation data
 * - Booking frequency patterns
 * - Customer lifetime value calculations
 * - Churn risk analysis
 * 
 * Used by the CustomerInsights dashboard component to display
 * customer behavior patterns and trends over time.
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  eachMonthOfInterval,
} from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const startDate = startOfMonth(subMonths(new Date(), 12))
    const endDate = endOfMonth(new Date())

    // Calculate retention trend
    const retentionTrend = await calculateRetentionTrend(
      session.user.id,
      startDate,
      endDate
    )

    // Get customer segments
    const customerSegments = await getCustomerSegments(
      session.user.id,
      startDate,
      endDate
    )

    // Calculate customer lifetime value
    const lifetimeValue = await calculateCustomerLifetimeValue(
      session.user.id
    )

    // Get detailed segment analysis
    const segmentDetails = await getSegmentDetails(
      session.user.id,
      startDate,
      endDate
    )

    return NextResponse.json({
      retentionTrend,
      customerSegments,
      lifetimeValue,
      segmentDetails,
    })
  } catch (error) {
    console.error("Customer insights error:", error)
    return NextResponse.json(
      { error: "Failed to fetch customer insights" },
      { status: 500 }
    )
  }
}

async function calculateRetentionTrend(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const months = eachMonthOfInterval({ start: startDate, end: endDate })
  const retentionData = await Promise.all(
    months.map(async (month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const [activeCustomers, totalCustomers] = await Promise.all([
        prisma.user.count({
          where: {
            bookings: {
              some: {
                providerId: userId,
                createdAt: {
                  gte: monthStart,
                  lte: monthEnd,
                },
              },
            },
          },
        }),
        prisma.user.count({
          where: {
            bookings: {
              some: {
                providerId: userId,
                createdAt: { lte: monthEnd },
              },
            },
          },
        }),
      ])

      return {
        month: month.toISOString(),
        retention: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
        target: 80, // Example target retention rate
      }
    })
  )

  return retentionData
}

async function getCustomerSegments(
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

  return [
    {
      segment: "New",
      value: customers.filter((c) => c.bookings.length === 1).length,
    },
    {
      segment: "Returning",
      value: customers.filter(
        (c) => c.bookings.length > 1 && c.bookings.length <= 3
      ).length,
    },
    {
      segment: "Frequent",
      value: customers.filter((c) => c.bookings.length > 3).length,
    },
  ]
} 