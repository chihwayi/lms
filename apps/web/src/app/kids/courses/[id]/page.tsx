'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KidsLayout } from '@/components/kids/KidsLayout';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Play, Check, Lock, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Lesson {
  id: string;
  title: string;
  content_type: string;
  duration_minutes: number;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  modules: Module[];
}

interface Enrollment {
  progress: number;
  completedLessons: string[];
}

export default function KidsCourseView() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, enrollmentRes] = await Promise.all([
          apiClient(`courses/${params.id}`),
          apiClient(`enrollment/${params.id}/progress`)
        ]);

        const courseData = await courseRes.json();
        const enrollmentData = await enrollmentRes.json();

        setCourse(courseData);
        setEnrollment(enrollmentData);
      } catch (error) {
        console.error('Failed to fetch course data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const isLessonCompleted = (lessonId: string) => {
    return enrollment?.completedLessons?.includes(lessonId);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'quiz': return '❓';
      case 'drawing': return '🎨';
      case 'voice': return '🎤';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <KidsLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-bounce text-4xl">🚀 Loading...</div>
        </div>
      </KidsLayout>
    );
  }

  if (!course) return null;

  return (
    <KidsLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/kids">
            <Button 
              size="icon" 
              className="w-14 h-14 rounded-full bg-white border-4 border-pink-200 text-pink-500 hover:bg-pink-50 hover:scale-110 transition-all shadow-sm"
            >
              <ArrowLeft className="w-8 h-8" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-800">{course.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-4 w-48 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-1000"
                  style={{ width: `${enrollment?.progress || 0}%` }}
                />
              </div>
              <span className="font-bold text-green-600">{Math.round(enrollment?.progress || 0)}% Complete</span>
            </div>
          </div>
        </div>

        {/* Modules & Lessons */}
        <div className="space-y-12">
          {course.modules.map((module, moduleIndex) => (
            <div key={module.id} className="relative">
              {/* Module Title with Decoration */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-black text-xl shadow-md border-4 border-white ring-4 ring-yellow-100">
                  {moduleIndex + 1}
                </div>
                <h2 className="text-2xl font-bold text-gray-700">{module.title}</h2>
              </div>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-4 md:ml-8">
                {module.lessons.map((lesson, lessonIndex) => {
                  const completed = isLessonCompleted(lesson.id);
                  // Simple logic: allow if it's the first lesson OR previous lesson is completed
                  // In a real app, you might want more complex locking logic
                  // For kids, maybe we keep it open or strictly linear. Let's assume open for now or visually distinct.
                  
                  return (
                    <Link 
                      href={`/kids/courses/${course.id}/lessons/${lesson.id}`} 
                      key={lesson.id}
                      className={cn(
                        "group relative bg-white rounded-3xl p-6 shadow-sm border-b-8 border-r-4 transition-all duration-300 hover:scale-[1.02] active:scale-95",
                        completed 
                          ? "border-green-200 hover:border-green-300" 
                          : "border-blue-100 hover:border-blue-200"
                      )}
                    >
                      {completed && (
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                          <Check className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner",
                          completed ? "bg-green-50" : "bg-blue-50"
                        )}>
                          {getLessonIcon(lesson.content_type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                            {lesson.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                            <span className="bg-gray-100 px-2 py-1 rounded-md uppercase text-xs tracking-wide">
                              {lesson.content_type}
                            </span>
                            <span>{lesson.duration_minutes}m</span>
                          </div>
                        </div>
                      </div>

                      <div className={cn(
                        "mt-6 flex items-center justify-center w-full py-3 rounded-xl font-bold text-lg transition-colors",
                        completed 
                          ? "bg-green-100 text-green-700" 
                          : "bg-blue-500 text-white group-hover:bg-blue-600 shadow-blue-200 shadow-lg"
                      )}>
                        {completed ? 'Play Again' : 'Start Lesson!'}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </KidsLayout>
  );
}
