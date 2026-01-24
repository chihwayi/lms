import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { offlineStorage } from '@/lib/offline-storage';
import * as Network from 'expo-network';
import { useToast } from '@/components/ui/Toast';

export function useCourseProgress() {
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const markLessonComplete = useCallback(async (courseId: string, lessonId: string) => {
    try {
      // 1. Save locally first (Optimistic)
      await offlineStorage.saveProgress(lessonId, courseId, 100);
      
      // Update course level progress locally (approximate)
      // We'd need to fetch the course structure to do this accurately, 
      // but for now we'll rely on the backend response or offline calculation if needed.

      // 2. Check connection
      const status = await Network.getNetworkStateAsync();
      const isOnline = !!status.isConnected && !!status.isInternetReachable;

      if (isOnline) {
        // 3. Call API
        const payload = {
            courseId,
            lessonId,
            completed: true
        };
        console.log('Sending progress update:', payload);

        const res = await apiClient('/enrollments/progress', {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          // Mark as synced locally
          await offlineStorage.markProgressSynced(lessonId);
          return { success: true, data };
        } else {
          const errorText = await res.text();
          console.warn('API sync failed, progress stored locally. Status:', res.status, 'Body:', errorText);
          return { success: true, offline: true };
        }
      } else {
        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('Progress update error:', error);
      // Even if it fails, we stored it locally in step 1 if possible
      return { success: false, error };
    }
  }, []);

  const syncOfflineProgress = useCallback(async () => {
    if (syncing) return;
    
    try {
      const status = await Network.getNetworkStateAsync();
      if (!status.isConnected || !status.isInternetReachable) return;

      setSyncing(true);
      const unsynced = await offlineStorage.getUnsyncedProgress();

      if (unsynced.length === 0) {
        setSyncing(false);
        return;
      }

      console.log(`Syncing ${unsynced.length} progress records...`);

      for (const record of unsynced) {
        try {
          const res = await apiClient('/enrollments/progress', {
            method: 'PATCH',
            body: JSON.stringify({
              courseId: record.courseId,
              lessonId: record.lessonId,
              completed: true
            })
          });

          if (res.ok) {
            await offlineStorage.markProgressSynced(record.lessonId);
          } else {
            const errorText = await res.text();
            console.error('Failed to sync record', record, res.status, errorText);
          }
        } catch (e) {
          console.error('Failed to sync record', record, e);
        }
      }
      
      showToast({ 
        type: 'success', 
        title: 'Progress Synced', 
        message: 'Your offline progress has been saved.' 
      });

    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  }, [syncing, showToast]);

  return {
    markLessonComplete,
    syncOfflineProgress,
    isSyncing: syncing
  };
}
