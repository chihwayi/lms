'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, GripVertical, Video, FileText, Upload, Eye, CheckCircle, Settings, Users, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from './FileUpload';
import { ContentAssignment } from './ContentAssignment';
import { ContentPreview } from './ContentPreview';
import { PublishingStatus } from './PublishingStatus';
import { ChunkedUpload } from './ChunkedUpload';
import { QuizBuilder } from './QuizBuilder';
import { CourseSettings } from './CourseSettings';
import { QuizData } from './QuizRunner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { LessonAttachments } from './LessonAttachments';
import { CourseEnrollments } from './CourseEnrollments';
import { apiClient } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Lesson {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'document' | 'text' | 'quiz';
  duration_minutes: number;
  is_preview: boolean;
  content_url?: string | null;
  content_data?: any;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface PreviewContent {
  id: string;
  fileName: string;
  fileType: string;
  title: string;
  data?: any;
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  status: string;
}

interface CourseBuilderProps {
  course: Course;
  onCourseUpdate: (course: Course) => void;
}

export function CourseBuilder({ course, onCourseUpdate }: CourseBuilderProps) {
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [previewContentData, setPreviewContentData] = useState<PreviewContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEnrollments, setShowEnrollments] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState<{
    title: string;
    description: string;
    content_type: 'video' | 'document' | 'text' | 'quiz';
    duration_minutes: number;
    is_preview: boolean;
    content_data?: any;
  }>({
    title: '',
    description: '',
    content_type: 'video',
    duration_minutes: 0,
    is_preview: false,
    content_data: null
  });
  const [filesRefreshTrigger, setFilesRefreshTrigger] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'module' | 'lesson';
    id: string;
    moduleId?: string;
  } | null>(null);

  const createModule = async () => {
    try {
      const response = await apiClient(`/courses/${course.id}/modules`, {
        method: 'POST',
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
    if (!editingModule) return;
    try {
      const response = await apiClient(`/courses/${course.id}/modules/${editingModule.id}`, {
        method: 'PUT',
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

  const deleteModule = (moduleId: string) => {
    setDeleteConfirmation({ type: 'module', id: moduleId });
  };

  const editModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm({ title: module.title, description: module.description });
    setShowModuleForm(true);
  };

  const cancelModuleEdit = () => {
    setEditingModule(null);
    setModuleForm({ title: '', description: '' });
    setShowModuleForm(false);
  };

  const startAddLesson = (moduleId: string, type: 'video' | 'document' | 'text' | 'quiz' = 'video') => {
    setLessonForm({
      title: '',
      description: '',
      content_type: type,
      duration_minutes: 0,
      is_preview: false,
      content_data: null
    });
    setEditingLesson(null);
    setShowLessonForm(moduleId);
  };

  const createLesson = async (moduleId: string) => {
    try {
      const targetModule = course.modules.find(m => m.id === moduleId);
      if (!targetModule) return;

      const response = await apiClient(`/api/v1/courses/modules/${moduleId}/lessons`, {
        method: 'POST',
        body: JSON.stringify({
          ...lessonForm,
          order_index: (targetModule.lessons?.length || 0) + 1
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
          is_preview: false,
          content_data: null
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

  const updateLesson = async (moduleId: string) => {
    if (!editingLesson) return;
    try {
      const response = await apiClient(`/api/v1/courses/modules/${moduleId}/lessons/${editingLesson.id}`, {
        method: 'PUT',
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
          is_preview: false,
          content_data: null
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

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setDeleteConfirmation({ type: 'lesson', id: lessonId, moduleId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'module') {
      const moduleId = deleteConfirmation.id;
      try {
        const response = await apiClient(`/api/v1/courses/${course.id}/modules/${moduleId}`, {
          method: 'DELETE',
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
    } else if (deleteConfirmation.type === 'lesson') {
      const { id: lessonId, moduleId } = deleteConfirmation;
      if (!moduleId) return;
       try {
        const response = await apiClient(`/api/v1/courses/modules/${moduleId}/lessons/${lessonId}`, {
          method: 'DELETE',
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
    }
    setDeleteConfirmation(null);
  };

  const editLesson = (lesson: Lesson, moduleId: string) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      content_type: lesson.content_type,
      duration_minutes: lesson.duration_minutes,
      is_preview: lesson.is_preview,
      content_data: lesson.content_data
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
      is_preview: false,
      content_data: null
    });
    setShowLessonForm(null);
  };

  const handleQuizSave = (data: QuizData) => {
    setLessonForm({
      ...lessonForm,
      content_data: data
    });
    setShowQuizBuilder(false);
    toast.success('Quiz configuration saved');
  };

  const previewContent = (lesson: Lesson) => {
    // Handle Quiz Preview
    if (lesson.content_type === 'quiz' && lesson.content_data) {
      setPreviewContentData({
        id: lesson.id,
        fileName: lesson.title,
        fileType: 'quiz',
        title: lesson.title,
        data: lesson.content_data
      });
      setShowPreview(true);
      return;
    }

    // Handle Text/HTML Preview
    if (lesson.content_type === 'text' && lesson.content_data) {
      setPreviewContentData({
        id: lesson.id,
        fileName: lesson.title,
        fileType: 'text',
        title: lesson.title,
        data: lesson.content_data
      });
      setShowPreview(true);
      return;
    }

    // Handle File Content (Video/Document)
    if (lesson.content_url) {
      setPreviewContentData({
        id: lesson.content_data?.fileId || lesson.id,
        fileName: lesson.content_data?.fileName || lesson.title,
        fileType: lesson.content_data?.fileType || (lesson.content_type === 'video' ? 'video/mp4' : 'application/pdf'),
        title: lesson.title
      });
      setShowPreview(true);
    } else {
      toast.error('No content available for preview');
    }
  };

  const getContentTypeIcon = (type: string) => {
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
        lastUpdated={lastUpdated}
      />

      {/* Course Structure */}
      <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10 p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 md:gap-0">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                <span className="text-white text-xl md:text-3xl">📚</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">Course Structure</h2>
                <p className="text-base md:text-xl text-gray-600 mt-1 md:mt-2 font-medium">Build your course with modules and lessons</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Button
                onClick={() => setShowEnrollments(true)}
                variant="outline"
                className="w-full sm:w-auto bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 text-gray-700 text-lg md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Users className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                Students
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="w-full sm:w-auto bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 text-gray-700 text-lg md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Settings className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                Settings
              </Button>
              <Button
                onClick={() => setShowModuleForm(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                Add Module
              </Button>
            </div>
          </div>

          {/* Add Module Form */}
          {showModuleForm && (
            <Card className="mb-8 bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-4 md:p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-white text-2xl">{editingModule ? '✏️' : '✨'}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent">
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
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4">
                    <Button 
                      onClick={editingModule ? updateModule : createModule} 
                      disabled={!moduleForm.title}
                      className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                    >
                      {editingModule ? '✏️ Update Module' : '✨ Create Module'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={cancelModuleEdit}
                      className="w-full sm:w-auto bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 text-gray-700 text-lg font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                <div key={module.id} className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/30 shadow-xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                      <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 break-words">
                          {moduleIndex + 1}. {module.title}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 break-words">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startAddLesson(module.id, 'quiz')}
                        className="flex-1 sm:flex-none bg-purple-100/70 hover:bg-purple-200/90 backdrop-blur-sm border-purple-300/40 text-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <HelpCircle className="w-4 h-4 mr-1" />
                        Add Quiz
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startAddLesson(module.id)}
                        className="flex-1 sm:flex-none bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                            onValueChange={(value) => setLessonForm({ ...lessonForm, content_type: value as 'video' | 'document' | 'text' | 'quiz' })}
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
                        {lessonForm.content_type === 'text' && (
                          <div className="mt-4">
                            <label className="text-sm font-medium mb-2 block">Lesson Content</label>
                            <RichTextEditor
                              content={lessonForm.content_data?.html || ''}
                              onChange={(html) => setLessonForm({ 
                                ...lessonForm, 
                                content_data: { ...lessonForm.content_data, html }
                              })}
                              className="bg-white/70"
                            />
                          </div>
                        )}
                        {lessonForm.content_type === 'quiz' && (
                          <div className="mt-6 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-semibold text-purple-900">Quiz Configuration</label>
                              {lessonForm.content_data && (
                                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {lessonForm.content_data.questions?.length} Questions Configured
                                </span>
                              )}
                            </div>
                            <Button
                              type="button"
                              onClick={() => setShowQuizBuilder(true)}
                              variant="outline"
                              className="w-full h-auto py-4 bg-white hover:bg-purple-50 border-2 border-dashed border-purple-200 hover:border-purple-300 text-purple-600 hover:text-purple-700 transition-all duration-300 group"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                  {lessonForm.content_data ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </div>
                                <span className="font-bold text-base mt-1">
                                  {lessonForm.content_data ? 'Edit Quiz Content' : 'Configure Quiz Questions'}
                                </span>
                                <span className="text-xs text-purple-400 font-normal">
                                  {lessonForm.content_data ? 'Modify questions, scoring, and settings' : 'Set up questions, options, and passing score'}
                                </span>
                              </div>
                            </Button>
                          </div>
                        )}
                        
                        {editingLesson && (
                          <LessonAttachments 
                            courseId={course.id}
                            lessonId={editingLesson.id}
                          />
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                          <Button 
                            onClick={() => editingLesson ? updateLesson(module.id) : createLesson(module.id)} 
                            disabled={!lessonForm.title}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            {editingLesson ? '✏️ Update Lesson' : '✨ Create Lesson'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={cancelLessonEdit}
                            className="w-full sm:w-auto bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 text-gray-700 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                          <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 gap-4">
                            <div className="flex items-center w-full sm:w-auto">
                              <GripVertical className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg mr-4 flex-shrink-0">
                                {getContentTypeIcon(lesson.content_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <h4 className="font-bold text-gray-900 truncate">
                                    {lessonIndex + 1}. {lesson.title}
                                  </h4>
                                  {lesson.is_preview && (
                                    <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full flex-shrink-0">
                                      FREE
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm">
                                  {lesson.content_type} • {lesson.duration_minutes} min
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto justify-end sm:ml-auto">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => previewContent(lesson)}
                                className="bg-green-100/70 hover:bg-green-200/90 backdrop-blur-sm border-green-300/40 text-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              >
                                <Eye className="w-4 h-4" />
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
                            onPreview={previewContent}
                            filesRefreshTrigger={filesRefreshTrigger}
                            onContentAssigned={(updatedLesson: Lesson | null) => {
                              const updatedModules = course.modules.map(m => 
                                m.id === module.id 
                                  ? { ...m, lessons: m.lessons.map(l => {
                                      if (l.id !== lesson.id) return l;
                                      if (updatedLesson) return updatedLesson;
                                      // Handle removal (null case)
                                      return { ...l, content_data: null, content_url: null, content_type: 'text' as const }; // Reset content type to a valid value
                                    }) }
                                  : m
                              );
                              onCourseUpdate({ ...course, modules: updatedModules });
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
            <div className="text-center py-10 md:py-20 px-4">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-100/60 to-purple-100/60 backdrop-blur-xl rounded-full mx-auto mb-6 md:mb-8 flex items-center justify-center border border-white/40 shadow-2xl">
                <span className="text-6xl md:text-8xl">📚</span>
              </div>
              <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 md:mb-6">No modules yet</h3>
              <p className="text-lg md:text-2xl text-gray-600 mb-8 md:mb-10 font-medium leading-relaxed max-w-2xl mx-auto">Start building your course by adding your first module</p>
              <Button
                onClick={() => setShowModuleForm(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl font-bold px-8 md:px-12 py-4 md:py-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4" />
                Create Your First Module
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* File Upload Section */}
      <div className="relative overflow-hidden bg-white/30 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10 p-4 md:p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                <span className="text-white text-xl md:text-3xl">📁</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-1 md:mb-2">Course Files</h2>
                <p className="text-base md:text-xl text-gray-600 font-medium">Upload videos, documents, and other course materials</p>
              </div>
            </div>
          </div>
          <FileUpload 
            courseId={course?.id} 
            onUploadComplete={() => setFilesRefreshTrigger(prev => prev + 1)}
          />
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Large File Upload</h3>
            <ChunkedUpload 
              courseId={course?.id} 
              onUploadComplete={() => setFilesRefreshTrigger(prev => prev + 1)}
            />
          </div>
        </div>
      </div>

      {/* Content Preview Modal */}
      <ContentPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        content={previewContentData}
      />

      {/* Course Settings Modal */}
      <CourseSettings
        course={course}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onUpdate={(updatedCourse) => {
          onCourseUpdate(updatedCourse);
          setLastUpdated(Date.now());
        }}
      />

      {/* Course Enrollments Modal */}
      <CourseEnrollments
        courseId={course?.id}
        isOpen={showEnrollments}
        onClose={() => setShowEnrollments(false)}
      />

      {/* Quiz Builder Overlay */}
      {showQuizBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8">
            <QuizBuilder
              initialData={lessonForm.content_data}
              onSave={handleQuizSave}
              onCancel={() => setShowQuizBuilder(false)}
            />
          </div>
        </div>
      )}

      <Dialog open={!!deleteConfirmation} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteConfirmation?.type === 'module' ? 'Delete Module' : 'Delete Lesson'}
            </DialogTitle>
            <DialogDescription>
              {deleteConfirmation?.type === 'module' 
                ? 'Are you sure you want to delete this module? This will also delete all lessons in it. This action cannot be undone.'
                : 'Are you sure you want to delete this lesson? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
