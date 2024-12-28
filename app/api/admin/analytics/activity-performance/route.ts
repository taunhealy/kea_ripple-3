import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activityId = searchParams.get("activityId")
    const startDate = startOfMonth(subMonths(new Date(), 1))
    const endDate = endOfMonth(new Date())

    const query = {
      providerId: session.user.id,
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

    const [bookings, popularTimeSlots, performanceMetrics] = await Promise.all([
      prisma.booking.findMany({
        where: query,
        include: {
          schedule: {
            include: {
              activity: true,
            },
          },
        },
      }),
      prisma.schedule.groupBy({
        by: ["startTime"],
        where: {
          bookings: {
            some: query,
          },
        },
        _count: {
          bookings: true,
        },
        orderBy: {
          _count: {
            bookings: "desc",
          },
        },
        take: 10,
      }),
      calculateActivityPerformance(session.user.id, activityId, startDate, endDate),
    ])

    return NextResponse.json({
      bookings,
      popularTimeSlots,
      performanceMetrics,
      insights: generateActivityInsights(bookings),
    })
  } catch (error) {
    console.error("Activity performance error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity performance" },
      { status: 500 }
    )
  }
} 