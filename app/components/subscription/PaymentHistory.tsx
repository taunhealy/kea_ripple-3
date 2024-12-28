import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { format } from 'date-fns'
import { Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PaymentHistory() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['subscription-payments'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/payments')
      if (!res.ok) throw new Error('Failed to fetch payment history')
      return res.json()
    }
  })

  const downloadInvoice = async (paymentId: string) => {
    const res = await fetch(`/api/subscriptions/payments/${paymentId}/invoice`)
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${paymentId}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Payment History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments?.map((payment: any) => (
            <TableRow key={payment.id}>
              <TableCell>
                {format(new Date(payment.date), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>{payment.description}</TableCell>
              <TableCell>R{payment.amount.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                    payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`
                }>
                  {payment.status}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadInvoice(payment.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 