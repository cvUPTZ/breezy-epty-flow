
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Square, ArrowRight, Ruler, Focus, MousePointer, PenTool, PenOff } from 'lucide-react';

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
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select', color: 'bg-gray-500' },
    { id: 'circle', icon: Circle, label: 'Circle', color: 'bg-blue-500' },
    { id: 'line', icon: Square, label: 'Line', color: 'bg-green-500' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow', color: 'bg-purple-500' },
    { id: 'distance', icon: Ruler, label: 'Distance', color: 'bg-red-500' },
    { id: 'spotlight', icon: Focus, label: 'Spotlight', color: 'bg-yellow-500' },
  ];

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
      <div className="pointer-events-auto">
        <Card className="bg-black/70 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              {/* Drawing Mode Toggle */}
              <Button
                size="sm"
                variant={drawingMode ? 'default' : 'outline'}
                onClick={onDrawingModeToggle}
                className={`
                  h-8 px-3 transition-all duration-200
                  ${drawingMode 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }
                `}
                title={drawingMode ? 'Disable Drawing Mode' : 'Enable Drawing Mode'}
              >
                {drawingMode ? <PenTool className="w-4 h-4 mr-1" /> : <PenOff className="w-4 h-4 mr-1" />}
                <span className="text-xs">{drawingMode ? 'Draw' : 'View'}</span>
              </Button>
              
              <div className="w-px h-6 bg-white/20" />
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={violationCount > 0 ? "destructive" : "default"}
                  className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-2 py-0"
                >
                  {violationCount}
                </Badge>
              </div>
              
              {/* Drawing Tools - only show when drawing mode is enabled */}
              {drawingMode && (
                <>
                  <div className="w-px h-6 bg-white/20" />
                  <div className="flex gap-1">
                    {tools.map((tool) => (
                      <Button
                        key={tool.id}
                        size="sm"
                        variant={activeAnnotationTool === tool.id ? 'default' : 'outline'}
                        onClick={() => onToolChange(tool.id)}
                        className={`
                          h-8 w-8 p-0 transition-all duration-200
                          ${activeAnnotationTool === tool.id 
                            ? `${tool.color} text-white shadow-lg` 
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                          }
                        `}
                        title={tool.label}
                      >
                        <tool.icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </>
              )}

              <div className="w-px h-6 bg-white/20" />
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onClearAll}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 px-2 text-xs"
                >
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  onClick={onSaveAnalysis}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-2 text-xs"
                >
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
