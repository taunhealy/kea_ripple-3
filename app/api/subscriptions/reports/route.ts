import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfMonth, endOfMonth, format } from "date-fns"
import ExcelJS from 'exceljs'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') 
      ? new Date(searchParams.get('month')!) 
      : new Date()

    const startDate = startOfMonth(month)
    const endDate = endOfMonth(month)

    // Fetch usage data
    const bookings = await prisma.booking.findMany({
      where: {
        providerId: session.user.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        schedule: {
          include: {
            activity: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Usage Report')

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Activity', key: 'activity', width: 30 },
      { header: 'Schedule', key: 'schedule', width: 20 },
      { header: 'Participants', key: 'participants', width: 15 },
      { header: 'Revenue', key: 'revenue', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ]

    // Add data
    bookings.forEach(booking => {
      worksheet.addRow({
        date: format(booking.createdAt, 'yyyy-MM-dd'),
        activity: booking.schedule.activity.title,
        schedule: format(booking.date, 'HH:mm'),
        participants: booking.participants,
        revenue: booking.totalPrice,
        status: booking.status
      })
    })

    // Add summary
    worksheet.addRow([])
    worksheet.addRow(['Summary'])
    worksheet.addRow([
      'Total Bookings:',
      bookings.length
    ])
    worksheet.addRow([
      'Total Revenue:',
      bookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0)
    ])
    worksheet.addRow([
      'Average Participants:',
      Math.round(
        bookings.reduce((sum, booking) => sum + booking.participants, 0) / 
        bookings.length
      )
    ])

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Return the Excel file
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=usage-report-${format(month, 'yyyy-MM')}.xlsx`
      }
    })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
} 