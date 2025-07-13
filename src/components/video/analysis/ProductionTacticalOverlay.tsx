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
  const [playerData, setPlayerData] = useState<any[]>([]);
  const [ballData, setBallData] = useState<any | null>(null);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      console.log('Fullscreen state changed:', isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange); 
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Load existing annotations
  useEffect(() => {
    const loadAnnotations = async () => {
      if (!videoUrl) return;
      
      try {
        const videoId = btoa(videoUrl).substring(0, 50); // Truncate for storage key
        const savedAnnotations = await AnnotationPersistenceService.loadAnnotations(videoId);
        setAnnotations(savedAnnotations);
        console.log(`Loaded ${savedAnnotations.length} annotations for video`);
      } catch (error) {
        console.error('Failed to load annotations:', error);
      }
    };

    loadAnnotations();
  }, [videoUrl]);

  // Process detection results
  useEffect(() => {
    if (detectionResults.length > 0) {
      const currentResult = detectionResults.find(
        (r) => Math.abs(r.timestamp - currentTime) < 0.5
      );

      if (currentResult) {
        setPlayerData(currentResult.players || []);
        setBallData(currentResult.ball || null);
        
        // Update violation count based on detection confidence
        const lowConfidenceDetections = currentResult.players?.filter(p => p.confidence < 0.7).length || 0;
        setViolationCount(lowConfidenceDetections);
      }
    }
  }, [currentTime, detectionResults]);

  // Handle annotation save
  const handleAnnotationSave = useCallback((newAnnotation: any) => {
    const annotationWithTimestamp = {
      ...newAnnotation,
      timestamp: currentTime,
      tool: activeAnnotationTool,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setAnnotations(prev => [...prev, annotationWithTimestamp]);
    
    // Show contextual toast based on annotation type
    const toolLabels = {
      'formation': 'Formation analysis',
      'pressing': 'Pressing trigger',
      'defensive-lines': 'Defensive line',
      'attacking-patterns': 'Attack pattern',
      'set-pieces': 'Set piece',
      'transitions': 'Transition moment'
    };
    
    const label = toolLabels[activeAnnotationTool as keyof typeof toolLabels] || activeAnnotationTool;
    toast.success(`${label} saved at ${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}`);
  }, [currentTime, activeAnnotationTool]);

  // Save annotations to storage
  const handleSaveAnnotations = async () => {
    if (!videoUrl || annotations.length === 0) {
      toast.warning('No annotations to save');
      return;
    }

    try {
      const videoId = btoa(videoUrl).substring(0, 50);
      await AnnotationPersistenceService.saveAnnotations(videoId, currentTime, annotations);
      toast.success(`${annotations.length} annotations saved successfully`);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Failed to save annotations: ${error.message}`);
    }
  };

  // Clear all annotations
  const handleClearAll = () => {
    setAnnotations([]);
    toast.success('All annotations cleared');
  };

  // Toggle drawing mode
  const handleDrawingModeToggle = () => {
    const newDrawingMode = !drawingMode;
    setDrawingMode(newDrawingMode);
    
    if (newDrawingMode) {
      setActiveAnnotationTool('select');
      toast.info('Drawing mode enabled - Select a tool to start annotating');
    } else {
      setActiveAnnotationTool('select');
      toast.info('Drawing mode disabled');
    }
  };

  // Handle tool change
  const handleToolChange = (tool: string) => {
    setActiveAnnotationTool(tool);
    console.log('Active annotation tool changed to:', tool);
    
    // Auto-enable drawing mode when selecting non-select tools
    if (tool !== 'select' && !drawingMode) {
      setDrawingMode(true);
    }
  };

  // Get the target container for rendering
  const getPortalTarget = () => {
    if (isFullscreen && document.fullscreenElement) {
      return document.fullscreenElement as Element;
    }
    return document.body;
  };

  // Check if we should intercept pointer events and show drawing cursor
  const shouldInterceptPointerEvents = drawingMode && activeAnnotationTool !== 'select';
  const isDrawingActive = drawingMode && activeAnnotationTool !== 'select';

  // Apply cursor styles dynamically
  useEffect(() => {
    if (isDrawingActive) {
      // Add global cursor styles
      const style = document.createElement('style');
      style.id = 'drawing-cursor-styles';
      style.textContent = `
        .drawing-overlay-active,
        .drawing-overlay-active *,
        video {
          cursor: crosshair !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        // Clean up styles when component unmounts or drawing is disabled
        const existingStyle = document.getElementById('drawing-cursor-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isDrawingActive]);

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
      <div className="absolute inset-0 overflow-hidden">
        {/* Drawing Overlay - Enhanced pointer event handling */}
        <div 
          className={`absolute inset-0 transition-all duration-200 ${
            shouldInterceptPointerEvents 
              ? 'pointer-events-auto z-30 drawing-overlay-active' 
              : 'pointer-events-none z-10'
          }`}
          style={{ 
            cursor: isDrawingActive ? 'crosshair' : 'default',
            touchAction: shouldInterceptPointerEvents ? 'none' : 'auto'
          }}
        >
          <AdvancedDrawingOverlay
            videoDimensions={videoDimensions}
            currentTime={currentTime}
            onAnnotationSave={handleAnnotationSave}
            playerPositions={playerData.map(p => ({
              id: p.id || `player-${Math.random()}`,
              x: p.position?.x || 0,
              y: p.position?.y || 0,
              team: p.team || 'unknown',
              jerseyNumber: p.jersey_number,
              isCorrectPosition: (p.confidence || 0) > 0.8,
              heatIntensity: Math.random() // Placeholder for heatmap data
            }))}
            ballPosition={ballData ? { 
              x: ballData.position?.x || 0, 
              y: ballData.position?.y || 0 
            } : null}
          />
        </div>

        {/* Annotation Visualization Overlay */}
        {annotations.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <svg className="w-full h-full">
              {annotations.map((annotation, index) => (
                <g key={annotation.id || index}>
                  {/* Render saved annotations based on type */}
                  {annotation.type === 'circle' && annotation.points && annotation.points.length >= 2 && (
                    <circle
                      cx={annotation.points[0].x}
                      cy={annotation.points[0].y}
                      r={Math.abs(annotation.points[1].x - annotation.points[0].x)}
                      fill="none"
                      stroke={annotation.color || '#3b82f6'}
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  )}
                  {annotation.type === 'line' && annotation.points && annotation.points.length >= 2 && (
                    <line
                      x1={annotation.points[0].x}
                      y1={annotation.points[0].y}
                      x2={annotation.points[1].x}
                      y2={annotation.points[1].y}
                      stroke={annotation.color || '#10b981'}
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  )}
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductionTacticalOverlay;
