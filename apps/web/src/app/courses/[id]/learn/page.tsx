'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, PlayCircle, CheckCircle, FileText, Lock, Circle, Menu, Check } from 'lucide-react';
import { VideoPlayer } from '@/components/courses/VideoPlayer';
import { QuizRunner, QuizData } from '@/components/courses/QuizRunner';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '../../../../components/ui/sheet';
import { Progress } from '@/components/ui/progress';

interface Lesson {
  id: string;
  title: string;
  content_type: string;
  duration_minutes: number;
  content_url?: string;
  content_data?: any;
  description?: string;
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

interface Enrollment {
  id: string;
  progress: number;
  completedLessons: string[] | null;
  status: string;
}

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch course and enrollment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch Course
        const courseRes = await fetch(`http://localhost:3001/api/v1/courses/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!courseRes.ok) throw new Error('Failed to load course');
        const courseData = await courseRes.json();
        setCourse(courseData);

        // Fetch Enrollment
        const enrollRes = await fetch(`http://localhost:3001/api/v1/enrollments/${params.id}/check`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (enrollRes.ok) {
          const enrollData = await enrollRes.json();
          if (!enrollData.isEnrolled) {
            toast.error('You are not enrolled in this course');
            router.push(`/courses/${params.id}`);
            return;
          }
          setEnrollment(enrollData.enrollment);
          
          // Set initial lesson (first incomplete or first overall)
          const allLessons = courseData.modules.flatMap((m: Module) => m.lessons);
          const completed = enrollData.enrollment.completedLessons || [];
          const firstIncomplete = allLessons.find((l: Lesson) => !completed.includes(l.id));
          setCurrentLesson(firstIncomplete || allLessons[0]);
        }
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('Failed to load course content');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, router]);

  const handleProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!currentLesson || !enrollment) return;

    // Only update progress every 10% or so to avoid spamming
    const progressPercent = (currentTime / duration) * 100;
    
    // If progress > 90%, mark as complete automatically for videos
    if (progressPercent > 90 && !enrollment.completedLessons?.includes(currentLesson.id)) {
      await handleLessonComplete(currentLesson.id);
    }
  }, [currentLesson, enrollment]);

  const handleLessonComplete = async (lessonId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/v1/enrollments/progress', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            courseId: course?.id,
            completedLessonId: lessonId,
            // Calculate total progress
            progress: calculateTotalProgress(lessonId)
        })
      });

      if (response.ok) {
        const updatedEnrollment = await response.json();
        setEnrollment(updatedEnrollment);
        toast.success('Lesson completed!');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const calculateTotalProgress = (newCompletedLessonId: string) => {
    if (!course || !enrollment) return 0;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const completedSet = new Set(enrollment.completedLessons || []);
    completedSet.add(newCompletedLessonId);
    return (completedSet.size / allLessons.length) * 100;
  };

  const handleQuizComplete = async (_score: number, passed: boolean) => {
    if (passed && currentLesson) {
      await handleLessonComplete(currentLesson.id);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return enrollment?.completedLessons?.includes(lessonId);
  };

  const navigateToLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setSidebarOpen(false); // Close sidebar on mobile on selection
  };

  const allLessons = course?.modules.flatMap((m: Module) => m.lessons) || [];
  const currentLessonIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = allLessons[currentLessonIndex - 1];
  const nextLesson = allLessons[currentLessonIndex + 1];

  const handleNextLesson = () => {
    if (nextLesson) {
      setCurrentLesson(nextLesson);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      setCurrentLesson(prevLesson);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!course || !currentLesson) return null;

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg line-clamp-1">{course.title}</h2>
        <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(enrollment?.progress || 0)}%</span>
            </div>
            <Progress value={enrollment?.progress || 0} className="h-2" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {course.modules.map((module, moduleIndex) => (
            <div key={module.id} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Module {moduleIndex + 1}: {module.title}
              </h3>
              <div className="space-y-1">
                {module.lessons.map((lesson) => {
                  const isActive = currentLesson.id === lesson.id;
                  const isCompleted = isLessonCompleted(lesson.id);
                  const Icon = lesson.content_type === 'video' ? PlayCircle : FileText;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigateToLesson(lesson)}
                      className={`w-full flex items-center gap-3 p-2 text-sm rounded-md transition-colors ${
                        isActive 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <span className="flex-1 text-left line-clamp-1">{lesson.title}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 flex-shrink-0 h-full">
          <SidebarContent />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center px-4 z-50 justify-between">
            <div className="flex items-center gap-2">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
                <span className="font-semibold truncate max-w-[200px]">{course.title}</span>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full md:h-screen overflow-hidden pt-16 md:pt-0">
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
                <div className="flex gap-2">
                    {isLessonCompleted(currentLesson.id) && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                            <Check className="w-3 h-3 mr-1" /> Completed
                        </Badge>
                    )}
                </div>
              </div>

              <Card className="overflow-hidden bg-white shadow-sm border-0">
                <CardContent className="p-0">
                    {currentLesson.content_type === 'video' && currentLesson.content_url ? (
                        <div className="aspect-video bg-black">
                             <VideoPlayer
                                fileId={currentLesson.content_data?.fileId || ''}
                                title={currentLesson.title}
                                onProgress={handleProgress}
                             />
                        </div>
                    ) : currentLesson.content_type === 'quiz' && currentLesson.content_data ? (
                        <div className="p-6">
                            <QuizRunner 
                                data={currentLesson.content_data} 
                                onComplete={handleQuizComplete}
                            />
                        </div>
                    ) : (
                        <div className="p-0 min-h-[400px]">
                            {currentLesson.content_url?.toLowerCase().endsWith('.pdf') ? (
                                <iframe 
                                    src={`${currentLesson.content_url}#toolbar=0`} 
                                    className="w-full h-[600px] border-0"
                                    title={currentLesson.title}
                                />
                            ) : (
                                <div className="p-8 prose max-w-none">
                                    <div className="mb-6 flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border border-dashed">
                                        <FileText className="w-16 h-16 text-gray-400 mb-4" />
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">{currentLesson.title}</h3>
                                        <p className="text-gray-500 text-center max-w-md mb-6">
                                            {currentLesson.description || "This lesson contains reading material or external resources."}
                                        </p>
                                        
                                        {currentLesson.content_url && (
                                            <Button 
                                                className="gap-2" 
                                                onClick={() => window.open(currentLesson.content_url, '_blank')}
                                            >
                                                <FileText className="w-4 h-4" />
                                                Open Resource
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {currentLesson.description && (
                                        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                                            <h4 className="font-semibold text-blue-900 mb-2">Lesson Notes</h4>
                                            <p className="text-blue-800/80 leading-relaxed">
                                                {currentLesson.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between pt-6 border-t mt-8">
                 <Button
                    variant="outline"
                    onClick={handlePrevLesson}
                    disabled={!prevLesson}
                    className="gap-2"
                 >
                    <ChevronLeft className="w-4 h-4" /> Previous
                 </Button>

                 <Button 
                    onClick={() => handleLessonComplete(currentLesson.id)}
                    disabled={isLessonCompleted(currentLesson.id)}
                    variant={isLessonCompleted(currentLesson.id) ? "outline" : "default"}
                    className={`min-w-[140px] ${isLessonCompleted(currentLesson.id) ? 'bg-green-100 hover:bg-green-200 border-green-200 text-green-800' : ''}`}
                 >
                    {isLessonCompleted(currentLesson.id) ? (
                        <>
                            <Check className="w-4 h-4 mr-2" /> Completed
                        </>
                    ) : (
                        'Mark as Complete'
                    )}
                 </Button>

                 <Button
                    variant="outline"
                    onClick={handleNextLesson}
                    disabled={!nextLesson}
                    className="gap-2"
                 >
                    Next <ChevronRight className="w-4 h-4" />
                 </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
