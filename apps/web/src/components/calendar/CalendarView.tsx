'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2 } from 'lucide-react';
import { CalendarToolbar } from './CalendarToolbar';
import { apiClient } from '@/lib/api-client';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  type?: string;
}

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

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
        const formattedEvents = data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch calendar events', error);
    } finally {
      setLoading(false);
    }
  };

  const eventPropGetter = (event: CalendarEvent) => {
    const type = event.type || event.resource?.type || 'default';
    let style: React.CSSProperties = {};

    if (type === 'milestone') {
      style = { backgroundColor: '#dcfce7', color: '#166534', borderLeft: '4px solid #166534' };
    } else if (type === 'assignment') {
      style = { backgroundColor: '#fef3c7', color: '#92400e', borderLeft: '4px solid #92400e' };
    } else if (type === 'quiz') {
      style = { backgroundColor: '#fee2e2', color: '#991b1b', borderLeft: '4px solid #991b1b' };
    } else if (type === 'live-session') {
      style = { backgroundColor: '#f3e8ff', color: '#6b21a8', borderLeft: '4px solid #6b21a8' };
    } else {
      style = { backgroundColor: '#dbeafe', color: '#1e40af', borderLeft: '4px solid #1e40af' };
    }

    return { style, className: 'text-xs font-semibold px-2 py-1 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 16px 0;
          font-weight: 600;
          font-size: 0.875rem;
          color: #6b7280;
          border-bottom: 1px solid #f3f4f6;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .rbc-month-row {
          border-top: 1px solid #f3f4f6;
        }
        .rbc-day-bg {
          border-left: 1px solid #f9fafb;
        }
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #f3f4f6;
        }
        .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        .rbc-today {
          background-color: #eff6ff !important;
        }
        .rbc-event {
          background: none;
          border: none;
          padding: 2px;
        }
        .rbc-event:focus {
          outline: none;
        }
        .rbc-toolbar {
          margin-bottom: 20px;
        }
        .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          background: white;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid #f3f4f6;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f9fafb;
        }
      `}</style>
      
      <Card className="bg-white/50 backdrop-blur-sm border-white/20 shadow-none border-0">
        <CardContent className="p-0">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 800 }}
            views={['month', 'week', 'day', 'agenda']}
            view={view} // controlled view
            date={date} // controlled date
            onView={(view) => setView(view)}
            onNavigate={(date) => setDate(date)}
            components={{
              toolbar: CalendarToolbar as any,
            }}
            eventPropGetter={eventPropGetter}
            className="rounded-xl"
          />
        </CardContent>
      </Card>
    </>
  );
}
