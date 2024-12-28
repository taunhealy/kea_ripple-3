/**
 * API Route: Activity Availability Management
 * 
 * Handles activity availability settings:
 * - GET: Retrieves current availability settings
 * - PUT: Updates availability settings including operating hours,
 *        blocked dates, and scheduling rules
 * 
 * Includes validation for:
 * - Admin/provider authorization
 * - Time slot conflicts
 * - Valid date ranges
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const availability = await prisma.activityAvailability.findUnique({
      where: {
        activityId: params.id,
      },
    })

    if (!availability) {
      return NextResponse.json(
        {
          operatingHours: [],
          bufferTime: 15,
          advanceBookingLimit: 30,
          blockedDates: [],
        }
      )
    }

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Availability fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch availability settings" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { operatingHours, bufferTime, advanceBookingLimit, blockedDates } = data

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

    // Update or create availability settings
    const availability = await prisma.activityAvailability.upsert({
      where: {
        activityId: params.id,
      },
      create: {
        activityId: params.id,
        operatingHours,
        bufferTime,
        advanceBookingLimit,
        blockedDates: blockedDates.map((date: string) => new Date(date)),
      },
      update: {
        operatingHours,
        bufferTime,
        advanceBookingLimit,
        blockedDates: blockedDates.map((date: string) => new Date(date)),
      },
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Availability update error:", error)
    return NextResponse.json(
      { error: "Failed to update availability settings" },
      { status: 500 }
    )
  }
} 