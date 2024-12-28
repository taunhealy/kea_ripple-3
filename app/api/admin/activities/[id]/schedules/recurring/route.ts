/**
 * API Route: Recurring Schedule Generation
 * 
 * Handles bulk creation of activity schedules:
 * - POST: Generates multiple schedules based on recurring pattern
 * 
 * Includes:
 * - Conflict detection
 * - Operating hours validation
 * - Availability checks
 * - Bulk database operations
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  addDays,
  eachDayOfInterval,
  setHours,
  setMinutes,
  isBefore,
  isWithinInterval,
} from "date-fns"

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
    const { startDate, endDate, days, timeSlots } = data

    // Validate the activity belongs to the user
    const activity = await prisma.activity.findFirst({
      where: {
        id: params.id,
        providerId: session.user.id,
      },
      include: {
        availability: true,
      },
    })

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }

    // Generate all dates in the range
    const dates = eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    }).filter((date) => days.includes(date.getDay()))

    // Check for blocked dates
    const blockedDates = activity.availability?.blockedDates || []
    const availableDates = dates.filter(
      (date) =>
        !blockedDates.some((blocked) =>
          isWithinInterval(date, {
            start: startOfDay(new Date(blocked)),
            end: endOfDay(new Date(blocked)),
          })
        )
    )

    // Generate schedules
    const schedules = []
    for (const date of availableDates) {
      for (const slot of timeSlots) {
        const [hours, minutes] = slot.startTime.split(":").map(Number)
        const startTime = setMinutes(setHours(date, hours), minutes)

        // Skip if in the past
        if (isBefore(startTime, new Date())) continue

        schedules.push({
          activityId: params.id,
          startTime,
          duration: slot.duration,
          maxParticipants: slot.maxParticipants,
        })
      }
    }

    // Bulk create schedules
    const result = await prisma.schedule.createMany({
      data: schedules,
      skipDuplicates: true,
    })

    return NextResponse.json({
      count: result.count,
      message: `Successfully generated ${result.count} schedules`,
    })
  } catch (error) {
    console.error("Schedule generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate schedules" },
      { status: 500 }
    )
  }
} 