'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MentorProfileForm } from '@/components/mentorship/MentorProfileForm';
import { TopNav } from '@/components/layout/TopNav';
import { Award, CheckCircle2 } from 'lucide-react';

export default function BecomeMentorPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <TopNav />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pb-24">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/20">
                    <Award className="w-8 h-8 text-yellow-300" />
                </div>
                <h1 className="text-3xl font-bold sm:text-5xl tracking-tight mb-4">
                    Share Your Expertise
                </h1>
                <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
                    Join our community of mentors and help shape the next generation of innovators.
                    Your guidance can change a career.
                </p>
            </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12">
            <div className="grid grid-cols-1 gap-8">
                {/* Benefits Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Why become a mentor?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-900">Give Back</h3>
                                <p className="text-sm text-slate-600 mt-1">Help others succeed by sharing your knowledge and experience.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-900">Grow Leadership</h3>
                                <p className="text-sm text-slate-600 mt-1">Develop your coaching and leadership skills.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-900">Expand Network</h3>
                                <p className="text-sm text-slate-600 mt-1">Connect with motivated learners and other industry experts.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <MentorProfileForm />
            </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
