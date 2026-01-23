'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, GraduationCap, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  tags: string[];
  courses: {
    id: string;
    title: string;
    duration_minutes: number;
    level: string;
  }[];
  createdAt: string;
}

interface LearningPathCardProps {
  path: LearningPath;
  progress?: number;
}

export function LearningPathCard({ path, progress }: LearningPathCardProps) {
  const totalDuration = path.courses.reduce((acc, course) => acc + course.duration_minutes, 0);
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  return (
    <Card className="flex flex-col h-full group hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {path.thumbnailUrl ? (
          <Image 
            src={path.thumbnailUrl} 
            alt={path.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-blue-50">
            <GraduationCap className="w-16 h-16 text-indigo-200" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-indigo-700 hover:bg-white backdrop-blur-sm shadow-sm border-indigo-100">
            {path.courses.length} Courses
          </Badge>
        </div>
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {path.title}
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {path.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal text-slate-500 bg-slate-50">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="text-slate-500 text-sm line-clamp-3 mb-4">
          {path.description}
        </p>
        
        <div className="flex items-center text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>{path.courses.length} Modules</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/learning-paths/${path.id}`} className="w-full">
          <Button className="w-full bg-slate-900 group-hover:bg-indigo-600 transition-colors">
            {progress !== undefined ? (
              progress === 100 ? 'Completed' : 'Continue Path'
            ) : (
              <>View Path <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
