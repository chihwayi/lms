'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { LearningPath } from '@/components/learning-paths/LearningPathCard';
import { Loader2, ArrowLeft, Clock, BookOpen, BarChart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function LearningPathDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [userPath, setUserPath] = useState<{ progress: number; status: string } | null>(null);
  const [courseEnrollments, setCourseEnrollments] = useState<any[]>([]);

  useEffect(() => {
    if (!accessToken || !params.id) return;

    // Fetch path details and user enrollment status in parallel
    const fetchData = async () => {
      try {
        const [pathRes, myPathsRes, myEnrollmentsRes] = await Promise.all([
          apiClient(`/learning-paths/${params.id}`),
          apiClient('/learning-paths/my-paths'),
          apiClient('/enrollments/my-courses')
        ]);

        if (pathRes.ok) {
          const pathData = await pathRes.json();
          setPath(pathData);
        }

        if (myPathsRes.ok) {
          const myPaths = await myPathsRes.json();
          const enrollment = myPaths.find((p: any) => p.learningPathId === params.id);
          if (enrollment) {
            setUserPath(enrollment);
          }
        }

        if (myEnrollmentsRes.ok) {
          const enrollments = await myEnrollmentsRes.json();
          setCourseEnrollments(enrollments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken, params.id, router]);

  const handleEnroll = async () => {
    if (!accessToken || !path) return;
    setEnrolling(true);
    try {
      const res = await apiClient(`/learning-paths/${path.id}/enroll`, {
        method: 'POST'
      });

      if (res.ok) {
        const enrollment = await res.json();
        setUserPath(enrollment);
        toast.success('Enrolled in Learning Path!');
      } else {
        toast.error('Failed to enroll');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setEnrolling(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!path) return null;

  const totalDuration = path.courses.reduce((acc, course) => acc + course.duration_minutes, 0);
  const hours = Math.floor(totalDuration / 60);

  // Find the first uncompleted course
  const nextCourse = path.courses.find(course => {
    const enrollment = courseEnrollments.find(e => e.course.id === course.id);
    return !enrollment || (enrollment.progress < 100 && enrollment.status !== 'completed');
  }) || path.courses[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/20"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <Button 
            variant="ghost" 
            className="text-slate-300 hover:text-white hover:bg-white/10 mb-8 -ml-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Paths
          </Button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="relative w-full md:w-64 aspect-video md:aspect-square rounded-xl overflow-hidden shadow-2xl ring-4 ring-white/10 shrink-0 bg-slate-800">
                {path.thumbnailUrl ? (
                    <Image src={path.thumbnailUrl} alt={path.title} fill className="object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-indigo-300">
                        <BookOpen className="w-16 h-16" />
                    </div>
                )}
             </div>
             
             <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                    {path.tags.map(tag => (
                        <Badge key={tag} className="bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 border-0">
                            {tag}
                        </Badge>
                    ))}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{path.title}</h1>
                <p className="text-lg text-slate-300 max-w-2xl leading-relaxed mb-8">
                    {path.description}
                </p>

                <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-300">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        {hours} Hours Content
                    </div>
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                        {path.courses.length} Courses
                    </div>
                    <div className="flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-indigo-400" />
                        Beginner to Advanced
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course List */}
            <div className="lg:col-span-2 space-y-8">
                <h2 className="text-2xl font-bold text-slate-900">Path Curriculum</h2>
                
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
                    {path.courses.map((course, index) => {
                        const enrollment = courseEnrollments.find(e => e.course.id === course.id);
                        const isCompleted = enrollment?.progress === 100 || enrollment?.status === 'completed';
                        const isEnrolled = !!enrollment;

                        return (
                        <div key={course.id} className="relative pl-8 group">
                            <div className={`absolute -left-[9px] top-0 border-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors z-10 ${isCompleted ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-300 text-slate-500 group-hover:border-indigo-500 group-hover:text-indigo-600'}`}>
                                {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : index + 1}
                            </div>
                            
                            <Card className={`hover:shadow-md transition-shadow duration-300 overflow-hidden ${isCompleted ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
                                <div className="p-5 flex flex-col sm:flex-row gap-5 items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-xs font-normal text-slate-500 border-slate-200">
                                                {course.level}
                                            </Badge>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-500">{course.duration_minutes} mins</span>
                                            {isCompleted && (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 ml-2">Completed</Badge>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                                            {course.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-4">
                                            <Link href={`/courses/${course.id}`}>
                                                <Button size="sm" variant={isCompleted ? "outline" : "default"} className={isCompleted ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50" : "bg-indigo-600 hover:bg-indigo-700"}>
                                                    {isCompleted ? 'Review Course' : (isEnrolled ? 'Continue' : 'View Course')}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )})}
                    
                    {/* Completion Marker */}
                    <div className="relative pl-8">
                        <div className={`absolute -left-[11px] top-0 border-2 w-6 h-6 rounded-full flex items-center justify-center z-10 ${userPath?.status === 'completed' ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className={`text-sm font-medium pt-0.5 ${userPath?.status === 'completed' ? 'text-emerald-700' : 'text-slate-500'}`}>
                            Path Completion
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
                <Card className="p-6 bg-white sticky top-24">
                    <h3 className="font-bold text-slate-900 mb-4">Your Progress</h3>
                    {userPath ? (
                      <>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                              style={{ width: `${userPath.progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">{userPath.progress}% Complete</p>
                        
                        <Link href={`/courses/${nextCourse.id}`}>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={userPath.progress === 100}>
                                {userPath.progress === 100 ? 'Completed!' : 'Continue Learning'}
                            </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                            <div className="bg-indigo-600 h-2.5 rounded-full w-[0%]"></div>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">0% Complete</p>
                        
                        <Button 
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          onClick={handleEnroll}
                          disabled={enrolling}
                        >
                            {enrolling ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enrolling...
                              </>
                            ) : (
                              'Start Learning Path'
                            )}
                        </Button>
                      </>
                    )}
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
