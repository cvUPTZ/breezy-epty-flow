
import React, { useState, useEffect, useCallback } from 'react';
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
  const [violationCount, setViolationCount] = useState(0);
  const [drawingMode, setDrawingMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

  // Start real-time tracking
  const handleStartTracking = useCallback(async () => {
    if (!trackingService || !videoElement) return;

    try {
      await trackingService.startTracking(videoElement, (data) => {
        setPlayerData(data);
        // Update violation count based on tracking data
        const violations = data.filter(p => p.confidence < 0.6).length;
        setViolationCount(violations);
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

  // Clear all annotations
  const handleClearAll = () => {
    setAnnotations([]);
    toast.success('All annotations cleared');
  };

  const handleDrawingModeToggle = () => {
    setDrawingMode(!drawingMode);
    if (!drawingMode) {
      setActiveAnnotationTool('select');
    }
  };

  return (
    <>
      {/* Drawing Tools Panel - Portal to body when fullscreen */}
      {drawingMode && (
        <div 
          className={`${isFullscreen ? 'fixed' : 'absolute'} top-4 left-1/2 transform -translate-x-1/2`}
          style={{ zIndex: 2147483647 }}
        >
          <DrawingToolsPanel
            activeAnnotationTool={activeAnnotationTool}
            onToolChange={setActiveAnnotationTool}
            onClearAll={handleClearAll}
            onSaveAnalysis={handleSaveAnnotations}
            violationCount={violationCount}
            drawingMode={drawingMode}
            onDrawingModeToggle={handleDrawingModeToggle}
          />
        </div>
      )}

      {/* Toggle Drawing Mode Button - Always visible */}
      {!drawingMode && (
        <div 
          className={`${isFullscreen ? 'fixed' : 'absolute'} top-4 left-1/2 transform -translate-x-1/2`}
          style={{ zIndex: 2147483647 }}
        >
          <button
            onClick={handleDrawingModeToggle}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            Enable Drawing
          </button>
        </div>
      )}

      {/* Drawing Overlay Container */}
      <div className="absolute inset-0">
        {/* Drawing Overlay - Only intercept pointer events when actively drawing */}
        <div className={`absolute inset-0 ${
          drawingMode && activeAnnotationTool !== 'select' 
            ? 'pointer-events-auto' 
            : 'pointer-events-none'
        }`} style={{ zIndex: 2147483646 }}>
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
          />
        </div>
      </div>
    </>
  );
};

export default ProductionTacticalOverlay;
