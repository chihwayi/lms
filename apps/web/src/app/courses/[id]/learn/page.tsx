'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, PlayCircle, CheckCircle, FileText, Lock, Circle, Menu, Check, Download, Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { VideoPlayer } from '@/components/courses/VideoPlayer';
import { QuizRunner, QuizData } from '@/components/courses/QuizRunner';
import { LessonContentRenderer, ContentBlock } from '@/components/courses/LessonContentRenderer';
import { LessonNotes } from '@/components/courses/LessonNotes';
import { AiAssistantButton } from '@/components/ai/AiAssistantButton';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '../../../../components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { useOfflineCourse } from '@/hooks/use-offline-course';
import { offlineStorage } from '@/lib/offline-storage';
import { cn } from '@/lib/utils';


interface Lesson {
  id: string;
  title: string;
  content_type: string;
  duration_minutes: number;
  content_url?: string;
  content_data?: any;
  description?: string;
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

interface Enrollment {
  id: string;
  progress: number;
  completedLessons: string[] | null;
  status: string;
  lastLessonId?: string | null;
  lesson_progress?: Record<string, { lastPosition: number; totalDuration: number; completed: boolean; lastUpdated: string }>;
}

import { apiClient } from '@/lib/api-client';

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { downloadCourse, isDownloading, downloadProgress, isCourseDownloaded } = useOfflineCourse();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Check if course is downloaded
  useEffect(() => {
      if (params.id) {
          isCourseDownloaded(params.id as string).then(setIsDownloaded);
      }
  }, [params.id, isDownloading]); // Re-check after downloading

