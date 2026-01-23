'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { PlayCircle, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/lib/auth-store';

export function ContinueLearning() {
  const [lastAccessed, setLastAccessed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken, logout } = useAuthStore();

  useEffect(() => {
    const fetchLastAccessed = async () => {
      try {
        if (!accessToken) return;

        const res = await apiClient('/enrollments/last-accessed');

        if (res.ok) {
          const text = await res.text();
          if (text) {
            try {
              const data = JSON.parse(text);
              if (data && data.id) {
                setLastAccessed(data);
              }
            } catch (e) {
              console.error('Failed to parse last accessed course', e);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch last accessed course', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchLastAccessed();
    }
  }, [accessToken]);

  if (loading || !lastAccessed) return null;

  const { course, progress, lastLessonId } = lastAccessed;
  const nextLessonId = lastLessonId || course.modules?.[0]?.lessons?.[0]?.id;
  
  // Find the lesson title if possible
  let lessonTitle = 'Continue where you left off';
  if (nextLessonId && course.modules) {
    for (const mod of course.modules) {
      const lesson = mod.lessons?.find((l: any) => l.id === nextLessonId);
      if (lesson) {
        lessonTitle = lesson.title;
        break;
      }
    }
  }

  return (
    <Card className="mb-8 overflow-hidden border-none shadow-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 text-blue-200 text-sm font-medium uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            Pick up where you left off
          </div>
          
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
              {course.title}
            </h2>
            <p className="text-slate-300 text-lg flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-400" />
              {lessonTitle}
            </p>
          </div>

          <div className="space-y-2 max-w-md">
            <div className="flex justify-between text-sm text-slate-300">
              <span>Course Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-700" />
          </div>
        </div>

        <div className="flex-shrink-0">
          <Link href={`/courses/${course.id}/learn`}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-900/20 text-lg px-8 h-14 rounded-full group">
              Continue Learning
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
