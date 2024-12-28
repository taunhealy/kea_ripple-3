import prisma from "@/lib/prisma"
import { NotificationType } from "@prisma/client"
import { createId } from "@paralleldrive/cuid2"
import { sendEmail } from "@/lib/email"

interface NotificationCreateInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  relatedId?: string
}

export class NotificationService {
  async create(input: NotificationCreateInput) {
    const notification = await prisma.notification.create({
      data: {
        id: createId(),
        ...input
      },
      include: {
        user: true
      }
    })

    // Send email notification
    await sendEmail({
      to: notification.user.email,
      subject: notification.title,
      text: notification.message
    })

    return notification
  }

  async markAsRead(id: string, userId: string) {
    return await prisma.notification.update({
      where: {
        id,
        userId // Ensure user owns the notification
      },
      data: {
        read: true
      }
    })
  }

  async getUserNotifications(userId: string, options?: {
    unreadOnly?: boolean
    limit?: number
    offset?: number
  }) {
    return await prisma.notification.findMany({
      where: {
        userId,
        ...(options?.unreadOnly ? { read: false } : {})
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: options?.limit,
      skip: options?.offset
    })
  }

  async deleteNotification(id: string, userId: string) {
    return await prisma.notification.delete({
      where: {
        id,
        userId // Ensure user owns the notification
      }
    })
  }
} 