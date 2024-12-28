/**
 * API Route: Analytics Overview
 * 
 * Provides aggregated analytics data:
 * - Key performance metrics
 * - Overall trends
 * - Summary statistics
 * - Usage metrics
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns"
import { calculateMetrics } from "@/lib/analytics"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : startOfMonth(subMonths(new Date(), 1))
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : endOfMonth(new Date())

    // Fetch bookings for the period
    const bookings = await prisma.booking.findMany({
      where: {
        providerId: session.user.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        schedule: {
          include: {
            activity: true,
          },
        },
        customer: true,
      },
    })

    // Calculate key metrics
    const metrics = await calculateMetrics({
      bookings,
      startDate,
      endDate,
      userId: session.user.id,
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
} 