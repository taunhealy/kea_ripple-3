import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CalendarClock, AlertCircle } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface RenewalSettingsProps {
  subscription: any
}

export function RenewalSettings({ subscription }: RenewalSettingsProps) {
  const [autoRenew, setAutoRenew] = useState(subscription.autoRenew)

  const updateRenewal = useMutation({
    mutationFn: async (autoRenew: boolean) => {
      const res = await fetch('/api/subscriptions/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoRenew })
      })
      if (!res.ok) throw new Error('Failed to update renewal settings')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Renewal settings updated')
    },
    onError: () => {
      setAutoRenew(!autoRenew) // Revert switch
      toast.error('Failed to update renewal settings')
    }
  })

  const handleRenewalChange = (checked: boolean) => {
    setAutoRenew(checked)
    updateRenewal.mutate(checked)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Renewal Settings</h3>
            <p className="text-sm text-muted-foreground">
              Manage your subscription renewal preferences
            </p>
          </div>
          <Switch
            checked={autoRenew}
            onCheckedChange={handleRenewalChange}
          />
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
          <span>
            Next billing date: {new Date(subscription.nextBillingDate).toLocaleDateString()}
          </span>
        </div>

        {!autoRenew && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Auto-renewal is disabled</AlertTitle>
            <AlertDescription>
              Your subscription will expire on {new Date(subscription.nextBillingDate).toLocaleDateString()}.
              To maintain access to your services, please enable auto-renewal or renew manually before exp
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  )
} 