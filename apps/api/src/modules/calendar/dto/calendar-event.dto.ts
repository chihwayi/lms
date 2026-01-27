export class CalendarEventDto {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  type: 'milestone' | 'assignment' | 'quiz' | 'mentorship' | 'live-session';
  status?: string;
  metadata?: Record<string, unknown>;
}
