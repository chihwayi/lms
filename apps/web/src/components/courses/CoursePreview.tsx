'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Play, Clock, Users, Star, BookOpen, Eye } from 'lucide-react';

interface CoursePreviewProps {
  courseId: string;
  onEnroll?: () => void;
}

export function CoursePreview({ courseId, onEnroll }: CoursePreviewProps) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => {
    fetchCoursePreview();
  }, [courseId]);

  const fetchCoursePreview = async () => {
    try {
      const response = await apiClient(`/api/v1/courses/${courseId}/preview`);
      
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      }
    } catch (error) {
      console.error('Error fetching course preview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!course) {
    return (
      <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Course preview not available</p>
        </CardContent>
      </Card>
    );
  }

  const processContent = (content: string) => {
    if (!content) return '';
    // Replace $...$ with <span data-type="mathematics" data-content="..."></span>
    // This ensures Tiptap parses them as math nodes
    return content.replace(/\$([^$]+)\$/g, (match, equation) => {
      return `<span data-type="mathematics" data-content="${equation.replace(/"/g, '&quot;')}"></span>`;
    });
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-xl border-white/40 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                {course.is_featured && (
                  <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ⭐ FEATURED
                  </div>
                )}
                <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                  course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                  course.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {course.level}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-4">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                {course.short_description || course.description}
              </p>
              
              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{Math.floor((course.stats?.totalDuration || 0) / 60)}h {(course.stats?.totalDuration || 0) % 60}m</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.stats?.totalLessons || 0} lessons</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 mb-4">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </div>
              <Button
                onClick={onEnroll}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Enroll Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {course.stats?.totalModules || 0}
            </div>
            <div className="text-gray-600 font-medium">Modules</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {course.stats?.totalLessons || 0}
            </div>
            <div className="text-gray-600 font-medium">Lessons</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.floor((course.stats?.totalDuration || 0) / 60)}h
            </div>
            <div className="text-gray-600 font-medium">Duration</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {course.stats?.previewLessons || 0}
            </div>
            <div className="text-gray-600 font-medium">Free Previews</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Modules */}
      <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
          
          <div className="space-y-4">
            {course.modules?.map((module: any, index: number) => (
              <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {index + 1}. {module.title}
                </h3>
                <p className="text-gray-600 mb-4">{module.description}</p>
                
                <div className="space-y-2">
                  {module.lessons?.map((lesson: any, lessonIndex: number) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Play className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {lessonIndex + 1}. {lesson.title}
                        </span>
                        {lesson.is_preview && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-green-100 text-green-800 hover:bg-green-200"
                            onClick={() => setSelectedLesson(lesson)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.duration_minutes || 0} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLesson} onOpenChange={(open) => !open && setSelectedLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedLesson?.title}</DialogTitle>
            <div className="text-sm text-gray-500">
               {selectedLesson?.is_preview ? 'Free Preview' : 'Course Content'}
            </div>
          </DialogHeader>
          
          <div className="mt-4">
            {(selectedLesson?.content_data?.content || selectedLesson?.content_data?.text) ? (
              <RichTextEditor 
                content={processContent(selectedLesson.content_data.content || selectedLesson.content_data.text)} 
                readOnly={true} 
              />
            ) : selectedLesson?.description ? (
              <p className="text-gray-700">{selectedLesson.description}</p>
            ) : (
              <p className="text-gray-500 italic">No content available for preview.</p>
            )}
          </div>
          
          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
               <div className="mt-8 pt-4 border-t text-xs text-gray-400">
                  <p>Debug Info:</p>
                  <p>Lesson ID: {selectedLesson?.id}</p>
                  <p>Has Content: {selectedLesson?.content_data ? 'Yes' : 'No'}</p>
               </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedLesson(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}