import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { addDays, eachDayOfInterval, setHours, setMinutes } from "date-fns"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const {
      title,
      description,
      duration,
      price,
      maxParticipants,
      location,
      isRecurring,
      recurringDays,
      startDate,
      endDate,
      startTime,
      endTime,
    } = data

    // Create the activity
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        duration,
        price,
        maxParticipants,
        location,
        providerId: session.user.id,
      },
    })

    // Generate schedules
    if (isRecurring && recurringDays) {
      const [startHour, startMinute] = startTime.split(":").map(Number)
      const schedules = generateRecurringSchedules({
        activityId: activity.id,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : addDays(new Date(startDate), 90),
        recurringDays,
        startHour,
        startMinute,
        duration,
      })

      await prisma.schedule.createMany({
        data: schedules,
      })
    } else {
      // Create single schedule
      const [startHour, startMinute] = startTime.split(":").map(Number)
      await prisma.schedule.create({
        data: {
          activityId: activity.id,
          startTime: setMinutes(setHours(new Date(startDate), startHour), startMinute),
          duration,
        },
      })
    }

    return NextResponse.json({ activity })
  } catch (error) {
    console.error("Activity creation error:", error)
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const activities = await prisma.activity.findMany({
      where: {
        providerId: session.user.id,
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
      include: {
        schedules: {
          take: 5,
          orderBy: { startTime: "asc" },
        },
        _count: {
          select: { bookings: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.activity.count({
      where: {
        providerId: session.user.id,
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
    })

    return NextResponse.json({
      activities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Activity fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}

function generateRecurringSchedules({
  activityId,
  startDate,
  endDate,
  recurringDays,
  startHour,
  startMinute,
  duration,
}: {
  activityId: string
  startDate: Date
  endDate: Date
  recurringDays: number[]
  startHour: number
  startMinute: number
  duration: number
}) {
  const schedules = []
  const dates = eachDayOfInterval({ start: startDate, end: endDate })

  for (const date of dates) {
    if (recurringDays.includes(date.getDay())) {
      const startTime = setMinutes(setHours(date, startHour), startMinute)
      schedules.push({
        activityId,
        startTime,
        duration,
      })
    }
  }

  return schedules
} 