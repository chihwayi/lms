'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Clock, ArrowRight } from 'lucide-react';
import { format, isFuture, isToday, isPast, addMinutes } from 'date-fns';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Session {
    id: string;
    menteeId: string;
    startTime: string;
    endTime: string;
    status: string;
    meetingLink?: string;
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

export function MentorshipSessionsWidget() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const { accessToken, user } = useAuthStore();

    useEffect(() => {
        if (!accessToken) return;

        const fetchSessions = async () => {
            try {
                const res = await apiClient('/mentorship/sessions');
                if (res.ok) {
                    const data = await res.json();
                    // Filter only upcoming sessions and take top 3
                    const upcoming = data
                        .filter((s: Session) => isFuture(new Date(s.endTime)))
                        .slice(0, 3);
                    setSessions(upcoming);
                }
            } catch (error) {
                console.error('Failed to fetch sessions', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [accessToken]);

    if (loading) {
        return (
            <Card className="h-full border-none shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        Upcoming Sessions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full border-none shadow-xl bg-gradient-to-br from-white via-white to-indigo-50/30 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <CardHeader className="pb-4 flex flex-row items-center justify-between relative z-10 border-b border-slate-100/50">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
                        <Video className="w-6 h-6" />
                    </div>
                    Upcoming Sessions
                </CardTitle>
                <Link href="/dashboard/mentorship" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold tracking-tight flex items-center gap-1 px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </CardHeader>
            <CardContent className="relative z-10 pt-4 flex-1">
                {sessions.length === 0 ? (
                    <div className="text-center py-8 h-full flex flex-col justify-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Calendar className="w-8 h-8 text-indigo-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-4">No upcoming sessions</p>
                        <Link href="/dashboard/mentorship">
                            <Button variant="outline" size="sm" className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold">
                                Find a Mentor
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map(session => {
                            const isMentee = user?.id === session.menteeId;
                            const otherPerson = isMentee ? session.mentor?.user : session.mentee;
                            const sessionDate = new Date(session.startTime);
                            
                            // Can join 15 mins before start until end time
                            const now = new Date();
                            const canJoin = isToday(sessionDate) && 
                                            now >= addMinutes(sessionDate, -15) && 
                                            now <= new Date(session.endTime);

                            return (
                                <div key={session.id} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-600 rounded-xl text-white font-bold shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                            <span className="text-xl leading-none">{format(sessionDate, 'd')}</span>
                                            <span className="text-[10px] uppercase tracking-wider opacity-80">{format(sessionDate, 'MMM')}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                {otherPerson?.firstName} {otherPerson?.lastName}
                                            </p>
                                            <div className="flex items-center text-xs font-medium text-slate-500 gap-1.5 mt-1">
                                                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                                {format(sessionDate, 'h:mm a')}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {canJoin ? (
                                        <Button 
                                            size="sm" 
                                            className="bg-emerald-500 hover:bg-emerald-600 h-9 px-4 text-xs font-bold shadow-lg shadow-emerald-500/20 animate-pulse"
                                            onClick={() => session.meetingLink && window.open(session.meetingLink, '_blank')}
                                        >
                                            <Video className="w-3.5 h-3.5 mr-1.5" />
                                            Join
                                        </Button>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-medium border border-slate-200 px-3 py-1">
                                            {isToday(sessionDate) ? 'Today' : format(sessionDate, 'EEE')}
                                        </Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
