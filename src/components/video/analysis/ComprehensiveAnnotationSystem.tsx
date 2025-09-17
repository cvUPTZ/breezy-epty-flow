
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Zap, 
  Shield, 
  Target, 
  Flag, 
  ArrowRightLeft,
  Save, 
  Trash2,
  Clock,
  MapPin,
  Activity
} from 'lucide-react';

export interface AnnotationType {
  id: string;
  type: 'formation' | 'pressing' | 'defensive-lines' | 'attacking-patterns' | 'set-pieces' | 'transitions';
  timestamp: number;
  data: any;
  notes?: string;
}

interface ComprehensiveAnnotationSystemProps {
  currentTime: number;
  annotations: AnnotationType[];
  onAnnotationSave: (annotation: AnnotationType) => void;
  onAnnotationDelete: (id: string) => void;
  drawingMode: boolean;
}

export const ComprehensiveAnnotationSystem: React.FC<ComprehensiveAnnotationSystemProps> = ({
  currentTime,
  annotations,
  onAnnotationSave,
  onAnnotationDelete,
  drawingMode
}) => {
  const [activeAnnotationType, setActiveAnnotationType] = useState<AnnotationType['type']>('formation');
  const [notes, setNotes] = useState('');
  const [formationData, setFormationData] = useState({
    homeFormation: '4-4-2',
    awayFormation: '4-3-3',
    tacticalChange: false
  });

  const annotationTypes = [
    {
      id: 'formation',
      label: 'Formation Mapping',
      icon: Users,
      color: 'bg-blue-500',
      description: 'Team structure and player positioning'
    },
    {
      id: 'pressing',
      label: 'Pressing Triggers',
      icon: Zap,
      color: 'bg-red-500',
      description: 'Coordinated high pressing moments'
    },
    {
      id: 'defensive-lines',
      label: 'Defensive Lines',
      icon: Shield,
      color: 'bg-green-500',
      description: 'Defensive line positioning and movement'
    },
    {
      id: 'attacking-patterns',
      label: 'Attacking Patterns',
      icon: Target,
      color: 'bg-orange-500',
      description: 'Offensive movements and sequences'
    },
    {
      id: 'set-pieces',
      label: 'Set Pieces',
      icon: Flag,
      color: 'bg-purple-500',
      description: 'Dead ball situations'
    },
    {
      id: 'transitions',
      label: 'Transition Moments',
      icon: ArrowRightLeft,
      color: 'bg-yellow-500',
      description: 'Possession change moments'
    }
  ];

  const handleSaveAnnotation = useCallback(() => {
    const annotation: AnnotationType = {
      id: Date.now().toString(),
      type: activeAnnotationType,
      timestamp: currentTime,
      data: getAnnotationData(),
      notes
    };

    onAnnotationSave(annotation);
    setNotes('');
  }, [activeAnnotationType, currentTime, notes, onAnnotationSave]);

  const getAnnotationData = () => {
    switch (activeAnnotationType) {
      case 'formation':
        return formationData;
      case 'pressing':
        return { intensity: 'high', playersInvolved: 4, success: true };
      case 'defensive-lines':
        return { height: 'medium', compactness: 'tight', movement: 'push-up' };
      case 'attacking-patterns':
        return { pattern: 'overlap', players: 3, outcome: 'chance-created' };
      case 'set-pieces':
        return { type: 'corner', delivery: 'in-swinger', outcome: 'cleared' };
      case 'transitions':
        return { type: 'turnover', speed: 'fast', outcome: 'counter-attack' };
      default:
        return {};
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnnotationColor = (type: AnnotationType['type']) => {
    return annotationTypes.find(t => t.id === type)?.color || 'bg-gray-500';
  };

  const getAnnotationIcon = (type: AnnotationType['type']) => {
    const annotationType = annotationTypes.find(t => t.id === type);
    return annotationType?.icon || Activity;
  };

  if (!drawingMode) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Tactical Annotation System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeAnnotationType} onValueChange={(value) => setActiveAnnotationType(value as AnnotationType['type'])}>
          <TabsList className="grid grid-cols-6 w-full mb-4">
            {annotationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline text-xs">{type.label.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {annotationTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                <div>
                  <h3 className="font-medium">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>

              {/* Annotation-specific controls */}
              {type.id === 'formation' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Home Formation</label>
                    <Input
                      value={formationData.homeFormation}
                      onChange={(e) => setFormationData(prev => ({ ...prev, homeFormation: e.target.value }))}
                      placeholder="e.g., 4-4-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Away Formation</label>
                    <Input
                      value={formationData.awayFormation}
                      onChange={(e) => setFormationData(prev => ({ ...prev, awayFormation: e.target.value }))}
                      placeholder="e.g., 4-3-3"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Add notes about this ${type.label.toLowerCase()}...`}
                  rows={3}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Current time: {formatTime(currentTime)}</span>
                </div>
                <Button onClick={handleSaveAnnotation} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Annotation
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Saved Annotations List */}
        <div className="mt-6">
          <h3 className="font-medium mb-3">Saved Annotations ({annotations.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {annotations.map((annotation) => {
              const Icon = getAnnotationIcon(annotation.type);
              return (
                <div key={annotation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getAnnotationColor(annotation.type)} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{formatTime(annotation.timestamp)}</Badge>
                        <span className="font-medium capitalize">
                          {annotation.type.replace('-', ' ')}
                        </span>
                      </div>
                      {annotation.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{annotation.notes}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAnnotationDelete(annotation.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
            {annotations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p>No annotations saved yet</p>
                <p className="text-sm">Start annotating tactical moments in the video</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
