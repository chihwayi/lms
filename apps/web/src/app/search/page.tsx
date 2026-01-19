'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CourseSearch } from '@/components/courses/CourseSearch';

export default function SearchPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
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
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</Link>
                  <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">Courses</Link>
                  <span className="text-gray-700 font-medium border-b-2 border-blue-600">Search</span>
                  {isAdmin && (
                    <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">Admin</Link>
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

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CourseSearch />
        </main>
      </div>
    </ProtectedRoute>
  );
}