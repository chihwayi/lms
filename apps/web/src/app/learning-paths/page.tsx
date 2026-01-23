'use client';

import { useEffect, useState } from 'react';
import { LearningPath, LearningPathCard } from '@/components/learning-paths/LearningPathCard';
import { TopNav } from '@/components/layout/TopNav';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    const fetchPaths = async () => {
      try {
        const res = await apiClient('/learning-paths');
        if (res.ok) {
          const data = await res.json();
          setPaths(data);
        }
      } catch (err) {
        console.error('Failed to fetch learning paths', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();
  }, [accessToken]);

  const filteredPaths = paths.filter(path => 
    path.title.toLowerCase().includes(search.toLowerCase()) || 
    path.description.toLowerCase().includes(search.toLowerCase()) ||
    path.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Learning Paths</h1>
            <p className="text-slate-500 mt-2">Curated collections of courses to help you master specific skills.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search paths..." 
              className="pl-9 bg-white border-slate-200 focus:border-indigo-300 focus:ring-indigo-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPaths.map(path => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No learning paths found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search terms or check back later.</p>
          </div>
        )}
      </main>
    </div>
  );
}
