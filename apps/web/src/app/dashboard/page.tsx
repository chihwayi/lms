'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EnrolledCourses } from '@/components/courses/EnrolledCourses';
import { TeachingCourses } from '@/components/courses/TeachingCourses';
import { ContinueLearning } from '@/components/dashboard/ContinueLearning';
import { BookOpen, Presentation, LayoutDashboard } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'learning' | 'teaching'>('learning');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasRole = (roleName: string) => {
    return user?.roles?.some(r => r.name === roleName) || user?.role === roleName;
  };

  const isInstructor = hasRole('instructor') || hasRole('educator') || hasRole('admin') || hasRole('super_admin');
  const isAdmin = hasRole('admin') || hasRole('super_admin');

  // If user is instructor and we haven't set tab yet, maybe we want to default to something?
  // But 'learning' is a safe default.

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Navigation */}
      <TopNav />
      
      <main className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Continue Learning Widget */}
        <ContinueLearning />

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
                Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
                Manage your learning and teaching activities
            </p>
          </div>
          
          {isInstructor && (
            <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-white/30 shadow-sm">
                <button
                    onClick={() => setActiveTab('learning')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        activeTab === 'learning' 
                        ? 'bg-white shadow text-blue-600 font-semibold' 
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    <span>My Learning</span>
                </button>
                <button
                    onClick={() => setActiveTab('teaching')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        activeTab === 'teaching' 
                        ? 'bg-white shadow text-purple-600 font-semibold' 
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                >
                    <Presentation className="w-4 h-4" />
                    <span>My Teaching</span>
                </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
            {activeTab === 'learning' ? (
                <EnrolledCourses />
            ) : (
                isInstructor && <TeachingCourses />
            )}
        </div>
      </main>
    </div>
  );
}
