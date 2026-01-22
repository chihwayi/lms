'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, FileText, Image as ImageIcon, Music, X, Upload, Play, Search } from 'lucide-react';
import { toast } from 'sonner';

interface ContentAssignmentProps {
  lessonId: string;
  courseId: string;
  currentContent?: any;
  onContentAssigned?: (content: any) => void;
  onPreview?: (content: any) => void;
  filesRefreshTrigger?: number;
}

export function ContentAssignment({ 
  lessonId, 
  courseId, 
  currentContent, 
  onContentAssigned,
  onPreview,
  filesRefreshTrigger = 0
}: ContentAssignmentProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFileId, setSelectedFileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourseFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !courseId) return;
        
        const response = await fetch(`/api/v1/files/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
  
        if (response.ok) {
          const courseFiles = await response.json();
          setFiles(courseFiles || []);
          // Don't auto-select any file - start with empty selection
        } else {
          console.error('Failed to fetch files:', response.status);
          setFiles([]);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
        setFiles([]);
      }
    };

    fetchCourseFiles();
  }, [courseId, filesRefreshTrigger]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    return files.filter(file => 
      file.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  useEffect(() => {
    // Auto-select first file if only one exists and no file is currently selected
    // Only apply this when NOT searching, to avoid jumping selection
    if (!searchQuery && files.length === 1 && !selectedFileId) {
      setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId, searchQuery]);

  const assignContent = async () => {
    if (!selectedFileId) {
      console.log('No file selected, selectedFileId:', selectedFileId);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/lessons/${lessonId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId: selectedFileId }),
      });

      if (response.ok) {
        const updatedLesson = await response.json();
        onContentAssigned?.(updatedLesson);
        setShowAssignment(false);
        setSelectedFileId('');
        toast.success('Content assigned successfully!');
      } else {
        toast.error('Failed to assign content');
      }
    } catch (error) {
      toast.error('Failed to assign content');
    } finally {
      setLoading(false);
    }
  };

  const removeContent = async () => {
    if (!currentContent?.content_data?.fileId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/lessons/${lessonId}/content/${currentContent.content_data.fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        onContentAssigned?.(null);
        toast.success('Content removed successfully!');
      } else {
        toast.error('Failed to remove content');
      }
    } catch (error) {
      toast.error('Failed to remove content');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'document': return <FileText className="w-5 h-5 text-green-500" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-purple-500" />;
      case 'audio': return <Music className="w-5 h-5 text-orange-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Current Content Display */}
      {currentContent?.content_data ? (
        <Card className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm border-green-200/40 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  {getFileIcon(currentContent.content_data.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-bold text-gray-900 truncate">📎 Content Assigned</h4>
                  <p className="text-green-700 font-medium truncate">{currentContent.content_data.fileName}</p>
                  <p className="text-sm text-gray-600">{currentContent.content_data.fileType}</p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPreview?.(currentContent)}
                  className="flex-1 sm:flex-none bg-blue-100/70 hover:bg-blue-200/90 backdrop-blur-sm border-blue-300/40 text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeContent}
                  className="bg-red-100/70 hover:bg-red-200/90 backdrop-blur-sm border-red-300/40 text-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm border-gray-200/40 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">No Content Assigned</h4>
                  <p className="text-gray-600">Assign a file to this lesson</p>
                </div>
              </div>
              <Button
                onClick={() => setShowAssignment(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Upload className="w-4 h-4 mr-2" />
                Assign Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Assignment Modal */}
      {showAssignment && (
        <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="p-4 md:p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-2xl">📎</span>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-700 bg-clip-text text-transparent">Assign Content</h3>
                <p className="text-gray-600 text-sm md:text-base">Choose a file to assign to this lesson</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">Select File</label>
                
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search files..." 
                    value={searchQuery}
                    onChange={(e: any) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/50"
                  />
                </div>

                <Select value={selectedFileId} onValueChange={(value) => {
                  console.log('Select changed to:', value);
                  setSelectedFileId(value);
                }}>
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg text-lg py-4 px-6 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50">
                    <SelectValue placeholder={files.length === 0 ? "No files available" : "Choose a file from your course files..."} />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl rounded-xl max-h-60">
                    {files.length > 0 && (
                      <SelectItem value="" disabled>
                        Choose a file from your course files...
                      </SelectItem>
                    )}
                    {filteredFiles.length === 0 ? (
                      <SelectItem value="no-files" disabled>
                        {files.length === 0 ? "No files uploaded yet" : "No files match your search"}
                      </SelectItem>
                    ) : (
                      filteredFiles.map((file: any) => (
                        <SelectItem key={file.id} value={file.id} className="text-lg py-4">
                          {file.original_name} ({file.file_type} • {formatFileSize(file.file_size)})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {files.length > 0 && (
                   <p className="text-sm text-gray-500 mt-2 text-right">
                     Showing {filteredFiles.length} of {files.length} files
                   </p>
                )}
              </div>

              {files.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">📁</span>
                  </div>
                  <p className="text-gray-600 font-medium">No files uploaded yet</p>
                  <p className="text-sm text-gray-500">Upload files in the Course Files section below</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={assignContent}
                  disabled={!selectedFileId || loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Assigning...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>📎 Assign Content</span>
                    </div>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAssignment(false)}
                  className="w-full sm:w-auto bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 text-gray-700 text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}