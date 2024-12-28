/**
 * Analytics Export Sheet Generation
 * 
 * Functions for generating detailed Excel sheets for analytics exports:
 * - Activity performance analysis
 * - Customer insights
 * - Financial reports
 * - Booking patterns
 */

import type { Worksheet } from "exceljs"
import prisma from "@/lib/prisma"
import {
  startOfMonth,
  endOfMonth,
  format,
  eachMonthOfInterval,
} from "date-fns"
import { calculateActivityPerformance } from "./activity-performance"
import { getSegmentDetails } from "./customer-metrics"

export async function generateActivitySheet(
  sheet: Worksheet,
  userId: string,
  startDate: Date,
  endDate: Date
) {
  sheet.columns = [
    { header: "Activity", key: "activity", width: 30 },
    { header: "Total Bookings", key: "bookings", width: 15 },
    { header: "Revenue", key: "revenue", width: 15 },
    { header: "Avg. Participants", key: "avgParticipants", width: 20 },
    { header: "Capacity %", key: "capacity", width: 15 },
    { header: "Rating", key: "rating", width: 15 },
  ]

  const activities = await prisma.activity.findMany({
    where: {
      providerId: userId,
    },
    include: {
      schedules: {
        where: {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          bookings: {
            include: {
              reviews: true,
            },
          },
        },
      },
    },
  })

  for (const activity of activities) {
    const bookings = activity.schedules.flatMap((s) => s.bookings)
    const totalCapacity = activity.schedules.reduce(
      (sum, s) => sum + s.maxParticipants,
      0
    )
    const totalParticipants = bookings.reduce(
      (sum, b) => sum + b.participants,
      0
    )
    const totalRevenue = bookings.reduce(
      (sum, b) => sum + Number(b.totalPrice),
      0
    )
    const avgRating =
      bookings.reduce(
        (sum, b) =>
          sum + (b.reviews[0]?.rating || 0) * b.participants,
        0
      ) / totalParticipants || 0

    sheet.addRow({
      activity: activity.title,
      bookings: bookings.length,
      revenue: totalRevenue,
      avgParticipants: (totalParticipants / bookings.length || 0).toFixed(1),
      capacity: `${((totalParticipants / totalCapacity) * 100).toFixed(1)}%`,
      rating: avgRating.toFixed(1),
    })
  }

  // Add formatting
  sheet.getColumn("revenue").numFmt = '"R"#,##0.00'
  sheet.getRow(1).font = { bold: true }
}

export async function generateCustomerSheet(
  sheet: Worksheet,
  userId: string,
  startDate: Date,
  endDate: Date
) {
  sheet.columns = [
    { header: "Segment", key: "segment", width: 20 },
    { header: "Customers", key: "customers", width: 15 },
    { header: "Revenue", key: "revenue", width: 15 },
    { header: "Avg. Value", key: "avgValue", width: 15 },
    { header: "Retention %", key: "retention", width: 15 },
  ]

  const segments = await getSegmentDetails(userId, startDate, endDate)

  segments.forEach((segment) => {
    sheet.addRow({
      segment: segment.name,
      customers: segment.customers,
      revenue: segment.revenue,
      avgValue: segment.averageValue,
      retention: `${segment.retention.toFixed(1)}%`,
    })
  })

  // Add formatting
  sheet.getColumn("revenue").numFmt = '"R"#,##0.00'
  sheet.getColumn("avgValue").numFmt = '"R"#,##0.00'
  sheet.getRow(1).font = { bold: true }
} 