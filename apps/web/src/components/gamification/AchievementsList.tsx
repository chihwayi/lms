'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';

export function AchievementsList() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      fetchAchievements();
    }
  }, [accessToken]);

  const fetchAchievements = async () => {
    try {
      const res = await apiClient('/gamification/stats');

      if (res.ok) {
        const data = await res.json();
        setAchievements(data.badges || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
      ))}
    </div>
  );

  return (
    <Card className="border-none shadow-lg bg-white/90 backdrop-blur-md">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <span className="block text-slate-800">Your Achievements</span>
            <span className="block text-sm font-normal text-slate-500 mt-0.5">Badges earned from your progress</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className="group relative bg-gradient-to-br from-white to-slate-50 hover:from-yellow-50 hover:to-orange-50 border border-slate-100 hover:border-yellow-200 p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-3xl group-hover:scale-110 transition-transform duration-300 ring-4 ring-slate-50 group-hover:ring-yellow-100">
                {achievement.icon || '🏆'}
              </div>
              
              <h4 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-slate-900 transition-colors">
                {achievement.name}
              </h4>
              
              <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed group-hover:text-slate-600">
                {achievement.description}
              </p>
              
              <div className="mt-auto pt-2">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 group-hover:bg-yellow-100 group-hover:text-yellow-700 transition-colors font-semibold">
                  +{achievement.xpBonus} XP
                </Badge>
              </div>
            </div>
          ))}
          
          {achievements.length === 0 && (
            <div className="col-span-full text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">No achievements yet</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Complete courses, quizzes, and participate in discussions to earn badges!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
