
import React, { useState, useEffect, useCallback } from 'react';
import { ProductionVideoAnalysisService } from '@/services/productionVideoAnalysisService';
import { ProductionPlayerTrackingService, RealTimePlayerData } from '@/services/productionPlayerTrackingService';
import { AnnotationPersistenceService } from '@/services/annotationPersistenceService';
import { AdvancedDrawingOverlay } from './AdvancedDrawingOverlay';
import { DrawingToolsPanel } from './DrawingToolsPanel';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

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
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      console.log('Fullscreen state changed:', isCurrentlyFullscreen);
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
        console.log(`Loaded ${savedAnnotations.length} annotations for video ${videoId}`);
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

  // Handle annotation save
  const handleAnnotationSave = (newAnnotation: any) => {
    setAnnotations(prev => [...prev, newAnnotation]);
    toast.success(`${activeAnnotationTool} annotation saved at ${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}`);
  };

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
      toast.info('Drawing mode enabled - Start annotating tactical moments');
    } else {
      toast.info('Drawing mode disabled');
    }
  };

  const handleToolChange = (tool: string) => {
    setActiveAnnotationTool(tool);
    console.log('Active annotation tool changed to:', tool);
  };

  // Get the target container for rendering
  const getPortalTarget = () => {
    if (isFullscreen && document.fullscreenElement) {
      return document.fullscreenElement as Element;
    }
    return document.body;
  };

  return (
    <>
      {/* Drawing Tools Panel - Always positioned correctly using portal */}
      {createPortal(
        <DrawingToolsPanel
          activeAnnotationTool={activeAnnotationTool}
          onToolChange={handleToolChange}
          onClearAll={handleClearAll}
          onSaveAnalysis={handleSaveAnnotations}
          violationCount={violationCount}
          drawingMode={drawingMode}
          onDrawingModeToggle={handleDrawingModeToggle}
        />,
        getPortalTarget()
      )}

      {/* Drawing Overlay Container */}
      <div className="absolute inset-0">
        {/* Drawing Overlay - Only intercept pointer events when actively drawing */}
        <div className={`absolute inset-0 ${
          drawingMode && activeAnnotationTool !== 'select' 
            ? 'pointer-events-auto cursor-crosshair' 
            : 'pointer-events-none'
        }`} style={{ zIndex: 10 }}>
          <AdvancedDrawingOverlay
            videoDimensions={videoDimensions}
            currentTime={currentTime}
            onAnnotationSave={handleAnnotationSave}
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
