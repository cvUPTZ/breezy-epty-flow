import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AdvancedDrawingOverlay } from './AdvancedDrawingOverlay';
import { TacticalPlayerHighlighting } from './TacticalPlayerHighlighting';

interface PlayerPosition {
  id: string;
  x: number;
  y: number;
  team: 'home' | 'away';
  jerseyNumber?: number;
  isCorrectPosition?: boolean;
  heatIntensity?: number;
}

interface AnnotationElement {
  id: string;
  type: 'circle' | 'line' | 'arrow' | 'distance' | 'area' | 'spotlight' | 'trajectory' | 'offside-line' | 'pressure-zone' | 'passing-lane' | 'ellipse-light' | 'cone';
  points: { x: number; y: number }[];
  color: string;
  label?: string;
  measurement?: number;
  intensity?: number;
}

interface TacticalAnnotationOverlayProps {
  videoDimensions: { width: number; height: number };
  currentTime: number;
  onAnnotationSave: (annotations: AnnotationElement[]) => void;
  playerPositions?: PlayerPosition[];
}

// Generate mock player positions with heatmap data
const generateMockPlayerPositions = (videoDimensions: { width: number; height: number }): PlayerPosition[] => {
  const positions: PlayerPosition[] = [];
  
  // Home team players (blue)
  for (let i = 1; i <= 11; i++) {
    positions.push({
      id: `home-${i}`,
      x: Math.random() * videoDimensions.width * 0.8 + videoDimensions.width * 0.1,
      y: Math.random() * videoDimensions.height * 0.6 + videoDimensions.height * 0.2,
      team: 'home',
      jerseyNumber: i,
      isCorrectPosition: Math.random() > 0.3,
      heatIntensity: Math.random()
    });
  }
  
  // Away team players (red)
  for (let i = 1; i <= 11; i++) {
    positions.push({
      id: `away-${i}`,
      x: Math.random() * videoDimensions.width * 0.8 + videoDimensions.width * 0.1,
      y: Math.random() * videoDimensions.height * 0.6 + videoDimensions.height * 0.2,
      team: 'away',
      jerseyNumber: i,
      isCorrectPosition: Math.random() > 0.3,
      heatIntensity: Math.random()
    });
  }
  
  return positions;
};

export const TacticalAnnotationOverlay: React.FC<TacticalAnnotationOverlayProps> = ({
  videoDimensions,
  currentTime,
  onAnnotationSave,
  playerPositions = []
}) => {
  const [mockPositions, setMockPositions] = useState<PlayerPosition[]>([]);
  const [showPlayerHighlighting, setShowPlayerHighlighting] = useState(true);

  // Generate mock data when dimensions are available
  useEffect(() => {
    if (videoDimensions.width > 0 && videoDimensions.height > 0) {
      setMockPositions(generateMockPlayerPositions(videoDimensions));
    }
  }, [videoDimensions]);

  // Use provided positions or mock positions
  const effectivePositions = playerPositions.length > 0 ? playerPositions : mockPositions;

  const togglePlayerHighlighting = useCallback(() => {
    setShowPlayerHighlighting(prev => !prev);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Tactical Player Highlighting Overlay */}
      <TacticalPlayerHighlighting
        videoDimensions={videoDimensions}
        isVisible={showPlayerHighlighting}
        onToggle={togglePlayerHighlighting}
      />
      
      {/* Advanced Drawing Overlay */}
      <AdvancedDrawingOverlay
        videoDimensions={videoDimensions}
        currentTime={currentTime}
        onAnnotationSave={onAnnotationSave}
        playerPositions={effectivePositions}
      />
    </div>
  );
};

export default TacticalAnnotationOverlay;
