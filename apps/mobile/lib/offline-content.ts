import * as FileSystem from 'expo-file-system/legacy';
import { useConfigStore } from '@/stores/config-store';
import { Platform } from 'react-native';

const VIDEO_DIR = (FileSystem.documentDirectory || '') + 'videos/';

export async function ensureVideoDir() {
  if (Platform.OS === 'web') return;
  const dirInfo = await FileSystem.getInfoAsync(VIDEO_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VIDEO_DIR, { intermediates: true });
  }
}

export async function saveVideoForOffline(
    fileId: string, 
    token: string, 
    onProgress?: (progress: number) => void
): Promise<string> {
    if (Platform.OS === 'web') {
        console.warn('Offline video download not supported on web');
        return '';
    }
    await ensureVideoDir();
    
    const instanceUrl = useConfigStore.getState().instanceUrl;
    // Remove trailing slash if exists
    const baseUrl = instanceUrl?.replace(/\/$/, '') || '';
    const url = `${baseUrl}/api/v1/files/${fileId}/stream?token=${token}`;
    const fileUri = VIDEO_DIR + `${fileId}.mp4`; // Assuming mp4 for now

    const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            if (onProgress) {
                onProgress(progress * 100);
            }
        }
    );

    try {
        const result = await downloadResumable.downloadAsync();
        if (result && result.uri) {
            return result.uri;
        }
        throw new Error('Download failed');
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function getOfflineVideoUrl(fileId: string): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    const fileUri = VIDEO_DIR + `${fileId}.mp4`;
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
        return fileUri;
    }
    return null;
}

export async function isVideoOffline(fileId: string): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const fileUri = VIDEO_DIR + `${fileId}.mp4`;
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
}

export async function removeOfflineVideo(fileId: string): Promise<void> {
    if (Platform.OS === 'web') return;
    const fileUri = VIDEO_DIR + `${fileId}.mp4`;
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
        await FileSystem.deleteAsync(fileUri);
    }
}
