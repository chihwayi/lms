'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduFlow
              </Link>
              <span className="ml-4 text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.firstName}!</span>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 hover:shadow-lg transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        {/* Welcome Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            You're successfully logged into EduFlow LMS
          </p>
          
          {/* User Info */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user.email}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-semibold text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600">
            Course management and learning features will be available in Sprint 4.
          </p>
        </div>
      </main>
    </div>
  );
}