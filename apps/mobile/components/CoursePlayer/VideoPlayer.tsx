import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getOfflineVideoUrl, isVideoOffline } from '@/lib/offline-content';
import { useAuthStore } from '@/stores/auth-store';
import { useConfigStore } from '@/stores/config-store';

interface Props {
  fileId: string;
  onComplete?: () => void;
  autoplay?: boolean;
}

export function VideoPlayer({ fileId, onComplete, autoplay = false }: Props) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { accessToken } = useAuthStore();
  const { instanceUrl } = useConfigStore();

  useEffect(() => {
    loadVideo();
  }, [fileId, accessToken]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Check offline first
      const isOffline = await isVideoOffline(fileId);
      if (isOffline) {
        const localUri = await getOfflineVideoUrl(fileId);
        if (localUri) {
          console.log('Playing offline video:', localUri);
          setVideoUrl(localUri);
          setLoading(false);
          return;
        }
      }

      // 2. Fallback to online streaming
      if (instanceUrl && accessToken) {
        // Ensure no trailing slash
        const baseUrl = instanceUrl.replace(/\/$/, '');
        const streamUrl = `${baseUrl}/api/v1/files/${fileId}/stream?token=${accessToken}`;
        console.log('Streaming video:', streamUrl);
        setVideoUrl(streamUrl);
      } else {
        setError('Cannot play video: No access token or offline file');
      }
    } catch (err) {
      console.error('Failed to load video', err);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const player = useVideoPlayer(videoUrl, player => {
    player.loop = false;
    if (autoplay) {
      player.play();
    }
  });

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      onComplete?.();
    });
    return () => subscription.remove();
  }, [player, onComplete]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!videoUrl) {
      return (
          <View style={styles.container}>
              <Text style={styles.errorText}>Video not found</Text>
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
});
