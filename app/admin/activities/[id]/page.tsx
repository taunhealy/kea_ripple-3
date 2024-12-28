/**
 * Page: Activity Details
 * 
 * Detailed view and management of a single activity:
 * - Activity information
 * - Schedule management
 * - Booking overview
 * - Performance metrics
 */

import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityForm } from "@/components/admin/activities/ActivityForm"
import { ScheduleList } from "@/components/admin/activities/ScheduleList"
import { BookingList } from "@/components/admin/activities/BookingList"
import { ActivityMetrics } from "@/components/admin/activities/ActivityMetrics"

async function getActivity(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/activities/${id}`,
    { cache: "no-store" }
  )
  if (!res.ok) {
    if (res.status === 404) notFound()
    throw new Error("Failed to fetch activity")
  }
  return res.json()
}

export default async function ActivityPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) redirect("/")

  const activity = await getActivity(params.id)

  async function updateActivity(data: FormData) {
    "use server"

    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/activities/${params.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(data)),
      }
    )

    if (!res.ok) throw new Error("Failed to update activity")
    redirect("/admin/activities")
  }

  async function deleteActivity() {
    "use server"

    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) throw new Error("Unauthorized")

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/activities/${params.id}`,
      {
        method: "DELETE",
      }
    )

    if (!res.ok) throw new Error("Failed to delete activity")
    redirect("/admin/activities")
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/admin/activities">
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{activity.title}</h1>
        <p className="text-muted-foreground">{activity.location}</p>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="max-w-2xl">
            <ActivityForm
              activity={activity}
              action={updateActivity}
              deleteAction={deleteActivity}
            />
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="mt-6">
          <ScheduleList activityId={params.id} />
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <BookingList activityId={params.id} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <ActivityMetrics activityId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 