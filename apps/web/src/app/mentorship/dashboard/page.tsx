'use client';

import { MentorshipDashboard } from '@/components/mentorship/MentorshipDashboard';
import { TopNav } from '@/components/layout/TopNav';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LayoutDashboard } from 'lucide-react';

export default function MentorshipDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <TopNav />
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white shadow-md pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                 <LayoutDashboard className="w-6 h-6 text-indigo-100" />
               </div>
               <span className="text-indigo-100 font-medium tracking-wide uppercase text-sm">Overview</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white drop-shadow-sm">Mentorship Dashboard</h1>
            <p className="mt-2 text-indigo-100 text-lg max-w-2xl">
              Track your mentorship requests, manage your connections, and stay on top of your growth journey.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-6 sm:p-8 min-h-[600px]">
                <MentorshipDashboard />
            </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
