import { SubscriptionDashboard } from '@/components/subscription/SubscriptionDashboard'
import { useQuery } from 'react-query'
import { Loader2 } from 'lucide-react'

export default function SubscriptionPage() {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions')
      if (!res.ok) throw new Error('Failed to fetch subscription')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!subscription) {
    return <TierComparison currentTier={null} onUpgrade={(tier) => {
      // Handle initial subscription
    }} />
  }

  return (
    <div className="container py-8">
      <SubscriptionDashboard
        subscription={subscription}
        onUpgrade={(tier) => {
          // Handle upgrade
        }}
      />
    </div>
  )
}