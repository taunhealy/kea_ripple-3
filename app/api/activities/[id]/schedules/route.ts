import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { scheduleSchema } from "@/lib/validations/activity"
import { createId } from "@paralleldrive/cuid2"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify activity ownership
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      select: { providerId: true }
    })

    if (!activity || activity.providerId !== session.user.id) {
      return NextResponse.json(
        { error: "Activity not found or unauthorized" },
        { status: 404 }
      )
    }

    const json = await request.json()
    const validatedData = scheduleSchema.parse(json)

    const schedule = await prisma.schedule.create({
      data: {
        id: createId(),
        ...validatedData,
        activityId: params.id
      }
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    )
  }
} 