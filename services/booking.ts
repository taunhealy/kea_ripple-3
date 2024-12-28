import prisma from "@/lib/prisma"
import { payfast } from "@/lib/payfast"
import { createId } from "@paralleldrive/cuid2"
import { BookingStatus, PaymentStatus } from "@prisma/client"
import { addDays, isAfter, isBefore, parseISO } from "date-fns"
import { BookingCreateInput } from "@/types/booking"
import { PackService } from "@/services/pack"

export class BookingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = "BookingError"
  }
}

export class BookingService {
  private async validateAvailability(
    scheduleId: string,
    participants: number,
    date: Date
  ) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        activity: true,
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"]
            }
          }
        }
      }
    })

    if (!schedule) {
      throw new BookingError("Schedule not found", "SCHEDULE_NOT_FOUND", 404)
    }

    // Check if provider's subscription is active
    const provider = await prisma.user.findUnique({
      where: { id: schedule.activity.providerId },
      select: { subscriptionStatus: true }
    })

    if (provider?.subscriptionStatus !== "ACTIVE") {
      throw new BookingError(
        "This activity is currently unavailable",
        "PROVIDER_INACTIVE"
      )
    }

    if (isBefore(date, schedule.startDate) || isAfter(date, schedule.endDate)) {
      throw new BookingError(
        "Selected date is outside schedule range",
        "INVALID_DATE"
      )
    }

    const bookedParticipants = schedule.bookings.reduce(
      (sum, booking) => sum + booking.participants,
      0
    )

    const availableSpots = schedule.maxParticipants - bookedParticipants

    if (participants > availableSpots) {
      throw new BookingError(
        `Only ${availableSpots} spots available`,
        "INSUFFICIENT_CAPACITY"
      )
    }

    return { schedule, availableSpots }
  }

  private async validateProviderSubscription(providerId: string) {
    const provider = await prisma.user.findUnique({
      where: { id: providerId },
      select: { 
        subscriptionTier: true,
        subscriptionStatus: true,
        monthlyBookings: true,
        stripeAccountId: true 
      }
    })

    if (!provider || provider.subscriptionStatus !== "ACTIVE") {
      throw new BookingError("Provider subscription inactive", "SUBSCRIPTION_INACTIVE")
    }

    // Check booking limits based on tier
    const bookingLimits = {
      BASIC: 50,
      PROFESSIONAL: 200,
      ENTERPRISE: Infinity
    }

    if (provider.monthlyBookings >= bookingLimits[provider.subscriptionTier]) {
      throw new BookingError("Monthly booking limit reached", "BOOKING_LIMIT_REACHED")
    }

    if (!provider.stripeAccountId) {
      throw new BookingError("Provider payment setup incomplete", "PAYMENT_SETUP_INCOMPLETE")
    }

    return provider
  }

  private async validatePackBooking(packId: string, userId: string) {
    const packService = new PackService()
    return await packService.validatePackBooking(packId, userId)
  }

  async createBooking(input: BookingCreateInput) {
    return await prisma.$transaction(async (tx) => {
      // If booking with a pack
      if (input.packId) {
        const pack = await this.validatePackBooking(input.packId, input.userId)
        // Use pack price instead of regular price
        input.totalPrice = pack.price
      }

      const { schedule } = await this.validateAvailability(
        input.scheduleId,
        input.participants,
        parseISO(input.date)
      )

      const booking = await tx.booking.create({
        data: {
          id: createId(),
          scheduleId: input.scheduleId,
          activityId: schedule.activity.id,
          userId: input.userId,
          participants: input.participants,
          date: parseISO(input.date),
          status: BookingStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          totalPrice: input.totalPrice || schedule.price || schedule.activity.price,
          specialRequests: input.specialRequests,
          contactDetails: input.contactDetails
        },
        include: {
          schedule: {
            include: {
              activity: {
                include: {
                  provider: true
                }
              }
            }
          },
          user: true
        }
      })

      const payment = payfast.createPaymentRequest({
        amount: booking.totalPrice,
        itemName: `Booking for ${booking.schedule.activity.title}`,
        merchantReference: booking.id,
        email: booking.user.email,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel`,
        notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/payfast`
      })

      return {
        booking,
        payment
      }
    })
  }

  async cancelBooking(bookingId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          schedule: {
            include: {
              activity: true
            }
          }
        }
      })

      if (!booking) {
        throw new BookingError("Booking not found", "BOOKING_NOT_FOUND", 404)
      }

      if (
        booking.userId !== userId &&
        booking.schedule.activity.providerId !== userId
      ) {
        throw new BookingError(
          "Not authorized to cancel this booking",
          "UNAUTHORIZED",
          403
        )
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED
        }
      })

      await tx.notification.createMany({
        data: [
          {
            userId: booking.userId,
            type: "BOOKING_CANCELLED",
            title: "Booking Cancelled",
            message: `Your booking for ${booking.schedule.activity.title} has been cancelled`
          },
          {
            userId: booking.schedule.activity.providerId,
            type: "BOOKING_CANCELLED",
            title: "Booking Cancelled",
            message: `A booking for ${booking.schedule.activity.title} has been cancelled`
          }
        ]
      })

      return updatedBooking
    })
  }

  private async sendBookingConfirmation(booking: any) {
    // Implementation for sending confirmation email
  }
}

export const bookingService = new BookingService()