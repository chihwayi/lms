'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface XPDisplayProps {
  minimal?: boolean;
}

export function XPDisplay({ minimal = false }: XPDisplayProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/v1/gamification/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  // Calculate progress to next level
  // Current level start XP = (level-1)^2 * 100
  // Next level start XP = level^2 * 100
  const currentLevelStartXp = Math.pow(stats.level - 1, 2) * 100;
  const nextLevelStartXp = Math.pow(stats.level, 2) * 100;
  const levelRange = nextLevelStartXp - currentLevelStartXp;
  const xpInLevel = stats.xp - currentLevelStartXp;
  const progress = Math.min(100, Math.max(0, (xpInLevel / levelRange) * 100));

  if (minimal) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-yellow-100 p-2 rounded-full">
          <Trophy className="w-4 h-4 text-yellow-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-slate-700">Lvl {stats.level}</span>
            <span className="text-slate-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-indigo-100 font-medium mb-1">Current Level</p>
            <h3 className="text-4xl font-bold">{stats.level}</h3>
          </div>
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Trophy className="w-8 h-8 text-yellow-300" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-indigo-100">
              <span>{stats.xp} XP</span>
              <span>{stats.nextLevelXp} XP</span>
            </div>
            <Progress value={progress} className="h-3 bg-indigo-900/30" />
            <p className="text-xs text-indigo-200 text-center">
              {Math.round(stats.nextLevelXp - stats.xp)} XP to next level
            </p>
          </div>

          <Link href="/gamification" className="block">
            <Button variant="ghost" className="w-full bg-white/10 hover:bg-white/20 text-white border-0">
              View Achievements
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
