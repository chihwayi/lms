'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Medal, Trophy } from 'lucide-react';

export function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/gamification/leaderboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaders(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading leaderboard...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Learners
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaders.map((entry, index) => (
            <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${
                index === 0 ? 'bg-yellow-100 text-yellow-600' :
                index === 1 ? 'bg-slate-100 text-slate-600' :
                index === 2 ? 'bg-orange-100 text-orange-600' :
                'text-slate-400'
              }`}>
                {index + 1}
              </div>
              
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={entry.user?.avatar} />
                <AvatarFallback>{entry.user?.firstName?.[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  {entry.user?.firstName} {entry.user?.lastName}
                </p>
                <p className="text-xs text-slate-500">Level {entry.level}</p>
              </div>
              
              <div className="text-right">
                <span className="font-bold text-indigo-600">{entry.total_xp}</span>
                <span className="text-xs text-slate-400 ml-1">XP</span>
              </div>
            </div>
          ))}
          
          {leaders.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              No data yet. Start learning to earn XP!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
