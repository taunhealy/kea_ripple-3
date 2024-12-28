import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Loader2, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from 'sonner'

export function NotificationList() {
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return res.json()
    }
  })

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH'
      })
      if (!res.ok) throw new Error('Failed to mark notification as read')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete notification')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification deleted')
    }
  })

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    )
  }

  if (!notifications?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No notifications
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="p-4 space-y-4">
        {notifications.map((notification: any) => (
          <div
            key={notification.id}
            className={`flex items-start justify-between p-3 rounded-lg border ${
              !notification.read ? 'bg-muted' : ''
            }`}
          >
            <div className="space-y-1">
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(notification.createdAt), 'PPp')}
              </p>
            </div>
            <div className="flex space-x-2">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead.mutate(notification.id)}
                >
                  Mark as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteNotification.mutate(notification.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 