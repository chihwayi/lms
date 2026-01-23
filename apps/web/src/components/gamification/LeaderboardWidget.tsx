'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, User } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
}

export function LeaderboardWidget() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
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
        const mappedUsers = data.map((u: any) => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`.trim() || 'Anonymous',
          avatar: u.avatar,
          xp: u.xp,
          level: u.level
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-slate-100 rounded-xl"></div>;

  return (
    <Card className="border-none shadow-lg bg-white/90 backdrop-blur-md overflow-hidden transition-all hover:shadow-xl">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <div className="p-1.5 bg-yellow-100 rounded-md">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[320px] pr-4 -mr-4">
          <div className="space-y-3 pr-4">
            {users.map((user, index) => (
              <div 
                key={user.id} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200 shadow-sm scale-[1.02]' : 
                  index === 1 ? 'bg-gradient-to-r from-slate-50 to-white border-slate-200' : 
                  index === 2 ? 'bg-gradient-to-r from-orange-50 to-white border-orange-200' : 
                  'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                }`}
              >
                <div className={`
                  w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shadow-sm relative
                  ${index === 0 ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-200' : 
                    index === 1 ? 'bg-slate-300 text-slate-800 ring-2 ring-slate-100' : 
                    index === 2 ? 'bg-orange-300 text-orange-900 ring-2 ring-orange-100' : 
                    'bg-slate-100 text-slate-500'}
                `}>
                  {index === 0 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-400 drop-shadow-sm" />
                    </div>
                  )}
                  {index + 1}
                </div>
                
                <Avatar className={`h-9 w-9 border-2 ${
                  index === 0 ? 'border-yellow-200' :
                  index === 1 ? 'border-slate-200' :
                  index === 2 ? 'border-orange-200' :
                  'border-white'
                }`}>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${
                    index === 0 ? 'text-slate-900' : 'text-slate-700'
                  }`}>{user.name}</p>
                  <p className="text-xs text-slate-500 font-medium">Level {user.level}</p>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-bold text-sm text-indigo-600">
                    {user.xp.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">XP</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
