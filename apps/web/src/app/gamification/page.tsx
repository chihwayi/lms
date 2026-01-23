'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { XPDisplay } from '@/components/gamification/XPDisplay';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { AchievementsList } from '@/components/gamification/AchievementsList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function GamificationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/50 pb-20 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        </div>

        <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Gamification Center
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Achievements */}
            <div className="lg:col-span-2 space-y-8">
              <XPDisplay />
              <AchievementsList />
            </div>

            {/* Right Column: Leaderboard */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Leaderboard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
