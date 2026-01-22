'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MentorList } from '@/components/mentorship/MentorList';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Users, LayoutDashboard } from 'lucide-react';

export default function MentorshipPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <TopNav />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-blue-100 font-medium tracking-wide uppercase text-sm">Mentorship Program</span>
                        </div>
                        <h1 className="text-3xl font-bold sm:text-5xl tracking-tight">
                            Find Your Mentor
                        </h1>
                        <p className="mt-4 text-xl text-blue-100 max-w-2xl leading-relaxed">
                            Connect with industry experts who can guide your innovation journey. 
                            Get feedback, career advice, and technical support.
                        </p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
                        <Link href="/mentorship/dashboard">
                            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 w-full sm:w-auto font-medium border-0 shadow-lg shadow-blue-900/20">
                                <LayoutDashboard className="w-5 h-5 mr-2" />
                                My Mentorships
                            </Button>
                        </Link>
                        <Link href="/mentorship/become">
                            <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 backdrop-blur-sm transition-all w-full sm:w-auto">
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Become a Mentor
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8">
          <MentorList />
        </main>
      </div>
    </ProtectedRoute>
  );
}
