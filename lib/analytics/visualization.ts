/**
 * Analytics Data Visualization Utilities
 * 
 * Helper functions for formatting and preparing data for charts:
 * - Data transformation for various chart types
 * - Color schemes and styling
 * - Tooltip formatting
 * - Axis configuration
 * - Chart-specific calculations
 */

import { format, isSameDay, eachDayOfInterval } from "date-fns"

export const CHART_COLORS = {
  primary: "#2563eb",
  secondary: "#9333ea",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  gray: "#6b7280",
}

export const CHART_GRADIENTS = {
  primary: {
    gradient: {
      colorStops: [
        { offset: 0, color: "rgba(37, 99, 235, 0.2)" },
        { offset: 1, color: "rgba(37, 99, 235, 0)" },
      ],
    },
  },
  secondary: {
    gradient: {
      colorStops: [
        { offset: 0, color: "rgba(147, 51, 234, 0.2)" },
        { offset: 1, color: "rgba(147, 51, 234, 0)" },
      ],
    },
  },
}

interface ChartDataPoint {
  date: Date | string
  value: number
  [key: string]: any
}

export function prepareTimeSeriesData(
  data: ChartDataPoint[],
  startDate: Date,
  endDate: Date,
  options: {
    fillGaps?: boolean
    defaultValue?: number
    dateFormat?: string
  } = {}
) {
  const {
    fillGaps = true,
    defaultValue = 0,
    dateFormat = "yyyy-MM-dd",
  } = options

  if (!fillGaps) {
    return data.map((point) => ({
      ...point,
      date:
        typeof point.date === "string"
          ? point.date
          : format(point.date, dateFormat),
    }))
  }

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
  const dataMap = new Map(
    data.map((point) => [
      typeof point.date === "string"
        ? point.date
        : format(point.date, dateFormat),
      point,
    ])
  )

  return dateRange.map((date) => {
    const formattedDate = format(date, dateFormat)
    const existingPoint = dataMap.get(formattedDate)

    return existingPoint || {
      date: formattedDate,
      value: defaultValue,
    }
  })
}

export function calculateMovingAverage(
  data: ChartDataPoint[],
  window: number
) {
  return data.map((point, index) => {
    const start = Math.max(0, index - window + 1)
    const windowSlice = data.slice(start, index + 1)
    const average =
      windowSlice.reduce((sum, p) => sum + p.value, 0) / windowSlice.length

    return {
      ...point,
      movingAverage: Number(average.toFixed(2)),
    }
  })
}

export function formatTooltipValue(
  value: number,
  format: "currency" | "percentage" | "number" = "number"
) {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
      }).format(value)
    case "percentage":
      return `${value.toFixed(1)}%`
    default:
      return value.toLocaleString()
  }
}

export function generateChartOptions(
  type: "line" | "bar" | "pie" | "radar",
  customOptions: any = {}
) {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
  }

  const typeSpecificOptions = {
    line: {
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    },
    bar: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
    pie: {
      plugins: {
        legend: {
          position: "right" as const,
        },
      },
    },
    radar: {
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 100,
        },
      },
    },
  }

  return {
    ...baseOptions,
    ...typeSpecificOptions[type],
    ...customOptions,
  }
} 