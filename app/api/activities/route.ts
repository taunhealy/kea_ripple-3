import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { activitySchema } from "@/lib/validations/activity"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const validatedData = activitySchema.parse(json)

    // Check if user is a provider
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "PROVIDER" && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only providers can create activities" },
        { status: 403 }
      )
    }

    const activity = await prisma.activity.create({
      data: {
        id: createId(),
        ...validatedData,
        providerId: session.user.id,
        status: "DRAFT"
      },
      include: {
        location: true,
        category: true,
        images: true
      }
    })

    return NextResponse.json(activity)
  } catch (error: any) {
    console.error("Error creating activity:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create activity" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const filters = {
    categoryId: searchParams.get("category"),
    locationId: searchParams.get("location"),
    minPrice: Number(searchParams.get("minPrice")) || undefined,
    maxPrice: Number(searchParams.get("maxPrice")) || undefined,
    date: searchParams.get("date"),
    participants: Number(searchParams.get("participants")) || undefined
  }

  try {
    const activities = await prisma.activity.findMany({
      where: {
        status: "ACTIVE",
        categoryId: filters.categoryId || undefined,
        locationId: filters.locationId || undefined,
        price: {
          gte: filters.minPrice,
          lte: filters.maxPrice
        },
        maxParticipants: {
          gte: filters.participants
        },
        schedules: filters.date ? {
          some: {
            startDate: {
              lte: new Date(filters.date)
            },
            endDate: {
              gte: new Date(filters.date)
            }
          }
        } : undefined
      },
      include: {
        location: true,
        category: true,
        images: {
          where: { isPrimary: true },
          take: 1
        },
        provider: {
          select: {
            name: true,
            businessName: true
          }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}