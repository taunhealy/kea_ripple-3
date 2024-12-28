import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { NotificationList } from "./NotificationList"
import { useQuery } from '@tanstack/react-query'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

  const { data: notifications } = useQuery({
    queryKey: ['notifications', { unreadOnly: true }],
    queryFn: async () => {
      const res = await fetch('/api/notifications?unreadOnly=true')
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return res.json()
    }
  })

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.length)
    }
  }, [notifications])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <NotificationList />
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 