import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; scheduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate the activity and schedule belong to the user
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: params.scheduleId,
        activity: {
          id: params.id,
          providerId: session.user.id,
        },
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      )
    }

    if (schedule._count.bookings > 0) {
      return NextResponse.json(
        { error: "Cannot delete schedule with existing bookings" },
        { status: 400 }
      )
    }

    await prisma.schedule.delete({
      where: { id: params.scheduleId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Schedule deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    )
  }
} 