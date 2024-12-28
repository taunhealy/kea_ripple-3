/**
 * Component: Booking Details Modal
 * 
 * Displays detailed information about a booking including:
 * - Customer information
 * - Schedule details
 * - Booking status
 * - Payment information
 * - Actions (cancel, reschedule, etc.)
 */

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface BookingDetailsModalProps {
  booking: any
  isOpen: boolean
  onClose: () => void
  onStatusChange: () => void
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onStatusChange,
}: BookingDetailsModalProps) {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)

  const cancelBooking = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/admin/bookings/${booking.id}/cancel`,
        {
          method: "POST",
        }
      )
      if (!res.ok) throw new Error("Failed to cancel booking")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Booking cancelled successfully")
      onStatusChange()
      onClose()
    },
    onError: () => {
      toast.error("Failed to cancel booking")
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Customer Information</h3>
            <div className="text-sm space-y-1">
              <p>Name: {booking.customer.name}</p>
              <p>Email: {booking.customer.email}</p>
              <p>Phone: {booking.customer.phone || "Not provided"}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Schedule Details</h3>
            <div className="text-sm space-y-1">
              <p>
                Date:{" "}
                {format(
                  new Date(booking.schedule.startTime),
                  "MMMM d, yyyy"
                )}
              </p>
              <p>
                Time:{" "}
                {format(new Date(booking.schedule.startTime), "HH:mm")}
              </p>
              <p>Duration: {booking.schedule.duration} minutes</p>
              <p>Participants: {booking.participants}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Payment Information</h3>
            <div className="text-sm space-y-1">
              <p>Amount: R{booking.amount}</p>
              <p>Status: {booking.paymentStatus}</p>
              {booking.paymentId && (
                <p>Payment ID: {booking.paymentId}</p>
              )}
            </div>
          </div>

          {booking.status !== "CANCELLED" && (
            <div className="flex justify-end gap-2">
              {isConfirmingCancel ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmingCancel(false)}
                  >
                    No, Keep Booking
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => cancelBooking.mutate()}
                    disabled={cancelBooking.isPending}
                  >
                    {cancelBooking.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Yes, Cancel Booking
                  </Button>
                </>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => setIsConfirmingCancel(true)}
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 