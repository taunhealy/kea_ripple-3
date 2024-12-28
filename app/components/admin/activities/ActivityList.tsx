/**
 * Component: Activity List/Grid View
 * 
 * Displays all activities with management options:
 * - Grid/list view toggle
 * - Activity cards with quick actions
 * - Sorting and filtering
 * - Batch operations
 */

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import { formatCurrency } from "@/lib/utils"

interface Activity {
  id: string
  title: string
  description: string
  duration: number
  price: number
  maxParticipants: number
  location: string
  schedules: any[]
  _count: {
    bookings: number
  }
}

export function ActivityList() {
  const [view, setView] = useState<"grid" | "list">("grid")

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await fetch("/api/admin/activities")
      if (!res.ok) throw new Error("Failed to fetch activities")
      return res.json()
    },
  })

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete activity")
      toast.success("Activity deleted")
      refetch()
    } catch (error) {
      toast.error("Failed to delete activity")
    }
  }

  if (isLoading) {
    return <div>Loading activities...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activities</h2>
        <div className="flex gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            onClick={() => setView("grid")}
          >
            Grid
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            List
          </Button>
        </div>
      </div>

      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }
      >
        {activities?.map((activity: Activity) => (
          <Card key={activity.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{activity.title}</CardTitle>
                <CardDescription>{activity.location}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      window.location.href = `/admin/activities/${activity.id}`
                    }
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(activity.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {activity.description}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {formatCurrency(activity.price)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{activity.duration} min</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Capacity</p>
                  <p className="font-medium">{activity.maxParticipants}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bookings</p>
                  <p className="font-medium">{activity._count.bookings}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  window.location.href = `/admin/activities/${activity.id}/schedules`
                }
              >
                Manage Schedules
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 