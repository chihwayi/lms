'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useConfigStore } from '@/lib/config-store';
import { apiClient } from '@/lib/api-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { io, Socket } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

export function NotificationsDrawer() {
  const { user, accessToken } = useAuthStore();
  const { instanceUrl } = useConfigStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user || !accessToken) return;

    // Initial fetch
    fetchNotifications();

    let baseUrl = instanceUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Safety check: if baseUrl points to frontend port 3000, force it to 3001
    if (baseUrl.includes('localhost:3000')) {
        baseUrl = 'http://localhost:3001';
    }

    // Socket connection
    console.log('Initializing notifications socket connection...');
    const socketUrl = `${baseUrl}/notifications`;
    console.log('Target Notifications Socket URL:', socketUrl);

    const newSocket = io(socketUrl, {
      query: { token: accessToken },
      path: '/socket.io',
      transports: ['websocket'], // Force websocket to avoid polling issues
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to notifications');
    });

    newSocket.on('notification:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Special handling for gamification events
      if (notification.metadata?.type === 'LEVEL_UP') {
        toast.success(notification.title, {
          description: notification.message,
          duration: 8000,
          className: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none",
        });
        // You could trigger a confetti effect here if you had a library for it
      } else if (notification.metadata?.type === 'BADGE_EARNED') {
        toast.success(notification.title, {
          description: notification.message,
          duration: 6000,
          className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none",
        });
      } else {
        toast(notification.title, {
          description: notification.message,
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accessToken, instanceUrl]);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient('/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient(`/notifications/${id}/read`, {
        method: 'PATCH',
      });

      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient('/notifications/read-all', {
        method: 'PATCH',
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-center">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl transition-all cursor-pointer border ${
                    notification.is_read 
                      ? 'bg-white border-gray-100' 
                      : 'bg-blue-50/50 border-blue-100 shadow-sm'
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`text-sm font-semibold ${!notification.is_read ? 'text-blue-700' : 'text-gray-700'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  {notification.type === 'reminder' && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Reminder
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
