'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format, parseISO, set } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { scheduleSchema } from '@/lib/zodSchemas'
import { toast } from 'sonner'

interface ScheduleForm {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  daysOfWeek: number[]
  maxParticipants: number
  price?: number
  isRecurring: boolean
  recurringUntil?: string
}

export default function ActivitySchedulePage({ params }: { params: { id: string } }) {
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      maxParticipants: 1,
      isRecurring: false,
      daysOfWeek: []
    }
  })

  const onSubmit = async (data: ScheduleForm) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/activities/${params.id}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          daysOfWeek: selectedDays
        })
      })

      if (!response.ok) throw new Error('Failed to create schedule')
      
      toast.success('Schedule created successfully')
      form.reset()
      setSelectedDays([])
      // Refresh schedules list
      fetchSchedules()
    } catch (error) {
      toast.error('Failed to create schedule')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const weekDays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-4">Create Schedule</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  {...form.register('startDate')}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  {...form.register('endDate')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  {...form.register('startTime')}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  {...form.register('endTime')}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Available Days</label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {weekDays.map((day, index) => (
                  <Button
                    key={day}
                    type="button"
                    variant={selectedDays.includes(index) ? "default" : "outline"}
                    className="w-full"
                    onClick={() => toggleDay(index)}
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Max Participants</label>
              <Input
                type="number"
                min={1}
                {...form.register('maxParticipants', { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Price Override (Optional)</label>
              <Input
                type="number"
                step="0.01"
                {...form.register('price', { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...form.register('isRecurring')}
                id="isRecurring"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium">
                Recurring Schedule
              </label>
            </div>

            {form.watch('isRecurring') && (
              <div>
                <label className="text-sm font-medium">Recurring Until</label>
                <Input
                  type="date"
                  {...form.register('recurringUntil')}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Schedule'}
            </Button>
          </form>
        </Card>

        <div>
          <Card className="p-4">
            <h2 className="text-lg font-medium mb-4">Existing Schedules</h2>
            <div className="space-y-4">
              {schedules.map(schedule => (
                <div 
                  key={schedule.id} 
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {format(parseISO(schedule.startDate), 'MMM d, yyyy')} - 
                      {format(parseISO(schedule.endDate), 'MMM d, yyyy')}
                    </span>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Time: {format(parseISO(schedule.startTime), 'h:mm a')} - 
                    {format(parseISO(schedule.endTime), 'h:mm a')}
                  </div>
                  <div className="text-sm text-gray-600">
                    Days: {schedule.daysOfWeek.map(day => weekDays[day].slice(0, 3)).join(', ')}
                  </div>
                  <div className="text-sm text-gray-600">
                    Max Participants: {schedule.maxParticipants}
                  </div>
                  {schedule.price && (
                    <div className="text-sm text-gray-600">
                      Price Override: R{schedule.price}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 