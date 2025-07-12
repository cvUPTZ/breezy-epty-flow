
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Play, Settings, Save, Download } from 'lucide-react';

interface AnalysisControlPanelProps {
  isAnalyzing: boolean;
  analysisProgress: number;
  playerCount: number;
  avgConfidence: number;
  onStartAnalysis: () => void;
  onStartTracking: () => void;
  onSaveAnnotations: () => void;
  onExportData: () => void;
  trackingEnabled: boolean;
  heatmapEnabled: boolean;
  trajectoryEnabled: boolean;
  onTrackingToggle: (enabled: boolean) => void;
  onHeatmapToggle: (enabled: boolean) => void;
  onTrajectoryToggle: (enabled: boolean) => void;
}

export const AnalysisControlPanel: React.FC<AnalysisControlPanelProps> = ({
  isAnalyzing,
  analysisProgress,
  playerCount,
  avgConfidence,
  onStartAnalysis,
  onStartTracking,
  onSaveAnnotations,
  onExportData,
  trackingEnabled,
  heatmapEnabled,
  trajectoryEnabled,
  onTrackingToggle,
  onHeatmapToggle,
  onTrajectoryToggle
}) => {
  return (
    <div className="absolute top-4 right-4 w-64 space-y-2 z-20 pointer-events-none">
      {/* Analysis Status */}
      <Card className="bg-black/80 backdrop-blur-sm border-white/20 text-white pointer-events-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Analysis</span>
            <Badge variant={isAnalyzing ? 'default' : 'secondary'} className="bg-blue-600 text-xs">
              {isAnalyzing ? 'Processing' : 'Ready'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={onStartAnalysis}
              disabled={isAnalyzing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-7 text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onStartTracking}
              className="border-white/20 text-white hover:bg-white/20 h-7 w-7 p-0"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-1">
              <div className="text-xs text-gray-300">
                Processing: {analysisProgress}%
              </div>
              <Progress value={analysisProgress} className="h-1" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compact Tracking Options */}
      <Card className="bg-black/80 backdrop-blur-sm border-white/20 text-white pointer-events-auto">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">Player Tracking</span>
            <Switch
              checked={trackingEnabled}
              onCheckedChange={onTrackingToggle}
              className="scale-75"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Heatmap</span>
            <Switch
              checked={heatmapEnabled}
              onCheckedChange={onHeatmapToggle}
              className="scale-75"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Trajectories</span>
            <Switch
              checked={trajectoryEnabled}
              onCheckedChange={onTrajectoryToggle}
              className="scale-75"
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Stats */}
      {playerCount > 0 && (
        <Card className="bg-black/80 backdrop-blur-sm border-white/20 text-white pointer-events-auto">
          <CardContent className="p-3 space-y-1">
            <div className="text-xs">Players: {playerCount}</div>
            <div className="text-xs">
              Confidence: {avgConfidence.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compact Actions */}
      <Card className="bg-black/80 backdrop-blur-sm border-white/20 text-white pointer-events-auto">
        <CardContent className="p-2">
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onSaveAnnotations}
              className="flex-1 border-white/20 text-white hover:bg-white/20 h-7 text-xs"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onExportData}
              className="flex-1 border-white/20 text-white hover:bg-white/20 h-7 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
