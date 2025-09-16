
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Play, Square, Save, Users, Activity, Target, TrendingUp, Pause, Volume2, VolumeX } from 'lucide-react';

/**
 * @interface AnalysisControlPanelProps
 * @description Props for the AnalysisControlPanel component. The component is designed to be flexible,
 * rendering different controls based on which props are provided.
 * @property {boolean} [isAnalyzing] - Flag indicating if the analysis process is currently running.
 * @property {number} [analysisProgress] - The progress of the analysis, from 0 to 100.
 * @property {number} [playerCount] - The number of players detected.
 * @property {number} [avgConfidence] - The average confidence score of the detections.
 * @property {number} [currentTime] - The current playback time of the video.
 * @property {number} [duration] - The total duration of the video.
 * @property {boolean} [isPlaying] - Flag indicating if the video is currently playing.
 * @property {(time: number) => void} [onSeek] - Callback to handle seeking the video.
 * @property {() => void} [onPlayPause] - Callback to handle playing or pausing the video.
 * @property {() => Promise<void>} [onStartAnalysis] - Callback to start the main analysis process.
 * @property {() => void} [onStartTracking] - Callback to start real-time tracking.
 * @property {() => void} [onSaveAnnotations] - Callback to save annotations.
 * @property {() => void} [onExportData] - Callback to export analysis data.
 * @property {boolean} [trackingEnabled] - State for the player tracking toggle.
 * @property {boolean} [heatmapEnabled] - State for the heatmap toggle.
 * @property {boolean} [trajectoryEnabled] - State for the trajectory toggle.
 * @property {(enabled: boolean) => void} [onTrackingToggle] - Callback for the player tracking toggle.
 * @property {(enabled: boolean) => void} [onHeatmapToggle] - Callback for the heatmap toggle.
 * @property {(enabled: boolean) => void} [onTrajectoryToggle] - Callback for the trajectory toggle.
 */
interface AnalysisControlPanelProps {
  // Analysis states
  isAnalyzing?: boolean;
  analysisProgress?: number;
  playerCount?: number;
  avgConfidence?: number;
  
  // Video control props (for AdvancedVideoAnalysisInterface)
  currentTime?: number;
  duration?: number;
  isPlaying?: boolean;
  onSeek?: (time: number) => void;
  onPlayPause?: () => void;
  
  // Analysis control handlers
  onStartAnalysis?: () => Promise<void>;
  onStartTracking?: () => void;
  onSaveAnnotations?: () => void;
  onExportData?: () => void;
  
  // Toggle states (for ProductionVideoAnalysisInterface)
  trackingEnabled?: boolean;
  heatmapEnabled?: boolean;
  trajectoryEnabled?: boolean;
  onTrackingToggle?: (enabled: boolean) => void;
  onHeatmapToggle?: (enabled: boolean) => void;
  onTrajectoryToggle?: (enabled: boolean) => void;
}

/**
 * @function formatTime
 * @description A utility function to format a time in seconds into a MM:SS string.
 * @param {number} time - The time in seconds.
 * @returns {string} The formatted time string.
 */
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * @component AnalysisControlPanel
 * @description A flexible control panel for video analysis, designed to be used as an overlay.
 * It conditionally renders controls for video playback, analysis progress, statistics, and actions
 * based on the props provided, making it adaptable to different analysis interfaces.
 * @param {AnalysisControlPanelProps} props The props for the component.
 * @returns {JSX.Element} The rendered AnalysisControlPanel component.
 */
export const AnalysisControlPanel: React.FC<AnalysisControlPanelProps> = ({
  isAnalyzing = false,
  analysisProgress = 0,
  playerCount = 0,
  avgConfidence = 0,
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  onSeek,
  onPlayPause,
  onStartAnalysis,
  onStartTracking,
  onSaveAnnotations,
  onExportData,
  trackingEnabled = false,
  heatmapEnabled = false,
  trajectoryEnabled = false,
  onTrackingToggle,
  onHeatmapToggle,
  onTrajectoryToggle
}) => {
  return (
    <Card className="bg-black/80 backdrop-blur-md border-white/20 text-white">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Analysis Control</h3>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Active
          </Badge>
        </div>

        {/* Video Controls Section (for AdvancedVideoAnalysisInterface) */}
        {(currentTime !== undefined || duration !== undefined) && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Video Controls</h4>
            
            {onPlayPause && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={onPlayPause}
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <span className="text-sm min-w-20">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            )}

            {onSeek && duration > 0 && (
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={(value) => onSeek(value[0])}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing...</span>
              <span>{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

        {/* Analysis Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Players: {playerCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            <span>Confidence: {Math.round(avgConfidence)}%</span>
          </div>
        </div>

        {/* Toggle Controls (for ProductionVideoAnalysisInterface) */}
        {(onTrackingToggle || onHeatmapToggle || onTrajectoryToggle) && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Analysis Options</h4>
            
            {onTrackingToggle && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Player Tracking</span>
                <Switch
                  checked={trackingEnabled}
                  onCheckedChange={onTrackingToggle}
                />
              </div>
            )}
            
            {onHeatmapToggle && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Heatmap</span>
                <Switch
                  checked={heatmapEnabled}
                  onCheckedChange={onHeatmapToggle}
                />
              </div>
            )}
            
            {onTrajectoryToggle && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Trajectories</span>
                <Switch
                  checked={trajectoryEnabled}
                  onCheckedChange={onTrajectoryToggle}
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onStartAnalysis && (
            <Button
              onClick={onStartAnalysis}
              disabled={isAnalyzing}
              size="sm"
              className="flex-1"
            >
              {isAnalyzing ? <Square className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isAnalyzing ? 'Stop' : 'Analyze'}
            </Button>
          )}
          
          {onSaveAnnotations && (
            <Button onClick={onSaveAnnotations} size="sm" variant="outline">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          )}
          
          {onExportData && (
            <Button onClick={onExportData} size="sm" variant="outline">
              <TrendingUp className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
