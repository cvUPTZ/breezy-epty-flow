
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Save, Download, Settings } from 'lucide-react';
import { ProductionVideoAnalysisService } from '@/services/productionVideoAnalysisService';
import { ProductionPlayerTrackingService, RealTimePlayerData } from '@/services/productionPlayerTrackingService';
import { AnnotationPersistenceService } from '@/services/annotationPersistenceService';
import { AdvancedDrawingOverlay } from './AdvancedDrawingOverlay';
import { DrawingToolsPanel } from './DrawingToolsPanel';
import { toast } from 'sonner';

interface ProductionTacticalOverlayProps {
  videoElement: HTMLVideoElement | null;
  videoUrl: string;
  videoDimensions: { width: number; height: number };
  currentTime: number;
  isPlaying: boolean;
}

export const ProductionTacticalOverlay: React.FC<ProductionTacticalOverlayProps> = ({
  videoElement,
  videoUrl,
  videoDimensions,
  currentTime,
  isPlaying
}) => {
  const [analysisJob, setAnalysisJob] = useState<any>(null);
  const [playerData, setPlayerData] = useState<RealTimePlayerData[]>([]);
  const [trackingService, setTrackingService] = useState<ProductionPlayerTrackingService | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState('select');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Initialize tracking service
  useEffect(() => {
    const service = new ProductionPlayerTrackingService({
      frameRate: 15,
      detectionThreshold: 0.7,
      trackingAlgorithm: 'yolo',
      enableHeatmap: true,
      enableTrajectory: true
    });
    setTrackingService(service);

    return () => {
      service.stopTracking();
    };
  }, []);

  // Load existing annotations
  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        const videoId = btoa(videoUrl); // Simple video ID generation
        const savedAnnotations = await AnnotationPersistenceService.loadAnnotations(videoId);
        setAnnotations(savedAnnotations);
      } catch (error) {
        console.error('Failed to load annotations:', error);
      }
    };

    if (videoUrl) {
      loadAnnotations();
    }
  }, [videoUrl]);

  // Start analysis
  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const job = await ProductionVideoAnalysisService.startAnalysis(videoUrl, {
        enablePlayerTracking: true,
        enableEventDetection: true,
        enableHeatmaps: true,
        enableTrajectories: true
      });

      setAnalysisJob(job);
      toast.success('Analysis started successfully');

      // Poll for progress
      const pollInterval = setInterval(async () => {
        const updatedJob = await ProductionVideoAnalysisService.getJobStatus(job.id);
        if (updatedJob) {
          setAnalysisJob(updatedJob);
          setAnalysisProgress(updatedJob.progress);

          if (updatedJob.status === 'completed') {
            clearInterval(pollInterval);
            setIsAnalyzing(false);
            toast.success('Analysis completed');
          } else if (updatedJob.status === 'failed') {
            clearInterval(pollInterval);
            setIsAnalyzing(false);
            toast.error(`Analysis failed: ${updatedJob.error}`);
          }
        }
      }, 2000);

    } catch (error: any) {
      setIsAnalyzing(false);
      toast.error(`Failed to start analysis: ${error.message}`);
    }
  };

  // Start real-time tracking
  const handleStartTracking = useCallback(async () => {
    if (!trackingService || !videoElement) return;

    try {
      await trackingService.startTracking(videoElement, (data) => {
        setPlayerData(data);
      });
      toast.success('Real-time tracking started');
    } catch (error: any) {
      toast.error(`Failed to start tracking: ${error.message}`);
    }
  }, [trackingService, videoElement]);

  // Save annotations
  const handleSaveAnnotations = async () => {
    try {
      const videoId = btoa(videoUrl);
      await AnnotationPersistenceService.saveAnnotations(videoId, currentTime, annotations);
      toast.success('Annotations saved successfully');
    } catch (error: any) {
      toast.error(`Failed to save annotations: ${error.message}`);
    }
  };

  // Export analysis data
  const handleExportData = () => {
    const exportData = {
      videoUrl,
      analysisResults: analysisJob?.results,
      playerTracking: playerData,
      annotations,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Control Panel */}
      <Card className="absolute top-4 left-4 pointer-events-auto w-80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Production Analysis</span>
            <Badge variant={isAnalyzing ? 'default' : 'secondary'}>
              {isAnalyzing ? 'Processing' : 'Ready'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analysis Controls */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-1" />
                Start Analysis
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleStartTracking}
                disabled={!videoElement}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-1">
                <div className="text-xs text-gray-600">
                  Processing: {analysisProgress}%
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            )}
          </div>

          {/* Real-time Stats */}
          {playerData.length > 0 && (
            <div className="space-y-2 p-2 bg-gray-50 rounded">
              <div className="text-xs font-medium">Live Tracking</div>
              <div className="text-xs">Players detected: {playerData.length}</div>
              <div className="text-xs">
                Avg confidence: {(playerData.reduce((sum, p) => sum + p.confidence, 0) / playerData.length * 100).toFixed(1)}%
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSaveAnnotations}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drawing Tools */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <DrawingToolsPanel
          activeAnnotationTool={activeAnnotationTool}
          onToolChange={setActiveAnnotationTool}
        />
      </div>

      {/* Drawing Overlay */}
      <AdvancedDrawingOverlay
        videoDimensions={videoDimensions}
        currentTime={currentTime}
        onAnnotationSave={setAnnotations}
        playerPositions={playerData.map(p => ({
          id: p.playerId,
          x: p.position.x,
          y: p.position.y,
          team: p.team,
          jerseyNumber: p.jerseyNumber,
          isCorrectPosition: p.confidence > 0.8,
          heatIntensity: p.speed / 25
        }))}
        existingAnnotations={annotations}
      />
    </div>
  );
};

export default ProductionTacticalOverlay;
