
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Circle, Square, ArrowRight, Ruler, Users, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PlayerPosition {
  id: string;
  x: number;
  y: number;
  team: 'home' | 'away';
  jerseyNumber?: number;
  isCorrectPosition?: boolean;
}

interface TacticalRule {
  id: string;
  type: 'distance' | 'formation' | 'offside' | 'pressing';
  name: string;
  parameters: any;
  active: boolean;
}

interface AnnotationElement {
  id: string;
  type: 'circle' | 'line' | 'arrow' | 'distance' | 'area';
  points: { x: number; y: number }[];
  color: string;
  label?: string;
  measurement?: number;
}

interface TacticalAnnotationOverlayProps {
  videoDimensions: { width: number; height: number };
  currentTime: number;
  onAnnotationSave: (annotations: AnnotationElement[]) => void;
  playerPositions?: PlayerPosition[];
}

export const TacticalAnnotationOverlay: React.FC<TacticalAnnotationOverlayProps> = ({
  videoDimensions,
  currentTime,
  onAnnotationSave,
  playerPositions = []
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<'none' | 'circle' | 'line' | 'arrow' | 'distance' | 'area'>('none');
  const [annotations, setAnnotations] = useState<AnnotationElement[]>([]);
  const [tacticalRules, setTacticalRules] = useState<TacticalRule[]>([
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
  ]);
  const [showPlayerTracking, setShowPlayerTracking] = useState(true);
  const [showTacticalFeedback, setShowTacticalFeedback] = useState(true);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (activeAnnotationTool === 'none') return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setIsDrawing(true);
    setDrawingPoints([{ x, y }]);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDrawing || activeAnnotationTool === 'none') return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (activeAnnotationTool === 'line' || activeAnnotationTool === 'arrow' || activeAnnotationTool === 'distance') {
      setDrawingPoints([drawingPoints[0], { x, y }]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || drawingPoints.length === 0) return;

    const newAnnotation: AnnotationElement = {
      id: crypto.randomUUID(),
      type: activeAnnotationTool as any,
      points: [...drawingPoints],
      color: activeAnnotationTool === 'distance' ? '#ef4444' : '#3b82f6',
      measurement: activeAnnotationTool === 'distance' ? calculateDistance(drawingPoints) : undefined
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
    // Convert pixels to meters (approximate conversion for soccer field)
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    return Math.round((pixelDistance / videoDimensions.width) * 100); // Approximate field width conversion
  };

  const analyzeTacticalViolations = useCallback(() => {
    if (!playerPositions.length) return [];

    const violations = [];

    // Check defensive line compactness
    const defensiveLineRule = tacticalRules.find(r => r.type === 'distance' && r.active);
    if (defensiveLineRule) {
      const defenders = playerPositions.filter(p => p.team === 'home' && p.y > videoDimensions.height * 0.6);
      if (defenders.length >= 2) {
        for (let i = 0; i < defenders.length - 1; i++) {
          const distance = Math.sqrt(
            Math.pow(defenders[i].x - defenders[i + 1].x, 2) + 
            Math.pow(defenders[i].y - defenders[i + 1].y, 2)
          );
          const meterDistance = (distance / videoDimensions.width) * 100;
          
          if (meterDistance > defensiveLineRule.parameters.maxDistance) {
            violations.push({
              type: 'distance_violation',
              players: [defenders[i], defenders[i + 1]],
              distance: Math.round(meterDistance),
              maxAllowed: defensiveLineRule.parameters.maxDistance
            });
          }
        }
      }
    }

    return violations;
  }, [playerPositions, tacticalRules, videoDimensions]);

  const renderAnnotation = (annotation: AnnotationElement) => {
    const { type, points, color, measurement } = annotation;

    switch (type) {
      case 'circle':
        if (points.length > 0) {
          const radius = 30;
          return (
            <circle
              key={annotation.id}
              cx={points[0].x}
              cy={points[0].y}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        }
        break;

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
              strokeWidth="2"
            />
          );
        }
        break;

      case 'arrow':
        if (points.length >= 2) {
          const dx = points[1].x - points[0].x;
          const dy = points[1].y - points[0].y;
          const angle = Math.atan2(dy, dx);
          const arrowLength = 15;
          
          return (
            <g key={annotation.id}>
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke={color}
                strokeWidth="2"
              />
              <polygon
                points={`${points[1].x},${points[1].y} ${points[1].x - arrowLength * Math.cos(angle - 0.5)},${points[1].y - arrowLength * Math.sin(angle - 0.5)} ${points[1].x - arrowLength * Math.cos(angle + 0.5)},${points[1].y - arrowLength * Math.sin(angle + 0.5)}`}
                fill={color}
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
            <g key={annotation.id}>
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke={color}
                strokeWidth="2"
                strokeDasharray="3,3"
              />
              <rect
                x={midX - 15}
                y={midY - 10}
                width="30"
                height="20"
                fill="white"
                stroke={color}
                strokeWidth="1"
                rx="3"
              />
              <text
                x={midX}
                y={midY + 3}
                textAnchor="middle"
                fontSize="10"
                fill={color}
                fontWeight="bold"
              >
                {measurement}m
              </text>
            </g>
          );
        }
        break;
    }
    return null;
  };

  const violations = analyzeTacticalViolations();

  return (
    <div className="absolute inset-0">
      {/* Main annotation overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {/* Render saved annotations */}
          {annotations.map(renderAnnotation)}
          
          {/* Render current drawing */}
          {isDrawing && drawingPoints.length > 0 && (
            <>
              {activeAnnotationTool === 'line' && drawingPoints.length === 2 && (
                <line
                  x1={drawingPoints[0].x}
                  y1={drawingPoints[0].y}
                  x2={drawingPoints[1].x}
                  y2={drawingPoints[1].y}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
              {activeAnnotationTool === 'distance' && drawingPoints.length === 2 && (
                <line
                  x1={drawingPoints[0].x}
                  y1={drawingPoints[0].y}
                  x2={drawingPoints[1].x}
                  y2={drawingPoints[1].y}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                />
              )}
            </>
          )}

          {/* Player positions and tracking */}
          {showPlayerTracking && playerPositions.map(player => (
            <g key={player.id}>
              <circle
                cx={player.x}
                cy={player.y}
                r="15"
                fill={player.team === 'home' ? '#3b82f6' : '#ef4444'}
                stroke={player.isCorrectPosition === false ? '#fbbf24' : '#10b981'}
                strokeWidth="3"
              />
              {player.jerseyNumber && (
                <text
                  x={player.x}
                  y={player.y + 3}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {player.jerseyNumber}
                </text>
              )}
            </g>
          ))}

          {/* Tactical violations visualization */}
          {showTacticalFeedback && violations.map((violation, index) => (
            <g key={index}>
              {violation.type === 'distance_violation' && (
                <>
                  <line
                    x1={violation.players[0].x}
                    y1={violation.players[0].y}
                    x2={violation.players[1].x}
                    y2={violation.players[1].y}
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                  <text
                    x={(violation.players[0].x + violation.players[1].x) / 2}
                    y={(violation.players[0].y + violation.players[1].y) / 2 - 10}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#ef4444"
                    fontWeight="bold"
                  >
                    {violation.distance}m
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Control Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Tactical Analysis Tools</span>
              <div className="flex items-center gap-2">
                <Badge variant={violations.length > 0 ? "destructive" : "default"}>
                  {violations.length} Issues
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Annotation Tools */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={activeAnnotationTool === 'circle' ? 'default' : 'outline'}
                onClick={() => setActiveAnnotationTool('circle')}
              >
                <Circle className="w-3 h-3 mr-1" />
                Circle
              </Button>
              <Button
                size="sm"
                variant={activeAnnotationTool === 'line' ? 'default' : 'outline'}
                onClick={() => setActiveAnnotationTool('line')}
              >
                <Square className="w-3 h-3 mr-1" />
                Line
              </Button>
              <Button
                size="sm"
                variant={activeAnnotationTool === 'arrow' ? 'default' : 'outline'}
                onClick={() => setActiveAnnotationTool('arrow')}
              >
                <ArrowRight className="w-3 h-3 mr-1" />
                Arrow
              </Button>
              <Button
                size="sm"
                variant={activeAnnotationTool === 'distance' ? 'default' : 'outline'}
                onClick={() => setActiveAnnotationTool('distance')}
              >
                <Ruler className="w-3 h-3 mr-1" />
                Distance
              </Button>
            </div>

            {/* Settings */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Player Tracking</span>
                <Switch
                  checked={showPlayerTracking}
                  onCheckedChange={setShowPlayerTracking}
                />
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Tactical Feedback</span>
                <Switch
                  checked={showTacticalFeedback}
                  onCheckedChange={setShowTacticalFeedback}
                />
              </div>
            </div>

            {/* Tactical Rules */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Active Rules:</div>
              <div className="flex flex-wrap gap-2">
                {tacticalRules.filter(r => r.active).map(rule => (
                  <Badge key={rule.id} variant="outline" className="text-xs">
                    {rule.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setAnnotations([]);
                  toast.success('Annotations cleared');
                }}
              >
                Clear All
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  onAnnotationSave(annotations);
                  toast.success('Annotations saved');
                }}
              >
                Save Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TacticalAnnotationOverlay;
