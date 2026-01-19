'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  status: string;
  level: string;
  price: number;
  short_description?: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCourses();
  }, [isAuthenticated, router]);

  const fetchCourses = async () => {
    try {
      const { accessToken } = useAuthStore.getState();
      const token = accessToken || localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        router.push('/login');
        return;
      }
      
      const response = await fetch('/api/v1/courses?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        if (data.courses?.length > 0) {
          toast.success(`Loaded ${data.courses.length} courses`);
        }
      } else if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const canCreateCourses = isAdmin || user.role === 'educator' || user.role === 'instructor' || user.role === 'learner';


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduFlow
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium border-b-2 border-blue-600">
                  Dashboard
                </Link>
                <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Courses
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{user.firstName[0]}</span>
                </div>
                <span className="text-gray-700 font-medium">{user.firstName}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" className="bg-white/50 hover:bg-white/80">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {canCreateCourses 
              ? 'Ready to inspire minds? Manage your courses and track your teaching impact.' 
              : 'Continue your learning journey and discover new opportunities.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {canCreateCourses && (
            <Link href="/courses/create" className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent backdrop-blur-xl rounded-3xl p-8 border border-blue-200/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-gradient-to-br hover:from-blue-500/20 hover:via-blue-400/10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-3xl font-bold">+</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Create Course</h3>
                  <p className="text-gray-600 leading-relaxed">Start building your next educational masterpiece</p>
                </div>
              </div>
            </Link>
          )}
          
          <Link href="/courses" className="group">
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-400/5 to-transparent backdrop-blur-xl rounded-3xl p-8 border border-green-200/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-gradient-to-br hover:from-green-500/20 hover:via-green-400/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-3xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Browse Courses</h3>
                <p className="text-gray-600 leading-relaxed">Explore our comprehensive course library</p>
              </div>
            </div>
          </Link>

          {canCreateCourses && (
            <Link href={courses.length > 0 ? `/courses/${courses[0].id}/builder` : '/courses'} className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-transparent backdrop-blur-xl rounded-3xl p-8 border border-orange-200/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-gradient-to-br hover:from-orange-500/20 hover:via-orange-400/10">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-3xl">🏗️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Build Course</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {courses.length > 0 ? 'Add modules, lessons, and content to your courses' : 'Create a course first to start building'}
                  </p>
                </div>
              </div>
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin" className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-transparent backdrop-blur-xl rounded-3xl p-8 border border-purple-200/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-gradient-to-br hover:from-purple-500/20 hover:via-purple-400/10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-3xl">⚙️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Admin Panel</h3>
                  <p className="text-gray-600 leading-relaxed">Manage system settings and users</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        {canCreateCourses && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Courses</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{courses.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">📖</span>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Published</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">
                    {courses.filter(c => c.status === 'published').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">✅</span>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Students</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">0</p>
                  <p className="text-xs text-gray-500 mt-1">Coming in Sprint 5</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">👥</span>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Revenue</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">
                    ${(courses.reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0)).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Potential earnings</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Courses */}
        <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center p-8 border-b border-white/20">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Recent Courses</h2>
                <p className="text-gray-600 mt-2">Your latest educational content</p>
              </div>
              <Link href="/courses">
                <div className="bg-white/50 hover:bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <span className="text-gray-700 font-semibold">View All →</span>
                </div>
              </Link>
            </div>
            <div className="p-8">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  <span className="ml-4 text-xl text-gray-600">Loading courses...</span>
                </div>
              ) : courses.length > 0 ? (
                <div className="space-y-6">
                  {courses.map((course) => (
                    <div key={course.id} className="group relative overflow-hidden bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-2xl">📚</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{course.title}</h3>
                            <p className="text-gray-600 mt-2 leading-relaxed">{course.short_description || 'No description available'}</p>
                            <div className="flex items-center space-x-4 mt-4">
                              <span className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${
                                course.status === 'published' 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}>
                                {course.status}
                              </span>
                              <span className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                {course.level}
                              </span>
                              <span className="text-sm text-gray-500 font-medium">
                                ${course.price} • {new Date(course.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Link href={`/courses/${course.id}`}>
                            <div className="bg-white/70 hover:bg-white backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                              <span className="text-gray-700 font-semibold">View</span>
                            </div>
                          </Link>
                          {canCreateCourses && (
                            <>
                              <Link href={`/courses/${course.id}/builder`}>
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                  <span className="text-white font-semibold">🏗️ Build</span>
                                </div>
                              </Link>
                              <Link href={`/courses/${course.id}/edit`}>
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                  <span className="text-white font-semibold">Edit</span>
                                </div>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 backdrop-blur-sm rounded-full mx-auto mb-8 flex items-center justify-center border border-white/30 shadow-xl">
                    <span className="text-6xl">📚</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">No courses yet</h3>
                  <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    {canCreateCourses 
                      ? 'Ready to share your knowledge? Create your first course and start inspiring learners worldwide.' 
                      : 'No courses are available at the moment. Check back soon for new learning opportunities.'}
                  </p>
                  {canCreateCourses && (
                    <Link href="/courses/create">
                      <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        Create Your First Course 🚀
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}