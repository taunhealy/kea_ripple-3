import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { useState } from "react"

interface BookingsListProps {
  activityId: string
}

export function BookingsList({ activityId }: BookingsListProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", activityId, page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        status,
      })
      const res = await fetch(
        `/api/admin/activities/${activityId}/bookings?${params}`
      )
      if (!res.ok) throw new Error("Failed to fetch bookings")
      return res.json()
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.bookings.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {booking.customer.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(booking.schedule.startTime),
                      "MMM d, yyyy HH:mm"
                    )}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {booking.status.toLowerCase()}
                    </div>
                  </TableCell>
                  <TableCell>{booking.participants}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data?.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from(
                { length: data.pagination.pages },
                (_, i) => i + 1
              ).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
} 