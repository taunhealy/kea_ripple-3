/**
 * Component: Recurring Schedule Generator
 * 
 * Allows admins to generate multiple schedules based on:
 * - Date range
 * - Days of the week
 * - Time slots
 * - Capacity settings
 * 
 * Includes conflict detection and bulk creation capabilities
 */

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { addDays, format, isBefore, startOfDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Plus, X } from "lucide-react"

interface TimeSlot {
  startTime: string
  duration: number
  maxParticipants: number
}

interface RecurringScheduleGeneratorProps {
  activityId: string
  onSuccess: () => void
}

export function RecurringScheduleGenerator({
  activityId,
  onSuccess,
}: RecurringScheduleGeneratorProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  const generateSchedules = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/admin/activities/${activityId}/schedules/recurring`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: dateRange.from,
            endDate: dateRange.to,
            days: selectedDays,
            timeSlots,
          }),
        }
      )
      if (!res.ok) throw new Error("Failed to generate schedules")
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(
        `Successfully generated ${data.count} schedules`
      )
      onSuccess()
    },
    onError: () => {
      toast.error("Failed to generate schedules")
    },
  })

  const addTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      { startTime: "09:00", duration: 60, maxParticipants: 10 },
    ])
  }

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index))
  }

  const updateTimeSlot = (
    index: number,
    field: keyof TimeSlot,
    value: string | number
  ) => {
    const updated = [...timeSlots]
    updated[index] = { ...updated[index], [field]: value }
    setTimeSlots(updated)
  }

  const isValid = () => {
    return (
      dateRange.from &&
      dateRange.to &&
      selectedDays.length > 0 &&
      timeSlots.length > 0 &&
      timeSlots.every(
        (slot) =>
          slot.startTime &&
          slot.duration > 0 &&
          slot.maxParticipants > 0
      )
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Date Range</h3>
        <Calendar
          mode="range"
          selected={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          onSelect={setDateRange as any}
          disabled={(date) =>
            isBefore(startOfDay(date), startOfDay(new Date()))
          }
          numberOfMonths={2}
          className="mb-4"
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Days of Week</h3>
        <div className="flex gap-2 flex-wrap">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day, index) => (
              <Button
                key={day}
                variant={
                  selectedDays.includes(index) ? "default" : "outline"
                }
                onClick={() => {
                  setSelectedDays(
                    selectedDays.includes(index)
                      ? selectedDays.filter((d) => d !== index)
                      : [...selectedDays, index]
                  )
                }}
              >
                {day}
              </Button>
            )
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Time Slots</h3>
          <Button onClick={addTimeSlot}>
            <Plus className="h-4 w-4 mr-2" />
            Add Time Slot
          </Button>
        </div>
        <div className="space-y-4">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex items-center gap-4">
              <Input
                type="time"
                value={slot.startTime}
                onChange={(e) =>
                  updateTimeSlot(index, "startTime", e.target.value)
                }
              />
              <Input
                type="number"
                placeholder="Duration (mins)"
                value={slot.duration}
                onChange={(e) =>
                  updateTimeSlot(
                    index,
                    "duration",
                    parseInt(e.target.value)
                  )
                }
                className="w-32"
                min={15}
                step={15}
              />
              <Input
                type="number"
                placeholder="Max participants"
                value={slot.maxParticipants}
                onChange={(e) =>
                  updateTimeSlot(
                    index,
                    "maxParticipants",
                    parseInt(e.target.value)
                  )
                }
                className="w-32"
                min={1}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTimeSlot(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => generateSchedules.mutate()}
          disabled={!isValid() || generateSchedules.isPending}
        >
          {generateSchedules.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Generate Schedules
        </Button>
      </div>
    </div>
  )
} 