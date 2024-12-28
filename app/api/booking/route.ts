import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { bookingService, BookingError } from "@/services/booking"
import { bookingCreateSchema } from "@/lib/validations/booking"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Apply rate limiting
    const limiter = await rateLimit.check(request, 10, "1m") // 10 requests per minute
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many booking attempts" },
        { status: 429 }
      )
    }

    const json = await request.json()
    const validatedData = bookingCreateSchema.parse(json)

    const result = await bookingService.createBooking({
      ...validatedData,
      userId: session.user.id
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Booking creation error:", error)

    if (error instanceof BookingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          {
            schedule: {
              activity: {
                providerId: session.user.id
              }
            }
          }
        ],
        status: status || undefined,
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined
        }
      },
      include: {
        schedule: {
          include: {
            activity: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        addons: {
          include: {
            addon: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}