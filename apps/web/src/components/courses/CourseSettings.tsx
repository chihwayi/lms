'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-300">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-white/20 ring-1 ring-black/5">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Course Settings</h2>
            <p className="text-gray-500 text-sm mt-1">Manage your course details and visibility</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover:bg-gray-100/80 rounded-full w-10 h-10 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>
        
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 font-semibold text-base">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter an engaging course title"
                  required
                  className="bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 h-12 text-lg rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700 font-semibold text-base">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger className="bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 h-12 text-lg rounded-xl">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="focus:bg-blue-50 rounded-lg cursor-pointer py-3">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description" className="text-gray-700 font-semibold text-base">Short Description</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Brief summary of your course (appears in course cards)"
                  className="bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 min-h-[100px] text-base rounded-xl resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-semibold text-base">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of your course content, goals, and prerequisites"
                  className="bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 min-h-[160px] text-base rounded-xl resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-gray-700 font-semibold text-base">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger className="bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 h-12 text-lg rounded-xl">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                      <SelectItem value="beginner" className="focus:bg-blue-50 rounded-lg cursor-pointer py-3">Beginner</SelectItem>
                      <SelectItem value="intermediate" className="focus:bg-blue-50 rounded-lg cursor-pointer py-3">Intermediate</SelectItem>
                      <SelectItem value="advanced" className="focus:bg-blue-50 rounded-lg cursor-pointer py-3">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-700 font-semibold text-base">Price ($)</Label>
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
                      className="bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 h-12 text-lg rounded-xl pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 md:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-semibold py-4 md:py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
