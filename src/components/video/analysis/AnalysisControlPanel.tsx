
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Square, Save, Users, Activity, Target, TrendingUp } from 'lucide-react';

interface AnalysisControlPanelProps {
  isAnalyzing: boolean;
  analysisProgress: number;
  playerCount: number;
  avgConfidence: number;
  onStartAnalysis: () => Promise<void>;
  onStartTracking: () => void;
  onSaveAnnotations: () => void;
  onExportData: () => void;
}

export const AnalysisControlPanel: React.FC<AnalysisControlPanelProps> = ({
  isAnalyzing,
  analysisProgress,
  playerCount,
  avgConfidence,
  onStartAnalysis,
  onStartTracking,
  onSaveAnnotations,
  onExportData
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

        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing...</span>
              <span>{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

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

        <div className="flex gap-2">
          <Button
            onClick={onStartAnalysis}
            disabled={isAnalyzing}
            size="sm"
            className="flex-1"
          >
            {isAnalyzing ? <Square className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isAnalyzing ? 'Stop' : 'Analyze'}
          </Button>
          <Button onClick={onSaveAnnotations} size="sm" variant="outline">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
