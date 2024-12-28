'use client'

import { useQuery } from '@tanstack/react-query'
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SubscriptionPage() {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions')
      if (!res.ok) throw new Error('Failed to fetch subscription')
      return res.json()
    }
  })

  const cancelSubscription = async () => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to cancel subscription')
      toast.success('Subscription cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel subscription')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (subscription?.status === 'ACTIVE') {
    return (
      <div className="container py-12">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Current Subscription</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Plan: {subscription.plan}</p>
              <p className="text-muted-foreground">
                Next billing date: {new Date(subscription.nextBilling).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="font-medium">Usage this month:</p>
              <p className="text-muted-foreground">
                {subscription.currentBookings} / {subscription.maxBookings} bookings
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={cancelSubscription}
            >
              Cancel Subscription
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <SubscriptionPlans />
}