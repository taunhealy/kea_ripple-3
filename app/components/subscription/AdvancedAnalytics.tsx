import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { format, subMonths } from "date-fns"

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed']

export function AdvancedAnalytics() {
  const { data: analytics } = useQuery({
    queryKey: ['advanced-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/analytics/advanced')
      if (!res.ok) throw new Error('Failed to fetch analytics')
      return res.json()
    }
  })

  if (!analytics) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <Select defaultValue="6">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="retention" className="space-y-4">
        <TabsList>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="retention" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Customer Retention Rate</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.retentionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMMM yyyy')}
                    formatter={(value) => [`${value}%`, 'Retention Rate']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Churn Reasons</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.churnReasons}
                      dataKey="value"
                      nameKey="reason"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {analytics.churnReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Subscription Lifetime</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.subscriptionLifetime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="months" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="customers" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Cohort Retention Analysis</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cohort</TableHead>
                    {[...Array(6)].map((_, i) => (
                      <TableHead key={i}>Month {i + 1}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.cohortAnalysis.map((cohort) => (
                    <TableRow key={cohort.month}>
                      <TableCell>{format(new Date(cohort.month), 'MMM yyyy')}</TableCell>
                      {cohort.retention.map((rate, i) => (
                        <TableCell 
                          key={i}
                          className={`${
                            rate > 75 ? 'bg-green-100' :
                            rate > 50 ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}
                        >
                          {rate}%
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Churn Risk Analysis</h3>
              <div className="space-y-4">
                {analytics.churnRiskUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last active: {format(new Date(user.lastActive), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className={`
                      px-3 py-1 rounded-full text-sm
                      ${user.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                        user.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'}
                    `}>
                      {user.riskLevel} Risk
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Revenue Forecast</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.revenueForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'MMMM yyyy')}
                      formatter={(value) => [`R${value}`, 'Predicted Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Actual"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predicted"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 