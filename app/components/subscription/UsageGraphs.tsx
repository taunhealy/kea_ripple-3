import { useQuery } from '@tanstack/react-query'
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
} from 'recharts'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

export function UsageGraphs() {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['subscription-usage'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/usage')
      if (!res.ok) throw new Error('Failed to fetch usage data')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="daily">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Usage Analytics</h3>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="daily" className="space-y-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usage?.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
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
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Today's Bookings</p>
              <p className="text-2xl font-bold">{usage?.today}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Weekly Average</p>
              <p className="text-2xl font-bold">{usage?.weeklyAverage}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Peak Day</p>
              <p className="text-2xl font-bold">{usage?.peakDay}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usage?.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMMM yyyy')}
                />
                <Bar
                  dataKey="bookings"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Monthly Total</p>
              <p className="text-2xl font-bold">{usage?.monthlyTotal}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Monthly Average</p>
              <p className="text-2xl font-bold">{usage?.monthlyAverage}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Limit Usage</p>
              <p className="text-2xl font-bold">{usage?.usagePercentage}%</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
} 