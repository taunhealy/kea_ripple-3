import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsageGraphs } from "./UsageGraphs"
import { UsageAlerts } from "./UsageAlerts"
import { TierComparison } from "./TierComparison"
import { PaymentHistory } from "./PaymentHistory"
import { Button } from "@/components/ui/button"
import { Download, CreditCard, Settings } from "lucide-react"

interface SubscriptionDashboardProps {
  subscription: any
  onUpgrade: (tier: string) => void
}

export function SubscriptionDashboard({ 
  subscription,
  onUpgrade 
}: SubscriptionDashboardProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <div className="space-x-2">
          <Button variant="outline" onClick={() => {
            window.location.href = '/api/subscriptions/reports'
          }}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Billing
          </Button>
        </div>
      </div>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Current Plan</h3>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{subscription.tier}</p>
              <p className="text-muted-foreground">
                Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <UsageAlerts />
          </Card>
        </div>
        <UsageGraphs />
      </TabsContent>

      <TabsContent value="usage" className="space-y-6">
        <UsageGraphs />
        <TierComparison
          currentTier={subscription.tier}
          onUpgrade={onUpgrade}
        />
      </TabsContent>

      <TabsContent value="billing">
        <PaymentHistory />
      </TabsContent>

      <TabsContent value="settings">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Subscription Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-renewal</p>
                <p className="text-sm text-muted-foreground">
                  Automatically renew your subscription
                </p>
              </div>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Usage Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Manage usage alert preferences
                </p>
              </div>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 