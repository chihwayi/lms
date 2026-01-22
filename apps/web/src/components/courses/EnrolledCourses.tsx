'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, PlayCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { Progress } from '@/components/ui/progress';

export function EnrolledCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:3001/api/v1/enrollments/my-courses', {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data || []);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-300 rounded-xl"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-2 bg-gray-300 rounded w-full mt-4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            My Learning
          </h2>
          <p className="text-gray-600">Continue your educational journey</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((enrollment: any) => (
          <Link key={enrollment.id} href={`/courses/${enrollment.course.id}/learn`}>
            <Card className="group bg-white/40 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-40 bg-gray-900">
                    {enrollment.course.thumbnail_url ? (
                        <img src={enrollment.course.thumbnail_url} alt={enrollment.course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                            <span className="text-white text-4xl">📚</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                        <h4 className="text-white font-bold text-lg line-clamp-2 mb-2">
                            {enrollment.course.title}
                        </h4>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{Math.round(enrollment.progress || 0)}%</span>
                  </div>
                  <Progress value={enrollment.progress || 0} className="h-2" />
                  
                  <div className="pt-4">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        {enrollment.progress > 0 ? (
                            <>
                                <PlayCircle className="w-4 h-4 mr-2" /> Continue Learning
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-4 h-4 mr-2" /> Start Course
                            </>
                        )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {courses.length === 0 && (
             <Card className="col-span-full bg-white/40 backdrop-blur-xl border-white/30 shadow-xl border-dashed border-2">
               <CardContent className="p-12 text-center">
                 <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                   <BookOpen className="w-12 h-12 text-gray-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">You are not enrolled in any courses</h3>
                 <p className="text-gray-600 mb-6">Browse our catalog and start learning today!</p>
                 <Link href="/courses">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Browse Courses
                    </Button>
                 </Link>
               </CardContent>
             </Card>
        )}
      </div>
    </div>
  );
}
