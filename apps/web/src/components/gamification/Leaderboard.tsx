'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Medal, Trophy } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';

export function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetchLeaderboard();
    }
  }, [accessToken]);

  const fetchLeaderboard = async () => {
    try {
      const res = await apiClient('/gamification/leaderboard');

      if (res.ok) {
        const data = await res.json();
        // Map backend response to component structure if needed
        // Backend returns User[] directly
        const mappedData = data.map((user: any) => ({
          id: user.id,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
          },
          level: user.level,
          total_xp: user.xp
        }));
        setLeaders(mappedData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
      ))}
    </div>
  );

  return (
    <Card className="border-none shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Top Learners</h2>
              <p className="text-sm font-normal text-slate-500">Weekly rankings</p>
            </div>
          </CardTitle>
          <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
            Top 10
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-50">
          {leaders.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`flex items-center gap-4 p-4 transition-all hover:bg-slate-50 ${
                index < 3 ? 'bg-gradient-to-r from-slate-50/50 to-transparent' : ''
              }`}
            >
              <div className={`
                w-10 h-10 flex items-center justify-center font-bold text-lg rounded-full shadow-sm relative shrink-0
                ${index === 0 ? 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-50' :
                  index === 1 ? 'bg-slate-300 text-slate-800 ring-4 ring-slate-50' :
                  index === 2 ? 'bg-orange-300 text-orange-900 ring-4 ring-orange-50' :
                  'bg-slate-100 text-slate-500'}
              `}>
                {index === 0 && (
                  <Trophy className="absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-5 text-yellow-500 fill-yellow-400 drop-shadow-sm" />
                )}
                {index + 1}
              </div>
              
              <Avatar className={`h-12 w-12 border-2 shadow-sm ${
                index === 0 ? 'border-yellow-200' :
                index === 1 ? 'border-slate-200' :
                index === 2 ? 'border-orange-200' :
                'border-white'
              }`}>
                <AvatarImage src={entry.user?.avatar} />
                <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-lg">
                  {entry.user?.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 text-base truncate">
                    {entry.user?.firstName} {entry.user?.lastName}
                  </p>
                  {index < 3 && (
                    <Medal className={`w-4 h-4 ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-slate-400' :
                      'text-orange-500'
                    }`} />
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium">Level {entry.level} • Student</p>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-indigo-600 tabular-nums">
                  {entry.total_xp.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total XP</div>
              </div>
            </div>
          ))}
          
          {leaders.length === 0 && (
            <div className="text-center text-slate-500 py-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-600">No data yet</p>
              <p className="text-sm text-slate-400">Start learning to earn XP!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
