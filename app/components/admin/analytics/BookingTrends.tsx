/**
 * Component: Booking Trends Analytics
 * 
 * Visualizes booking patterns and trends:
 * - Daily/weekly/monthly booking volumes
 * - Peak booking times
 * - Cancellation rates
 * - Capacity utilization trends
 */

import { useQuery } from "@tanstack/react-query"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { format, subDays, subMonths } from "date-fns"

type TimeRange = "7d" | "30d" | "90d" | "1y"
type MetricType = "bookings" | "capacity" | "cancellations"

export function BookingTrends() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const [metric, setMetric] = useState<MetricType>("bookings")

  const { data, isLoading } = useQuery({
    queryKey: ["booking-trends", timeRange, metric],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/analytics/booking-trends?` +
          new URLSearchParams({
            range: timeRange,
            metric,
          })
      )
      if (!res.ok) throw new Error("Failed to fetch booking trends")
      return res.json()
    },
  })

  const renderChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data?.trends}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), "MMM d")}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(date) =>
            format(new Date(date), "MMMM d, yyyy")
          }
          formatter={(value: number) =>
            metric === "capacity"
              ? `${value}%`
              : metric === "cancellations"
              ? `${value}%`
              : value
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          name={
            metric === "bookings"
              ? "Total Bookings"
              : metric === "capacity"
              ? "Capacity Utilization"
              : "Cancellation Rate"
          }
        />
        {metric === "bookings" && (
          <Line
            type="monotone"
            dataKey="target"
            stroke="#9333ea"
            strokeDasharray="5 5"
            name="Target"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Booking Trends</h3>
        <div className="flex gap-4">
          <Select value={metric} onValueChange={(v: MetricType) => setMetric(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bookings">Total Bookings</SelectItem>
              <SelectItem value="capacity">Capacity Utilization</SelectItem>
              <SelectItem value="cancellations">Cancellation Rate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(v: TimeRange) => setTimeRange(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {renderChart()}
    </Card>
  )
} 