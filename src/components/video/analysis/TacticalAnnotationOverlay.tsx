import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AdvancedDrawingOverlay } from './AdvancedDrawingOverlay';
import { TacticalPlayerHighlighting } from './TacticalPlayerHighlighting';

/**
 * @interface PlayerPosition
 * @description Represents the position and state of a single player on the overlay.
 * @property {string} id - The unique identifier for the player.
 * @property {number} x - The x-coordinate of the player.
 * @property {number} y - The y-coordinate of the player.
 * @property {'home' | 'away'} team - The team the player belongs to.
 * @property {number} [jerseyNumber] - The player's jersey number.
 * @property {boolean} [isCorrectPosition] - Flag indicating if the player is in the correct tactical position.
 * @property {number} [heatIntensity] - The intensity value for heatmap rendering (0-1).
 */
interface PlayerPosition {
  id: string;
  x: number;
  y: number;
  team: 'home' | 'away';
  jerseyNumber?: number;
  isCorrectPosition?: boolean;
  heatIntensity?: number;
}

/**
 * @interface AnnotationElement
 * @description Represents a single drawing or annotation on the overlay.
 * @property {string} id - The unique identifier for the annotation.
 * @property {'circle' | 'line' | 'arrow' | 'distance' | 'area' | 'spotlight' | 'trajectory' | 'offside-line' | 'pressure-zone' | 'passing-lane' | 'ellipse-light' | 'cone'} type - The type of annotation.
 * @property {{ x: number; y: number }[]} points - An array of points defining the annotation's shape and position.
 * @property {string} color - The color of the annotation.
 * @property {string} [label] - An optional text label for the annotation.
 * @property {number} [measurement] - A calculated measurement (e.g., distance).
 * @property {number} [intensity] - An intensity value for effects like spotlights.
 */
interface AnnotationElement {
  id: string;
  type: 'circle' | 'line' | 'arrow' | 'distance' | 'area' | 'spotlight' | 'trajectory' | 'offside-line' | 'pressure-zone' | 'passing-lane' | 'ellipse-light' | 'cone';
  points: { x: number; y: number }[];
  color: string;
  label?: string;
  measurement?: number;
  intensity?: number;
}

/**
 * @interface TacticalAnnotationOverlayProps
 * @description Props for the TacticalAnnotationOverlay component.
 * @property {{ width: number; height: number }} videoDimensions - The dimensions of the video player.
 * @property {number} currentTime - The current playback time of the video.
 * @property {(annotations: AnnotationElement[]) => void} onAnnotationSave - Callback to save the current set of annotations.
 * @property {PlayerPosition[]} [playerPositions] - An array of player positions to display.
 */
interface TacticalAnnotationOverlayProps {
  videoDimensions: { width: number; height: number };
  currentTime: number;
  onAnnotationSave: (annotations: AnnotationElement[]) => void;
  playerPositions?: PlayerPosition[];
}

/**
 * @function generateMockPlayerPositions
 * @description A helper function to generate mock player position data for demonstration purposes.
 * @param {{ width: number; height: number }} videoDimensions - The dimensions of the video to constrain the positions within.
 * @returns {PlayerPosition[]} An array of generated player positions.
 */
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

/**
 * @component TacticalAnnotationOverlay
 * @description A container component that integrates multiple tactical analysis overlays.
 * It combines the `TacticalPlayerHighlighting` and `AdvancedDrawingOverlay` components.
 * It is also responsible for generating mock player position data for demonstration if no real data is provided.
 * @param {TacticalAnnotationOverlayProps} props The props for the component.
 * @returns {JSX.Element} The rendered TacticalAnnotationOverlay component.
 */
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
