import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const date = dateParam ? new Date(dateParam) : new Date()

    const schedules = await prisma.schedule.findMany({
      where: {
        activityId: params.id,
        startTime: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json(
      schedules.map((schedule) => ({
        ...schedule,
        bookedCount: schedule._count.bookings,
      }))
    )
  } catch (error) {
    console.error("Schedule fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { startTime, duration, maxParticipants } = data

    // Validate the activity belongs to the user
    const activity = await prisma.activity.findFirst({
      where: {
        id: params.id,
        providerId: session.user.id,
      },
    })

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }

    const schedule = await prisma.schedule.create({
      data: {
        activityId: params.id,
        startTime: new Date(startTime),
        duration,
        maxParticipants,
      },
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Schedule creation error:", error)
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    )
  }
} 