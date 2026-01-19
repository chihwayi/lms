'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CourseDetailPage() {
  const { user, logout } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  useEffect(() => {
    if (params.id) {
      fetchCourse(params.id);
    }
  }, [params.id]);

  const fetchCourse = async (courseId) => {
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
  };

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
        <nav className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduFlow
                </Link>
                <div className="hidden md:flex space-x-6">
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Courses
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user?.firstName?.[0] || 'U'}</span>
                  </div>
                  <span className="text-gray-700 font-medium">{user?.firstName || 'User'}</span>
                </div>
                <div onClick={handleLogout} className="bg-white/50 hover:bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <span className="text-gray-700 font-semibold">Logout</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Header */}
          <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10 p-8">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-5xl font-bold text-gray-900 mb-4">{course.title}</h1>
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed max-w-3xl">{course.short_description}</p>
                  <div className="flex gap-4 mb-6">
                    <span className={`px-6 py-3 rounded-2xl text-sm font-bold shadow-lg ${
                      course.status === 'published' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {course.status}
                    </span>
                    <span className="px-6 py-3 rounded-2xl text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-lg">
                      {course.level}
                    </span>
                    {course.category && (
                      <span className="px-6 py-3 rounded-2xl text-sm font-bold bg-purple-100 text-purple-800 border border-purple-200 shadow-lg">
                        {course.category.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link href="/courses">
                    <div className="bg-white/70 hover:bg-white backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <span className="text-gray-700 font-semibold">← Back to Courses</span>
                    </div>
                  </Link>
                  <Link href={`/courses/${course.id}/builder`}>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <span className="text-white font-semibold">🏗️ Build Course</span>
                    </div>
                  </Link>
                  <Link href={`/courses/${course.id}/edit`}>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <span className="text-white font-semibold">Edit Course</span>
                    </div>
                  </Link>
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
                                <div key={lesson.id} className="group flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-white text-xl">🎥</span>
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <p className="font-bold text-gray-900 text-lg">
                                      {lessonIndex + 1}. {lesson.title}
                                    </p>
                                    <p className="text-gray-600">
                                      {lesson.content_type} • {lesson.duration_minutes} min
                                      {lesson.is_preview && ' • Preview Available'}
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
      </div>
    </ProtectedRoute>
  );
}