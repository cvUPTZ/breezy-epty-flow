
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export interface AnalysisControlPanelProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onPlayPause?: () => void;
  isPlaying?: boolean;
}

export const AnalysisControlPanel: React.FC<AnalysisControlPanelProps> = ({
  currentTime,
  duration,
  onSeek,
  onPlayPause,
  isPlaying = false
}) => {
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSkipBackward = () => {
    onSeek(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    onSeek(Math.min(duration, currentTime + 10));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Playback Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipBackward}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          {onPlayPause && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPlayPause}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipForward}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <span className="text-sm min-w-24">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Timeline</label>
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={(value) => onSeek(value[0])}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
