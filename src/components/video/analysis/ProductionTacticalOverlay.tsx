
import React, { useState, useEffect, useCallback } from 'react';
import { AnnotationPersistenceService } from '@/services/annotationPersistenceService';
import { AdvancedDrawingOverlay } from './AdvancedDrawingOverlay';
import { DrawingToolsPanel } from './DrawingToolsPanel';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import { DetectionResult } from '@/services/pythonDetectionService';

interface ProductionTacticalOverlayProps {
  videoElement: HTMLVideoElement | null;
  videoUrl: string;
  videoDimensions: { width: number; height: number };
  currentTime: number;
  isPlaying: boolean;
  detectionResults: DetectionResult[];
}

export const ProductionTacticalOverlay: React.FC<ProductionTacticalOverlayProps> = ({
  videoElement,
  videoUrl,
  videoDimensions,
  currentTime,
  isPlaying,
  detectionResults
}) => {
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState('select');
  const [violationCount, setViolationCount] = useState(0);
  const [drawingMode, setDrawingMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const [playerData, setPlayerData] = useState<any[]>([]);
  const [ballData, setBallData] = useState<any | null>(null);

  useEffect(() => {
    if (detectionResults.length > 0) {
      const currentResult = detectionResults.find(
        (r) => Math.abs(r.timestamp - currentTime) < 0.5
      );

      if (currentResult) {
        setPlayerData(currentResult.players);
        setBallData(currentResult.ball);
      }
    }
  }, [currentTime, detectionResults]);

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
              id: p.id,
              x: p.position.x,
              y: p.position.y,
              team: p.team,
              jerseyNumber: p.jersey_number,
              isCorrectPosition: p.confidence > 0.8,
              heatIntensity: 0
            }))}
            ballPosition={ballData ? { x: ballData.position.x, y: ballData.position.y } : null}
          />
        </div>
      </div>
    </>
  );
};

export default ProductionTacticalOverlay;
