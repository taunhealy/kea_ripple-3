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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

const CANCELLATION_REASONS = [
  { id: "too_expensive", label: "Too expensive" },
  { id: "not_using", label: "Not using it enough" },
  { id: "missing_features", label: "Missing features" },
  { id: "switching", label: "Switching to another service" },
  { id: "other", label: "Other reason" }
]

export function CancellationFlow() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [feedback, setFeedback] = useState("")
  const [step, setStep] = useState<"confirm" | "feedback" | "final">("confirm")

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, feedback })
      })
      if (!res.ok) throw new Error('Failed to cancel subscription')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Subscription cancelled successfully')
      setStep("final")
      router.refresh()
    },
    onError: () => {
      toast.error('Failed to cancel subscription')
    }
  })

  const handleCancel = () => {
    if (step === "confirm") {
      setStep("feedback")
    } else if (step === "feedback") {
      cancelSubscription.mutate()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive">
          Cancel Subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your subscription? You'll lose access to:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Advanced booking features</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Monthly booking allowance</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Analytics and reporting</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancel}
              >
                Continue Cancellation
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "feedback" && (
          <>
            <DialogHeader>
              <DialogTitle>Help Us Improve</DialogTitle>
              <DialogDescription>
                We're sorry to see you go. Please let us know why you're cancelling.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <RadioGroup value={reason} onValueChange={setReason}>
                {CANCELLATION_REASONS.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={item.id} id={item.id} />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="space-y-2">
                <Label>Additional Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us more about your experience..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancel}
                disabled={!reason}
              >
                Cancel Subscription
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "final" && (
          <>
            <DialogHeader>
              <DialogTitle>Subscription Cancelled</DialogTitle>
              <DialogDescription>
                Your subscription has been cancelled. You'll have access to your current features until the end of your billing period.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 