'use client';

import { useEffect, useState } from 'react';
import { KidsLayout } from '@/components/kids/KidsLayout';
import { apiClient } from '@/lib/api-client';
import { Play, Star, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';

export default function KidsDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Reuse the enrolled courses endpoint
        const response = await apiClient('enrollment/my-courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <KidsLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-lg transform transition-transform hover:scale-[1.01] duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl backdrop-blur-sm">
              👋
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-1">Hi, {user?.name?.split(' ')[0] || 'Friend'}!</h1>
              <p className="text-purple-100 font-medium text-lg">Ready to learn something new today?</p>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div>
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Star className="w-8 h-8 text-yellow-500 fill-current animate-pulse" />
            My Adventures
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl h-64 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((enrollment) => (
                <Link 
                  href={`/kids/courses/${enrollment.course.id}`} 
                  key={enrollment.id}
                  className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 overflow-hidden"
                >
                  {/* Course Image */}
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {enrollment.course.thumbnail_url ? (
                      <img 
                        src={enrollment.course.thumbnail_url} 
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-6xl">
                        🚀
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                        <Play className="w-8 h-8 text-purple-600 fill-current ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-black text-gray-800 mb-3 line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {enrollment.course.title}
                    </h3>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm font-bold text-gray-500">
                        <span>Progress</span>
                        <span>{Math.round(enrollment.progress)}%</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          className={cn("h-full transition-all duration-1000 ease-out rounded-full", getProgressColor(enrollment.progress))}
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Continue</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </KidsLayout>
  );
}
