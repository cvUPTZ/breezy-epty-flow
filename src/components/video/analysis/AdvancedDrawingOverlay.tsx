import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Layers, MapPin, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { DrawingToolsPanel } from './DrawingToolsPanel';

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
  type: 'circle' | 'line' | 'arrow' | 'distance' | 'spotlight' | 'trajectory' | 'area' | 'offside-line' | 'pressure-zone' | 'passing-lane' | 'ellipse-light' | 'cone';
  points: { x: number; y: number }[];
  color: string;
  label?: string;
  measurement?: number;
  intensity?: number;
}

interface TacticalRule {
  id: string;
  type: 'distance' | 'formation' | 'offside' | 'pressing';
  name: string;
  parameters: any;
  active: boolean;
}

interface AdvancedDrawingOverlayProps {
  videoDimensions: { width: number; height: number };
  currentTime: number;
  onAnnotationSave: (annotations: AnnotationElement[]) => void;
  playerPositions?: PlayerPosition[];
}

export const AdvancedDrawingOverlay: React.FC<AdvancedDrawingOverlayProps> = ({
  videoDimensions,
  currentTime,
  onAnnotationSave,
  playerPositions = []
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<string>('select');
  const [annotations, setAnnotations] = useState<AnnotationElement[]>([]);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [showPlayerTracking, setShowPlayerTracking] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTrajectories, setShowTrajectories] = useState(false);
  const [zoomLevel, setZoomLevel] = useState([1]);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Isometric transformation parameters
  const isometricScale = 0.866; // cos(30°) for isometric effect
  const perspectiveAngle = 15; // degrees for depth perspective

  // Transform coordinates to isometric view
  const transformToIsometric = (x: number, y: number) => {
    // Apply perspective transformation for stadium camera angle
    const centerX = videoDimensions.width / 2;
    const centerY = videoDimensions.height / 2;
    
    // Translate to center, apply isometric transform, translate back
    const relativeX = x - centerX;
    const relativeY = y - centerY;
    
    // Apply isometric scaling with depth effect
    const depth = (relativeY / videoDimensions.height) * 0.3; // Create depth illusion
    const isoX = centerX + relativeX + (relativeY * 0.5 * isometricScale);
    const isoY = centerY + (relativeY * isometricScale) - (depth * 50);
    
    return { x: isoX, y: isoY };
  };

  const tacticalRules: TacticalRule[] = [
    {
      id: '1',
      type: 'distance',
      name: 'Defensive Line Compactness',
      parameters: { maxDistance: 12, unit: 'm' },
      active: true
    },
    {
      id: '2',
      type: 'formation',
      name: 'Formation Shape',
      parameters: { formation: '4-3-3' },
      active: true
    }
  ];

  const handleMouseDown = (event: React.MouseEvent) => {
    if (activeAnnotationTool === 'select') return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / zoomLevel[0] - panPosition.x;
    const y = (event.clientY - rect.top) / zoomLevel[0] - panPosition.y;

    setIsDrawing(true);
    setDrawingPoints([{ x, y }]);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDrawing || activeAnnotationTool === 'select') return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / zoomLevel[0] - panPosition.x;
    const y = (event.clientY - rect.top) / zoomLevel[0] - panPosition.y;

    if (['line', 'arrow', 'distance', 'trajectory', 'offside-line', 'passing-lane'].includes(activeAnnotationTool)) {
      setDrawingPoints([drawingPoints[0], { x, y }]);
    } else if (['spotlight', 'pressure-zone', 'ellipse-light', 'cone'].includes(activeAnnotationTool)) {
      const radius = Math.sqrt(Math.pow(x - drawingPoints[0].x, 2) + Math.pow(y - drawingPoints[0].y, 2));
      setDrawingPoints([drawingPoints[0], { x: drawingPoints[0].x + radius, y: drawingPoints[0].y }]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || drawingPoints.length === 0) return;

    const colorMap = {
      circle: '#3b82f6',
      line: '#10b981',
      arrow: '#8b5cf6',
      distance: '#ef4444',
      spotlight: '#fbbf24',
      trajectory: '#f97316',
      area: '#06b6d4',
      'offside-line': '#dc2626',
      'pressure-zone': '#7c3aed',
      'passing-lane': '#059669',
      'ellipse-light': '#f59e0b',
      'cone': '#ec4899'
    };

    const newAnnotation: AnnotationElement = {
      id: crypto.randomUUID(),
      type: activeAnnotationTool as any,
      points: [...drawingPoints],
      color: colorMap[activeAnnotationTool as keyof typeof colorMap] || '#3b82f6',
      measurement: activeAnnotationTool === 'distance' ? calculateDistance(drawingPoints) : undefined,
      intensity: ['spotlight', 'pressure-zone', 'ellipse-light', 'cone'].includes(activeAnnotationTool) ? 0.7 : undefined
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setDrawingPoints([]);
    setIsDrawing(false);
    
    toast.success(`${activeAnnotationTool} annotation added`);
  };

  const calculateDistance = (points: { x: number; y: number }[]): number => {
    if (points.length < 2) return 0;
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    return Math.round((pixelDistance / videoDimensions.width) * 100);
  };

  const renderAnnotation = (annotation: AnnotationElement) => {
    const { type, points, color, measurement, intensity } = annotation;

    // Apply isometric transformation to all points
    const isoPoints = points.map(point => transformToIsometric(point.x, point.y));

    switch (type) {
      case 'circle':
        if (isoPoints.length > 0) {
          return (
            <ellipse
              key={annotation.id}
              cx={isoPoints[0].x}
              cy={isoPoints[0].y}
              rx="40"
              ry={40 * isometricScale}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray="8,4"
              className="animate-pulse drop-shadow-lg"
              transform={`skewX(-${perspectiveAngle})`}
            />
          );
        }
        break;

      case 'line':
        if (isoPoints.length >= 2) {
          return (
            <line
              key={annotation.id}
              x1={isoPoints[0].x}
              y1={isoPoints[0].y}
              x2={isoPoints[1].x}
              y2={isoPoints[1].y}
              stroke={color}
              strokeWidth="3"
              className="drop-shadow-lg"
            />
          );
        }
        break;

      case 'offside-line':
        if (isoPoints.length >= 2) {
          return (
            <g key={annotation.id} className="drop-shadow-lg">
              <line
                x1={0}
                y1={isoPoints[0].y}
                x2={videoDimensions.width}
                y2={isoPoints[0].y}
                stroke={color}
                strokeWidth="4"
                strokeDasharray="10,5"
                className="animate-pulse"
              />
              <text
                x={videoDimensions.width - 80}
                y={isoPoints[0].y - 10}
                fill={color}
                fontSize="14"
                fontWeight="bold"
                className="drop-shadow-md"
              >
                OFFSIDE LINE
              </text>
            </g>
          );
        }
        break;

      case 'passing-lane':
        if (isoPoints.length >= 2) {
          const width = 40;
          const dx = isoPoints[1].x - isoPoints[0].x;
          const dy = isoPoints[1].y - isoPoints[0].y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          
          return (
            <g key={annotation.id} className="drop-shadow-lg">
              <rect
                x={isoPoints[0].x}
                y={isoPoints[0].y - width/2}
                width={length}
                height={width}
                fill={`${color}30`}
                stroke={color}
                strokeWidth="2"
                strokeDasharray="5,5"
                transform={`rotate(${angle * 180 / Math.PI} ${isoPoints[0].x} ${isoPoints[0].y})`}
                className="animate-pulse"
              />
            </g>
          );
        }
        break;

      case 'pressure-zone':
        if (isoPoints.length >= 2) {
          const radius = Math.abs(isoPoints[1].x - isoPoints[0].x);
          return (
            <g key={annotation.id}>
              <ellipse
                cx={isoPoints[0].x}
                cy={isoPoints[0].y}
                rx={radius}
                ry={radius * isometricScale}
                fill={`${color}40`}
                stroke={color}
                strokeWidth="3"
                strokeDasharray="8,4"
                className="animate-pulse drop-shadow-lg"
                transform={`skewX(-${perspectiveAngle})`}
              />
              <text
                x={isoPoints[0].x}
                y={isoPoints[0].y - radius - 10}
                textAnchor="middle"
                fill={color}
                fontSize="12"
                fontWeight="bold"
                className="drop-shadow-md"
              >
                PRESSURE ZONE
              </text>
            </g>
          );
        }
        break;

      case 'arrow':
        if (isoPoints.length >= 2) {
          return (
            <g key={annotation.id} className="drop-shadow-lg">
              <defs>
                <marker
                  id={`arrowhead-${annotation.id}`}
                  markerWidth="12"
                  markerHeight="8"
                  refX="11"
                  refY="4"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 12 4, 0 8"
                    fill={color}
                  />
                </marker>
              </defs>
              <line
                x1={isoPoints[0].x}
                y1={isoPoints[0].y}
                x2={isoPoints[1].x}
                y2={isoPoints[1].y}
                stroke={color}
                strokeWidth="4"
                markerEnd={`url(#arrowhead-${annotation.id})`}
              />
            </g>
          );
        }
        break;

      case 'spotlight':
        if (isoPoints.length >= 2) {
          const radius = Math.abs(isoPoints[1].x - isoPoints[0].x);
          return (
            <g key={annotation.id}>
              <ellipse
                cx={isoPoints[0].x}
                cy={isoPoints[0].y}
                rx={radius}
                ry={radius * isometricScale}
                fill={`${color}40`}
                stroke={color}
                strokeWidth="3"
                className="animate-pulse drop-shadow-lg"
                transform={`skewX(-${perspectiveAngle})`}
              />
              <ellipse
                cx={isoPoints[0].x}
                cy={isoPoints[0].y}
                rx={radius * 0.7}
                ry={radius * 0.7 * isometricScale}
                fill={`${color}20`}
                className="animate-pulse"
                transform={`skewX(-${perspectiveAngle})`}
              />
            </g>
          );
        }
        break;

      case 'distance':
        if (isoPoints.length >= 2) {
          const midX = (isoPoints[0].x + isoPoints[1].x) / 2;
          const midY = (isoPoints[0].y + isoPoints[1].y) / 2;
          
          return (
            <g key={annotation.id} className="drop-shadow-lg">
              <line
                x1={isoPoints[0].x}
                y1={isoPoints[0].y}
                x2={isoPoints[1].x}
                y2={isoPoints[1].y}
                stroke={color}
                strokeWidth="3"
                strokeDasharray="5,5"
              />
              <circle cx={isoPoints[0].x} cy={isoPoints[0].y} r="4" fill={color} />
              <circle cx={isoPoints[1].x} cy={isoPoints[1].y} r="4" fill={color} />
              <rect
                x={midX - 25}
                y={midY - 15}
                width="50"
                height="30"
                fill="rgba(0,0,0,0.8)"
                stroke={color}
                strokeWidth="2"
                rx="5"
              />
              <text
                x={midX}
                y={midY + 5}
                textAnchor="middle"
                fontSize="12"
                fill="white"
                fontWeight="bold"
              >
                {measurement}m
              </text>
            </g>
          );
        }
        break;

      case 'trajectory':
        if (isoPoints.length >= 2) {
          return (
            <g key={annotation.id}>
              <path
                d={`M ${isoPoints[0].x} ${isoPoints[0].y} Q ${(isoPoints[0].x + isoPoints[1].x) / 2} ${isoPoints[0].y - 50} ${isoPoints[1].x} ${isoPoints[1].y}`}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeDasharray="10,5"
                className="animate-pulse drop-shadow-lg"
              />
              <circle cx={isoPoints[0].x} cy={isoPoints[0].y} r="6" fill={color} className="animate-bounce" />
              <circle cx={isoPoints[1].x} cy={isoPoints[1].y} r="6" fill={color} className="animate-bounce" />
            </g>
          );
        }
        break;

      case 'area':
        if (isoPoints.length >= 2) {
          const width = Math.abs(isoPoints[1].x - isoPoints[0].x);
          const height = Math.abs(isoPoints[1].y - isoPoints[0].y);
          return (
            <rect
              key={annotation.id}
              x={Math.min(isoPoints[0].x, isoPoints[1].x)}
              y={Math.min(isoPoints[0].y, isoPoints[1].y)}
              width={width}
              height={height * isometricScale}
              fill={`${color}30`}
              stroke={color}
              strokeWidth="2"
              strokeDasharray="8,4"
              className="animate-pulse drop-shadow-lg"
            />
          );
        }
        break;

      case 'ellipse-light':
        if (isoPoints.length >= 2) {
          const radius = Math.abs(isoPoints[1].x - isoPoints[0].x);
          return (
            <g key={annotation.id}>
              {/* Vertical light beam */}
              <defs>
                <linearGradient id={`light-gradient-${annotation.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={`${color}80`} />
                  <stop offset="50%" stopColor={`${color}40`} />
                  <stop offset="100%" stopColor={`${color}10`} />
                </linearGradient>
              </defs>
              {/* Light beam extending upward */}
              <rect
                x={isoPoints[0].x - 20}
                y={isoPoints[0].y - 200}
                width="40"
                height="200"
                fill={`url(#light-gradient-${annotation.id})`}
                className="animate-pulse"
                transform={`skewX(-${perspectiveAngle})`}
              />
              {/* Main ellipse */}
              <ellipse
                cx={isoPoints[0].x}
                cy={isoPoints[0].y}
                rx={radius}
                ry={radius * isometricScale}
                fill={`${color}30`}
                stroke={color}
                strokeWidth="3"
                className="animate-pulse drop-shadow-lg"
                transform={`skewX(-${perspectiveAngle})`}
              />
              <text
                x={isoPoints[0].x}
                y={isoPoints[0].y - radius - 20}
                textAnchor="middle"
                fill={color}
                fontSize="12"
                fontWeight="bold"
                className="drop-shadow-md"
              >
                LIGHT ZONE
              </text>
            </g>
          );
        }
        break;

      case 'cone':
        if (isoPoints.length >= 2) {
          const radius = Math.abs(isoPoints[1].x - isoPoints[0].x);
          const coneHeight = radius * 1.5;
          return (
            <g key={annotation.id}>
              {/* Cone shape using path */}
              <path
                d={`M ${isoPoints[0].x} ${isoPoints[0].y - coneHeight} 
                    L ${isoPoints[0].x - radius} ${isoPoints[0].y} 
                    A ${radius} ${radius * isometricScale} 0 0 0 ${isoPoints[0].x + radius} ${isoPoints[0].y} 
                    Z`}
                fill={`${color}40`}
                stroke={color}
                strokeWidth="3"
                className="drop-shadow-lg"
                transform={`skewX(-${perspectiveAngle})`}
              />
              {/* Cone base ellipse */}
              <ellipse
                cx={isoPoints[0].x}
                cy={isoPoints[0].y}
                rx={radius}
                ry={radius * isometricScale * 0.3}
                fill={`${color}60`}
                stroke={color}
                strokeWidth="2"
                transform={`skewX(-${perspectiveAngle})`}
              />
              <text
                x={isoPoints[0].x}
                y={isoPoints[0].y + radius + 15}
                textAnchor="middle"
                fill={color}
                fontSize="12"
                fontWeight="bold"
                className="drop-shadow-md"
              >
                CONE
              </text>
            </g>
          );
        }
        break;
    }
    return null;
  };

  const renderHeatmap = () => {
    if (!showHeatmap || !playerPositions.length) return null;

    return (
      <g>
        {playerPositions.map(player => {
          const isoPos = transformToIsometric(player.x, player.y);
          return (
            <ellipse
              key={`heatmap-${player.id}`}
              cx={isoPos.x}
              cy={isoPos.y}
              rx={30 + (player.heatIntensity || 0) * 20}
              ry={(30 + (player.heatIntensity || 0) * 20) * isometricScale}
              fill={`rgba(255, 0, 0, ${0.1 + (player.heatIntensity || 0) * 0.3})`}
              className="animate-pulse"
              transform={`skewX(-${perspectiveAngle})`}
            />
          );
        })}
      </g>
    );
  };

  const renderPlayerTracking = () => {
    if (!showPlayerTracking) return null;

    return (
      <g>
        {playerPositions.map(player => {
          const isoPos = transformToIsometric(player.x, player.y);
          return (
            <g key={player.id}>
              <ellipse
                cx={isoPos.x}
                cy={isoPos.y}
                rx="18"
                ry={18 * isometricScale}
                fill={player.team === 'home' ? '#3b82f6' : '#ef4444'}
                stroke={
                  player.isCorrectPosition === false ? '#fbbf24' : 
                  player.isCorrectPosition === true ? '#10b981' : '#6b7280'
                }
                strokeWidth="4"
                className={`transition-all duration-300 ${selectedPlayer === player.id ? 'animate-pulse scale-125' : ''}`}
                onClick={() => setSelectedPlayer(selectedPlayer === player.id ? null : player.id)}
                transform={`skewX(-${perspectiveAngle})`}
              />
              {player.jerseyNumber && (
                <text
                  x={isoPos.x}
                  y={isoPos.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fill="white"
                  fontWeight="bold"
                >
                  {player.jerseyNumber}
                </text>
              )}
              {selectedPlayer === player.id && (
                <ellipse
                  cx={isoPos.x}
                  cy={isoPos.y}
                  rx="35"
                  ry={35 * isometricScale}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  className="animate-spin"
                  transform={`skewX(-${perspectiveAngle})`}
                />
              )}
            </g>
          );
        })}
      </g>
    );
  };

  const handleClearAll = () => {
    setAnnotations([]);
    setSelectedPlayer(null);
    toast.success('All annotations cleared');
  };

  const handleSaveAnalysis = () => {
    onAnnotationSave(annotations);
    toast.success('Tactical analysis saved successfully');
  };

  const handleDrawingModeToggle = () => {
    setDrawingMode(!drawingMode);
    if (!drawingMode) {
      setActiveAnnotationTool('select');
    }
  };

  const violationCount = playerPositions.filter(p => p.isCorrectPosition === false).length;

  return (
    <div className="absolute inset-0">
      {/* Main drawing overlay */}
      <div
        ref={overlayRef}
        className={`absolute inset-0 ${drawingMode && activeAnnotationTool !== 'select' ? 'cursor-crosshair' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          transform: `scale(${zoomLevel[0]}) translate(${panPosition.x}px, ${panPosition.y}px)`,
          transformOrigin: 'top left'
        }}
      >
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {/* Render heatmap */}
          {renderHeatmap()}
          
          {/* Render player tracking */}
          {renderPlayerTracking()}
          
          {/* Render saved annotations */}
          {annotations.map(renderAnnotation)}
          
          {/* Render current drawing with isometric preview */}
          {isDrawing && drawingPoints.length > 0 && (
            <>
              {activeAnnotationTool === 'line' && drawingPoints.length === 2 && (
                <line
                  x1={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x}
                  y1={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).y}
                  x2={transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).x}
                  y2={transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).y}
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'offside-line' && drawingPoints.length >= 1 && (
                <line
                  x1={0}
                  y1={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).y}
                  x2={videoDimensions.width}
                  y2={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).y}
                  stroke="#dc2626"
                  strokeWidth="4"
                  strokeDasharray="10,5"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'arrow' && drawingPoints.length === 2 && (
                <line
                  x1={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x}
                  y1={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).y}
                  x2={transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).x}
                  y2={transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).y}
                  stroke="#8b5cf6"
                  strokeWidth="4"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'distance' && drawingPoints.length === 2 && (
                <line
                  x1={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x}
                  y1={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).y}
                  x2={transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).x}
                  y2={transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).y}
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="3,3"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'spotlight' && drawingPoints.length === 2 && (
                <ellipse
                  cx={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x}
                  cy={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).y}
                  rx={Math.abs(transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).x - transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x)}
                  ry={Math.abs(transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).x - transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x) * isometricScale}
                  fill="#fbbf2440"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  className="animate-pulse"
                  transform={`skewX(-${perspectiveAngle})`}
                />
              )}
              {activeAnnotationTool === 'trajectory' && drawingPoints.length === 2 && (
                <path
                  d={`M ${transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x} ${transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).y} Q ${(transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x + transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).x) / 2} ${transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).y - 50} ${transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).x} ${transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).y}`}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeDasharray="10,5"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'ellipse-light' && drawingPoints.length === 2 && (
                <g>
                  <defs>
                    <linearGradient id="preview-light-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b80" />
                      <stop offset="50%" stopColor="#f59e0b40" />
                      <stop offset="100%" stopColor="#f59e0b10" />
                    </linearGradient>
                  </defs>
                  <rect
                    x={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x - 20}
                    y={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).y - 200}
                    width="40"
                    height="200"
                    fill="url(#preview-light-gradient)"
                    className="animate-pulse"
                  />
                  <ellipse
                    cx={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x}
                    cy={transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).y}
                    rx={Math.abs(transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).x - transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x)}
                    ry={Math.abs(transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).x - transformToIsometric(drawingPoints[0].x, drawingPoints[0].y).x) * isometricScale}
                    fill="#f59e0b30"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    className="animate-pulse"
                    transform={`skewX(-${perspectiveAngle})`}
                  />
                </g>
              )}
              {activeAnnotationTool === 'cone' && drawingPoints.length === 2 && (
                <g>
                  {(() => {
                    const isoStart = transformToIsometric(drawingPoints[0].x, drawingPoints[0].y);
                    const radius = Math.abs(transformToIsometric(drawingPoints[1].x, drawingPoints[1].y).x - isoStart.x);
                    const coneHeight = radius * 1.5;
                    return (
                      <>
                        <path
                          d={`M ${isoStart.x} ${isoStart.y - coneHeight} 
                              L ${isoStart.x - radius} ${isoStart.y} 
                              A ${radius} ${radius * isometricScale} 0 0 0 ${isoStart.x + radius} ${isoStart.y} 
                              Z`}
                          fill="#ec489940"
                          stroke="#ec4899"
                          strokeWidth="3"
                          className="animate-pulse"
                          transform={`skewX(-${perspectiveAngle})`}
                        />
                        <ellipse
                          cx={isoStart.x}
                          cy={isoStart.y}
                          rx={radius}
                          ry={radius * isometricScale * 0.3}
                          fill="#ec489960"
                          stroke="#ec4899"
                          strokeWidth="2"
                          className="animate-pulse"
                          transform={`skewX(-${perspectiveAngle})`}
                        />
                      </>
                    );
                  })()}
                </g>
              )}
            </>
          )}
        </svg>
      </div>

      {/* Control panels */}
      <div className="absolute top-4 right-4 z-20 space-y-3 pointer-events-none">
        {/* Zoom and Pan Controls */}
        <Card className="bg-black/80 backdrop-blur-md border-white/20 text-white pointer-events-auto">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Zoom</span>
              <Slider
                value={zoomLevel}
                onValueChange={setZoomLevel}
                min={0.5}
                max={3}
                step={0.1}
                className="w-24"
              />
              <span className="text-xs">{zoomLevel[0].toFixed(1)}x</span>
            </div>
          </CardContent>
        </Card>

        {/* View Options */}
        <Card className="bg-black/80 backdrop-blur-md border-white/20 text-white pointer-events-auto">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Player Tracking</span>
              </div>
              <Switch
                checked={showPlayerTracking}
                onCheckedChange={setShowPlayerTracking}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Heatmap</span>
              </div>
              <Switch
                checked={showHeatmap}
                onCheckedChange={setShowHeatmap}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Trajectories</span>
              </div>
              <Switch
                checked={showTrajectories}
                onCheckedChange={setShowTrajectories}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Rules */}
        {tacticalRules.filter(r => r.active).length > 0 && (
          <Card className="bg-black/80 backdrop-blur-md border-white/20 text-white pointer-events-auto">
            <CardContent className="p-3">
              <div className="text-sm font-medium mb-2">Active Rules</div>
              <div className="space-y-1">
                {tacticalRules.filter(r => r.active).map(rule => (
                  <Badge key={rule.id} variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {rule.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Drawing Tools Panel */}
      <DrawingToolsPanel
        activeAnnotationTool={activeAnnotationTool}
        onToolChange={setActiveAnnotationTool}
        onClearAll={handleClearAll}
        onSaveAnalysis={handleSaveAnalysis}
        violationCount={violationCount}
        drawingMode={drawingMode}
        onDrawingModeToggle={handleDrawingModeToggle}
      />
    </div>
  );
};
