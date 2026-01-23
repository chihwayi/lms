'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/layout/TopNav';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { LearningPath, LearningPathCard } from '@/components/learning-paths/LearningPathCard';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, GraduationCap } from 'lucide-react';

interface UserLearningPath {
  id: string;
  progress: number;
  status: string;
  learningPath: LearningPath;
}

export default function MyLearningPathsPage() {
  const [paths, setPaths] = useState<UserLearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    const fetchPaths = async () => {
      try {
        const res = await apiClient('/learning-paths/my-paths');
        if (res.ok) {
          const data = await res.json();
          setPaths(data);
        }
      } catch (err) {
        console.error('Failed to fetch my paths', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Learning Paths</h1>
                <p className="text-slate-500 mt-2">Track your progress and continue learning</p>
            </div>
            <Link href="/learning-paths">
                <Button variant="outline">Browse All Paths</Button>
            </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : paths.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No learning paths started</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                You haven&apos;t enrolled in any learning paths yet. Explore our curated paths to master new skills.
            </p>
            <Link href="/learning-paths">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Explore Learning Paths
                </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map(userPath => (
              <LearningPathCard 
                key={userPath.id} 
                path={userPath.learningPath} 
                progress={userPath.progress}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
