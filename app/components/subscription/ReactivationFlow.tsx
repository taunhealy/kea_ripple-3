import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, CheckCircle } from "lucide-react"
import { TierComparison } from "./TierComparison"

interface ReactivationFlowProps {
  lastTier: string
}

export function ReactivationFlow({ lastTier }: ReactivationFlowProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState(lastTier)
  const [step, setStep] = useState<"select" | "payment" | "success">("select")

  const reactivate = useMutation({
    mutationFn: async (data: { tier: string, paymentMethodId: string }) => {
      const res = await fetch('/api/subscriptions/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to reactivate subscription')
      return res.json()
    },
    onSuccess: () => {
      setStep("success")
      toast.success('Subscription reactivated successfully')
      setTimeout(() => {
        setIsOpen(false)
        router.refresh()
      }, 2000)
    },
    onError: () => {
      toast.error('Failed to reactivate subscription')
    }
  })

  const handlePayment = async () => {
    try {
      // Simulate payment method selection/addition
      const paymentMethodId = "pm_simulated"
      await reactivate.mutateAsync({
        tier: selectedTier,
        paymentMethodId
      })
    } catch (error) {
      console.error("Payment error:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          Reactivate Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        {step === "select" && (
          <>
            <DialogHeader>
              <DialogTitle>Reactivate Your Subscription</DialogTitle>
              <DialogDescription>
                Choose a plan to reactivate your subscription
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <TierComparison
                currentTier={null}
                onSelect={setSelectedTier}
                selectedTier={selectedTier}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep("payment")}>
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Add your payment method to reactivate your subscription
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {/* Payment form would go here */}
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">
                  Your subscription will be reactivated immediately after payment
                </p>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={reactivate.isPending}
              >
                {reactivate.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Payment
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle>Welcome Back!</DialogTitle>
              <DialogDescription>
                Your subscription has been successfully reactivated
              </DialogDescription>
            </DialogHeader>
            <div className="py-8 flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 