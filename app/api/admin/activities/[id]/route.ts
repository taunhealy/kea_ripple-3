/**
 * API Route: Activity Management (Single Activity)
 * 
 * Handles operations for individual activities:
 * - GET: Fetch activity details
 * - PUT: Update activity
 * - DELETE: Remove activity
 * 
 * Includes validation and cascading operations
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

    const activity = await prisma.activity.findUnique({
      where: {
        id: params.id,
        providerId: session.user.id,
      },
      include: {
        schedules: {
          include: {
            bookings: {
              include: {
                customer: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(activity)
  } catch (error) {
    console.error("Activity fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity" },
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
    const activity = await prisma.activity.update({
      where: {
        id: params.id,
        providerId: session.user.id,
      },
      data,
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error("Activity update error:", error)
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check for existing bookings
    const bookings = await prisma.booking.findMany({
      where: {
        schedule: {
          activityId: params.id,
        },
        status: "CONFIRMED",
      },
    })

    if (bookings.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete activity with existing bookings. Cancel all bookings first.",
        },
        { status: 400 }
      )
    }

    // Delete associated schedules and the activity
    await prisma.$transaction([
      prisma.schedule.deleteMany({
        where: {
          activityId: params.id,
        },
      }),
      prisma.activity.delete({
        where: {
          id: params.id,
          providerId: session.user.id,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Activity deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    )
  }
} 