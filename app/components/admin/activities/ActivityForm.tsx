/**
 * Component: Activity Management Form
 * 
 * Handles activity creation and updates:
 * - Activity details input
 * - Schedule configuration
 * - Pricing and capacity settings
 * - Location management
 */

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
  startDate: z.string(),
  endDate: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
})

type ActivityFormData = z.infer<typeof activitySchema>

interface ActivityFormProps {
  activity?: ActivityFormData
  onSubmit: (data: ActivityFormData) => Promise<void>
}

export function ActivityForm({ activity, onSubmit }: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity || {
      isRecurring: false,
      recurringDays: [],
    },
  })

  const handleSubmit = async (data: ActivityFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      toast.success(activity ? "Activity updated" : "Activity created")
    } catch (error) {
      toast.error("Failed to save activity")
    } finally {
      setIsSubmitting(false)
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
        
        {/* Add remaining form fields */}
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : activity ? "Update Activity" : "Create Activity"}
        </Button>
      </form>
    </Form>
  )
} 