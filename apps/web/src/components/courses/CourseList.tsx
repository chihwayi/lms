'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  status: string;
  level: string;
  price: number;
}

export function CourseList() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [search, selectedCategory, selectedLevel]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLevel) params.append('level', selectedLevel);

      const response = await fetch(`/api/v1/courses?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/courses/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduFlow
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition-colors font-medium border-b-2 border-blue-600">
                  Courses
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{user?.firstName?.[0] || 'U'}</span>
                </div>
                <span className="text-gray-700 font-medium">{user?.firstName || 'User'}</span>
              </div>
              <div onClick={handleLogout} className="bg-white/50 hover:bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                <span className="text-gray-700 font-semibold">Logout</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Course Library</h1>
              <p className="text-lg md:text-xl text-gray-600 mt-2">Discover and manage educational content</p>
            </div>
            <Link href="/courses/create" className="w-full md:w-auto">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
                <span className="font-semibold">+ Create Course</span>
              </div>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full md:w-auto max-w-md">
                <input
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="group relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.short_description || course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {course.level}
                      </span>
                      <span className="font-medium">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/courses/${course.id}`} className="flex-1">
                        <div className="bg-white/70 hover:bg-white backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                          <span className="text-gray-700 font-semibold">View</span>
                        </div>
                      </Link>
                      <Link href={`/courses/${course.id}/edit`} className="flex-1">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                          <span className="text-white font-semibold">Edit</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {courses.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 backdrop-blur-sm rounded-full mx-auto mb-8 flex items-center justify-center border border-white/30 shadow-xl">
                <span className="text-6xl">📚</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No courses found</h3>
              <p className="text-xl text-gray-600 mb-10">
                {search || selectedCategory || selectedLevel
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first course'}
              </p>
              <Link href="/courses/create">
                <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  Create Your First Course 🚀
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}