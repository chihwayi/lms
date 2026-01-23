'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface XPDisplayProps {
  minimal?: boolean;
}

export function XPDisplay({ minimal = false }: XPDisplayProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetchStats();
    }
  }, [accessToken]);

  const fetchStats = async () => {
    try {
      const res = await apiClient('/gamification/stats');

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-20 bg-slate-100 rounded-lg"></div>;
  if (!stats) return null;

  const { level, xp, nextLevelXp, progress } = stats;

  if (minimal) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-yellow-100 p-2 rounded-full">
          <Trophy className="w-4 h-4 text-yellow-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-slate-700">Lvl {level}</span>
            <span className="text-slate-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white border-none shadow-xl relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-2xl group">
      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/15 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-indigo-100 font-medium mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-300" />
              Current Level
            </p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-indigo-100 bg-clip-text text-transparent drop-shadow-sm">
                {level}
              </h3>
            </div>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner border border-white/10 transform transition-transform group-hover:rotate-12 duration-300">
            <Trophy className="w-8 h-8 text-yellow-300 drop-shadow-md" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-indigo-100">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {xp.toLocaleString()} XP
              </span>
              <span className="opacity-80">Next: {nextLevelXp.toLocaleString()} XP</span>
            </div>
            <div className="relative h-4 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-indigo-200 text-right font-medium mt-1">
              {Math.round(100 - progress)}% to Level {level + 1}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Link href="/gamification">
              <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 h-auto py-2.5 flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px]">
                <span className="text-sm font-semibold">View Details</span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

