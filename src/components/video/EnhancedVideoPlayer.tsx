
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react';

/**
 * @interface EnhancedVideoPlayerProps
 * @description Props for the EnhancedVideoPlayer component.
 * @property {string} src - The URL of the video source.
 * @property {(currentTime: number) => void} [onTimeUpdate] - Callback function that fires when the video's current time changes.
 * @property {(duration: number) => void} [onDurationChange] - Callback function that fires when the video's duration is available.
 * @property {string} [className] - Optional CSS class names to apply to the container card.
 */
interface EnhancedVideoPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  className?: string;
}

/**
 * @interface VideoPlayerRef
 * @description Defines the imperative handles exposed by the EnhancedVideoPlayer component's ref.
 * This allows parent components to control the video player directly.
 * @property {HTMLVideoElement | null} videoElement - A direct reference to the underlying HTML video element.
 * @property {() => Promise<void>} play - A function to programmatically play the video.
 * @property {() => void} pause - A function to programmatically pause the video.
 * @property {number} currentTime - A getter and setter for the video's current playback time.
 */
export interface VideoPlayerRef {
  videoElement: HTMLVideoElement | null;
  play: () => Promise<void>;
  pause: () => void;
  currentTime: number;
}

/**
 * @component EnhancedVideoPlayer
 * @description A custom video player component with basic controls and event handling.
 * It provides a simple overlay for play/pause, mute, and fullscreen controls.
 * It also exposes imperative handles via a ref for programmatic control from parent components.
 * @param {EnhancedVideoPlayerProps} props The props for the component.
 * @param {React.Ref<VideoPlayerRef>} ref The ref to expose imperative handles.
 * @returns {JSX.Element} The rendered EnhancedVideoPlayer component.
 */
const EnhancedVideoPlayer = forwardRef<VideoPlayerRef, EnhancedVideoPlayerProps>(
  ({ src, onTimeUpdate, onDurationChange, className = '' }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // Expose the video element and controls through the ref
    useImperativeHandle(ref, () => ({
      videoElement: videoRef.current,
      play: async () => {
        if (videoRef.current) {
          await videoRef.current.play();
        }
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      },
      get currentTime() {
        return videoRef.current?.currentTime || 0;
      },
      set currentTime(time: number) {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      }
    }), []);

    const togglePlay = () => {
      if (!videoRef.current) return;
      
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setError('Failed to play video');
        });
      }
    };

    const toggleMute = () => {
      if (!videoRef.current) return;
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    };

    const toggleFullscreen = () => {
      if (!videoRef.current) return;
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    };

    const handleTimeUpdate = () => {
      if (!videoRef.current) return;
      onTimeUpdate?.(videoRef.current.currentTime);
    };

    const handleDurationChange = () => {
      if (!videoRef.current) return;
      onDurationChange?.(videoRef.current.duration);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError('');
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setError('Failed to load video. Please check the URL or try a different video.');
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    if (error) {
      return (
        <Card className={`bg-red-50 border-red-200 ${className}`}>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">Video Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0 relative">
          <div className="relative bg-black aspect-video">
            <video
              ref={videoRef}
              src={src}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onLoadStart={handleLoadStart}
              onCanPlay={handleCanPlay}
              onError={handleError}
              onPlay={handlePlay}
              onPause={handlePause}
              preload="metadata"
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-white">Loading...</div>
              </div>
            )}
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                <div className="flex-1" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

EnhancedVideoPlayer.displayName = 'EnhancedVideoPlayer';

export default EnhancedVideoPlayer;
