'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock } from 'lucide-react';

export function AchievementsList() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/gamification/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading achievements...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-500" />
          Your Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 p-4 rounded-xl flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-2xl">
                {achievement.icon || '🏆'}
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{achievement.name}</h4>
              <p className="text-xs text-slate-500 mb-2 line-clamp-2">{achievement.description}</p>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                +{achievement.xp_reward} XP
              </Badge>
            </div>
          ))}
          
          {achievements.length === 0 && (
            <div className="col-span-full text-center py-8 bg-slate-50 rounded-lg border border-dashed">
              <Lock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No achievements unlocked yet.</p>
              <p className="text-xs text-slate-400">Complete courses and quizzes to earn badges!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
