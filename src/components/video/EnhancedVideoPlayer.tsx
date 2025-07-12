
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onLoadedMetadata?: () => void;
  className?: string;
}

export interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  setCurrentTime: (time: number) => void;
  getDuration: () => number;
  isPlaying: () => boolean;
}

export const EnhancedVideoPlayer = forwardRef<VideoPlayerRef, EnhancedVideoPlayerProps>(
  ({ videoUrl, onTimeUpdate, onDurationChange, onLoadedMetadata, className = "" }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      getCurrentTime: () => videoRef.current?.currentTime || 0,
      setCurrentTime: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      getDuration: () => duration,
      isPlaying: () => isPlaying,
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      setIsLoading(true);
      setError(null);

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setIsLoading(false);
        onDurationChange?.(video.duration);
        onLoadedMetadata?.();
      };

      const handleTimeUpdate = () => {
        const time = video.currentTime;
        setCurrentTime(time);
        onTimeUpdate?.(time);
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleError = () => {
        setError('Failed to load video. Please check the URL or try a different video.');
        setIsLoading(false);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('error', handleError);
      };
    }, [videoUrl, onTimeUpdate, onDurationChange, onLoadedMetadata]);

    const togglePlayPause = () => {
      if (!videoRef.current) return;
      
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    };

    const handleSeek = (value: number[]) => {
      if (!videoRef.current) return;
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const handleVolumeChange = (value: number[]) => {
      if (!videoRef.current) return;
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
      if (!videoRef.current) return;
      
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    };

    const formatTime = (seconds: number): string => {
      if (isNaN(seconds)) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
      return (
        <div className={`bg-gray-900 rounded-lg flex items-center justify-center p-8 ${className}`}>
          <div className="text-center text-white">
            <p className="text-red-400 mb-2">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-white border-white/20"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="relative">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-auto"
            preload="metadata"
            crossOrigin="anonymous"
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white">Loading video...</div>
            </div>
          )}
        </div>

        {/* Custom Controls */}
        <div className="bg-gray-900 p-4 space-y-3">
          {/* Progress Bar */}
          <div className="space-y-1">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
              disabled={!duration}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className="text-white hover:bg-white/10"
                disabled={!duration}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/10"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

EnhancedVideoPlayer.displayName = 'EnhancedVideoPlayer';
