import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PackService } from "@/services/pack"
import { z } from "zod"

const packService = new PackService()

const packSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  sessions: z.number().min(1, "Must have at least 1 session"),
  validityDays: z.number().min(1, "Must be valid for at least 1 day"),
  price: z.number().min(0, "Price cannot be negative")
})

export async function POST(
  request: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const validatedData = packSchema.parse(json)

    const pack = await packService.createPack({
      ...validatedData,
      activityId: params.activityId
    })

    return NextResponse.json(pack)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create pack" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const packs = await packService.getActivityPacks(params.activityId)
    return NextResponse.json(packs)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch packs" },
      { status: 500 }
    )
  }
} 