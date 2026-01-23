'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import { CreateSessionDialog } from './CreateSessionDialog';
import { Calendar, Clock, Video } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface LiveSession {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  platform: string;
  status: string;
}

interface LiveSessionsListProps {
  courseId: string;
  isInstructor?: boolean;
}

import { apiClient } from '@/lib/api-client';

export function LiveSessionsList({ courseId, isInstructor = false }: LiveSessionsListProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  console.log('LiveSessionsList rendering', { courseId, isInstructor });

  const fetchSessions = async () => {
    try {
      const response = await apiClient(`live-sessions?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchSessions();
    }
  }, [courseId, accessToken]);

  if (loading) return <div>Loading sessions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Upcoming Live Sessions</h3>
        {isInstructor && (
          <CreateSessionDialog courseId={courseId} onSessionCreated={fetchSessions} />
        )}
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No live sessions scheduled yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold">{session.title}</h4>
                      <Badge variant={session.status === 'live' ? 'destructive' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{session.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(session.start_time), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                      </div>
                      <div className="flex items-center gap-1 capitalize">
                        <Video className="w-4 h-4" />
                        {session.platform.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      className="w-full md:w-auto"
                      onClick={() => window.open(session.meeting_link, '_blank')}
                    >
                      Join Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
