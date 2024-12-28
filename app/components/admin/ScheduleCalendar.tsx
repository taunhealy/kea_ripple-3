/**
 * Component: Schedule Calendar View
 * 
 * Provides a calendar interface for viewing and managing activity schedules:
 * - Monthly/weekly/daily views
 * - Schedule details on click
 * - Visual indicators for availability and bookings
 * - Quick actions for schedule management
 */

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BookingDetailsModal } from "./BookingDetailsModal"
import { ChevronLeft, ChevronRight, Users } from "lucide-react"

interface ScheduleCalendarProps {
  activityId: string
}

export function ScheduleCalendar({ activityId }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", activityId, currentDate, view],
    queryFn: async () => {
      const start =
        view === "month"
          ? startOfMonth(currentDate)
          : view === "week"
          ? startOfWeek(currentDate)
          : startOfDay(currentDate)
      const end =
        view === "month"
          ? endOfMonth(currentDate)
          : view === "week"
          ? endOfWeek(currentDate)
          : endOfDay(currentDate)

      const res = await fetch(
        `/api/admin/activities/${activityId}/schedules?` +
          new URLSearchParams({
            start: start.toISOString(),
            end: end.toISOString(),
          })
      )
      if (!res.ok) throw new Error("Failed to fetch schedules")
      return res.json()
    },
  })

  const renderMonthView = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    })

    return (
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const daySchedules = schedules?.filter((s: any) =>
            isSameDay(new Date(s.startTime), day)
          )
          return (
            <Card
              key={day.toISOString()}
              className={`p-2 min-h-[100px] ${
                !isSameMonth(day, currentDate)
                  ? "bg-muted/50"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="text-sm font-medium">
                {format(day, "d")}
              </div>
              <div className="mt-1 space-y-1">
                {daySchedules?.map((schedule: any) => (
                  <Tooltip key={schedule.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-left font-normal"
                        onClick={() => setSelectedSchedule(schedule)}
                      >
                        <span>
                          {format(
                            new Date(schedule.startTime),
                            "HH:mm"
                          )}
                        </span>
                        <span className="flex items-center text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          {schedule.bookedCount}/
                          {schedule.maxParticipants}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {format(
                          new Date(schedule.startTime),
                          "HH:mm"
                        )}{" "}
                        - {schedule.duration} mins
                      </p>
                      <p>
                        {schedule.bookedCount} booked of{" "}
                        {schedule.maxParticipants} spots
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentDate(
                view === "month"
                  ? subMonths(currentDate, 1)
                  : subWeeks(currentDate, 1)
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentDate(
                view === "month"
                  ? addMonths(currentDate, 1)
                  : addWeeks(currentDate, 1)
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Select value={view} onValueChange={(v: any) => setView(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === "month" && renderMonthView()}
      {/* Week and day views would be implemented similarly */}

      {selectedSchedule && (
        <BookingDetailsModal
          booking={selectedSchedule}
          isOpen={!!selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          onStatusChange={() => {
            // Refetch schedules
          }}
        />
      )}
    </div>
  )
} 