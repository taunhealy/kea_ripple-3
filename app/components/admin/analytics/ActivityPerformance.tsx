/**
 * Component: Activity Performance Analytics
 * 
 * Analyzes and visualizes activity-specific metrics:
 * - Popular time slots
 * - Capacity utilization by activity
 * - Customer ratings and feedback
 * - Booking patterns by activity
 */

import { useQuery } from "@tanstack/react-query"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export function ActivityPerformance() {
  const [selectedActivity, setSelectedActivity] = useState<string>("all")

  const { data, isLoading } = useQuery({
    queryKey: ["activity-performance", selectedActivity],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/analytics/activity-performance?` +
          new URLSearchParams({
            activityId: selectedActivity,
          })
      )
      if (!res.ok) throw new Error("Failed to fetch activity performance")
      return res.json()
    },
  })

  const renderTimeSlotChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data?.popularTimeSlots}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timeSlot" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="bookings"
          fill="#2563eb"
          name="Number of Bookings"
        />
        <Bar
          dataKey="utilization"
          fill="#10b981"
          name="Capacity Utilization %"
        />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPerformanceMetrics = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data?.performanceMetrics}>
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="Current"
          dataKey="value"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.6}
        />
        <Radar
          name="Previous Period"
          dataKey="previous"
          stroke="#9333ea"
          fill="#9333ea"
          fillOpacity={0.6}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Activity Performance</h3>
        <Select
          value={selectedActivity}
          onValueChange={(value) => setSelectedActivity(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            {data?.activities?.map((activity: any) => (
              <SelectItem key={activity.id} value={activity.id}>
                {activity.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="timeSlots">
        <TabsList>
          <TabsTrigger value="timeSlots">Popular Time Slots</TabsTrigger>
          <TabsTrigger
</rewritten_file> 