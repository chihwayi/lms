'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FeaturedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/v1/courses/featured', {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.log('Featured courses response:', response.status);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching featured courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-orange-700 bg-clip-text text-transparent">
              Featured Courses
            </h2>
            <p className="text-gray-600 text-sm md:text-base">Handpicked courses for exceptional learning</p>
          </div>
        </div>
        <Link href="/search" className="w-full md:w-auto">
          <Button className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="group bg-white/40 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="w-full h-32 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <span className="text-white text-4xl">⭐</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      FEATURED
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {course.title}
                    </h4>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {course.short_description || course.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                      course.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {course.level}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Star className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No featured courses yet</h3>
            <p className="text-gray-600">Check back soon for featured content</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}