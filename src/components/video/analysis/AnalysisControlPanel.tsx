
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Save, Target, Activity, Download } from 'lucide-react';

interface AnalysisControlPanelProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  isPlaying: boolean;
  isAnalyzing?: boolean;
  analysisProgress?: number;
  playerCount?: number;
  avgConfidence?: number;
  onStartAnalysis?: () => Promise<void>;
  onStartTracking?: () => void;
  onSaveAnnotations?: () => void;
  onClearAnnotations?: () => void;
  onExportData?: () => void;
  onPlayerTrackingToggle?: (enabled: boolean) => void;
  onHeatmapToggle?: (enabled: boolean) => void;
  onTrajectoryToggle?: (enabled: boolean) => void;
  trackingEnabled?: boolean;
  heatmapEnabled?: boolean;
  trajectoryEnabled?: boolean;
}

export const AnalysisControlPanel: React.FC<AnalysisControlPanelProps> = ({
  currentTime,
  duration,
  onSeek,
  onPlayPause,
  isPlaying,
  isAnalyzing = false,
  analysisProgress = 0,
  playerCount = 0,
  avgConfidence = 0,
  onStartAnalysis,
  onStartTracking,
  onSaveAnnotations,
  onClearAnnotations,
  onExportData,
  onPlayerTrackingToggle,
  onHeatmapToggle,
  onTrajectoryToggle
}) => {
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="space-y-4">
      {/* Playback Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Playback Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={onPlayPause}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <span className="text-sm min-w-20">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={(value) => onSeek(value[0])}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Analysis Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {onStartAnalysis && (
              <Button
                size="sm"
                variant="outline"
                onClick={onStartAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
              </Button>
            )}
            
            {onStartTracking && (
              <Button
                size="sm"
                variant="outline"
                onClick={onStartTracking}
              >
                <Activity className="w-4 h-4 mr-2" />
                Start Tracking
              </Button>
            )}
            
            {onSaveAnnotations && (
              <Button
                size="sm"
                variant="outline"
                onClick={onSaveAnnotations}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Analysis
              </Button>
            )}
            
            {onClearAnnotations && (
              <Button
                size="sm"
                variant="outline"
                onClick={onClearAnnotations}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}

            {onExportData && (
              <Button
                size="sm"
                variant="outline"
                onClick={onExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>

          {/* Analysis Stats */}
          {(playerCount > 0 || avgConfidence > 0) && (
            <div className="flex gap-4">
              {playerCount > 0 && (
                <Badge variant="secondary">
                  Players: {playerCount}
                </Badge>
              )}
              {avgConfidence > 0 && (
                <Badge variant="secondary">
                  Confidence: {Math.round(avgConfidence * 100)}%
                </Badge>
              )}
            </div>
          )}

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analysis Progress</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <Slider
                value={[analysisProgress]}
                max={100}
                disabled
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
