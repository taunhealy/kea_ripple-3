import { z } from "zod"

export const activitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  maxParticipants: z.number().min(1, "Must allow at least 1 participant"),
  minParticipants: z.number().default(1),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z.string().default("USD"),
  locationId: z.string().optional(),
  categoryId: z.string(),
  requirements: z.string().optional(),
  included: z.array(z.string()),
  excluded: z.array(z.string()),
  cancellationPolicy: z.enum(["FLEXIBLE", "MODERATE", "STRICT", "NON_REFUNDABLE"]),
  tags: z.array(z.string()).default([])
})

export const scheduleSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  daysOfWeek: z.array(z.number().min(0).max(6)),
  maxParticipants: z.number().min(1),
  price: z.number().optional(),
  isRecurring: z.boolean().default(false),
  recurringUntil: z.string().datetime().optional()
})