'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Download, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { saveVideoForOffline, getOfflineVideoUrl, isVideoOffline, removeOfflineVideo } from '@/lib/offline-content';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import { useConfigStore } from '@/lib/config-store';

interface VideoPlayerProps {
  fileId: string;
  poster?: string;
  title?: string;
  startAt?: number;
  onProgress?: (currentTime: number, duration: number) => void;
}

export function VideoPlayer({ fileId, poster, title, startAt = 0, onProgress }: VideoPlayerProps) {
  const { accessToken: token } = useAuthStore();
  const { instanceUrl } = useConfigStore();
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineUrl, setOfflineUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Initial loading state
    setIsLoading(false);
  }, []);

  // Check offline status on mount
  useEffect(() => {
    if (!fileId || !token) return;
    
    const checkOffline = async () => {
      const isAvailable = await isVideoOffline(fileId);
      setIsOffline(isAvailable);
      if (isAvailable) {
        const url = await getOfflineVideoUrl(fileId, token);
        setOfflineUrl(url);
      }
    };
    
    checkOffline();
  }, [fileId, token]);

  const baseUrl = instanceUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const streamUrl = offlineUrl || (token ? `${baseUrl}/api/v1/files/${fileId}/stream?token=${token}` : '');
  
  const handleDownload = async () => {
    if (!token) return;

    if (isOffline) {
        // Option to remove?
        try {
            await removeOfflineVideo(fileId, token);
            setIsOffline(false);
            setOfflineUrl(null);
            toast.success('Removed from offline downloads');
        } catch (e) {
            toast.error('Failed to remove video');
        }
        return;
    }

    setDownloading(true);
    toast.info('Starting download for offline viewing...');
    try {
      await saveVideoForOffline(fileId, token);
      setIsOffline(true);
      const url = await getOfflineVideoUrl(fileId, token);
      setOfflineUrl(url);
      toast.success('Video downloaded for offline viewing!');
    } catch (error) {
      toast.error('Failed to download video');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime, video.duration);
    };

    const updateDuration = () => {
      setDuration(video.duration);
      // Seek to last position when metadata is ready
      if (startAt > 0 && !isNaN(startAt)) {
        try {
          video.currentTime = Math.min(startAt, video.duration || startAt);
        } catch {}
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [onProgress]);

  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={streamUrl}
        poster={poster}
        className="w-full h-auto"
        onClick={togglePlay}
        onError={(e) => {
          const video = e.target as HTMLVideoElement;
          console.error('Video load error:', {
            error: video.error,
            src: video.currentSrc,
            networkState: video.networkState,
            readyState: video.readyState
          });
        }}
      />

      {/* Controls Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
              disabled={downloading}
              title={isOffline ? "Remove from downloads" : "Download for offline viewing"}
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isOffline ? (
                <Check className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>

            {/* Playback Speed */}
            <select
              value={playbackRate}
              onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
              className="bg-transparent text-white text-sm border border-white/20 rounded px-2 py-1"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={togglePlay}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-4"
          >
            <Play className="w-8 h-8" />
          </Button>
        </div>
      )}

      {/* Title Overlay */}
      {title && (
        <div className="absolute top-4 left-4 text-white">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
    </div>
  );
}
