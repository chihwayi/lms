'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CreateCourseFormProps {
  categories: Category[];
}

export function CreateCourseForm({ categories }: CreateCourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category_id: '',
    level: 'beginner',
    language: 'en',
    price: 0,
    visibility: 'public',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { accessToken } = useAuthStore.getState();
      const token = accessToken || localStorage.getItem('token');
      
      // Prepare payload: remove empty strings for optional fields and ensure price is number
      const payload: any = { ...formData };
      if (!payload.category_id) delete payload.category_id;
      if (!payload.short_description) delete payload.short_description;
      if (!payload.description) delete payload.description;
      
      // Ensure price is a number, defaulting to 0 if invalid
      payload.price = Number(payload.price) || 0;

      const response = await fetch('/api/v1/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Create course error details:', errorData);
        throw new Error(errorData.message || 'Failed to create course');
      }

      const course = await response.json();
      toast.success('Course created successfully!');
      router.push(`/courses/${course.id}`);
    } catch (error) {
      toast.error('Failed to create course');
      console.error('Error creating course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Course Title Section */}
      <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📝</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Course Details</h3>
              <p className="text-gray-600">Basic information about your course</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-lg font-semibold text-gray-800">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter an engaging course title"
                className="bg-white/70 backdrop-blur-sm border-white/30 shadow-lg text-lg py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="short_description" className="text-lg font-semibold text-gray-800">Short Description</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) => handleChange('short_description', e.target.value)}
                placeholder="A brief, compelling description (max 500 characters)"
                className="bg-white/70 backdrop-blur-sm border-white/30 shadow-lg text-lg py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                maxLength={500}
              />
              <p className="text-sm text-gray-500">{formData.short_description.length}/500 characters</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-lg font-semibold text-gray-800">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Provide a detailed description of what students will learn..."
                className="bg-white/70 backdrop-blur-sm border-white/30 shadow-lg text-lg py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 min-h-[120px]"
                rows={5}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Settings Section */}
      <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">⚙️</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Course Settings</h3>
              <p className="text-gray-600">Configure your course parameters</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-800">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                <SelectTrigger className="bg-white/70 backdrop-blur-sm border-white/30 shadow-lg text-lg py-3 px-4 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl rounded-xl">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-lg py-3">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-800">Difficulty Level</Label>
              <Select value={formData.level} onValueChange={(value) => handleChange('level', value)}>
                <SelectTrigger className="bg-white/70 backdrop-blur-sm border-white/30 shadow-lg text-lg py-3 px-4 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl rounded-xl">
                  <SelectItem value="beginner" className="text-lg py-3">🌱 Beginner</SelectItem>
                  <SelectItem value="intermediate" className="text-lg py-3">🚀 Intermediate</SelectItem>
                  <SelectItem value="advanced" className="text-lg py-3">⭐ Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="price" className="text-lg font-semibold text-gray-800">Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  className="bg-white/70 backdrop-blur-sm border-white/30 shadow-lg text-lg py-3 pl-8 pr-4 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-gray-500">Set to $0 for free courses</p>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-800">Visibility</Label>
              <Select value={formData.visibility} onValueChange={(value) => handleChange('visibility', value)}>
                <SelectTrigger className="bg-white/70 backdrop-blur-sm border-white/30 shadow-lg text-lg py-3 px-4 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl rounded-xl">
                  <SelectItem value="public" className="text-lg py-3">🌍 Public</SelectItem>
                  <SelectItem value="private" className="text-lg py-3">🔒 Private</SelectItem>
                  <SelectItem value="restricted" className="text-lg py-3">👥 Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl font-bold px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              <span>Creating Course...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>Create Course</span>
              <span>🚀</span>
            </div>
          )}
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/30 text-gray-700 text-xl font-semibold px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}