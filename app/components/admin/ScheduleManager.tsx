import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { format, addDays, isBefore } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { PlusCircle, Loader2, X } from "lucide-react"

interface Schedule {
  id: string
  startTime: string
  duration: number
  maxParticipants: number
  bookedCount: number
}

interface ScheduleManagerProps {
  activityId: string
}

export function ScheduleManager({ activityId }: ScheduleManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showAddDialog, setShowAddDialog] = useState(false)

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", activityId, selectedDate],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/activities/${activityId}/schedules?date=${selectedDate?.toISOString()}`
      )
      if (!res.ok) throw new Error("Failed to fetch schedules")
      return res.json()
    },
  })

  const addSchedule = useMutation({
    mutationFn: async (data: {
      startTime: string
      duration: number
      maxParticipants: number
    }) => {
      const res = await fetch(`/api/admin/activities/${activityId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to add schedule")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Schedule added successfully")
      setShowAddDialog(false)
    },
    onError: () => {
      toast.error("Failed to add schedule")
    },
  })

  const deleteSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      const res = await fetch(
        `/api/admin/activities/${activityId}/schedules/${scheduleId}`,
        {
          method: "DELETE",
        }
      )
      if (!res.ok) throw new Error("Failed to delete schedule")
    },
    onSuccess: () => {
      toast.success("Schedule deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete schedule")
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => isBefore(date, new Date())}
          />
          <div className="space-y-1">
            <h3 className="font-medium">
              Schedules for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage activity schedules and availability
            </p>
          </div>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Schedule</DialogTitle>
            </DialogHeader>
            <AddScheduleForm
              onSubmit={async (data) => {
                await addSchedule.mutateAsync(data)
              }}
              isLoading={addSchedule.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h- 