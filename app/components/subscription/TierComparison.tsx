import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/lib/constants/subscription"

interface TierComparisonProps {
  currentTier: SubscriptionTier
  onSuccess?: () => void
}

export function TierComparison({ currentTier, onSuccess }: TierComparisonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)

  const changeTier = useMutation({
    mutationFn: async (newTier: SubscriptionTier) => {
      const res = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newTier })
      })
      if (!res.ok) throw new Error('Failed to change subscription tier')
      return res.json()
    },
    onSuccess: (data) => {
      toast.success('Subscription updated successfully')
      if (data.proratedCredit > 0) {
        toast.info(`Credit of R${data.proratedCredit} will be applied to your next bill`)
      }
      setIsOpen(false)
      router.refresh()
      onSuccess?.()
    },
    onError: () => {
      toast.error('Failed to update subscription')
    }
  })

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier)
    setIsOpen(true)
  }

  const isUpgrade = selectedTier ? 
    SUBSCRIPTION_TIERS[selectedTier].price > SUBSCRIPTION_TIERS[currentTier].price : 
    false

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tier) => (
          <Card
            key={tier}
            className={`p-6 ${tier === currentTier ? 'border-primary' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">{SUBSCRIPTION_TIERS[tier].name}</h3>
                <p className="text-sm text-muted-foreground">
                  R{SUBSCRIPTION_TIERS[tier].price}/month
                </p>
              </div>
              {tier === currentTier && (
                <span className="text-sm text-primary">Current Plan</span>
              )}
            </div>

            <ul className="space-y-2 mb-6">
              {SUBSCRIPTION_TIERS[tier].features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-primary mr-2" />
                  {feature}
                </li>
              ))}
            </ul>

            {tier !== currentTier && (
              <Button
                className="w-full"
                variant={SUBSCRIPTION_TIERS[tier].price > SUBSCRIPTION_TIERS[currentTier].price ? 
                  "default" : "outline"
                }
                onClick={() => handleTierSelect(tier)}
              >
                {SUBSCRIPTION_TIERS[tier].price > SUBSCRIPTION_TIERS[currentTier].price ? 
                  'Upgrade' : 'Downgrade'}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isUpgrade ? 'Upgrade' : 'Downgrade'} Subscription
            </DialogTitle>
            <DialogDescription>
              {isUpgrade ? 
                'Upgrade your subscription to get access to more features' :
                'Are you sure you want to downgrade your subscription?'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedTier && (
            <>
              <div className="space-y-4">
                {!isUpgrade && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Downgrading will reduce your available features and booking limits.
                      Any unused credit will be applied to your next bill.
                    </AlertDescription>
                  </Alert>
                )}

                <Card className="p-4">
                  <p className="font-medium mb-2">Price Change</p>
                  <p className="text-sm text-muted-foreground">
                    From R{SUBSCRIPTION_TIERS[currentTier].price}/month to 
                    R{SUBSCRIPTION_TIERS[selectedTier].price}/month
                  </p>
                </Card>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => changeTier.mutate(selectedTier)}
                  disabled={changeTier.isPending}
                >
                  {changeTier.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm {isUpgrade ? 'Upgrade' : 'Downgrade'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 