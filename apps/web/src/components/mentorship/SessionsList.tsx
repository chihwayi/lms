'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, MoreVertical, ExternalLink } from 'lucide-react';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';

import { FeedbackDialog } from './FeedbackDialog';

import { apiClient } from '@/lib/api-client';

interface Session {
    id: string;
    menteeId: string;
    startTime: string;
    endTime: string;
    status: string;
    meetingLink?: string;
    rating?: number;
    notes?: string;
    mentor?: {
        user: {
            firstName: string;
            lastName: string;
            avatar?: string;
        }
    };
    mentee?: {
        firstName: string;
        lastName: string;
        avatar?: string;
    };
}

export function SessionsList() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    const fetchSessions = async () => {
        try {
            const res = await apiClient('/mentorship/sessions');
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No sessions scheduled</h3>
                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                    Book a session with a mentor to get started on your journey.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sessions.map(session => {
                const otherPerson = session.mentor?.user; // Simplifying for now
                const sessionDate = new Date(session.startTime);
                const sessionEnd = new Date(session.endTime);
                const isUpcoming = isFuture(sessionDate) || (isToday(sessionDate) && !isPast(sessionEnd));
                
                // Logic: Can join 15 mins before start until end time
                const now = new Date();
                const joinStart = new Date(sessionDate.getTime() - 15 * 60000); // 15 mins before
                const canJoin = now >= joinStart && now <= sessionEnd && session.status === 'SCHEDULED';
                
                const isCompleted = session.status === 'COMPLETED' || (now > sessionEnd && session.status !== 'CANCELLED');
                const canRate = isCompleted && !session.rating && session.menteeId === user?.id;

                return (
                    <Card key={session.id} className="overflow-hidden border-slate-200 hover:border-indigo-200 transition-all duration-300 group hover:shadow-md">
                        <div className="flex flex-col sm:flex-row">
                            <div className="bg-indigo-50/50 p-4 sm:w-32 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-indigo-100 transition-colors group-hover:bg-indigo-50">
                                <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">{format(sessionDate, 'MMM')}</span>
                                <span className="text-2xl font-bold text-slate-900">{format(sessionDate, 'd')}</span>
                                <span className="text-slate-500 text-xs font-medium">{format(sessionDate, 'EEE')}</span>
                            </div>
                            
                            <div className="p-4 sm:p-6 flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm ring-2 ring-slate-100">
                                        <AvatarImage src={otherPerson?.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 font-bold">
                                            {otherPerson?.firstName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-slate-900">Mentorship Session</h4>
                                            <Badge variant={isUpcoming ? "default" : "secondary"} className={isUpcoming ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200" : "bg-slate-100 text-slate-600"}>
                                                {isUpcoming ? 'Upcoming' : 'Completed'}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                {format(sessionDate, 'HH:mm')} - {format(sessionEnd, 'HH:mm')}
                                            </div>
                                            <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-slate-400">with</span>
                                                <span className="font-medium text-slate-700">{otherPerson?.firstName} {otherPerson?.lastName}</span>
                                            </div>
                                        </div>
                                        
                                        {session.notes && (
                                            <p className="text-sm text-slate-500 mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                                                &quot;{session.notes}&quot;
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                    {canRate && (
                                        <FeedbackDialog sessionId={session.id} onSuccess={fetchSessions} />
                                    )}
                                    {session.meetingLink ? (
                                        <Button 
                                            size="sm" 
                                            className={`gap-2 w-full sm:w-auto transition-all duration-300 ${
                                                canJoin 
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 scale-105' 
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                            disabled={!canJoin}
                                            onClick={() => canJoin && session.meetingLink && window.open(session.meetingLink, '_blank')}
                                        >
                                            {canJoin ? (
                                                <>
                                                    <Video className="w-4 h-4 animate-pulse" />
                                                    Join Meeting
                                                </>
                                            ) : (
                                                <>
                                                    <Video className="w-4 h-4" />
                                                    {isUpcoming ? 'Join (Soon)' : 'Meeting Ended'}
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="outline" disabled className="gap-2 w-full sm:w-auto opacity-50">
                                            <Video className="w-4 h-4" />
                                            No Link Yet
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
