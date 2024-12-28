import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PackService } from "@/services/pack"
import prisma from "@/lib/prisma"

const packService = new PackService()

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const pack = await prisma.pack.findUnique({
      where: { id: params.id },
      include: { activity: true }
    })

    if (!pack || pack.activity.providerId !== session.user.id) {
      return NextResponse.json(
        { error: "Pack not found or unauthorized" },
        { status: 404 }
      )
    }

    const json = await request.json()
    const updatedPack = await packService.updatePack(params.id, json)

    return NextResponse.json(updatedPack)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update pack" },
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const pack = await prisma.pack.findUnique({
      where: { id: params.id },
      include: { activity: true }
    })

    if (!pack || pack.activity.providerId !== session.user.id) {
      return NextResponse.json(
        { error: "Pack not found or unauthorized" },
        { status: 404 }
      )
    }

    await packService.deletePack(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete pack" },
      { status: 500 }
    )
  }
} 