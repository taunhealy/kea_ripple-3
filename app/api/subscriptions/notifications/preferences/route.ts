import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json(preferences)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        ...data
      }
    })

    return NextResponse.json(preferences)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    )
  }
} 