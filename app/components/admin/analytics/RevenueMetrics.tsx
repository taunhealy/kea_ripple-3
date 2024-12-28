/**
 * Component: Revenue Metrics Analytics
 * 
 * Visualizes revenue-related metrics:
 * - Revenue trends
 * - Average booking value
 * - Revenue by activity
 * - Payment methods distribution
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

const COLORS = ["#2563eb", "#9333ea", "#06b6d4", "#10b981", "#f59e0b"]

export function RevenueMetrics() {
  const { data, isLoading } = useQuery({
    queryKey: ["revenue-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/revenue")
      if (!res.ok) throw new Error("Failed to fetch revenue metrics")
      return res.json()
    },
  })

  const renderRevenueChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data?.revenueByMonth}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickFormatter={(date) => format(new Date(date), "MMM yyyy")}
        />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("en-ZA", {
              style: "currency",
              currency: "ZAR",
              minimumFractionDigits: 0,
            }).format(value)
          }
        />
        <Tooltip
          labelFormatter={(date) =>
            format(new Date(date), "MMMM yyyy")
          }
          formatter={(value: number) =>
            new Intl.NumberFormat("en-ZA", {
              style: "currency",
              currency: "ZAR",
            }).format(value)
          }
        />
        <Legend />
        <Bar dataKey="revenue" fill="#2563eb" name="Revenue" />
        <Bar
          dataKey="target"
          fill="#9333ea"
          name="Target"
          opacity={0.5}
        />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderActivityRevenue = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data?.revenueByActivity}
          dataKey="revenue"
          nameKey="activity"
          cx="50%"
          cy="50%"
          outerRadius={150}
          label={({
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            value,
            index,
          }) => {
            const RADIAN = Math.PI / 180
            const radius = 25 + innerRadius + (outerRadius - innerRadius)
            const x = cx + radius * Math.cos(-midAngle * RADIAN)
            const y = cy + radius * Math.sin(-midAngle * RADIAN)

            return (
              <text
                x={x}
                y={y}
                fill="#374151"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
              >
                {data?.revenueByActivity[index].activity}{" "}
                ({((value / data?.totalRevenue) * 100).toFixed(1)}%)
              </text>
            )
          }}
        >
          {data?.revenueByActivity.map((entry: any, index: number) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("en-ZA", {
              style: "currency",
              currency: "ZAR",
            }).format(value)
          }
        />
      </PieChart>
    </ResponsiveContainer>
  )

  return (
    <Card className="p-6">
      <Tabs defaultValue="trends">
        <TabsList className="mb-6">
          <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
          <TabsTrigger value="activities">
            Revenue by Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends">{renderRevenueChart()}</TabsContent>
        <TabsContent value="activities">
          {renderActivityRevenue()}
        </TabsContent>
      </Tabs>
    </Card>
  )
} 