/**
 * Predictive Analytics Functions
 * 
 * Provides functions for forecasting and trend analysis:
 * - Booking demand prediction
 * - Revenue forecasting
 * - Seasonal pattern detection
 * - Capacity planning recommendations
 * - Customer behavior prediction
 */

import prisma from "@/lib/prisma"
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachMonthOfInterval,
  format,
} from "date-fns"

interface PredictionInput {
  userId: string
  months: number
  activityId?: string
}

export async function predictBookingDemand({
  userId,
  months,
  activityId,
}: PredictionInput) {
  // Fetch historical data
  const historicalData = await getHistoricalBookings(
    userId,
    24,
    activityId
  )

  // Analyze seasonal patterns
  const seasonalPatterns = analyzeSeasonalPatterns(historicalData)

  // Generate predictions
  const predictions = generatePredictions(
    historicalData,
    seasonalPatterns,
    months
  )

  // Calculate confidence intervals
  const withConfidence = calculateConfidenceIntervals(predictions)

  return withConfidence
}

async function getHistoricalBookings(
  userId: string,
  monthsBack: number,
  activityId?: string
) {
  const startDate = startOfMonth(subMonths(new Date(), monthsBack))
  const endDate = endOfMonth(new Date())

  const bookings = await prisma.booking.findMany({
    where: {
      providerId: userId,
      ...(activityId && {
        schedule: {
          activityId,
        },
      }),
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      schedule: true,
    },
  })

  const months = eachMonthOfInterval({ start: startDate, end: endDate })
  return months.map((month) => {
    const monthBookings = bookings.filter(
      (booking) =>
        booking.createdAt >= startOfMonth(month) &&
        booking.createdAt <= endOfMonth(month)
    )

    return {
      month: format(month, "yyyy-MM"),
      bookings: monthBookings.length,
      revenue: monthBookings.reduce(
        (sum, booking) => sum + Number(booking.totalPrice),
        0
      ),
    }
  })
}

function analyzeSeasonalPatterns(historicalData: any[]) {
  const monthlyAverages = Array(12).fill(0)
  const monthCounts = Array(12).fill(0)

  historicalData.forEach((data) => {
    const month = parseInt(data.month.split("-")[1]) - 1
    monthlyAverages[month] += data.bookings
    monthCounts[month]++
  })

  return monthlyAverages.map((total, index) => ({
    month: index + 1,
    average: monthCounts[index]
      ? total / monthCounts[index]
      : null,
  }))
}

function generatePredictions(
  historicalData: any[],
  seasonalPatterns: any[],
  months: number
) {
  const trend = calculateTrend(historicalData)
  const predictions = []
  const lastMonth = new Date(
    historicalData[historicalData.length - 1].month + "-01"
  )

  for (let i = 1; i <= months; i++) {
    const predictionMonth = addMonths(lastMonth, i)
    const monthIndex = predictionMonth.getMonth()
    const seasonalFactor = seasonalPatterns[monthIndex].average
      ? seasonalPatterns[monthIndex].average /
        (historicalData.reduce(
          (sum, data) => sum + data.bookings,
          0
        ) /
          historicalData.length)
      : 1

    predictions.push({
      month: format(predictionMonth, "yyyy-MM"),
      predicted: Math.max(
        0,
        Math.round(
          (trend.baseline + trend.slope * (historicalData.length + i)) *
            seasonalFactor
        )
      ),
    })
  }

  return predictions
}

function calculateTrend(historicalData: any[]) {
  const n = historicalData.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = historicalData.map((d) => d.bookings)

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope =
    (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const baseline = (sumY - slope * sumX) / n

  return { slope, baseline }
}

function calculateConfidenceIntervals(predictions: any[]) {
  const confidenceLevel = 0.95 // 95% confidence interval
  const zScore = 1.96 // z-score for 95% confidence

  return predictions.map((prediction) => {
    const standardError = prediction.predicted * 0.1 // Simplified error calculation
    const marginOfError = zScore * standardError

    return {
      ...prediction,
      lowerBound: Math.max(0, Math.round(prediction.predicted - marginOfError)),
      upperBound: Math.round(prediction.predicted + marginOfError),
    }
  })
} 