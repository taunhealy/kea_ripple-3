/**
 * Component: Activity Availability Manager
 * 
 * Manages activity availability settings including:
 * - Default operating hours
 * - Blocked dates and times
 * - Capacity overrides
 * - Buffer times between bookings
 * - Advanced scheduling limits
 */

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { Clock, Calendar as CalendarIcon, Plus, X } from "lucide-react"

interface TimeSlot {
  day: number
  startTime: string
  endTime: string
}

interface AvailabilityManagerProps {
  activityId: string
  initialSettings?: {
    operatingHours: TimeSlot[]
    bufferTime: number
    advanceBookingLimit: number
    blockedDates: Date[]
  }
}

export function AvailabilityManager({
  activityId,
  initialSettings,
}: AvailabilityManagerProps) {
  const [operatingHours, setOperatingHours] = useState<TimeSlot[]>(
    initialSettings?.operatingHours || []
  )
  const [bufferTime, setBufferTime] = useState(
    initialSettings?.bufferTime || 15
  )
  const [advanceBookingLimit, setAdvanceBookingLimit] = useState(
    initialSettings?.advanceBookingLimit || 30
  )
  const [blockedDates, setBlockedDates] = useState<Date[]>(
    initialSettings?.blockedDates || []
  )

  const updateAvailability = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(
        `/api/admin/activities/${activityId}/availability`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )
      if (!res.ok) throw new Error("Failed to update availability")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Availability settings updated")
    },
    onError: () => {
      toast.error("Failed to update availability settings")
    },
  }) 