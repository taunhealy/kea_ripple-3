import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { payfast } from "@/lib/payfast"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
        payments: {
          where: {
            status: "PAID",
            type: "SUBSCRIPTION"
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 12 // Last 12 months
        }
      }
    })

    if (!user?.subscription) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Format card details (if stored)
    const card = user.subscription.paymentMethodId ? {
      last4: "••••", // In production, fetch from payment provider
      expMonth: "••",
      expYear: "••"
    } : null

    // Format invoices
    const invoices = user.payments.map(payment => ({
      id: payment.id,
      date: payment.createdAt,
      amount: payment.amount,
      description: payment.description,
      status: payment.status
    }))

    // Calculate upcoming invoice
    const upcomingInvoice = {
      date: user.subscription.nextBillingDate,
      amount: user.subscription.amount
    }

    return NextResponse.json({
      card,
      invoices,
      upcomingInvoice
    })
  } catch (error) {
    console.error("Billing info error:", error)
    return NextResponse.json(
      { error: "Failed to fetch billing information" },
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

    // Update payment method with PayFast
    const paymentMethod = await payfast.updatePaymentMethod({
      userId: session.user.id,
      ...data
    })

    // Update subscription with new payment method
    await prisma.subscription.update({
      where: {
        userId: session.user.id
      },
      data: {
        paymentMethodId: paymentMethod.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update billing error:", error)
    return NextResponse.json(
      { error: "Failed to update billing information" },
      { status: 500 }
    )
  }
} 