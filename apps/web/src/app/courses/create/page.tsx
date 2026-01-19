'use client';

import { useState, useEffect } from 'react';
import { CreateCourseForm } from '@/components/courses/CreateCourseForm';
import { useAuthStore } from '@/lib/auth-store';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CreateCoursePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { accessToken } = useAuthStore.getState();
      const token = accessToken || localStorage.getItem('token');
      
      const response = await fetch('/api/v1/courses/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

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
                  <span className="text-gray-700 font-medium border-b-2 border-blue-600">
                    Create Course
                  </span>
                  {isAdmin && (
                    <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                      Admin
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user?.firstName?.[0] || 'U'}</span>
                  </div>
                  <span className="text-gray-700 font-medium">{user?.firstName || 'User'}</span>
                </div>
                <Button onClick={handleLogout} variant="outline" className="bg-white/50 hover:bg-white/80">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-3xl">🚀</span>
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-xl text-gray-600 mt-2">Share your knowledge and inspire learners worldwide</p>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-8">
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <span>→</span>
              <Link href="/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
              <span>→</span>
              <span className="text-gray-700 font-medium">Create Course</span>
            </div>
          </div>

          {/* Create Course Form Container */}
          <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10 p-8">
              <CreateCourseForm categories={categories} />
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">💡</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Engaging Title</h3>
                <p className="text-gray-600 text-sm">Create a compelling title that clearly describes what students will learn</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📝</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Clear Description</h3>
                <p className="text-gray-600 text-sm">Provide detailed information about course content and learning outcomes</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Right Level</h3>
                <p className="text-gray-600 text-sm">Choose the appropriate difficulty level to match your target audience</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}