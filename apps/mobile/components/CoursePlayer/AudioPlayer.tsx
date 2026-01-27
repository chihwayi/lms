
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useVideoPlayer } from 'expo-video';
import { useEvent } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth-store';
import { useConfigStore } from '@/stores/config-store';
import { Colors } from '@/constants/theme';

import { getOfflineFileUrl, isFileOffline } from '@/lib/offline-content';

interface Props {
  fileId?: string;
  url?: string; // Direct URL support
  title?: string;
  onComplete?: () => void;
  startAt?: number;
  onProgress?: (currentTime: number, duration: number) => void;
}

export function AudioPlayer({ fileId, url, title, onComplete, startAt = 0, onProgress }: Props) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const { accessToken } = useAuthStore();
  const { instanceUrl } = useConfigStore();

  useEffect(() => {
    const loadSource = async () => {
      if (url) {
        setSourceUrl(url);
        return;
      }
      
      if (!fileId) return;

      // Check offline first
      try {
        const isOffline = await isFileOffline(fileId, 'mp3');
        if (isOffline) {
          const localUri = await getOfflineFileUrl(fileId, 'mp3');
          if (localUri) {
            setSourceUrl(localUri);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to check offline audio:', e);
      }

      if (instanceUrl && accessToken) {
        const baseUrl = instanceUrl.replace(/\/$/, '');
        setSourceUrl(`${baseUrl}/api/v1/files/${fileId}/stream?token=${accessToken}`);
      }
    };

    loadSource();
  }, [fileId, url, accessToken, instanceUrl]);

  const player = useVideoPlayer(sourceUrl, (player) => {
    player.loop = false;
    if (startAt && startAt > 0) {
      try {
        (player as any).seek?.(startAt);
      } catch {
        (player as any).seekTo?.(startAt);
      }
    }
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  
  // Progress tracking via timeUpdate events
  useEffect(() => {
    let lastSentAt = 0;
    const progressSub = player.addListener('timeUpdate', (payload: any) => {
      const now = Date.now();
      if (now - lastSentAt > 10000) {
        const current = payload?.currentTime ?? (player as any)?.currentTime ?? 0;
        const duration = payload?.duration ?? (player as any)?.duration ?? 0;
        onProgress?.(Math.floor(current), Math.floor(duration));
        lastSentAt = now;
      }
    });
    const endSub = player.addListener('playToEnd', () => {
      onComplete?.();
    });
    return () => {
      progressSub.remove();
      endSub.remove();
    };
  }, [player, onComplete, onProgress]);

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      onComplete?.();
    });
    return () => subscription.remove();
  }, [player, onComplete]);

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  if (!sourceUrl) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="musical-notes" size={24} color={Colors.light.primary} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{title || 'Audio Clip'}</Text>
          <Text style={styles.status}>{isPlaying ? 'Playing' : 'Paused'}</Text>
        </View>
        <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    color: '#6B7280',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
