
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

  // Create drawing tools component
  const DrawingTools = () => {
    if (drawingMode) {
      return (
        <DrawingToolsPanel
          activeAnnotationTool={activeAnnotationTool}
          onToolChange={setActiveAnnotationTool}
          onClearAll={handleClearAll}
          onSaveAnalysis={handleSaveAnnotations}
          violationCount={violationCount}
          drawingMode={drawingMode}
          onDrawingModeToggle={handleDrawingModeToggle}
        />
      );
    }
    
    return (
      <button
        onClick={handleDrawingModeToggle}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        Enable Drawing
      </button>
    );
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
      {/* Drawing Tools - Always positioned correctly using portal */}
      {createPortal(
        <div 
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto ${
            isFullscreen ? 'z-[2147483647]' : 'z-50'
          }`}
          style={{ 
            position: isFullscreen ? 'fixed' : 'absolute',
            zIndex: isFullscreen ? 2147483647 : 50
          }}
        >
          <DrawingTools />
        </div>,
        getPortalTarget()
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
