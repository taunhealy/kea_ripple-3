/**
 * Component: Analytics Metric Card
 * 
 * Displays individual metric cards in the analytics dashboard:
 * - Shows current value with comparison
 * - Supports different metric types and formats
 * - Visual indicators for trends
 * - Optional target comparison
 */

import { Card } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid"

interface MetricCardProps {
  title: string
  metric: "bookings" | "revenue" | "capacity" | "retention"
  value?: number
  previousValue?: number
  target?: number
  compare: "previous" | "target"
  format?: "number" | "currency" | "percentage"
}

export function MetricCard({
  title,
  metric,
  value = 0,
  previousValue,
  target,
  compare,
  format = "number",
}: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-ZA", {
          style: "currency",
          currency: "ZAR",
        }).format(val)
      case "percentage":
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString()
    }
  }

  const calculateChange = () => {
    if (compare === "previous" && previousValue !== undefined) {
      return previousValue !== 0
        ? ((value - previousValue) / previousValue) * 100
        : 0
    }
    if (compare === "target" && target !== undefined) {
      return target !== 0 ? ((value - target) / target) * 100 : 0
    }
    return 0
  }

  const change = calculateChange()
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-muted-foreground">
        {title}
      </h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold">{formatValue(value)}</p>
        {change !== 0 && (
          <p
            className={`ml-2 flex items-baseline text-sm font-semibold ${
              isPositive
                ? "text-green-600"
                : isNegative
                ? "text-red-600"
                : ""
            }`}
          >
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="sr-only">
              {isPositive ? "Increased" : "Decreased"} by
            </span>
            {Math.abs(change).toFixed(1)}%
          </p>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {compare === "previous"
          ? "vs. previous period"
          : `vs. target ${formatValue(target || 0)}`}
      </p>
    </Card>
  )
} 