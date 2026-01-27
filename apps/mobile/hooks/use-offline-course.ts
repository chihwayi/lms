import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { offlineStorage } from '@/lib/offline-storage';
import { saveVideoForOffline, saveFileForOffline } from '@/lib/offline-content';
import { useAuthStore } from '@/stores/auth-store';
import { Alert } from 'react-native';

export function useOfflineCourse() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { accessToken } = useAuthStore();

  const downloadCourse = useCallback(async (courseId: string) => {
    if (!accessToken) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // 1. Fetch Course Details
      const courseResponse = await apiClient(`/courses/${courseId}`);
      if (!courseResponse.ok) throw new Error('Failed to fetch course details');
      const course = await courseResponse.json();

      // Save course metadata
      await offlineStorage.saveCourse(course);

      // Calculate total items to download for progress tracking
      let totalItems = 1; // Course itself
      course.modules.forEach((module: any) => {
        totalItems += module.lessons.length;
      });

      let processedItems = 1;
      setDownloadProgress((processedItems / totalItems) * 100);

      // 2. Fetch Lessons and Content
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          // Fetch full lesson details (content, quiz config, etc.)
          const lessonResponse = await apiClient(`/courses/${courseId}/lessons/${lesson.id}`);
          if (lessonResponse.ok) {
            const lessonData = await lessonResponse.json();
            await offlineStorage.saveLesson(lessonData);

            // 3. Download Content Files
            
            // Legacy Video
            if (lessonData.content_type === 'video' && lessonData.content_data?.fileId) {
               try {
                  await saveVideoForOffline(lessonData.content_data.fileId, accessToken);
               } catch (err) {
                  console.error(`Failed to download video for lesson ${lesson.id}`, err);
               }
            }

            // Multi-content blocks
            if (lessonData.content_data?.blocks && Array.isArray(lessonData.content_data.blocks)) {
                for (const block of lessonData.content_data.blocks) {
                    if (block.fileId) {
                        let ext = 'mp4';
                        if (block.type === 'audio') ext = 'mp3';
                        if (block.type === 'document') ext = 'pdf';
                        
                        try {
                            await saveFileForOffline(block.fileId, accessToken, undefined, ext);
                        } catch (err) {
                            console.error(`Failed to download file for block ${block.id}`, err);
                        }
                    }
                }
            }
          }

          processedItems++;
          setDownloadProgress((processedItems / totalItems) * 100);
        }
      }

      // Success handled by caller
    } catch (error) {
      console.error('Failed to download course', error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  }, [accessToken]);

  const isCourseDownloaded = useCallback(async (courseId: string) => {
    const course = await offlineStorage.getCourse(courseId);
    return !!course;
  }, []);

  return {
    downloadCourse,
    isDownloading,
    downloadProgress,
    isCourseDownloaded,
  };
}
