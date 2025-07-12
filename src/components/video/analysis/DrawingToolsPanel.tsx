
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MousePointer, 
  Circle, 
  Minus, 
  ArrowRight, 
  Ruler, 
  Search, 
  TrendingUp,
  Square,
  AlertTriangle,
  Zap,
  Navigation,
  Save,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

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
    // Basic Tools
    { id: 'select', icon: MousePointer, label: 'Select', category: 'basic' },
    { id: 'circle', icon: Circle, label: 'Circle', category: 'basic' },
    { id: 'line', icon: Minus, label: 'Line', category: 'basic' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow', category: 'basic' },
    
    // Measurement
    { id: 'distance', icon: Ruler, label: 'Distance', category: 'measurement' },
    
    // Tactical Analysis
    { id: 'spotlight', icon: Search, label: 'Spotlight', category: 'tactical' },
    { id: 'trajectory', icon: TrendingUp, label: 'Trajectory', category: 'tactical' },
    { id: 'area', icon: Square, label: 'Area', category: 'tactical' },
    
    // Advanced Analysis
    { id: 'offside-line', icon: AlertTriangle, label: 'Offside Line', category: 'advanced' },
    { id: 'pressure-zone', icon: Zap, label: 'Pressure Zone', category: 'advanced' },
    { id: 'passing-lane', icon: Navigation, label: 'Passing Lane', category: 'advanced' },
  ];

  const ToolButton = ({ tool }: { tool: typeof tools[0] }) => {
    const Icon = tool.icon;
    const isActive = activeAnnotationTool === tool.id;
    
    return (
      <Button
        key={tool.id}
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={() => onToolChange(tool.id)}
        className={`flex items-center gap-2 min-w-[100px] ${
          isActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black/20 hover:bg-black/40'
        } text-white border-white/20`}
        title={tool.label}
      >
        <Icon className="w-4 h-4" />
        <span>{tool.label}</span>
      </Button>
    );
  };

  if (!drawingMode) {
    return null;
  }

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
      <div className="bg-black/90 backdrop-blur-md rounded-lg shadow-xl border border-white/20 p-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-semibold">Tactical Analysis Tools</h3>
            {violationCount > 0 && (
              <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                {violationCount} Issues
              </Badge>
            )}
          </div>
          <Button
            onClick={onDrawingModeToggle}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Hide Tools
          </Button>
        </div>

        {/* Tools Grid - Organized by Category */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
          {tools.map(tool => <ToolButton key={tool.id} tool={tool} />)}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-white/20">
          <div className="text-white/70 text-sm">
            Selected: <span className="text-white font-medium">
              {tools.find(t => t.id === activeAnnotationTool)?.label || 'None'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onClearAll}
              variant="outline"
              size="sm"
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button
              onClick={onSaveAnalysis}
              variant="outline"
              size="sm"
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
