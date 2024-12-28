import prisma from "@/lib/prisma"
import { Resend } from "resend"
import { format } from "date-fns"

const resend = new Resend(process.env.RESEND_API_KEY)

export class NotificationService {
  async sendBookingConfirmation(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        schedule: {
          include: {
            activity: true,
          },
        },
      },
    })

    if (!booking) throw new Error("Booking not found")

    // Send email notification
    await resend.emails.send({
      from: "bookings@yourdomain.com",
      to: booking.customer.email,
      subject: "Booking Confirmation",
      react: EmailTemplate({
        customerName: booking.customer.name,
        activityName: booking.schedule.activity.title,
        dateTime: format(
          new Date(booking.schedule.startTime),
          "MMMM d, yyyy 'at' HH:mm"
        ),
        duration: booking.schedule.duration,
        participants: booking.participants,
        location: booking.schedule.activity.location,
      }),
    })

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: booking.customer.id,
        type: "BOOKING_CONFIRMATION",
        title: "Booking Confirmed",
        message: `Your booking for ${
          booking.schedule.activity.title
        } on ${format(
          new Date(booking.schedule.startTime),
          "MMMM d, yyyy"
        )} has been confirmed.`,
        metadata: {
          bookingId: booking.id,
          activityId: booking.schedule.activity.id,
        },
      },
    })
  }

  async sendBookingReminder(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        schedule: {
          include: {
            activity: true,
          },
        },
      },
    })

    if (!booking) throw new Error("Booking not found")

    await resend.emails.send({
      from: "reminders@yourdomain.com",
      to: booking.customer.email,
      subject: "Upcoming Booking Reminder",
      react: ReminderTemplate({
        customerName: booking.customer.name,
        activityName: booking.schedule.activity.title,
        dateTime: format(
          new Date(booking.schedule.startTime),
          "MMMM d, yyyy 'at' HH:mm"
        ),
        location: booking.schedule.activity.location,
      }),
    })
  }

  async sendScheduleUpdate(scheduleId: string, type: "CANCELLED" | "MODIFIED") {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        activity: true,
        bookings: {
          include: {
            customer: true,
          },
        },
      },
    })

    if (!schedule) throw new Error("Schedule not found")

    // Notify all affected customers
    for (const booking of schedule.bookings) {
      await resend.emails.send({
        from: "updates@yourdomain.com",
        to: booking.customer.email,
        subject: `Schedule ${type === "CANCELLED" ? "Cancellation" : "Update"}`,
        react: ScheduleUpdateTemplate({
          customerName: booking.customer.name,
          activityName: schedule.activity.title,
          type,
          dateTime: format(
            new Date(schedule.startTime),
            "MMMM d, yyyy 'at' HH:mm"
          ),
        }),
      })

      await prisma.notification.create({
        data: {
          userId: booking.customer.id,
          type: `SCHEDULE_${type}`,
          title: `Schedule ${type === "CANCELLED" ? "Cancelled" : "Modified"}`,
          message: `The schedule for ${
            schedule.activity.title
          } on ${format(
            new Date(schedule.startTime),
            "MMMM d, yyyy"
          )} has been ${type.toLowerCase()}.`,
          metadata: {
            scheduleId: schedule.id,
            activityId: schedule.activity.id,
          },
        },
      })
    }
  }
}

export const notificationService = new NotificationService() 