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

export async function saveFileForOffline(
    fileId: string, 
    token: string, 
    onProgress?: (progress: number) => void,
    extension: string = 'mp4'
): Promise<string> {
    if (Platform.OS === 'web') {
        console.warn('Offline download not supported on web');
        return '';
    }
    await ensureVideoDir();
    
    const instanceUrl = useConfigStore.getState().instanceUrl;
    // Remove trailing slash if exists
    const baseUrl = instanceUrl?.replace(/\/$/, '') || '';
    const url = `${baseUrl}/api/v1/files/${fileId}/stream?token=${token}`;
    const fileUri = VIDEO_DIR + `${fileId}.${extension}`;

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

export async function saveVideoForOffline(
    fileId: string, 
    token: string, 
    onProgress?: (progress: number) => void
): Promise<string> {
    return saveFileForOffline(fileId, token, onProgress, 'mp4');
}

export async function getOfflineFileUrl(fileId: string, extension: string = 'mp4'): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    const fileUri = VIDEO_DIR + `${fileId}.${extension}`;
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
        return fileUri;
    }
    return null;
}

export async function getOfflineVideoUrl(fileId: string): Promise<string | null> {
    return getOfflineFileUrl(fileId, 'mp4');
}

export async function isFileOffline(fileId: string, extension: string = 'mp4'): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const fileUri = VIDEO_DIR + `${fileId}.${extension}`;
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
}

export async function isVideoOffline(fileId: string): Promise<boolean> {
    return isFileOffline(fileId, 'mp4');
}

export async function removeOfflineFile(fileId: string, extension: string = 'mp4'): Promise<void> {
    if (Platform.OS === 'web') return;
    const fileUri = VIDEO_DIR + `${fileId}.${extension}`;
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
        await FileSystem.deleteAsync(fileUri);
    }
}

export async function removeOfflineVideo(fileId: string): Promise<void> {
    return removeOfflineFile(fileId, 'mp4');
}
