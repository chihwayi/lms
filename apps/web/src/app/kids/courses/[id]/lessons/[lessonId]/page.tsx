'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KidsLayout } from '@/components/kids/KidsLayout';
import { LessonContentRenderer } from '@/components/courses/LessonContentRenderer';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Lesson {
  id: string;
  title: string;
  content_type: string;
  duration_minutes: number;
  content_url?: string;
  content_data?: any;
  content?: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  modules: Module[];
}

export default function KidsLessonPlayer() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient(`courses/${params.id}`);
        if (!res.ok) throw new Error('Failed to load course');
        const courseData = await res.json();
        setCourse(courseData);

        // Find current, prev, next lessons
        const allLessons = courseData.modules.flatMap((m: Module) => m.lessons);
        const currentIndex = allLessons.findIndex((l: Lesson) => l.id === params.lessonId);
        
        if (currentIndex !== -1) {
          setCurrentLesson(allLessons[currentIndex]);
          setPrevLessonId(currentIndex > 0 ? allLessons[currentIndex - 1].id : null);
          setNextLessonId(currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null);
        }
      } catch (error) {
        console.error('Error loading lesson:', error);
        toast.error('Could not load the lesson');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, params.lessonId]);

  const handleComplete = async () => {
    if (!currentLesson) return;
    setIsCompleting(true);

    try {
      // Mark as complete
      await apiClient('enrollments/progress', {
        method: 'PATCH',
        body: JSON.stringify({
          courseId: params.id,
          lessonId: currentLesson.id,
          progress: 100, // Always 100% for kids when they click "Next/Finish"
        }),
      });

      setShowCelebration(true);
      
      // Delay navigation for celebration effect
      setTimeout(() => {
        if (nextLessonId) {
          router.push(`/kids/courses/${params.id}/lessons/${nextLessonId}`);
        } else {
          router.push(`/kids/courses/${params.id}`);
          toast.success('Course Completed! Great job! 🎉');
        }
      }, 2000);

    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Something went wrong');
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <KidsLayout>
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="animate-bounce text-4xl">🚀 Loading...</div>
        </div>
      </KidsLayout>
    );
  }

  if (!currentLesson) return null;

  return (
    <KidsLayout>
      <div className="max-w-4xl mx-auto pb-20">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            className="text-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold gap-2 rounded-full px-6 py-6"
            onClick={() => router.push(`/kids/courses/${params.id}`)}
          >
            <ArrowLeft className="w-8 h-8" />
            Back to Map
          </Button>
          
          <div className="flex items-center gap-2 bg-yellow-100 px-6 py-3 rounded-full border-2 border-yellow-300 shadow-sm">
            <span className="text-2xl">🌟</span>
            <span className="font-bold text-yellow-800">Lesson Time!</span>
          </div>
        </div>

        {/* Lesson Title */}
        <h1 className="text-4xl font-black text-center text-gray-800 mb-8 drop-shadow-sm">
          {currentLesson.title}
        </h1>

        {/* Content Container */}
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-blue-100 relative overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-bl-[100%] opacity-20 -mr-10 -mt-10" />
          
          <LessonContentRenderer 
            lessonId={currentLesson.id}
            blocks={currentLesson.content_data?.blocks || []}
            content={currentLesson.content}
            contentType={currentLesson.content_type}
            contentData={currentLesson.content_data}
          />
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between mt-12 gap-4">
          <Button
            onClick={() => prevLessonId && router.push(`/kids/courses/${params.id}/lessons/${prevLessonId}`)}
            disabled={!prevLessonId}
            className={cn(
              "h-20 px-8 rounded-full text-xl font-bold border-b-8 transition-all active:border-b-0 active:translate-y-2",
              prevLessonId 
                ? "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200" 
                : "opacity-0 pointer-events-none"
            )}
          >
            <ArrowLeft className="w-8 h-8 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleComplete}
            disabled={isCompleting}
            className={cn(
              "h-24 px-12 rounded-full text-2xl font-black border-b-8 transition-all active:border-b-0 active:translate-y-2 shadow-xl hover:scale-105",
              nextLessonId 
                ? "bg-green-500 hover:bg-green-600 border-green-700 text-white" 
                : "bg-yellow-400 hover:bg-yellow-500 border-yellow-600 text-yellow-900"
            )}
          >
            {isCompleting ? (
              <span className="animate-pulse">Saving...</span>
            ) : nextLessonId ? (
              <>
                Next Lesson <ArrowRight className="w-10 h-10 ml-3" />
              </>
            ) : (
              <>
                Finish! <Star className="w-10 h-10 ml-3" />
              </>
            )}
          </Button>
        </div>

        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none"
            >
              <motion.div 
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1.2, rotate: 0 }}
                className="bg-white p-12 rounded-[3rem] shadow-2xl text-center border-8 border-yellow-400"
              >
                <div className="text-8xl mb-4">🎉</div>
                <h2 className="text-5xl font-black text-purple-600 mb-2">Awesome!</h2>
                <p className="text-2xl text-gray-600 font-bold">Lesson Completed!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </KidsLayout>
  );
}
