'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, ArrowRight, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { LearningPath } from './LearningPathCard';
import Image from 'next/image';

export function RecommendedPathsWidget() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    apiClient('/learning-paths/recommendations')
    .then(res => res.json())
    .then(data => setPaths(data.slice(0, 3))) // Show top 3
    .catch(err => console.error('Failed to fetch recommendations', err));
  }, [accessToken]);

  if (paths.length === 0) return null;

  return (
    <Card className="col-span-full border-none shadow-xl bg-gradient-to-br from-white via-white to-slate-50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between pb-6 space-y-0 relative z-10 border-b border-slate-100/50">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
            <Map className="w-6 h-6" />
          </div>
          Recommended Paths
        </CardTitle>
        <Link href="/learning-paths">
          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold tracking-tight">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 relative z-10">
        {paths.map(path => (
          <Link key={path.id} href={`/learning-paths/${path.id}`} className="group/item block h-full">
            <div className="flex flex-col h-full p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 mb-4 group-hover/item:shadow-md transition-all">
                {path.thumbnailUrl ? (
                  <Image src={path.thumbnailUrl} alt={path.title} fill className="object-cover transition-transform duration-500 group-hover/item:scale-105" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-300">
                    <Map className="w-10 h-10" />
                  </div>
                )}
                {path.tags[0] && (
                  <div className="absolute top-3 right-3">
                     <span className="bg-indigo-600/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-lg uppercase tracking-wider">
                        {path.tags[0]}
                     </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <h4 className="font-bold text-slate-900 text-base group-hover/item:text-indigo-600 transition-colors line-clamp-1">
                  {path.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                  {path.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                 <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {path.courses.length} Courses
                 </span>
                 <span className="text-xs font-bold text-indigo-600 group-hover/item:translate-x-1 transition-transform flex items-center bg-indigo-50 px-3 py-1.5 rounded-full group-hover/item:bg-indigo-100">
                    Start <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                 </span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
