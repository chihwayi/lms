import { useConfigStore } from './config-store';

export const OFFLINE_CACHE_NAME = 'offline-content-v1';

export async function saveVideoForOffline(fileId: string, token: string, onProgress?: (progress: number) => void): Promise<void> {
  if (!('caches' in window)) {
    throw new Error('Offline storage not supported');
  }

  const cache = await caches.open(OFFLINE_CACHE_NAME);
  const instanceUrl = useConfigStore.getState().instanceUrl;
  const baseUrl = instanceUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = `${baseUrl}/api/v1/files/${fileId}/stream?token=${token}`;

  // Fetch with progress tracking is tricky with standard fetch.
  // We'll use XMLHttpRequest for progress or just simple fetch for now.
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');
    
    // We need to store the response in the cache
    await cache.put(url, response);
    
    // Also store metadata in localStorage or IndexedDB to know we have this file
    const offlineFiles = JSON.parse(localStorage.getItem('offline_files') || '{}');
    offlineFiles[fileId] = {
      url,
      downloadedAt: Date.now(),
    };
    localStorage.setItem('offline_files', JSON.stringify(offlineFiles));
    
  } catch (error) {
    console.error('Offline save failed:', error);
    throw error;
  }
}

export async function getOfflineVideoUrl(fileId: string, token: string): Promise<string | null> {
  if (!('caches' in window)) return null;

  const instanceUrl = useConfigStore.getState().instanceUrl;
  const baseUrl = instanceUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = `${baseUrl}/api/v1/files/${fileId}/stream?token=${token}`;
  const cache = await caches.open(OFFLINE_CACHE_NAME);
  const response = await cache.match(url);

  if (response) {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  
  return null;
}

export async function isVideoOffline(fileId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const offlineFiles = JSON.parse(localStorage.getItem('offline_files') || '{}');
  return !!offlineFiles[fileId];
}

export async function removeOfflineVideo(fileId: string, token: string): Promise<void> {
    if (!('caches' in window)) return;
    
    const instanceUrl = useConfigStore.getState().instanceUrl;
    const baseUrl = instanceUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api/v1/files/${fileId}/stream?token=${token}`;
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    await cache.delete(url);
    
    const offlineFiles = JSON.parse(localStorage.getItem('offline_files') || '{}');
    delete offlineFiles[fileId];
    localStorage.setItem('offline_files', JSON.stringify(offlineFiles));
}
