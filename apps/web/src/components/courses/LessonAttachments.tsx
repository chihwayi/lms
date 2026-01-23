'use client';

import { useState, useEffect } from 'react';
import { File, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileUpload } from './FileUpload';
import { apiClient } from '@/lib/api-client';

interface LessonAttachmentsProps {
  courseId: string;
  lessonId: string;
}

export function LessonAttachments({ courseId, lessonId }: LessonAttachmentsProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchLessonFiles();
  }, [lessonId, refreshTrigger]);

  const fetchLessonFiles = async () => {
    try {
      // We can use getLessonContent to get files
      const res = await apiClient(`/api/v1/courses/lessons/${lessonId}/content`);
      if (res.ok) {
        const data = await res.json();
        // Filter out the main content file if it's also in the files list?
        // Usually main content is referenced by URL, but it might be in the files list too.
        // But for now, let's show all files attached to the lesson.
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to fetch lesson files', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const res = await apiClient(`/api/v1/files/${fileId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('File deleted');
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      toast.error('Error deleting file');
    }
  };

  return (
    <div className="space-y-4 mt-6 p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <h4 className="font-semibold flex items-center gap-2">
            <File className="w-4 h-4" />
            Lesson Attachments
        </h4>
        
        <div className="space-y-2">
            {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3">
                        <File className="w-8 h-8 text-blue-100 fill-blue-500" />
                        <div>
                            <p className="text-sm font-medium truncate max-w-[200px]">{file.original_name}</p>
                            <p className="text-xs text-gray-500">{(file.file_size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(file.id)} className="hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ))}
            {files.length === 0 && (
                <p className="text-sm text-gray-400 italic">No attachments yet</p>
            )}
        </div>

        <div className="pt-2">
            <FileUpload 
                courseId={courseId} 
                lessonId={lessonId} 
                onUploadComplete={() => setRefreshTrigger(prev => prev + 1)}
            />
        </div>
    </div>
  );
}
