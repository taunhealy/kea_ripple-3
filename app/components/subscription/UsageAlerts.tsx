import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

export function UsageAlerts() {
  const { data: usage } = useQuery({
    queryKey: ['subscription-usage'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/usage')
      if (!res.ok) throw new Error('Failed to fetch usage')
      return res.json()
    }
  })

  if (!usage) return null

  const { currentBookings, maxBookings, daysLeft } = usage
  const usagePercentage = (currentBookings / maxBookings) * 100

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Monthly Usage</span>
          <span>{currentBookings} / {maxBookings} bookings</span>
        </div>
        <Progress value={usagePercentage} />
      </div>

      {usagePercentage >= 90 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical Usage Alert</AlertTitle>
          <AlertDescription>
            You've used {usagePercentage.toFixed(1)}% of your monthly booking limit.
            Consider upgrading your plan to avoid service interruption.
          </AlertDescription>
        </Alert>
      )}

      {usagePercentage >= 80 && usagePercentage < 90 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Usage Warning</AlertTitle>
          <AlertDescription>
            You're approaching your monthly booking limit with {daysLeft} days remaining.
          </AlertDescription>
        </Alert>
      )}

      {usagePercentage < 80 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Usage Status</AlertTitle>
          <AlertDescription>
            Your usage is within normal limits. {daysLeft} days remaining this month.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 