import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, TrendingUp, TrendingDown, Users, Calendar } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { format } from "date-fns"

export function AnalyticsDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['subscription-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/analytics')
      if (!res.ok) throw new Error('Failed to fetch analytics')
      return res.json()
    }
  })

  if (!analytics) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Analytics</h2>
        <Button variant="outline" onClick={() => {
          window.location.href = '/api/subscriptions/analytics/export'
        }}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Bookings"
          value={analytics.totalBookings}
          trend={analytics.bookingsTrend}
          icon={Calendar}
        />
        <MetricCard
          title="Active Users"
          value={analytics.activeUsers}
          trend={analytics.usersTrend}
          icon={Users}
        />
        <MetricCard
          title="Revenue"
          value={`R${analytics.revenue.toFixed(2)}`}
          trend={analytics.revenueTrend}
          icon={TrendingUp}
        />
        <MetricCard
          title="Usage"
          value={`${analytics.usagePercentage}%`}
          trend={analytics.usageTrend}
          icon={TrendingDown}
        />
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.bookingsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Peak Booking Times</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.peakTimes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Popular Activities</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.popularActivities}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="activity" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    formatter={(value) => [`R${value}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.usageHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    formatter={(value) => [`${value}%`, 'Usage']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({ title, value, trend, icon: Icon }) {
  const isPositive = trend > 0
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-center text-sm">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
        )}
        <span className={isPositive ? "text-green-500" : "text-red-500"}>
          {Math.abs(trend)}%
        </span>
        <span className="text-muted-foreground ml-1">vs last month</span>
      </div>
    </Card>
  )
}