import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { offlineStorage } from '@/lib/offline-storage';
import { saveVideoForOffline } from '@/lib/offline-content';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';

export function useOfflineCourse() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { accessToken } = useAuthStore();

  const downloadCourse = async (courseId: string) => {
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

            // 3. Download Video if exists
            if (lessonData.content_type === 'video' && lessonData.content_data?.fileId) {
               try {
                  await saveVideoForOffline(lessonData.content_data.fileId, accessToken);
               } catch (err) {
                  console.error(`Failed to download video for lesson ${lesson.id}`, err);
               }
            }
          }

          // 4. Fetch Quiz if exists
          if (lesson.type === 'quiz') {
              // Quiz data usually comes with lesson or separate endpoint
              // If it's separate:
              // const quizResponse = await apiClient(`/quizzes/${lesson.quizId}`);
              // ...
          }

          processedItems++;
          setDownloadProgress((processedItems / totalItems) * 100);
        }
      }

      toast.success('Course downloaded for offline use');
    } catch (error) {
      console.error('Failed to download course', error);
      toast.error('Failed to download course');
    } finally {
      setIsDownloading(false);
    }
  };

  const isCourseDownloaded = async (courseId: string) => {
    return await offlineStorage.isCourseOffline(courseId);
  };

  return {
    downloadCourse,
    isDownloading,
    downloadProgress,
    isCourseDownloaded,
  };
}
