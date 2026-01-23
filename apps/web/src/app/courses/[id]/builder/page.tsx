'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TopNav } from '@/components/layout/TopNav';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CourseBuilder } from '@/components/courses/CourseBuilder';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function CourseBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async (courseId: string) => {
      try {
        const response = await apiClient(`/courses/${courseId}`);

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

    if (params.id) {
      fetchCourse(params.id as string);
    }
  }, [params.id, router]);

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
        
        <TopNav />

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