  // Fetch course and enrollment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!accessToken) {
           // Check if we have offline access
           const hasOfflineAccess = await offlineStorage.isCourseOffline(params.id as string);
           if (!hasOfflineAccess) {
             router.push('/login');
             return;
           }
           setIsOfflineMode(true);
        }

        // Try loading from offline storage first if we suspect offline or if downloaded
        const localCourse = await offlineStorage.getCourse(params.id as string);
        
        let fetchedCourse = null;
        let fetchedEnrollment = null;

        if (!isOfflineMode) {
            try {
                // Fetch Course from API
                const courseRes = await apiClient(`courses/${params.id}`);
                if (courseRes.ok) {
                    fetchedCourse = await courseRes.json();
                    
                    // Fetch Enrollment
                    const enrollRes = await apiClient(`enrollments/${params.id}/check`);
                    if (enrollRes.ok) {
                        const enrollData = await enrollRes.json();
                        if (enrollData.isEnrolled) {
                             fetchedEnrollment = enrollData.enrollment;
                        }
                    }
                }
            } catch (error) {
                console.log('Network request failed, attempting offline fallback');
            }
        }

        // Use offline data if API failed or we are in offline mode
        if (!fetchedCourse && localCourse) {
            fetchedCourse = localCourse;
            setIsOfflineMode(true);
            toast.info('Viewing offline version of course');
            
            // Load offline progress
            const offlineProgress = await offlineStorage.getCourseProgress(params.id as string);
            if (offlineProgress) {
                fetchedEnrollment = {
                    id: 'offline',
                    progress: offlineProgress.progress,
                    completedLessons: offlineProgress.completedLessons,
                    status: 'active'
                };
            }
        }

        if (!fetchedCourse) {
             throw new Error('Failed to load course');
        }

        setCourse(fetchedCourse);

        if (fetchedEnrollment) {
          setEnrollment(fetchedEnrollment);
          
          const allLessons = fetchedCourse.modules.flatMap((m: Module) => m.lessons);
          const completed = fetchedEnrollment.completedLessons || [];

          if (!currentLesson) {
            let initial: Lesson | undefined;
            if (fetchedEnrollment.lastLessonId) {
              initial = allLessons.find((l: Lesson) => l.id === fetchedEnrollment.lastLessonId);
            }
            if (!initial) {
              initial = allLessons.find((l: Lesson) => !completed.includes(l.id)) || allLessons[0];
            }
            setCurrentLesson(initial || allLessons[0]);
          }
        } else if (!isOfflineMode) {
             // Only redirect if online and not enrolled
             toast.error('You are not enrolled in this course');
             router.push(`/courses/${params.id}`);
        }
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('Failed to load course content');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router, accessToken]);

  // Sync offline progress
  useEffect(() => {
      const syncProgress = async () => {
           if (!accessToken || !navigator.onLine) return;
           
           const unsynced = await offlineStorage.getUnsyncedProgress();
           if (unsynced.length === 0) return;
           
           toast.info('Syncing offline progress...');
           
           let syncedCount = 0;
           for (const item of unsynced) {
               try {
                   const response = await apiClient('/enrollments/progress', {
                      method: 'PATCH',
                      body: JSON.stringify({
                          courseId: item.courseId,
                          lessonId: item.lessonId,
                          progress: item.progress || 0
                      })
                   });
                   
                   if (response.ok) {
                       await offlineStorage.markProgressSynced(item.lessonId);
                       syncedCount++;
                   }
               } catch (e) {
                   console.error('Failed to sync lesson', item.lessonId);
               }
           }
           
           if (syncedCount > 0) {
               toast.success(`Synced ${syncedCount} offline progress items`);
           }
      };
      
      syncProgress();
      window.addEventListener('online', syncProgress);
      return () => window.removeEventListener('online', syncProgress);
  }, [accessToken]);

  const handleProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!currentLesson || !enrollment) return;

    // Only update progress every 10% or so to avoid spamming
    const progressPercent = (currentTime / duration) * 100;
    // Throttle by 10 seconds and 10% increments
    const now = Date.now();
    const lastSent = (window as any).__lastProgressSent || 0;
    const lastPercent = (window as any).__lastProgressPercent || 0;
    const shouldSend =
      now - lastSent > 10000 || Math.abs(progressPercent - lastPercent) >= 10;
    if (shouldSend && accessToken && !isOfflineMode) {
      try {
        const res = await apiClient('/enrollments/progress', {
          method: 'PATCH',
          body: JSON.stringify({
            courseId: course?.id,
            lessonId: currentLesson.id,
            lastPosition: Math.floor(currentTime),
            totalDuration: Math.floor(duration),
          }),
        });
        if (res.ok) {
          (window as any).__lastProgressSent = now;
          (window as any).__lastProgressPercent = progressPercent;
        }
      } catch {}
    }
    
    // If progress > 90%, mark as complete automatically for videos
    if (progressPercent > 90 && !enrollment.completedLessons?.includes(currentLesson.id)) {
      await handleLessonComplete(currentLesson.id);
    }
  }, [currentLesson, enrollment]);

  const handleLessonComplete = async (lessonId: string) => {
    try {
        const newProgress = calculateTotalProgress(lessonId);
        
        // Optimistic update
        const newCompletedLessons = [...(enrollment?.completedLessons || [])];
        if (!newCompletedLessons.includes(lessonId)) {
            newCompletedLessons.push(lessonId);
            setEnrollment(prev => prev ? ({
                ...prev,
                completedLessons: newCompletedLessons,
                progress: newProgress
            }) : null);
            toast.success('Lesson completed!');
        }

        if (isOfflineMode || !accessToken) {
             // Save to offline storage
             if (course?.id) {
                await offlineStorage.saveProgress(lessonId, course.id, newProgress);
                await offlineStorage.saveCourseProgress({
                    courseId: course.id,
                    progress: newProgress,
                    completedLessons: newCompletedLessons
                });
             }
             return;
         }

      const response = await apiClient('/enrollments/progress', {
        method: 'PATCH',
        body: JSON.stringify({
            courseId: course?.id,
            lessonId: lessonId,
            // Calculate total progress
            progress: newProgress
        })
      });

      if (response.ok) {
        const updatedEnrollment = await response.json();
        setEnrollment(updatedEnrollment);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      // Fallback to offline save if request fails
       if (!isOfflineMode && course?.id) {
            const newProgress = calculateTotalProgress(lessonId);
            const newCompletedLessons = [...(enrollment?.completedLessons || [])];
            if (!newCompletedLessons.includes(lessonId)) {
                newCompletedLessons.push(lessonId);
            }
            
             await offlineStorage.saveProgress(lessonId, course.id, newProgress);
              await offlineStorage.saveCourseProgress({
                 courseId: course.id,
                 progress: newProgress,
                 completedLessons: newCompletedLessons
              });
             
             setIsOfflineMode(true);
             toast.info('Network failed, progress saved offline');
       }
    }
  };

  const calculateTotalProgress = (newCompletedLessonId: string) => {
    if (!course || !enrollment) return 0;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const completedSet = new Set(enrollment.completedLessons || []);
    completedSet.add(newCompletedLessonId);
    return (completedSet.size / allLessons.length) * 100;
  };

  const handleQuizComplete = async (score: number, passed: boolean, answers: Record<string, string>) => {
    if (!currentLesson || !enrollment) return;

    if (isOfflineMode || !accessToken) {
        if (passed) {
             toast.success(`Quiz passed locally with score: ${Math.round(score)}%`);
             
             // Update local state
             const newCompletedLessons = [...(enrollment.completedLessons || [])];
             if (!newCompletedLessons.includes(currentLesson.id)) {
                 newCompletedLessons.push(currentLesson.id);
                 
                 const allLessons = course?.modules.flatMap(m => m.lessons) || [];
                 const newProgress = (newCompletedLessons.length / allLessons.length) * 100;
                 
                 setEnrollment({
                     ...enrollment,
                     completedLessons: newCompletedLessons,
                     progress: newProgress
                 });
                 
                 // Save progress to IDB
                  if (course?.id) {
                      await offlineStorage.saveProgress(currentLesson.id, course.id, newProgress);
                      await offlineStorage.saveCourseProgress({
                         courseId: course.id,
                        progress: newProgress,
                        completedLessons: newCompletedLessons
                     });
                  }
             }
        } else {
             toast.error(`Quiz failed. Score: ${Math.round(score)}%. Try again!`);
        }
        return;
    }

    try {
      const response = await apiClient(`/enrollments/${enrollment.id}/quiz/${currentLesson.id}`, {
        method: 'POST',
        body: JSON.stringify(answers)
      });

      if (response.ok) {
        if (passed) {
             toast.success(`Quiz passed with score: ${Math.round(score)}%`);
             
             // Update local state to show completion
             const newCompletedLessons = [...(enrollment.completedLessons || [])];
             if (!newCompletedLessons.includes(currentLesson.id)) {
                 newCompletedLessons.push(currentLesson.id);
                 
                 // Recalculate progress
                 const allLessons = course?.modules.flatMap(m => m.lessons) || [];
                 const newProgress = (newCompletedLessons.length / allLessons.length) * 100;
                 
                 setEnrollment({
                     ...enrollment,
                     completedLessons: newCompletedLessons,
                     progress: newProgress
                 });
             }
        } else {
             toast.error(`Quiz failed. Score: ${Math.round(score)}%. Try again!`);
        }
      } else {
        toast.error('Failed to submit quiz results');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Error submitting quiz');
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

                  const lessonProgress = enrollment?.lesson_progress?.[lesson.id];
                  const resumeTime = !isCompleted && lessonProgress && lessonProgress.lastPosition > 0 
                      ? new Date(lessonProgress.lastPosition * 1000).toISOString().substr(14, 5) 
                      : null;

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
                      <div className="flex-1 text-left overflow-hidden">
                          <div className="line-clamp-1">{lesson.title}</div>
                          {resumeTime && (
                              <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                                  Resume {resumeTime}
                              </div>
                          )}
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t space-y-2">
        <Button 
            variant={isDownloaded ? "secondary" : "default"} 
            className="w-full"
            onClick={() => course && downloadCourse(course.id)}
            disabled={isDownloading || isDownloaded || isOfflineMode}
        >
            {isDownloading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {Math.round(downloadProgress)}%
                </>
            ) : isDownloaded ? (
                <>
                    <Check className="w-4 h-4 mr-2" /> Downloaded
                </>
            ) : (
                <>
                    <Download className="w-4 h-4 mr-2" /> Download
                </>
            )}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Dashboard
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
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
                    {isOfflineMode && (
                        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600 bg-yellow-50">
                            <WifiOff className="w-3 h-3" /> Offline Mode
                        </Badge>
                    )}
                </div>
                <div className="flex gap-2 items-center">
                    <AiAssistantButton 
                      title={currentLesson.title}
                      context={
                        currentLesson.content_type === 'text' && currentLesson.content_data?.html 
                          ? currentLesson.content_data.html.replace(/<[^>]*>/g, '') 
                          : currentLesson.description || "No text content available."
                      } 
                    />
                    {isLessonCompleted(currentLesson.id) && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                            <Check className="w-3 h-3 mr-1" /> Completed
                        </Badge>
                    )}
                </div>
              </div>

              <Card className="overflow-hidden bg-white shadow-sm border-0">
                <CardContent className="p-0">
                    {currentLesson.content_data?.blocks && currentLesson.content_data.blocks.length > 0 ? (
                        <div className="p-4 md:p-8">
                            <h1 className="text-2xl md:text-3xl font-bold mb-6">{currentLesson.title}</h1>
                            {/* Derive resume position from enrollment.lesson_progress for this lesson */}
                            {/*
                              Note: lesson_progress is stored on the server. If present, we pass the lastPosition to the video blocks for resume.
                            */}
                            {/*
                              We keep this inline to avoid additional state; it's recomputed on render, which is fine.
                            */}
                            <LessonContentRenderer 
                                lessonId={currentLesson.id}
                                blocks={currentLesson.content_data.blocks}
                                content={currentLesson.content_data?.html || currentLesson.content}
                                videoStartAtSeconds={enrollment?.lesson_progress?.[currentLesson.id]?.lastPosition ?? undefined}
                                onVideoProgress={handleProgress}
                            />
                            {currentLesson.description && (
                                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                                    <h4 className="font-semibold text-blue-900 mb-2">Lesson Notes</h4>
                                    <p className="text-blue-800/80 leading-relaxed">
                                        {currentLesson.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : currentLesson.content_type === 'video' && currentLesson.content_url ? (
                        <div className="aspect-video bg-black">
                             <VideoPlayer
                                fileId={currentLesson.content_data?.fileId || ''}
                                title={currentLesson.title}
                                startAt={enrollment?.lesson_progress?.[currentLesson.id]?.lastPosition ?? 0}
                                onProgress={handleProgress}
                             />
                        </div>
                    ) : currentLesson.content_type === 'quiz' && currentLesson.content_data ? (
                        <div className="p-4 md:p-6">
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
                                    className="w-full h-[400px] md:h-[600px] border-0"
                                    title={currentLesson.title}
                                />
                            ) : currentLesson.content_type === 'text' && currentLesson.content_data?.html ? (
                                <div className="p-4 md:p-8 prose max-w-none">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{currentLesson.title}</h1>
                                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content_data.html }} />
                                    
                                    {currentLesson.description && (
                                        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-blue-50 rounded-xl border border-blue-100 not-prose">
                                            <h4 className="font-semibold text-blue-900 mb-2">Lesson Notes</h4>
                                            <p className="text-blue-800/80 leading-relaxed">
                                                {currentLesson.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 md:p-8 prose max-w-none">
                                    <div className="mb-6 flex flex-col items-center justify-center p-8 md:p-12 bg-gray-50 rounded-lg border border-dashed">
                                        <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mb-4" />
                                        <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2 text-center">{currentLesson.title}</h3>
                                        <p className="text-gray-500 text-center max-w-md mb-6 text-sm md:text-base">
                                            {currentLesson.description || "This lesson contains reading material or external resources."}
                                        </p>
                                        
                                        {currentLesson.content_url && (
                                            <Button 
                                                className="gap-2 w-full sm:w-auto" 
                                                onClick={() => window.open(currentLesson.content_url, '_blank')}
                                            >
                                                <FileText className="w-4 h-4" />
                                                Open Resource
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {currentLesson.description && (
                                        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-blue-50 rounded-xl border border-blue-100">
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

              <Card className="overflow-hidden bg-white shadow-sm border-0">
                <CardContent className="p-4 md:p-8">
                    <LessonNotes lessonId={currentLesson.id} />
                </CardContent>
              </Card>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-6 border-t mt-8 gap-4 sm:gap-0">
                 <Button
                    variant="outline"
                    onClick={handlePrevLesson}
                    disabled={!prevLesson}
                    className="gap-2 w-full sm:w-auto"
                 >
                    <ChevronLeft className="w-4 h-4" /> Previous
                 </Button>

                 <Button 
                    onClick={() => handleLessonComplete(currentLesson.id)}
                    disabled={isLessonCompleted(currentLesson.id)}
                    variant={isLessonCompleted(currentLesson.id) ? "outline" : "default"}
                    className={`w-full sm:min-w-[140px] sm:w-auto ${isLessonCompleted(currentLesson.id) ? 'bg-green-100 hover:bg-green-200 border-green-200 text-green-800' : ''}`}
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
                    className="gap-2 w-full sm:w-auto"
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
