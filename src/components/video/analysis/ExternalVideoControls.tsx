
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from 'lucide-react';

interface ExternalVideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
}

export const ExternalVideoControls: React.FC<ExternalVideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle
}) => {
  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (values: number[]) => {
    if (values[0] !== undefined && isFinite(values[0])) {
      onSeek(values[0]);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    if (values[0] !== undefined && isFinite(values[0])) {
      onVolumeChange(values[0]);
    }
  };

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    onSeek(newTime);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(duration || 0, currentTime + 10);
    onSeek(newTime);
  };

  const safeCurrentTime = isFinite(currentTime) ? currentTime : 0;
  const safeDuration = isFinite(duration) && duration > 0 ? duration : 100;
  const safeVolume = isFinite(volume) ? volume : 1;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4 shadow-lg">
      {/* Timeline */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(safeCurrentTime)}</span>
          <span>{formatTime(safeDuration)}</span>
        </div>
        <Slider
          value={[safeCurrentTime]}
          max={safeDuration}
          step={0.1}
          onValueChange={handleSeekChange}
          className="w-full"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipBack}
            className="h-10 w-10 rounded-full"
            title="Skip back 10 seconds"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={onPlayPause}
            className="h-12 w-12 rounded-full bg-primary/10 hover:bg-primary/20"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipForward}
            className="h-10 w-10 rounded-full"
            title="Skip forward 10 seconds"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 flex-1 max-w-40 mx-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMuteToggle}
            className="h-8 w-8"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          
          <Slider
            value={[isMuted ? 0 : safeVolume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
          
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round((isMuted ? 0 : safeVolume) * 100)}%
          </span>
        </div>

        {/* Fullscreen Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreenToggle}
            className="h-8 w-8"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
