'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, GripVertical, Video, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from './FileUpload';
import { ContentAssignment } from './ContentAssignment';
import { PublishingStatus } from './PublishingStatus';

interface CourseBuilderProps {
  course: any;
  onCourseUpdate: (course: any) => void;
}

export function CourseBuilder({ course, onCourseUpdate }: CourseBuilderProps) {
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content_type: 'video',
    duration_minutes: 0,
    is_preview: false
  });

  const createModule = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/${course.id}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...moduleForm,
          order_index: (course.modules?.length || 0) + 1
        }),
      });

      if (response.ok) {
        const newModule = await response.json();
        const updatedCourse = {
          ...course,
          modules: [...(course.modules || []), newModule]
        };
        onCourseUpdate(updatedCourse);
        setModuleForm({ title: '', description: '' });
        setShowModuleForm(false);
        toast.success('Module created successfully!');
      } else {
        toast.error('Failed to create module');
      }
    } catch (error) {
      toast.error('Failed to create module');
    }
  };

  const updateModule = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/${course.id}/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleForm),
      });

      if (response.ok) {
        const updatedModule = await response.json();
        const updatedModules = course.modules.map(m => 
          m.id === editingModule.id ? updatedModule : m
        );
        onCourseUpdate({ ...course, modules: updatedModules });
        setModuleForm({ title: '', description: '' });
        setEditingModule(null);
        toast.success('Module updated successfully!');
      } else {
        toast.error('Failed to update module');
      }
    } catch (error) {
      toast.error('Failed to update module');
    }
  };

  const deleteModule = async (moduleId) => {
    if (!confirm('Are you sure you want to delete this module? This will also delete all lessons in it.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/${course.id}/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const updatedModules = course.modules.filter(m => m.id !== moduleId);
        onCourseUpdate({ ...course, modules: updatedModules });
        toast.success('Module deleted successfully!');
      } else {
        toast.error('Failed to delete module');
      }
    } catch (error) {
      toast.error('Failed to delete module');
    }
  };

  const editModule = (module) => {
    setEditingModule(module);
    setModuleForm({ title: module.title, description: module.description });
    setShowModuleForm(true);
  };

  const cancelModuleEdit = () => {
    setEditingModule(null);
    setModuleForm({ title: '', description: '' });
    setShowModuleForm(false);
  };

  const createLesson = async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const module = course.modules.find(m => m.id === moduleId);
      const response = await fetch(`/api/v1/courses/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...lessonForm,
          order_index: (module.lessons?.length || 0) + 1
        }),
      });

      if (response.ok) {
        const newLesson = await response.json();
        const updatedModules = course.modules.map(m => 
          m.id === moduleId 
            ? { ...m, lessons: [...(m.lessons || []), newLesson] }
            : m
        );
        onCourseUpdate({ ...course, modules: updatedModules });
        setLessonForm({
          title: '',
          description: '',
          content_type: 'video',
          duration_minutes: 0,
          is_preview: false
        });
        setShowLessonForm(null);
        toast.success('Lesson created successfully!');
      } else {
        toast.error('Failed to create lesson');
      }
    } catch (error) {
      toast.error('Failed to create lesson');
    }
  };

  const updateLesson = async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/modules/${moduleId}/lessons/${editingLesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lessonForm),
      });

      if (response.ok) {
        const updatedLesson = await response.json();
        const updatedModules = course.modules.map(m => 
          m.id === moduleId 
            ? { ...m, lessons: m.lessons.map(l => l.id === editingLesson.id ? updatedLesson : l) }
            : m
        );
        onCourseUpdate({ ...course, modules: updatedModules });
        setLessonForm({
          title: '',
          description: '',
          content_type: 'video',
          duration_minutes: 0,
          is_preview: false
        });
        setEditingLesson(null);
        setShowLessonForm(null);
        toast.success('Lesson updated successfully!');
      } else {
        toast.error('Failed to update lesson');
      }
    } catch (error) {
      toast.error('Failed to update lesson');
    }
  };

  const deleteLesson = async (moduleId, lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/modules/${moduleId}/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const updatedModules = course.modules.map(m => 
          m.id === moduleId 
            ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
            : m
        );
        onCourseUpdate({ ...course, modules: updatedModules });
        toast.success('Lesson deleted successfully!');
      } else {
        toast.error('Failed to delete lesson');
      }
    } catch (error) {
      toast.error('Failed to delete lesson');
    }
  };

  const editLesson = (lesson, moduleId) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      content_type: lesson.content_type,
      duration_minutes: lesson.duration_minutes,
      is_preview: lesson.is_preview
    });
    setShowLessonForm(moduleId);
  };

  const cancelLessonEdit = () => {
    setEditingLesson(null);
    setLessonForm({
      title: '',
      description: '',
      content_type: 'video',
      duration_minutes: 0,
      is_preview: false
    });
    setShowLessonForm(null);
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Publishing Status */}
      <PublishingStatus 
        courseId={course?.id} 
        currentStatus={course?.status}
        onStatusUpdate={(status) => {
          onCourseUpdate({ ...course, status });
        }}
      />

      {/* Course Structure */}
      <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-3xl">📚</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">Course Structure</h2>
                <p className="text-xl text-gray-600 mt-2 font-medium">Build your course with modules and lessons</p>
              </div>
            </div>
            <Button
              onClick={() => setShowModuleForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add Module
            </Button>
          </div>

          {/* Add Module Form */}
          {showModuleForm && (
            <Card className="mb-8 bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl">{editingModule ? '✏️' : '✨'}</span>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent">
                    {editingModule ? 'Edit Module' : 'Create New Module'}
                  </h3>
                </div>
                <div className="space-y-6">
                  <Input
                    placeholder="Enter an engaging module title..."
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg text-lg py-4 px-6 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                  <Textarea
                    placeholder="Describe what students will learn in this module..."
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg text-lg py-4 px-6 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 min-h-[120px]"
                  />
                  <div className="flex gap-6 pt-4">
                    <Button 
                      onClick={editingModule ? updateModule : createModule} 
                      disabled={!moduleForm.title}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                    >
                      {editingModule ? '✏️ Update Module' : '✨ Create Module'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={cancelModuleEdit}
                      className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 text-gray-700 text-lg font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modules List */}
          {course?.modules && course.modules.length > 0 ? (
            <div className="space-y-6">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {moduleIndex + 1}. {module.title}
                        </h3>
                        <p className="text-gray-600">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowLessonForm(module.id)}
                        className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Lesson
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => editModule(module)}
                        className="bg-blue-100/70 hover:bg-blue-200/90 backdrop-blur-sm border-blue-300/40 text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteModule(module.id)}
                        className="bg-red-100/70 hover:bg-red-200/90 backdrop-blur-sm border-red-300/40 text-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Add Lesson Form */}
                  {showLessonForm === module.id && (
                    <Card className="mb-4 bg-white/50 backdrop-blur-sm border-white/30">
                      <CardContent className="p-4">
                        <h4 className="text-lg font-bold mb-4">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Lesson title"
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                            className="bg-white/70"
                          />
                          <Select
                            value={lessonForm.content_type}
                            onValueChange={(value) => setLessonForm({ ...lessonForm, content_type: value })}
                          >
                            <SelectTrigger className="bg-white/70">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">📹 Video</SelectItem>
                              <SelectItem value="document">📄 Document</SelectItem>
                              <SelectItem value="text">📝 Text</SelectItem>
                              <SelectItem value="quiz">❓ Quiz</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="Duration (minutes)"
                            value={lessonForm.duration_minutes}
                            onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })}
                            className="bg-white/70"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="is_preview"
                              checked={lessonForm.is_preview}
                              onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                            />
                            <label htmlFor="is_preview" className="text-sm font-medium">Free Preview</label>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Lesson description"
                          value={lessonForm.description}
                          onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                          className="bg-white/70 mt-4"
                        />
                        <div className="flex gap-4 mt-4">
                          <Button 
                            onClick={() => editingLesson ? updateLesson(module.id) : createLesson(module.id)} 
                            disabled={!lessonForm.title}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            {editingLesson ? '✏️ Update Lesson' : '✨ Create Lesson'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={cancelLessonEdit}
                            className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 text-gray-700 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lessons List */}
                  {module.lessons && module.lessons.length > 0 && (
                    <div className="space-y-3">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="space-y-4">
                          <div className="flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                            <GripVertical className="w-4 h-4 text-gray-400 mr-3" />
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg mr-4">
                              {getContentTypeIcon(lesson.content_type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-gray-900">
                                  {lessonIndex + 1}. {lesson.title}
                                </h4>
                                {lesson.is_preview && (
                                  <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                                    FREE
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm">
                                {lesson.content_type} • {lesson.duration_minutes} min
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-green-100/70 hover:bg-green-200/90 backdrop-blur-sm border-green-300/40 text-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editLesson(lesson, module.id)}
                                className="bg-blue-100/70 hover:bg-blue-200/90 backdrop-blur-sm border-blue-300/40 text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => deleteLesson(module.id, lesson.id)}
                                className="bg-red-100/70 hover:bg-red-200/90 backdrop-blur-sm border-red-300/40 text-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <ContentAssignment 
                            lessonId={lesson.id}
                            courseId={course.id}
                            currentContent={lesson}
                            onContentAssigned={(updatedLesson) => {
                              if (updatedLesson) {
                                const updatedModules = course.modules.map(m => 
                                  m.id === module.id 
                                    ? { ...m, lessons: m.lessons.map(l => l.id === lesson.id ? updatedLesson : l) }
                                    : m
                                );
                                onCourseUpdate({ ...course, modules: updatedModules });
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100/60 to-purple-100/60 backdrop-blur-xl rounded-full mx-auto mb-8 flex items-center justify-center border border-white/40 shadow-2xl">
                <span className="text-8xl">📚</span>
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">No modules yet</h3>
              <p className="text-2xl text-gray-600 mb-10 font-medium leading-relaxed">Start building your course by adding your first module</p>
              <Button
                onClick={() => setShowModuleForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-2xl font-bold px-12 py-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-8 h-8 mr-4" />
                Create Your First Module
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* File Upload Section */}
      <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10 p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-3xl">📁</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-2">Course Files</h2>
                <p className="text-xl text-gray-600 font-medium">Upload videos, documents, and other course materials</p>
              </div>
            </div>
          </div>
          <FileUpload courseId={course?.id} />
        </div>
      </div>
    </div>
  );
}