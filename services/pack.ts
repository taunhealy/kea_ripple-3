import prisma from "@/lib/prisma"
import { createId } from "@paralleldrive/cuid2"
import { addDays } from "date-fns"

interface PackCreateInput {
  activityId: string
  title: string
  description?: string
  sessions: number
  validityDays: number
  price: number
}

export class PackService {
  async createPack(input: PackCreateInput) {
    return await prisma.pack.create({
      data: {
        id: createId(),
        ...input
      }
    })
  }

  async getActivityPacks(activityId: string) {
    return await prisma.pack.findMany({
      where: { activityId }
    })
  }

  async updatePack(id: string, data: Partial<PackCreateInput>) {
    return await prisma.pack.update({
      where: { id },
      data
    })
  }

  async deletePack(id: string) {
    return await prisma.pack.delete({
      where: { id }
    })
  }

  async validatePackBooking(packId: string, userId: string) {
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      include: {
        bookings: {
          where: { userId }
        }
      }
    })

    if (!pack) throw new Error("Pack not found")

    const usedSessions = pack.bookings.length
    if (usedSessions >= pack.sessions) {
      throw new Error("All sessions in this pack have been used")
    }

    const firstBooking = pack.bookings[0]
    if (firstBooking) {
      const validUntil = addDays(firstBooking.createdAt, pack.validityDays)
      if (new Date() > validUntil) {
        throw new Error("Pack has expired")
      }
    }

    return pack
  }
} 