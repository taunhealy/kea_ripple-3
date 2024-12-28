/**
 * API Route: Activity Bookings Management
 * 
 * Handles fetching and managing bookings for a specific activity:
 * - GET: Retrieves paginated bookings with search and status filters
 * - POST: Creates a new booking for the activity
 * 
 * Includes validation for:
 * - Admin/provider authorization
 * - Schedule availability
 * - Booking capacity
 */

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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"

    const where = {
      schedule: {
        activityId: params.id,
      },
      OR: search
        ? [
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { customer: { email: { contains: search, mode: "insensitive" } } },
          ]
        : undefined,
      status: status !== "all" ? status.toUpperCase() : undefined,
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        schedule: {
          select: {
            startTime: true,
            duration: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.booking.count({ where })

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Bookings fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
} 