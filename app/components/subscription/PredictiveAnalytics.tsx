import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from "recharts"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

export function PredictiveAnalytics() {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['predictive-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/analytics/predictive')
      if (!res.ok) throw new Error('Failed to fetch predictions')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!predictions) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Predictive Analytics</h2>
        <Button variant="outline" onClick={() => window.print()}>
          Export Report
        </Button>
      </div>

      <Tabs defaultValue="clv" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clv">Customer Lifetime Value</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Analysis</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="clv" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Predicted Customer Lifetime Value</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictions.clvTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => format(new Date(date), 'MMMM yyyy')}
                        formatter={(value) => [`R${value}`, 'Predicted CLV']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#2563eb" 
                        fill="#93c5fd" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#16a34a" 
                        fill="#86efac"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Prediction confidence: {predictions.clvConfidence}%
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Key Factors Influencing CLV</h4>
                {predictions.clvFactors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{factor.name}</div>
                      <div className="text-sm text-muted-foreground">{factor.description}</div>
                    </div>
                    <div className="text-sm font-medium">{factor.impact}%</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Seasonal Booking Patterns</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={predictions.seasonalPatterns}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="month" />
                    <PolarRadiusAxis />
                    <Radar 
                      name="Last Year" 
                      dataKey="lastYear" 
                      stroke="#2563eb" 
                      fill="#93c5fd" 
                      fillOpacity={0.6} 
                    />
                    <Radar 
                      name="Predicted" 
                      dataKey="predicted" 
                      stroke="#16a34a" 
                      fill="#86efac" 
                      fillOpacity={0.6} 
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Peak Season Predictions</h4>
                {predictions.peakSeasons.map((season, index) => (
                  <Card key={index} className="p-4">
                    <div className="font-medium">{season.period}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Expected increase: {season.increase}%
                    </div>
                    <div className="text-sm mt-2">{season.recommendation}</div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Customer Segment Analysis</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictions.segmentGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {predictions.segments.map((segment, index) => (
                        <Line
                          key={index}
                          type="monotone"
                          dataKey={segment.name}
                          stroke={segment.color}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Segment Insights</h4>
                {predictions.segments.map((segment, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{segment.name}</div>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Growth rate: {segment.growthRate}%
                    </div>
                    <div className="text-sm mt-2">{segment.insight}</div>
                    <div className="text-sm font-medium mt-2">
                      Recommended Action:
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {segment.recommendation}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 