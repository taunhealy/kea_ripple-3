import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { PDFDocument, rgb } from "pdf-lib"
import { format } from "date-fns"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payment = await prisma.payment.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        user: true
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    const { height } = page.getSize()

    // Add content to PDF
    page.drawText("INVOICE", {
      x: 50,
      y: height - 50,
      size: 24
    })

    page.drawText(`Invoice Number: ${payment.id}`, {
      x: 50,
      y: height - 100,
      size: 12
    })

    page.drawText(`Date: ${format(payment.createdAt, 'MMMM dd, yyyy')}`, {
      x: 50,
      y: height - 120,
      size: 12
    })

    page.drawText("Bill To:", {
      x: 50,
      y: height - 160,
      size: 12
    })

    page.drawText(payment.user.businessName || payment.user.name || "", {
      x: 50,
      y: height - 180,
      size: 12
    })

    // Add payment details
    page.drawText("Description", {
      x: 50,
      y: height - 250,
      size: 12,
      color: rgb(0.5, 0.5, 0.5)
    })

    page.drawText("Amount", {
      x: 450,
      y: height - 250,
      size: 12,
      color: rgb(0.5, 0.5, 0.5)
    })

    page.drawText(payment.description, {
      x: 50,
      y: height - 280,
      size: 12
    })

    page.drawText(`R${payment.amount.toFixed(2)}`, {
      x: 450,
      y: height - 280,
      size: 12
    })

    // Add total
    page.drawText("Total:", {
      x: 380,
      y: height - 350,
      size: 14
    })

    page.drawText(`R${payment.amount.toFixed(2)}`, {
      x: 450,
      y: height - 350,
      size: 14
    })

    // Add footer
    page.drawText("Thank you for your business", {
      x: 50,
      y: 50,
      size: 12
    })

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

    // Return PDF file
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${payment.id}.pdf"`
      }
    })
  } catch (error) {
    console.error("Invoice generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    )
  }
} 