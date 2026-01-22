'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Settings, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CourseSettingsProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedCourse: any) => void;
}

export function CourseSettings({ course, isOpen, onClose, onUpdate }: CourseSettingsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
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

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        short_description: course.short_description || '',
        category_id: course.category_id || '',
        level: course.level || 'beginner',
        language: course.language || 'en',
        price: course.price || 0,
        visibility: course.visibility || 'public',
      });
    }
    fetchCategories();
  }, [course]);

  const fetchCategories = async () => {
    try {
      const { accessToken } = useAuthStore.getState();
      const token = accessToken || localStorage.getItem('token');
      
      const response = await fetch('/api/v1/courses/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { accessToken } = useAuthStore.getState();
      const token = accessToken || localStorage.getItem('token');
      
      const payload: any = { ...formData };
      payload.price = Number(payload.price) || 0;

      // Remove empty strings for optional fields to avoid validation errors
      if (!payload.category_id) {
        delete payload.category_id;
      }

      const response = await fetch(`/api/v1/courses/${course.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      const updatedCourse = await response.json();
      toast.success('Course updated successfully!');
      onUpdate(updatedCourse);
      onClose();
    } catch (error) {
      toast.error('Failed to update course');
      console.error('Error updating course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-white/40 ring-1 ring-white/50">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/60 backdrop-blur-xl border-b border-white/40">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-inner">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Course Settings</h2>
              <p className="text-gray-600 text-sm mt-0.5">Manage your course details and visibility</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover:bg-red-50 hover:text-red-500 rounded-xl w-10 h-10 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 font-semibold text-base ml-1">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter an engaging course title"
                  required
                  className="bg-white/50 border-blue-100 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 h-12 text-lg rounded-xl shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700 font-semibold text-base ml-1">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger className="bg-white/50 border-blue-100 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 h-12 text-lg rounded-xl shadow-sm">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-blue-100 shadow-xl bg-white/95 backdrop-blur-xl">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="focus:bg-blue-50 focus:text-blue-700 rounded-lg cursor-pointer py-3 transition-colors">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description" className="text-gray-700 font-semibold text-base ml-1">Short Description</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Brief summary of your course (appears in course cards)"
                  className="bg-white/50 border-blue-100 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 min-h-[100px] text-base rounded-xl resize-none shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-semibold text-base ml-1">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of your course content, goals, and prerequisites"
                  className="bg-white/50 border-blue-100 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 min-h-[160px] text-base rounded-xl resize-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-gray-700 font-semibold text-base ml-1">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger className="bg-white/50 border-blue-100 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 h-12 text-lg rounded-xl shadow-sm">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-blue-100 shadow-xl bg-white/95 backdrop-blur-xl">
                      <SelectItem value="beginner" className="focus:bg-blue-50 focus:text-blue-700 rounded-lg cursor-pointer py-3 transition-colors">Beginner</SelectItem>
                      <SelectItem value="intermediate" className="focus:bg-blue-50 focus:text-blue-700 rounded-lg cursor-pointer py-3 transition-colors">Intermediate</SelectItem>
                      <SelectItem value="advanced" className="focus:bg-blue-50 focus:text-blue-700 rounded-lg cursor-pointer py-3 transition-colors">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-700 font-semibold text-base ml-1">Price ($)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="0.00"
                      className="bg-white/50 border-blue-100 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 h-12 text-lg rounded-xl pl-8 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-blue-100/50">
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 md:py-6 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-semibold py-4 md:py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
