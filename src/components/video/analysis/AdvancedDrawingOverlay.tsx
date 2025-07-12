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
  type: 'circle' | 'line' | 'arrow' | 'distance' | 'spotlight' | 'trajectory' | 'area' | 'offside-line' | 'pressure-zone' | 'passing-lane';
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
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [zoomLevel, setZoomLevel] = useState([1]);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Enhanced tactical rules for stadium perspective
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
    },
    {
      id: '3',
      type: 'offside',
      name: 'Offside Detection',
      parameters: { tolerance: 0.5 },
      active: false
    },
    {
      id: '4',
      type: 'pressing',
      name: 'High Pressing Intensity',
      parameters: { radius: 15, playerCount: 3 },
      active: false
    }
  ];

  // Initialize with some stadium-perspective annotations
  useEffect(() => {
    if (videoDimensions.width > 0 && videoDimensions.height > 0 && annotations.length === 0) {
      const stadiumAnnotations: AnnotationElement[] = [
        {
          id: 'penalty-area-top',
          type: 'area',
          points: [
            { x: videoDimensions.width * 0.78, y: videoDimensions.height * 0.25 },
            { x: videoDimensions.width * 0.95, y: videoDimensions.height * 0.25 },
            { x: videoDimensions.width * 0.95, y: videoDimensions.height * 0.55 },
            { x: videoDimensions.width * 0.78, y: videoDimensions.height * 0.55 }
          ],
          color: '#ffffff',
          label: 'Penalty Area'
        },
        {
          id: 'goal-area-top',
          type: 'area',
          points: [
            { x: videoDimensions.width * 0.88, y: videoDimensions.height * 0.35 },
            { x: videoDimensions.width * 0.95, y: videoDimensions.height * 0.35 },
            { x: videoDimensions.width * 0.95, y: videoDimensions.height * 0.45 },
            { x: videoDimensions.width * 0.88, y: videoDimensions.height * 0.45 }
          ],
          color: '#ffffff',
          label: 'Goal Area'
        },
        {
          id: 'center-circle',
          type: 'circle',
          points: [{ x: videoDimensions.width * 0.5, y: videoDimensions.height * 0.4 }],
          color: '#ffffff',
          label: 'Center Circle'
        },
        {
          id: 'offside-line',
          type: 'offside-line',
          points: [
            { x: videoDimensions.width * 0.65, y: videoDimensions.height * 0.15 },
            { x: videoDimensions.width * 0.65, y: videoDimensions.height * 0.65 }
          ],
          color: '#ff6b6b',
          label: 'Last Defender Line'
        }
      ];
      setAnnotations(stadiumAnnotations);
    }
  }, [videoDimensions]);

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
    } else if (activeAnnotationTool === 'spotlight' || activeAnnotationTool === 'pressure-zone') {
      const radius = Math.sqrt(Math.pow(x - drawingPoints[0].x, 2) + Math.pow(y - drawingPoints[0].y, 2));
      setDrawingPoints([drawingPoints[0], { x: drawingPoints[0].x + radius, y: drawingPoints[0].y }]);
    } else if (activeAnnotationTool === 'area') {
      if (drawingPoints.length === 1) {
        setDrawingPoints([drawingPoints[0], { x, y }]);
      }
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
      'offside-line': '#ff6b6b',
      'pressure-zone': '#ff8c42',
      'passing-lane': '#4ecdc4'
    };

    const newAnnotation: AnnotationElement = {
      id: crypto.randomUUID(),
      type: activeAnnotationTool as any,
      points: [...drawingPoints],
      color: colorMap[activeAnnotationTool as keyof typeof colorMap] || '#3b82f6',
      measurement: activeAnnotationTool === 'distance' ? calculateDistance(drawingPoints) : undefined,
      intensity: ['spotlight', 'pressure-zone'].includes(activeAnnotationTool) ? 0.7 : undefined
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setDrawingPoints([]);
    setIsDrawing(false);
    
    toast.success(`${activeAnnotationTool.replace('-', ' ')} annotation added`);
  };

  const calculateDistance = (points: { x: number; y: number }[]): number => {
    if (points.length < 2) return 0;
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    return Math.round((pixelDistance / videoDimensions.width) * 100);
  };

  const renderAnnotation = (annotation: AnnotationElement) => {
    const { type, points, color, measurement, intensity, label } = annotation;

    switch (type) {
      case 'circle':
        if (points.length > 0) {
          return (
            <g key={annotation.id}>
              <circle
                cx={points[0].x}
                cy={points[0].y}
                r="40"
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeDasharray="8,4"
                className="animate-pulse"
              />
              {label && (
                <text
                  x={points[0].x}
                  y={points[0].y - 50}
                  textAnchor="middle"
                  fontSize="12"
                  fill={color}
                  fontWeight="bold"
                >
                  {label}
                </text>
              )}
            </g>
          );
        }
        break;

      case 'area':
        if (points.length >= 2) {
          const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
          return (
            <g key={annotation.id}>
              <path
                d={path}
                fill={`${color}20`}
                stroke={color}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              {label && points.length > 0 && (
                <text
                  x={points[0].x}
                  y={points[0].y - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fill={color}
                  fontWeight="bold"
                >
                  {label}
                </text>
              )}
            </g>
          );
        }
        break;

      case 'offside-line':
        if (points.length >= 2) {
          return (
            <g key={annotation.id}>
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke={color}
                strokeWidth="3"
                strokeDasharray="10,5"
                className="animate-pulse"
              />
              <text
                x={points[0].x + 10}
                y={points[0].y - 5}
                fontSize="10"
                fill={color}
                fontWeight="bold"
              >
                {label || 'Offside Line'}
              </text>
            </g>
          );
        }
        break;

      case 'pressure-zone':
        if (points.length >= 2) {
          const radius = Math.abs(points[1].x - points[0].x);
          return (
            <g key={annotation.id}>
              <circle
                cx={points[0].x}
                cy={points[0].y}
                r={radius}
                fill={`${color}30`}
                stroke={color}
                strokeWidth="2"
                strokeDasharray="3,3"
                className="animate-pulse"
              />
              <circle
                cx={points[0].x}
                cy={points[0].y}
                r={radius * 0.5}
                fill={`${color}20`}
                className="animate-pulse"
              />
              <text
                x={points[0].x}
                y={points[0].y + 5}
                textAnchor="middle"
                fontSize="10"
                fill={color}
                fontWeight="bold"
              >
                High Press
              </text>
            </g>
          );
        }
        break;

      case 'passing-lane':
        if (points.length >= 2) {
          return (
            <g key={annotation.id}>
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke={color}
                strokeWidth="6"
                strokeDasharray="15,10"
                opacity="0.7"
              />
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke="white"
                strokeWidth="2"
                strokeDasharray="15,10"
              />
            </g>
          );
        }
        break;

      // Keep existing cases for line, arrow, distance, spotlight, trajectory
      case 'line':
        if (points.length >= 2) {
          return (
            <line
              key={annotation.id}
              x1={points[0].x}
              y1={points[0].y}
              x2={points[1].x}
              y2={points[1].y}
              stroke={color}
              strokeWidth="3"
              className="drop-shadow-lg"
            />
          );
        }
        break;

      case 'arrow':
        if (points.length >= 2) {
          return (
            <g key={annotation.id} className="drop-shadow-lg">
              <defs>
                <marker
                  id={`arrowhead-${annotation.id}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill={color}
                  />
                </marker>
              </defs>
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke={color}
                strokeWidth="4"
                markerEnd={`url(#arrowhead-${annotation.id})`}
              />
            </g>
          );
        }
        break;

      case 'spotlight':
        if (points.length >= 2) {
          const radius = Math.abs(points[1].x - points[0].x);
          return (
            <g key={annotation.id}>
              <circle
                cx={points[0].x}
                cy={points[0].y}
                r={radius}
                fill={`${color}40`}
                stroke={color}
                strokeWidth="3"
                className="animate-pulse"
              />
              <circle
                cx={points[0].x}
                cy={points[0].y}
                r={radius * 0.7}
                fill={`${color}20`}
                className="animate-pulse"
              />
            </g>
          );
        }
        break;

      case 'distance':
        if (points.length >= 2) {
          const midX = (points[0].x + points[1].x) / 2;
          const midY = (points[0].y + points[1].y) / 2;
          
          return (
            <g key={annotation.id} className="drop-shadow-lg">
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke={color}
                strokeWidth="3"
                strokeDasharray="5,5"
              />
              <circle cx={points[0].x} cy={points[0].y} r="4" fill={color} />
              <circle cx={points[1].x} cy={points[1].y} r="4" fill={color} />
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
        if (points.length >= 2) {
          return (
            <g key={annotation.id}>
              <path
                d={`M ${points[0].x} ${points[0].y} Q ${(points[0].x + points[1].x) / 2} ${points[0].y - 50} ${points[1].x} ${points[1].y}`}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeDasharray="10,5"
                className="animate-pulse drop-shadow-lg"
              />
              <circle cx={points[0].x} cy={points[0].y} r="6" fill={color} className="animate-bounce" />
              <circle cx={points[1].x} cy={points[1].y} r="6" fill={color} className="animate-bounce" />
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
        {playerPositions.map(player => (
          <circle
            key={`heatmap-${player.id}`}
            cx={player.x}
            cy={player.y}
            r={30 + (player.heatIntensity || 0) * 20}
            fill={`rgba(255, 0, 0, ${0.1 + (player.heatIntensity || 0) * 0.3})`}
            className="animate-pulse"
          />
        ))}
      </g>
    );
  };

  const renderPlayerTracking = () => {
    if (!showPlayerTracking) return null;

    return (
      <g>
        {playerPositions.map(player => (
          <g key={player.id}>
            <circle
              cx={player.x}
              cy={player.y}
              r="18"
              fill={player.team === 'home' ? '#3b82f6' : '#ef4444'}
              stroke={
                player.isCorrectPosition === false ? '#fbbf24' : 
                player.isCorrectPosition === true ? '#10b981' : '#6b7280'
              }
              strokeWidth="4"
              className={`transition-all duration-300 ${selectedPlayer === player.id ? 'animate-pulse scale-125' : ''}`}
              onClick={() => setSelectedPlayer(selectedPlayer === player.id ? null : player.id)}
            />
            {player.jerseyNumber && (
              <text
                x={player.x}
                y={player.y + 4}
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontWeight="bold"
              >
                {player.jerseyNumber}
              </text>
            )}
            {selectedPlayer === player.id && (
              <circle
                cx={player.x}
                cy={player.y}
                r="35"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeDasharray="5,5"
                className="animate-spin"
              />
            )}
          </g>
        ))}
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
          
          {/* Render current drawing - keep existing drawing preview code */}
          {isDrawing && drawingPoints.length > 0 && (
            <>
              {activeAnnotationTool === 'line' && drawingPoints.length === 2 && (
                <line
                  x1={drawingPoints[0].x}
                  y1={drawingPoints[0].y}
                  x2={drawingPoints[1].x}
                  y2={drawingPoints[1].y}
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'offside-line' && drawingPoints.length === 2 && (
                <line
                  x1={drawingPoints[0].x}
                  y1={drawingPoints[0].y}
                  x2={drawingPoints[1].x}
                  y2={drawingPoints[1].y}
                  stroke="#ff6b6b"
                  strokeWidth="3"
                  strokeDasharray="10,5"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'passing-lane' && drawingPoints.length === 2 && (
                <line
                  x1={drawingPoints[0].x}
                  y1={drawingPoints[0].y}
                  x2={drawingPoints[1].x}
                  y2={drawingPoints[1].y}
                  stroke="#4ecdc4"
                  strokeWidth="6"
                  strokeDasharray="15,10"
                  opacity="0.7"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'pressure-zone' && drawingPoints.length === 2 && (
                <circle
                  cx={drawingPoints[0].x}
                  cy={drawingPoints[0].y}
                  r={Math.abs(drawingPoints[1].x - drawingPoints[0].x)}
                  fill="#ff8c4230"
                  stroke="#ff8c42"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'arrow' && drawingPoints.length === 2 && (
                <line
                  x1={drawingPoints[0].x}
                  y1={drawingPoints[0].y}
                  x2={drawingPoints[1].x}
                  y2={drawingPoints[1].y}
                  stroke="#8b5cf6"
                  strokeWidth="4"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'distance' && drawingPoints.length === 2 && (
                <line
                  x1={drawingPoints[0].x}
                  y1={drawingPoints[0].y}
                  x2={drawingPoints[1].x}
                  y2={drawingPoints[1].y}
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="3,3"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'spotlight' && drawingPoints.length === 2 && (
                <circle
                  cx={drawingPoints[0].x}
                  cy={drawingPoints[0].y}
                  r={Math.abs(drawingPoints[1].x - drawingPoints[0].x)}
                  fill="#fbbf2440"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  className="animate-pulse"
                />
              )}
              {activeAnnotationTool === 'trajectory' && drawingPoints.length === 2 && (
                <path
                  d={`M ${drawingPoints[0].x} ${drawingPoints[0].y} Q ${(drawingPoints[0].x + drawingPoints[1].x) / 2} ${drawingPoints[0].y - 50} ${drawingPoints[1].x} ${drawingPoints[1].y}`}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeDasharray="10,5"
                  className="animate-pulse"
                />
              )}
            </>
          )}
        </svg>
      </div>

      {/* Enhanced control panels */}
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

        {/* Enhanced View Options */}
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
                <span className="text-sm">Field Lines</span>
              </div>
              <Switch
                checked={showFieldLines}
                onCheckedChange={setShowFieldLines}
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

      {/* Enhanced Drawing Tools Panel */}
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
