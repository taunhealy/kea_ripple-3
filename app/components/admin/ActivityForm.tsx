import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { TimeInput } from "@/components/ui/time-input"
import { toast } from "sonner"

const activitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  price: z.number().min(0, "Price cannot be negative"),
  maxParticipants: z.number().min(1, "Must allow at least 1 participant"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  isRecurring: z.boolean(),
  recurringDays: z.array(z.number()).optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  startTime: z.string(),
  endTime: z.string(),
})

type ActivityFormData = z.infer<typeof activitySchema>

interface ActivityFormProps {
  activity?: ActivityFormData
  onSubmit: (data: ActivityFormData) => Promise<void>
}

export function ActivityForm({ activity, onSubmit }: ActivityFormProps) {
  const [isRecurring, setIsRecurring] = useState(activity?.isRecurring || false)

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity || {
      title: "",
      description: "",
      duration: 60,
      price: 0,
      maxParticipants: 1,
      location: "",
      isRecurring: false,
      startDate: new Date(),
      startTime: "09:00",
      endTime: "10:00",
    },
  })

  const handleSubmit = async (data: ActivityFormData) => {
    try {
      await onSubmit(data)
      toast.success("Activity saved successfully")
    } catch (error) {
      toast.error("Failed to save activity")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Recurring Activity</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    setIsRecurring(checked)
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isRecurring && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="recurringDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurring Days</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day, index) => (
                          <Button
                            key={day}
                            type="button"
                            variant={
                              field.value?.includes(index)
                                ? "default"
                                : "outline"
                            }
                            className="w-12"
                            onClick={() => {
                              const days = field.value || []
                              field.onChange(
                                days.includes(index)
                                  ? days.filter((d) => d !== index)
                                  : [...days, index]
                              )
                            }}
                          >
                            {day}
                          </Button>
                        )
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < form.getValues("startDate")
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button type="submit">Save Activity</Button>
      </form>
    </Form>
  )
} 