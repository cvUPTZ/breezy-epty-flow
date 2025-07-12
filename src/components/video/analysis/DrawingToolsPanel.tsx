
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Square, ArrowRight, Ruler, Target, Zap, MousePointer, Spotlight } from 'lucide-react';

interface DrawingToolsPanelProps {
  activeAnnotationTool: string;
  onToolChange: (tool: string) => void;
  onClearAll: () => void;
  onSaveAnalysis: () => void;
  violationCount: number;
}

export const DrawingToolsPanel: React.FC<DrawingToolsPanelProps> = ({
  activeAnnotationTool,
  onToolChange,
  onClearAll,
  onSaveAnalysis,
  violationCount
}) => {
  const tools = [
    { id: 'circle', icon: Circle, label: 'Circle', color: 'bg-blue-500' },
    { id: 'line', icon: Square, label: 'Line', color: 'bg-green-500' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow', color: 'bg-purple-500' },
    { id: 'distance', icon: Ruler, label: 'Distance', color: 'bg-red-500' },
    { id: 'spotlight', icon: Spotlight, label: 'Spotlight', color: 'bg-yellow-500' },
    { id: 'trajectory', icon: Zap, label: 'Trajectory', color: 'bg-orange-500' },
  ];

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
      <div className="flex justify-center">
        <Card className="bg-black/80 backdrop-blur-md border-white/20 text-white pointer-events-auto max-w-4xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">Tactical Analysis Tools</h3>
                <Badge 
                  variant={violationCount > 0 ? "destructive" : "default"}
                  className="bg-red-500/20 text-red-400 border-red-500/30"
                >
                  {violationCount} Issues
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onClearAll}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Clear All
                </Button>
                <Button 
                  size="sm" 
                  onClick={onSaveAnalysis}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Analysis
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  size="lg"
                  variant={activeAnnotationTool === tool.id ? 'default' : 'outline'}
                  onClick={() => onToolChange(tool.id)}
                  className={`
                    h-16 flex flex-col gap-1 transition-all duration-200
                    ${activeAnnotationTool === tool.id 
                      ? `${tool.color} text-white shadow-lg scale-105` 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105'
                    }
                  `}
                >
                  <tool.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tool.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
