import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function NotificationPreferences() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/notifications/preferences')
      if (!res.ok) throw new Error('Failed to fetch preferences')
      return res.json()
    }
  })

  const updatePreferences = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/subscriptions/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update preferences')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Preferences updated successfully')
      setIsEditing(false)
    },
    onError: () => {
      toast.error('Failed to update preferences')
    }
  })

  const [formData, setFormData] = useState({
    emailNotifications: preferences?.emailNotifications ?? true,
    usageAlerts: preferences?.usageAlerts ?? true,
    usageThreshold: preferences?.usageThreshold ?? 80,
    paymentReminders: preferences?.paymentReminders ?? true,
    weeklyReports: preferences?.weeklyReports ?? false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePreferences.mutate(formData)
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, emailNotifications: checked }))
              }
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Usage Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when approaching limits
              </p>
            </div>
            <Switch
              checked={formData.usageAlerts}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, usageAlerts: checked }))
              }
              disabled={!isEditing}
            />
          </div>

          {formData.usageAlerts && (
            <div className="space-y-2">
              <Label>Usage Alert Threshold (%)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.usageThreshold}
                onChange={(e) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    usageThreshold: parseInt(e.target.value) 
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Payment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive payment due notifications
              </p>
            </div>
            <Switch
              checked={formData.paymentReminders}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, paymentReminders: checked }))
              }
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Get weekly usage summaries
              </p>
            </div>
            <Switch
              checked={formData.weeklyReports}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, weeklyReports: checked }))
              }
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          {!isEditing ? (
            <Button 
              type="button" 
              onClick={() => setIsEditing(true)}
            >
              Edit Preferences
            </Button>
          ) : (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    emailNotifications: preferences?.emailNotifications ?? true,
                    usageAlerts: preferences?.usageAlerts ?? true,
                    usageThreshold: preferences?.usageThreshold ?? 80,
                    paymentReminders: preferences?.paymentReminders ?? true,
                    weeklyReports: preferences?.weeklyReports ?? false
                  })
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </>
          )}
        </div>
      </form>
    </Card>
  )
} 