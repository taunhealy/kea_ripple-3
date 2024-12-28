import { NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { emailService } from "@/services/email"
import { render } from '@react-email/render'
import { UsageAlertEmail } from "@/emails/UsageAlertEmail"
import { WeeklyReportEmail } from "@/emails/WeeklyReportEmail"
import { verifySignature } from "@/lib/webhooks"
import { subDays, startOfWeek, endOfWeek } from "date-fns"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get("webhook-signature")
    
    // Verify webhook signature
    if (!verifySignature(body, signature!)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    const data = JSON.parse(body)
    const { type, userId } = data

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationPreferences: true,
        subscription: true
      }
    })

    if (!user || !user.notificationPreferences) {
      throw new Error("User or preferences not found")
    }

    switch (type) {
      case "USAGE_ALERT": {
        if (!user.notificationPreferences.usageAlerts) break

        const { usagePercentage, currentBookings, maxBookings, daysRemaining } = data

        // Create notification record
        await prisma.notification.create({
          data: {
            userId,
            type: "USAGE_ALERT",
            title: usagePercentage >= 90 
              ? "Critical Usage Alert"
              : "Usage Warning",
            message: `You've used ${usagePercentage.toFixed(1)}% of your monthly booking limit`
          }
        })

        // Send email if enabled
        if (user.notificationPreferences.emailNotifications) {
          const emailHtml = render(UsageAlertEmail({
            name: user.name || "",
            usagePercentage,
            currentBookings,
            maxBookings,
            daysRemaining,
            tier: user.subscription?.tier || "BASIC"
          }))

          await emailService.sendEmail({
            to: user.email,
            subject: usagePercentage >= 90 
              ? "Critical Usage Alert: Action Required"
              : "Usage Warning: Approaching Limit",
            html: emailHtml
          })
        }
        break
      }

      case "WEEKLY_REPORT": {
        if (!user.notificationPreferences.weeklyReports) break

        const startDate = startOfWeek(subDays(new Date(), 7))
        const endDate = endOfWeek(subDays(new Date(), 1))

        // Fetch weekly stats
        const bookings = await prisma.booking.findMany({
          where: {
            providerId: userId,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            schedule: {
              include: {
                activity: true
              }
            }
          }
        })

        // Calculate statistics
        const stats = {
          totalBookings: bookings.length,
          totalRevenue: bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0),
          avgParticipants: bookings.length > 0
            ? bookings.reduce((sum, b) => sum + b.participants, 0) / bookings.length
            : 0,
          usagePercentage: (bookings.length / (user.subscription?.maxBookings || 50)) * 100,
          topActivities: Object.values(
            bookings.reduce((acc, booking) => {
              const activity = booking.schedule.activity.title
              if (!acc[activity]) {
                acc[activity] = {
                  name: activity,
                  bookings: 0,
                  revenue: 0
                }
              }
              acc[activity].bookings++
              acc[activity].revenue += Number(booking.totalPrice)
              return acc
            }, {} as Record<string, any>)
          ).sort((a, b) => b.bookings - a.bookings).slice(0, 5)
        }

        // Send weekly report email
        const emailHtml = render(WeeklyReportEmail({
          name: user.name || "",
          startDate,
          endDate,
          stats
        }))

        await emailService.sendEmail({
          to: user.email,
          subject: "Your Weekly Booking Report",
          html: emailHtml
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
} 