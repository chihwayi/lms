'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CourseBuilder } from '@/components/courses/CourseBuilder';

export default function CourseBuilderPage() {
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
      } else {
        toast.error('Failed to load course');
        router.push('/courses');
      }
    } catch (error) {
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        <nav className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduFlow
                </Link>
                <div className="hidden md:flex space-x-6">
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</Link>
                  <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">Courses</Link>
                  <span className="text-gray-700 font-medium border-b-2 border-blue-600">Course Builder</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user?.firstName?.[0] || 'U'}</span>
                  </div>
                  <span className="text-gray-700 font-medium">{user?.firstName || 'User'}</span>
                </div>
                <Button onClick={handleLogout} variant="outline" className="bg-white/50 hover:bg-white/80">Logout</Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <span className="text-white text-4xl">🏗️</span>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">Course Builder</h1>
                  <p className="text-2xl text-gray-600 font-medium">{course?.title}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Link href={`/courses/${course?.id}`}>
                  <Button variant="outline" className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 text-lg font-semibold">
                    👁️ Preview Course
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div className="flex items-center space-x-3 text-lg text-gray-500 mt-6 bg-white/30 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/30 shadow-lg">
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors font-medium">Dashboard</Link>
              <span className="text-2xl">→</span>
              <Link href="/courses" className="hover:text-blue-600 transition-colors font-medium">Courses</Link>
              <span className="text-2xl">→</span>
              <Link href={`/courses/${course?.id}`} className="hover:text-blue-600 transition-colors font-medium">{course?.title}</Link>
              <span className="text-2xl">→</span>
              <span className="text-gray-700 font-bold">🏗️ Builder</span>
            </div>
          </div>

          <CourseBuilder course={course} onCourseUpdate={setCourse} />
        </main>
      </div>
    </ProtectedRoute>
  );
}