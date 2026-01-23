'use client';

import { InstructorDashboard } from '@/components/instructor/InstructorDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TopNav } from '@/components/layout/TopNav';

export default function InstructorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['instructor', 'admin']}>
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
          <InstructorDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
}
