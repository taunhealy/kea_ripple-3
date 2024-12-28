/**
 * API Route: Analytics Export
 * 
 * Generates and provides downloadable analytics reports:
 * - Excel/CSV exports of analytics data
 * - Customizable date ranges
 * - Multiple report types (overview, detailed, custom)
 * - Formatted data with calculations and insights
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import ExcelJS from "exceljs"
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  eachMonthOfInterval,
} from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : startOfMonth(subMonths(new Date(), 12))
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : endOfMonth(new Date())

    const workbook = new ExcelJS.Workbook()
    workbook.creator = session.user.name || "Admin"
    workbook.created = new Date()

    // Overview Sheet
    const overviewSheet = workbook.addWorksheet("Overview")
    await generateOverviewSheet(overviewSheet, session.user.id, startDate, endDate)

    // Activity Performance Sheet
    const activitySheet = workbook.addWorksheet("Activity Performance")
    await generateActivitySheet(activitySheet, session.user.id, startDate, endDate)

    // Customer Insights Sheet
    const customerSheet = workbook.addWorksheet("Customer Insights")
    await generateCustomerSheet(customerSheet, session.user.id, startDate, endDate)

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=analytics-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.xlsx`,
      },
    })
  } catch (error) {
    console.error("Analytics export error:", error)
    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 500 }
    )
  }
}

async function generateOverviewSheet(
  sheet: ExcelJS.Worksheet,
  userId: string,
  startDate: Date,
  endDate: Date
) {
  sheet.columns = [
    { header: "Month", key: "month", width: 15 },
    { header: "Total Bookings", key: "bookings", width: 15 },
    { header: "Revenue", key: "revenue", width: 15 },
    { header: "Avg. Participants", key: "avgParticipants", width: 20 },
    { header: "Capacity Utilization", key: "utilization", width: 20 },
  ]

  const months = eachMonthOfInterval({ start: startDate, end: endDate })
  
  for (const month of months) {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)

    const bookings = await prisma.booking.findMany({
      where: {
        providerId: userId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        schedule: true,
      },
    })

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice),
      0
    )
    const avgParticipants =
      bookings.reduce(
        (sum, booking) => sum + booking.participants,
        0
      ) / bookings.length || 0

    sheet.addRow({
      month: format(month, "MMMM yyyy"),
      bookings: bookings.length,
      revenue: totalRevenue,
      avgParticipants: avgParticipants.toFixed(1),
      utilization: `${(
        (book 