import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Trash, Save, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onSave: (blob: Blob) => void;
  className?: string;
  maxDuration?: number; // in seconds, default 60
}

export function VoiceRecorder({ 
  onSave, 
  className,
  maxDuration = 300 // 5 minutes default
}: VoiceRecorderProps) {
  const [permission, setPermission] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'recording' | 'recorded' | 'playing'>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Check permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setPermission(true))
      .catch(() => setPermission(false));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Cleanup audioUrl when it changes or unmounts
  useEffect(() => {
    return () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus('recorded');
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setStatus('recording');
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);

    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setStatus('recorded');
      } else {
        audioRef.current.src = audioUrl;
      }
      audioRef.current.play();
      setStatus('playing');
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setStatus('recorded');
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    setStatus('idle');
    chunksRef.current = [];
  };

  const handleSave = () => {
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      onSave(blob);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!permission) {
    return (
      <div className={cn("p-6 border-2 border-dashed rounded-xl text-center bg-gray-50", className)}>
        <p className="text-gray-500 mb-4">Microphone access required</p>
        <Button onClick={() => navigator.mediaDevices.getUserMedia({ audio: true }).then(() => setPermission(true))}>
          Allow Microphone
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border-2 border-purple-100", className)}>
      
      {/* Timer Display */}
      <div className="mb-8 text-4xl font-mono font-bold text-purple-600 tracking-wider">
        {formatTime(duration)}
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-6">
        {status === 'idle' && (
          <Button 
            size="lg" 
            className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-lg transition-all hover:scale-105"
            onClick={startRecording}
          >
            <Mic className="w-8 h-8 text-white" />
          </Button>
        )}

        {status === 'recording' && (
          <div className="relative">
            <span className="absolute -inset-1 rounded-full bg-red-500 opacity-20 animate-ping"></span>
            <Button 
              size="lg" 
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-lg relative z-10"
              onClick={stopRecording}
            >
              <Square className="w-8 h-8 text-white fill-current" />
            </Button>
          </div>
        )}

        {(status === 'recorded' || status === 'playing') && (
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full border-2 hover:bg-gray-100"
              onClick={resetRecording}
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </Button>

            <Button 
              size="lg" 
              className="w-20 h-20 rounded-full bg-purple-500 hover:bg-purple-600 shadow-lg"
              onClick={status === 'playing' ? pausePlayback : playRecording}
            >
              {status === 'playing' ? (
                <Pause className="w-8 h-8 text-white fill-current" />
              ) : (
                <Play className="w-8 h-8 text-white fill-current ml-1" />
              )}
            </Button>

            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 shadow-md"
              onClick={handleSave}
            >
              <Save className="w-5 h-5 text-white" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500 font-medium">
        {status === 'idle' && "Tap to record your answer"}
        {status === 'recording' && "Recording... Tap to stop"}
        {status === 'recorded' && "Review or save your recording"}
        {status === 'playing' && "Playing..."}
      </div>
    </div>
  );
}
