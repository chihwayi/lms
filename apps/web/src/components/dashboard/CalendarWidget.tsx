'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string from API
  type: string;
}

export function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetchEvents();
    }
  }, [accessToken]);

  const fetchEvents = async () => {
    try {
      const response = await apiClient('/calendar/events');
      
      if (response.ok) {
        const data = await response.json();
        // Filter for upcoming events and take top 3
        const now = new Date();
        const upcoming = data
          .filter((e: any) => new Date(e.start) >= now)
          .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())
          .slice(0, 3);
        setEvents(upcoming);
      }
    } catch (error) {
      console.error('Failed to fetch calendar events', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-white via-white to-blue-50/30 relative overflow-hidden mt-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <CardHeader className="pb-4 flex flex-row items-center justify-between relative z-10 border-b border-slate-100/50">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
            <Calendar className="w-6 h-6" />
          </div>
          Upcoming
        </CardTitle>
        <Link href="/dashboard/calendar">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold tracking-tight">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="relative z-10 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className={`flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 group border-l-[4px] ${
                  event.type === 'milestone' ? 'border-l-green-500' :
                  event.type === 'assignment' ? 'border-l-amber-500' : 'border-l-blue-500'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {event.title.replace('Milestone: ', '')}
                  </h4>
                  <div className="flex items-center mt-1 text-xs font-medium text-slate-500">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                    {format(new Date(event.start), 'MMM d, h:mm a')}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ml-3 shadow-md ring-2 ring-white ${
                  event.type === 'milestone' ? 'bg-green-500 shadow-green-200' :
                  event.type === 'assignment' ? 'bg-amber-500 shadow-amber-200' : 'bg-blue-500 shadow-blue-200'
                }`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Calendar className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">No upcoming events</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
