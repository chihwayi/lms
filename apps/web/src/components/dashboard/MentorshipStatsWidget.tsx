'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, Star, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface Stats {
  totalSessions: number;
  totalHours: number;
  averageRating: number;
  totalMentees: number;
}

export function MentorshipStatsWidget() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiClient('/mentorship/stats')
    .then(res => res.json())
    .then(data => setStats(data))
    .catch(err => console.error('Failed to fetch mentorship stats', err));
  }, []);

  if (!stats || (stats.totalSessions === 0 && stats.totalMentees === 0)) return null;

  return (
    <Card className="col-span-full md:col-span-2 lg:col-span-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Mentorship Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col items-center justify-center text-center">
            <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                <Video className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-900">{stats.totalSessions}</div>
            <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Sessions</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
            <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">{stats.totalHours}</div>
            <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Hours</div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col items-center justify-center text-center">
            <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-900">{stats.averageRating}</div>
            <div className="text-xs font-medium text-amber-600 uppercase tracking-wide">Avg Rating</div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center">
            <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-900">{stats.totalMentees}</div>
            <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Mentees</div>
        </div>
      </CardContent>
    </Card>
  );
}
