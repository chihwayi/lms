'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { XPDisplay } from '@/components/gamification/XPDisplay';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { AchievementsList } from '@/components/gamification/AchievementsList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function GamificationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Gamification Center
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Achievements */}
            <div className="lg:col-span-2 space-y-8">
              <XPDisplay />
              <AchievementsList />
            </div>

            {/* Right Column: Leaderboard */}
            <div className="lg:col-span-1">
              <Leaderboard />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
