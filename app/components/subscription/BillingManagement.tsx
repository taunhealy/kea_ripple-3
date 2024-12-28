import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { CreditCard, Download, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function BillingManagement() {
  const queryClient = useQueryClient()
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: billing } = useQuery({
    queryKey: ['billing'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/billing')
      if (!res.ok) throw new Error('Failed to fetch billing info')
      return res.json()
    }
  })

  const updateBilling = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/subscriptions/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update billing info')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
      toast.success('Billing information updated')
      setIsUpdating(false)
    },
    onError: () => {
      toast.error('Failed to update billing information')
    }
  })

  const downloadInvoice = async (invoiceId: string) => {
    const res = await fetch(`/api/subscriptions/invoices/${invoiceId}`)
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoiceId}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-medium">Payment Method</h3>
            <p className="text-sm text-muted-foreground">
              Manage your payment information
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Update Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Payment Method</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="**** **** **** ****" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="***" />
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  // Handle payment update
                  toast.success('Payment method updated')
                }}>
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {billing?.card && (
          <div className="flex items-center space-x-4">
            <CreditCard className="h-6 w-6" />
            <div>
              <p className="font-medium">
                •••• •••• •••• {billing.card.last4}
              </p>
              <p className="text-sm text-muted-foreground">
                Expires {billing.card.expMonth}/{billing.card.expYear}
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-medium">Billing History</h3>
            <p className="text-sm text-muted-foreground">
              View and download past invoices
            </p>
          </div>
          <Button variant="outline" onClick={() => {
            window.location.href = '/api/subscriptions/billing/export'
          }}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>

        <div className="space-y-4">
          {billing?.invoices?.map((invoice: any) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between py-4 border-b last:border-0"
            >
              <div>
                <p className="font-medium">
                  {new Date(invoice.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoice.description}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-medium">R{invoice.amount}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadInvoice(invoice.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {billing?.upcomingInvoice && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-1" />
            <div>
              <h4 className="font-medium">Upcoming Payment</h4>
              <p className="text-sm text-muted-foreground">
                Your next payment of R{billing.upcomingInvoice.amount} will be charged on{' '}
                {new Date(billing.upcomingInvoice.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 