import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { addDays, format, isBefore, isAfter, parseISO, setHours, setMinutes } from 'date-fns'
import { Schedule, Booking, TimeSlot } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface ActivityCalendarProps {
  schedule: Schedule & {
    bookings: Booking[]
    timeSlots: TimeSlot[]
  }
  onBookingSubmit: (booking: BookingFormData) => Promise<void>
  isLoading?: boolean
}

interface BookingFormData {
  date: Date
  timeSlot: TimeSlot
  participants: number
  specialRequests?: string
  contactDetails: {
    name: string
    email: string
    phone: string
  }
}

export function ActivityCalendar({ 
  schedule, 
  onBookingSubmit,
  isLoading = false 
}: ActivityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>()
  const [participants, setParticipants] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [contactDetails, setContactDetails] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Calculate available spots for a given date and time slot
  const getAvailableSpots = (date: Date, timeSlotId?: string) => {
    const dateBookings = schedule.bookings.filter(booking => {
      const sameDate = format(parseISO(booking.date.toString()), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      const sameTimeSlot = timeSlotId ? booking.timeSlotId === timeSlotId : true
      return booking.status !== 'CANCELLED' && sameDate && sameTimeSlot
    })
    
    const bookedParticipants = dateBookings.reduce(
      (sum, booking) => sum + booking.participants, 
      0
    )
    
    return schedule.maxParticipants - bookedParticipants
  }

  // Get available time slots for selected date
  const getAvailableTimeSlots = (date: Date) => {
    return schedule.timeSlots.filter(slot => {
      const spots = getAvailableSpots(date, slot.id)
      return spots > 0
    })
  }

  // Determine if a date should be disabled
  const isDateDisabled = (date: Date) => {
    return (
      isBefore(date, schedule.startDate) ||
      isAfter(date, schedule.endDate) ||
      getAvailableTimeSlots(date).length === 0
    )
  }

  // Custom day render to show availability
  const renderDay = (date: Date) => {
    const availableSlots = getAvailableTimeSlots(date)
    const isDisabled = isDateDisabled(date)

    return (
      <div className={`
        relative p-2 text-center
        ${isDisabled ? 'text-gray-300' : 'text-gray-900'}
      `}>
        <span>{format(date, 'd')}</span>
        {!isDisabled && (
          <span className="absolute bottom-0 left-0 right-0 text-xs text-gray-500">
            {availableSlots.length} times
          </span>
        )}
      </div>
    )
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTimeSlot(undefined)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTimeSlot) return

    await onBookingSubmit({
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      participants,
      specialRequests,
      contactDetails
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={isDateDisabled}
          components={{
            Day: renderDay
          }}
          className="rounded-md border"
        />
      </div>

      {selectedDate && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Available Times</h3>
              <div className="grid grid-cols-3 gap-2">
                {getAvailableTimeSlots(selectedDate).map(slot => (
                  <Button
                    key={slot.id}
                    type="button"
                    variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                    onClick={() => setSelectedTimeSlot(slot)}
                  >
                    {format(parseISO(slot.startTime), 'HH:mm')}
                    <span className="ml-1 text-xs">
                      ({getAvailableSpots(selectedDate, slot.id)} spots)
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {selectedTimeSlot && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of Participants
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={getAvailableSpots(selectedDate, selectedTimeSlot.id)}
                    value={participants}
                    onChange={e => setParticipants(parseInt(e.target.value))}
                    className="w-full rounded-md border p-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Details</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={contactDetails.name}
                    onChange={e => setContactDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-md border p-2"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={contactDetails.email}
                    onChange={e => setContactDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-md border p-2"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={contactDetails.phone}
                    onChange={e => setContactDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-md border p-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                    className="w-full rounded-md border p-2"
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Book Now - R${schedule.price}`
                  )}
                </Button>
              </>
            )}
          </form>
        </Card>
      )}
    </div>
  )
}