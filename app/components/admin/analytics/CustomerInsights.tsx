/**
 * Component: Customer Insights Analytics
 * 
 * Analyzes customer behavior and demographics:
 * - Customer retention rates
 * - Booking frequency
 * - Customer segments
 * - Lifetime value
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const COLORS = ["#2563eb", "#9333ea", "#06b6d4", "#10b981", "#f59e0b"]

export function CustomerInsights() {
  const { data, isLoading } = useQuery({
    queryKey: ["customer-insights"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/customer-insights")
      if (!res.ok) throw new Error("Failed to fetch customer insights")
      return res.json()
    },
  })

  const renderRetentionChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data?.retentionTrend}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="retention"
          stroke="#2563eb"
          name="Retention Rate"
        />
        <Line
          type="monotone"
          dataKey="target"
          stroke="#9333ea"
          strokeDasharray="5 5"
          name="Target"
        />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderCustomerSegments = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data?.customerSegments}
            dataKey="value"
            nameKey="segment"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data?.customerSegments.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Segment</TableHead>
            <TableHead>Customers</TableHead>
            <TableHead>Avg. Value</TableHead>
            <TableHead>Retention</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.segmentDetails?.map((segment: any) => (
            <TableRow key={segment.name}>
              <TableCell className="font-medium">
                {segment.name}
              </TableCell>
              <TableCell>{segment.customers}</TableCell>
              <TableCell>R{segment.averageValue}</TableCell>
              <TableCell>{segment.retention}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Card className="p-6">
      <Tabs defaultValue="retention">
        <TabsList>
          <TabsTrigger value="retention">Customer Retention</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="retention">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">
              Customer Retention Trend
            </h3>
            <p className="text-muted-foreground">
              Track customer retention rates over time
            </p>
          </div>
          {renderRetentionChart()}
        </TabsContent>

        <TabsContent value="segments">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">
              Customer Segmentation
            </h3>
            <p className="text-muted-foreground">
              Analysis of customer segments and their behavior
            </p>
          </div>
          {renderCustomerSegments()}
        </TabsContent>
      </Tabs>
    </Card>
  )
} 