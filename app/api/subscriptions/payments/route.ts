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

    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
        type: "SUBSCRIPTION"
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true,
        invoiceUrl: true
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Payment history error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment history" },
      { status: 500 }
    )
  }
} 