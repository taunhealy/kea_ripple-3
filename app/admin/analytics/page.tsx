/**
 * Page: Activity Analytics Dashboard
 * 
 * Provides real-time analytics and insights:
 * - Booking trends
 * - Revenue metrics
 * - Capacity utilization
 * - Customer demographics
 * - Activity performance
 */

import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingTrends } from "@/components/admin/analytics/BookingTrends"
import { RevenueMetrics } from "@/components/admin/analytics/RevenueMetrics"
import { ActivityPerformance } from "@/components/admin/analytics/ActivityPerformance"
import { CustomerInsights } from "@/components/admin/analytics/CustomerInsights"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <DateRangePicker />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Bookings"
          metric="bookings"
          compare="previous"
        />
        <MetricCard
          title="Revenue"
          metric="revenue"
          compare="previous"
          format="currency"
        />
        <MetricCard
          title="Avg. Capacity"
          metric="capacity"
          compare="target"
          format="percentage"
        />
        <MetricCard
          title="Customer Retention"
          metric="retention"
          compare="previous"
          format="percentage"
        />
      </div>

      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Booking Trends</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <BookingTrends />
          </Suspense>
        </TabsContent>

        <TabsContent value="revenue">
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <RevenueMetrics />
          </Suspense>
        </TabsContent>

        <TabsContent value="activities">
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <ActivityPerformance />
          </Suspense>
        </TabsContent>

        <TabsContent value="customers">
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <CustomerInsights />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
} 