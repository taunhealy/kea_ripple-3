import { Suspense } from "react"
import Link from "next/link"
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
import { PlusCircle, Search, Loader2 } from "lucide-react"
import { format } from "date-fns"

async function getActivities(search: string = "", page: number = 1) {
  const res = await fetch(
    `/api/admin/activities?search=${search}&page=${page}`,
    { cache: "no-store" }
  )
  if (!res.ok) throw new Error("Failed to fetch activities")
  return res.json()
}

export default function ActivitiesPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string }
}) {
  const search = searchParams.search || ""
  const page = parseInt(searchParams.page || "1")

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Link href="/admin/activities/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Activity
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search activities..."
            className="pl-10"
            defaultValue={search}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search)
              if (e.target.value) {
                params.set("search", e.target.value)
              } else {
                params.delete("search")
              }
              params.delete("page")
              window.location.search = params.toString()
            }}
          />
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <ActivityList search={search} page={page} />
      </Suspense>
    </div>
  )
}

async function ActivityList({ search, page }: { search: string; page: number }) {
  const { activities, pagination } = await getActivities(search, page)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Next Schedule</TableHead>
            <TableHead>Total Bookings</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity: any) => (
            <TableRow key={activity.id}>
              <TableCell className="font-medium">{activity.title}</TableCell>
              <TableCell>{activity.location}</TableCell>
              <TableCell>R{activity.price}</TableCell>
              <TableCell>
                {activity.schedules[0]
                  ? format(
                      new Date(activity.schedules[0].startTime),
                      "MMM d, yyyy HH:mm"
                    )
                  : "No upcoming schedules"}
              </TableCell>
              <TableCell>{activity._count.bookings}</TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/activities/${activity.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {activities.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No activities found
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <Button key={page} variant="outline" size="sm" onClick={() => {
              const params = new URLSearchParams(window.location.search)
              params.set("page", page.toString())
              window.location.search = params.toString()
            }}>
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
} 