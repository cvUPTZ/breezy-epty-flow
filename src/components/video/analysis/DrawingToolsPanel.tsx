
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Square, ArrowRight, Ruler, Search, MousePointer, PenTool, PenOff, Zap, Triangle, Users, Shield, Target, Flag, ArrowRightLeft } from 'lucide-react';

interface DrawingToolsPanelProps {
  activeAnnotationTool: string;
  onToolChange: (tool: string) => void;
  onClearAll: () => void;
  onSaveAnalysis: () => void;
  violationCount: number;
  drawingMode: boolean;
  onDrawingModeToggle: () => void;
}

export const DrawingToolsPanel: React.FC<DrawingToolsPanelProps> = ({
  activeAnnotationTool,
  onToolChange,
  onClearAll,
  onSaveAnalysis,
  violationCount,
  drawingMode,
  onDrawingModeToggle
}) => {
  const basicTools = [
    { id: 'select', icon: MousePointer, label: 'Select', color: 'bg-gray-500' },
    { id: 'circle', icon: Circle, label: 'Circle', color: 'bg-blue-500' },
    { id: 'line', icon: Square, label: 'Line', color: 'bg-green-500' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow', color: 'bg-purple-500' },
    { id: 'distance', icon: Ruler, label: 'Distance', color: 'bg-red-500' },
    { id: 'spotlight', icon: Search, label: 'Spotlight', color: 'bg-yellow-500' },
    { id: 'ellipse-light', icon: Zap, label: 'Light Zone', color: 'bg-orange-500' },
    { id: 'cone', icon: Triangle, label: 'Cone', color: 'bg-pink-500' },
  ];

  const tacticalTools = [
    { id: 'formation', icon: Users, label: 'Formation', color: 'bg-blue-600' },
    { id: 'pressing', icon: Zap, label: 'Pressing', color: 'bg-red-600' },
    { id: 'defensive-lines', icon: Shield, label: 'Defense', color: 'bg-green-600' },
    { id: 'attacking-patterns', icon: Target, label: 'Attack', color: 'bg-orange-600' },
    { id: 'set-pieces', icon: Flag, label: 'Set Piece', color: 'bg-purple-600' },
    { id: 'transitions', icon: ArrowRightLeft, label: 'Transition', color: 'bg-yellow-600' },
  ];

  const handleToolSelect = (toolId: string) => {
    if (!drawingMode && toolId !== 'select') {
      onDrawingModeToggle();
    }
    onToolChange(toolId);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
      <Card className="bg-black/90 backdrop-blur-md border-white/20 text-white shadow-2xl">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Drawing Mode Toggle */}
            <Button
              size="sm"
              variant={drawingMode ? 'default' : 'outline'}
              onClick={onDrawingModeToggle}
              className={`
                h-10 px-4 transition-all duration-300 font-medium
                ${drawingMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-blue-500' 
                  : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40'
                }
              `}
              title={drawingMode ? 'Disable Drawing Mode' : 'Enable Drawing Mode'}
            >
              {drawingMode ? <PenTool className="w-4 h-4 mr-2" /> : <PenOff className="w-4 h-4 mr-2" />}
              <span className="text-sm">{drawingMode ? 'Drawing' : 'Viewing'}</span>
            </Button>
            
            <div className="w-px h-8 bg-white/20" />
            
            {/* Violations Counter */}
            <div className="flex items-center gap-2">
              <Badge 
                variant={violationCount > 0 ? "destructive" : "default"}
                className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-3 py-1"
              >
                {violationCount} Issues
              </Badge>
            </div>
            
            {/* Drawing Tools - only show when drawing mode is enabled */}
            {drawingMode && (
              <>
                <div className="w-px h-8 bg-white/20" />
                
                {/* Basic Drawing Tools */}
                <div className="flex gap-1">
                  {basicTools.map((tool) => (
                    <Button
                      key={tool.id}
                      size="sm"
                      variant={activeAnnotationTool === tool.id ? 'default' : 'outline'}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`
                        h-10 w-10 p-0 transition-all duration-200 relative
                        ${activeAnnotationTool === tool.id 
                          ? `${tool.color} text-white shadow-lg ring-2 ring-white/30` 
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30'
                        }
                      `}
                      title={tool.label}
                    >
                      <tool.icon className="w-4 h-4" />
                      {activeAnnotationTool === tool.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full" />
                      )}
                    </Button>
                  ))}
                </div>
                
                <div className="w-px h-8 bg-white/20" />
                
                {/* Tactical Annotation Tools */}
                <div className="flex gap-1">
                  {tacticalTools.map((tool) => (
                    <Button
                      key={tool.id}
                      size="sm"
                      variant={activeAnnotationTool === tool.id ? 'default' : 'outline'}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`
                        h-10 w-10 p-0 transition-all duration-200 relative
                        ${activeAnnotationTool === tool.id 
                          ? `${tool.color} text-white shadow-lg ring-2 ring-white/30` 
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30'
                        }
                      `}
                      title={tool.label}
                    >
                      <tool.icon className="w-4 h-4" />
                      {activeAnnotationTool === tool.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full" />
                      )}
                    </Button>
                  ))}
                </div>
              </>
            )}

            <div className="w-px h-8 bg-white/20" />
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onClearAll}
                disabled={!drawingMode}
                className="bg-white/10 border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/30 h-10 px-3 text-sm transition-all duration-200"
              >
                Clear All
              </Button>
              <Button 
                size="sm" 
                onClick={onSaveAnalysis}
                className="bg-green-600 hover:bg-green-700 text-white h-10 px-3 text-sm transition-all duration-200 shadow-lg"
              >
                Save Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
