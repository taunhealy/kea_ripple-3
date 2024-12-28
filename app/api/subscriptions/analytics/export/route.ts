import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import ExcelJS from 'exceljs'
import { startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, format } from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6' // Default to 6 months
    const startDate = subMonths(new Date(), parseInt(period))

    // Fetch analytics data
    const bookings = await prisma.booking.findMany({
      where: {
        providerId: session.user.id,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        schedule: {
          include: {
            activity: true
          }
        }
      }
    })

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    
    // Monthly Overview
    const overviewSheet = workbook.addWorksheet('Monthly Overview')
    overviewSheet.columns = [
      { header: 'Month', key: 'month', width: 15 },
      { header: 'Total Bookings', key: 'bookings', width: 15 },
      { header: 'Revenue', key: 'revenue', width: 15 },
      { header: 'Avg. Participants', key: 'avgParticipants', width: 20 },
      { header: 'Usage %', key: 'usage', width: 15 }
    ]

    const months = eachMonthOfInterval({ start: startDate, end: new Date() })
    months.forEach(month => {
      const monthlyBookings = bookings.filter(b => 
        b.createdAt >= startOfMonth(month) &&
        b.createdAt <= endOfMonth(month)
      )

      const totalRevenue = monthlyBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0)
      const avgParticipants = monthlyBookings.length > 0
        ? monthlyBookings.reduce((sum, b) => sum + b.participants, 0) / monthlyBookings.length
        : 0

      overviewSheet.addRow({
        month: format(month, 'MMMM yyyy'),
        bookings: monthlyBookings.length,
        revenue: `R${totalRevenue.toFixed(2)}`,
        avgParticipants: avgParticipants.toFixed(1),
        usage: `${((monthlyBookings.length / 50) * 100).toFixed(1)}%`
      })
    })

    // Activity Analysis
    const activitySheet = workbook.addWorksheet('Activity Analysis')
    activitySheet.columns = [
      { header: 'Activity', key: 'activity', width: 30 },
      { header: 'Total Bookings', key: 'bookings', width: 15 },
      { header: 'Total Revenue', key: 'revenue', width: 15 },
      { header: 'Avg. Participants', key: 'avgParticipants', width: 20 }
    ]

    const activityStats = bookings.reduce((acc, booking) => {
      const activity = booking.schedule.activity.title
      if (!acc[activity]) {
        acc[activity] = {
          bookings: 0,
          revenue: 0,
          participants: 0
        }
      }
      acc[activity].bookings++
      acc[activity].revenue += Number(booking.totalPrice)
      acc[activity].participants += booking.participants
      return acc
    }, {} as Record<string, any>)

    Object.entries(activityStats).forEach(([activity, stats]) => {
      activitySheet.addRow({
        activity,
        bookings: stats.bookings,
        revenue: `R${stats.revenue.toFixed(2)}`,
        avgParticipants: (stats.participants / stats.bookings).toFixed(1)
      })
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Return the Excel file
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=subscription-analytics-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      }
    })
  } catch (error) {
    console.error("Analytics export error:", error)
    return NextResponse.json(
      { error: "Failed to generate analytics export" },
      { status: 500 }
    )
  }
} 