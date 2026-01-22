'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import Link from 'next/link';
import { ContentPreview } from '@/components/courses/ContentPreview';
import { CourseReviews } from '@/components/courses/CourseReviews';
import { Play } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';

interface Lesson {
  id: string;
  title: string;
  content_type: string;
  duration_minutes: number;
  is_preview: boolean;
  content_url?: string;
  content_data?: any;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  created_by: string;
  short_description?: string;
  description?: string;
  status: string;
  level: string;
  category?: {
    name: string;
  };
  price: number;
  duration_minutes: number;
  instructor?: {
    firstName: string;
    lastName: string;
  };
  created_at: string;
  modules: Module[];
}

export default function CourseDetailPage() {
  const { user, logout } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const checkEnrollment = useCallback(async (courseId: string) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`http://localhost:3001/api/v1/enrollments/${courseId}/check`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            setIsEnrolled(data.isEnrolled);
        }
    } catch (error) {
        console.error('Error checking enrollment:', error);
    } finally {
        setEnrollmentLoading(false);
    }
  }, []);

  const handleEnroll = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to enroll');
            router.push('/login');
            return;
        }

        const response = await fetch('http://localhost:3001/api/v1/enrollments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ courseId: course?.id })
        });

        if (response.ok) {
            toast.success('Successfully enrolled!');
            setIsEnrolled(true);
            router.push(`/courses/${course?.id}/learn`);
        } else {
            toast.error('Failed to enroll');
        }
    } catch (error) {
        toast.error('Error enrolling in course');
    }
  };

  const handlePreview = (lesson: Lesson) => {
    if (!lesson.is_preview) return;

    if (lesson.content_url) {
      setPreviewContent({
        id: lesson.content_data?.fileId || lesson.id,
        fileName: lesson.content_data?.fileName || lesson.title,
        fileType: lesson.content_data?.fileType || (lesson.content_type === 'video' ? 'video/mp4' : 'application/pdf'),
        title: lesson.title
      });
      setShowPreview(true);
    } else {
      toast.error('No content available for preview');
    }
  };

  const fetchCourse = useCallback(async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
      } else {
        toast.error('Failed to load course');
        router.push('/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (params.id) {
      fetchCourse(params.id as string);
      checkEnrollment(params.id as string);
    }
  }, [params.id, fetchCourse, checkEnrollment]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Course not found</h1>
            <Button onClick={() => router.push('/courses')}>
              Back to Courses
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        {/* Navigation */}
        <TopNav />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Course Header */}
          <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10 p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 w-full">
                  <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{course.title}</h1>
                  <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed max-w-3xl">{course.short_description}</p>
                  <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
                    <span className={`px-4 py-2 md:px-6 md:py-3 rounded-2xl text-xs md:text-sm font-bold shadow-lg ${
                      course.status === 'published' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {course.status}
                    </span>
                    <span className="px-4 py-2 md:px-6 md:py-3 rounded-2xl text-xs md:text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-lg">
                      {course.level}
                    </span>
                    {course.category && (
                      <span className="px-4 py-2 md:px-6 md:py-3 rounded-2xl text-xs md:text-sm font-bold bg-purple-100 text-purple-800 border border-purple-200 shadow-lg">
                        {course.category.name}
                      </span>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {isEnrolled ? (
                        <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" onClick={() => router.push(`/courses/${course.id}/learn`)}>
                            <Play className="w-5 h-5 mr-2" /> Continue Learning
                        </Button>
                    ) : (
                        <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" onClick={handleEnroll}>
                            Enroll Now {course.price > 0 ? `($${course.price})` : '(Free)'}
                        </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <Link href="/courses" className="w-full md:w-auto">
                    <div className="bg-white/70 hover:bg-white backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
                      <span className="text-gray-700 font-semibold">← Back</span>
                    </div>
                  </Link>
                  {(user?.id === course.created_by || user?.role === 'admin') && (
                    <>
                      <Link href={`/courses/${course.id}/builder`} className="w-full md:w-auto">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
                          <span className="text-white font-semibold">🏗️ Build</span>
                        </div>
                      </Link>
                      <Link href={`/courses/${course.id}/edit`} className="w-full md:w-auto">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
                          <span className="text-white font-semibold">Edit</span>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Description */}
              <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10 p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">About this course</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Course Content */}
              <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10 p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Content</h2>
                  {course.modules && course.modules.length > 0 ? (
                    <div className="space-y-6">
                      {course.modules.map((module, index) => (
                        <div key={module.id} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            {index + 1}. {module.title}
                          </h3>
                          <p className="text-gray-600 mb-6 text-lg">{module.description}</p>
                          {module.lessons && module.lessons.length > 0 && (
                            <div className="space-y-3">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div 
                                  key={lesson.id} 
                                  className={`group flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg transition-all duration-300 ${
                                    lesson.is_preview 
                                      ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' 
                                      : 'opacity-75 cursor-not-allowed'
                                  }`}
                                  onClick={() => handlePreview(lesson)}
                                >
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${
                                    lesson.is_preview 
                                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 group-hover:scale-110' 
                                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                  }`}>
                                    {lesson.is_preview ? (
                                      <Play className="w-5 h-5 text-white fill-current" />
                                    ) : (
                                      <span className="text-white text-xl">🔒</span>
                                    )}
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <p className="font-bold text-gray-900 text-lg">
                                      {lessonIndex + 1}. {lesson.title}
                                    </p>
                                    <p className="text-gray-600">
                                      {lesson.content_type} • {lesson.duration_minutes} min
                                      {lesson.is_preview && <span className="ml-2 text-green-600 font-bold">• Preview Available</span>}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 backdrop-blur-sm rounded-full mx-auto mb-8 flex items-center justify-center border border-white/30 shadow-xl">
                        <span className="text-6xl">📚</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">No modules yet</h3>
                      <p className="text-xl text-gray-600">Start building your course by adding modules</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Reviews */}
              <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10 p-8">
                  <CourseReviews courseId={course.id} isEnrolled={isEnrolled} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Course Information */}
              <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10 p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Course Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                      <span className="text-gray-600 font-medium">💰 Price:</span>
                      <span className="font-bold text-lg">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                      <span className="text-gray-600 font-medium">⏱️ Duration:</span>
                      <span className="font-bold text-lg">
                        {course.duration_minutes > 0 
                          ? `${Math.round(course.duration_minutes / 60)} hours`
                          : 'Not set'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                      <span className="text-gray-600 font-medium">👨‍🏫 Instructor:</span>
                      <span className="font-bold text-lg">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                      <span className="text-gray-600 font-medium">📅 Created:</span>
                      <span className="font-bold text-lg">
                        {new Date(course.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Statistics */}
              <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10 p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                      <span className="text-gray-600 font-medium">📖 Modules:</span>
                      <span className="font-bold text-2xl text-blue-600">{course.modules?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                      <span className="text-gray-600 font-medium">🎯 Lessons:</span>
                      <span className="font-bold text-2xl text-green-600">
                        {course.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                      <span className="text-gray-600 font-medium">👥 Students:</span>
                      <span className="font-bold text-2xl text-purple-600">0</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                      <span className="text-gray-600 font-medium">⭐ Rating:</span>
                      <span className="font-bold text-lg text-gray-500">Not rated yet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ContentPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          content={previewContent}
        />
      </div>
    </ProtectedRoute>
  );
}