
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
    <div className="absolute top-4 right-4 w-80 space-y-3 z-20 pointer-events-auto">
      {/* Analysis Status */}
      <Card className="bg-black/70 backdrop-blur-sm border-white/20 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Production Analysis</span>
            <Badge variant={isAnalyzing ? 'default' : 'secondary'} className="bg-blue-600">
              {isAnalyzing ? 'Processing' : 'Ready'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onStartAnalysis}
              disabled={isAnalyzing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-1" />
              Start Analysis
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onStartTracking}
              className="border-white/20 text-white hover:bg-white/20"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-1">
              <div className="text-xs text-gray-300">
                Processing: {analysisProgress}%
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Options */}
      <Card className="bg-black/70 backdrop-blur-sm border-white/20 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tracking Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Player Tracking</span>
            <Switch
              checked={trackingEnabled}
              onCheckedChange={onTrackingToggle}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Heatmap</span>
            <Switch
              checked={heatmapEnabled}
              onCheckedChange={onHeatmapToggle}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Trajectories</span>
            <Switch
              checked={trajectoryEnabled}
              onCheckedChange={onTrajectoryToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Stats */}
      {playerCount > 0 && (
        <Card className="bg-black/70 backdrop-blur-sm border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Live Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs">Players detected: {playerCount}</div>
            <div className="text-xs">
              Avg confidence: {avgConfidence.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="bg-black/70 backdrop-blur-sm border-white/20 text-white">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onSaveAnnotations}
              className="flex-1 border-white/20 text-white hover:bg-white/20"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onExportData}
              className="flex-1 border-white/20 text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
