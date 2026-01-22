'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Presentation, Plus, Users, Clock, Edit } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';

export function TeachingCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.id) {
        fetchMyCourses();
    }
  }, [user?.id]);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:3001/api/v1/courses?instructorId=${user?.id}&limit=100`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        // The API returns { courses: [], total: number }
        setCourses(data.courses || []);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching teaching courses:', error);
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Presentation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Courses
            </h2>
            <p className="text-gray-600">Manage your educational content</p>
          </div>
        </div>
        <Link href="/courses/create">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Plus className="w-4 h-4 mr-2" /> Create New Course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <Link key={course.id} href={`/courses/${course.id}/edit`}>
            <Card className="group bg-white/40 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <span className="text-white text-4xl">🎓</span>
                    </div>
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                        course.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {course.status.toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {course.title}
                    </h4>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {course.short_description || course.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                     <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course.enrollments_count || 0} students</span>
                     </div>
                     <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration_minutes || 0}m</span>
                     </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <Button size="sm" variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                        <Edit className="w-4 h-4 mr-2" />
                        Manage Course
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
                   <Plus className="w-12 h-12 text-gray-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">You haven't created any courses yet</h3>
                 <p className="text-gray-600 mb-6">Share your knowledge with the world!</p>
                 <Link href="/courses/create">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        Create Your First Course
                    </Button>
                 </Link>
               </CardContent>
             </Card>
        )}
      </div>
    </div>
  );
}
