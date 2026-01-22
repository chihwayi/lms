'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Star, Clock, DollarSign, Users, X } from 'lucide-react';
import Link from 'next/link';

interface CourseSearchProps {
  onResults?: (results: any) => void;
}

export function CourseSearch({ onResults }: CourseSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    categories: string[];
    levels: string[];
    minPrice: number;
    maxPrice: number;
    language: string;
    featured: boolean;
  }>({
    categories: [],
    levels: [],
    minPrice: 0,
    maxPrice: 1000,
    language: '',
    featured: false,
  });
  const [results, setResults] = useState({ courses: [], total: 0, filters: null });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    searchCourses();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/v1/courses/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        categories: filters.categories.join(','),
        levels: filters.levels.join(','),
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString(),
        language: filters.language,
        featured: filters.featured.toString(),
        status: 'published',
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        onResults?.(data);
      }
    } catch (error) {
      console.error('Error searching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      levels: [],
      minPrice: 0,
      maxPrice: 1000,
      language: '',
      featured: false,
    });
    setSearchQuery('');
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <Card className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-xl border-white/40 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Discover Courses
              </h2>
              <p className="text-xl text-gray-600 mt-2">Find the perfect course for your learning journey</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search courses, topics, or instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCourses()}
                className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg text-lg py-4 pl-12 pr-6 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-4 rounded-2xl"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
            <Button
              onClick={searchCourses}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Search Filters</h3>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="bg-white/70 hover:bg-white/90 text-gray-700"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">Category</label>
                <Select
                  value={filters.categories[0] || ''}
                  onValueChange={(value) => setFilters({ ...filters, categories: value ? [value] : [] })}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">Difficulty Level</label>
                <Select
                  value={filters.levels[0] || ''}
                  onValueChange={(value) => setFilters({ ...filters, levels: value ? [value] : [] })}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="beginner">🌱 Beginner</SelectItem>
                    <SelectItem value="intermediate">🚀 Intermediate</SelectItem>
                    <SelectItem value="advanced">⭐ Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                    className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 1000 })}
                    className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="mt-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-lg font-semibold text-gray-800">⭐ Featured Courses Only</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Search Results ({results.total} courses found)
          </h3>
        </div>

        {loading ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.courses.map((course: any) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="group bg-white/40 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Course Thumbnail */}
                      <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white text-4xl">📚</span>
                      </div>

                      {/* Course Info */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {course.title}
                        </h4>
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {course.short_description || course.description}
                        </p>
                      </div>

                      {/* Course Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                            course.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {course.level}
                          </span>
                          {course.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(course.price)}
                        </span>
                      </div>

                      {/* Instructor */}
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
        )}

        {results.courses.length === 0 && !loading && (
          <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No courses found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
              <Button onClick={clearFilters} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}