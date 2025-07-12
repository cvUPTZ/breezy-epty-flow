
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, SkipBack, SkipForward, Maximize, Volume2, Settings, MapPin, Pencil, Eraser } from 'lucide-react';
import { VideoPlayerControls } from './VideoPlayerControls';
import EventTaggingSection from './EventTaggingSection';
import { AnnotationToolbox } from './AnnotationToolbox';
import EnhancedVideoPlayer, { VideoPlayerRef } from '../EnhancedVideoPlayer';
import { toast } from 'sonner';

interface AnalysisEvent {
  id: string;
  timestamp: number;
  type: string;
  title: string;
  description?: string;
  color: string;
}

interface AnnotationData {
  id: string;
  timestamp: number;
  type: 'circle' | 'rectangle' | 'arrow' | 'text';
  data: any;
}

interface AdvancedVideoAnalysisInterfaceProps {
  videoUrl: string;
}

const MOCK_EVENTS: AnalysisEvent[] = [
  { id: '1', timestamp: 15, type: 'goal', title: 'Goal', description: 'Player A scores', color: '#22c55e' },
  { id: '2', timestamp: 45, type: 'foul', title: 'Foul', description: 'Yellow card for Player B', color: '#eab308' },
  { id: '3', timestamp: 67, type: 'substitution', title: 'Substitution', description: 'Player C out, Player D in', color: '#3b82f6' },
  { id: '4', timestamp: 89, type: 'corner', title: 'Corner Kick', description: 'Corner awarded to home team', color: '#8b5cf6' },
];

export const AdvancedVideoAnalysisInterface: React.FC<AdvancedVideoAnalysisInterfaceProps> = ({ videoUrl }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [events, setEvents] = useState<AnalysisEvent[]>(MOCK_EVENTS);
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
  const [selectedAnnotationTool, setSelectedAnnotationTool] = useState<'none' | 'circle' | 'rectangle' | 'arrow' | 'text'>('none');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');

  const videoRef = useRef<VideoPlayerRef>(null);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleDurationChange = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handlePlaybackRateChange = (rate: string) => {
    const newRate = parseFloat(rate);
    setPlaybackRate(newRate);
    if (videoRef.current && videoRef.current.playbackRate !== undefined) {
      videoRef.current.playbackRate = newRate;
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (videoRef.current && videoRef.current.volume !== undefined) {
      videoRef.current.volume = vol;
    }
  };

  const handleEventClick = (event: AnalysisEvent) => {
    handleSeek(event.timestamp);
    toast.info(`Jumped to ${event.title} at ${formatTime(event.timestamp)}`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEventMarkerPosition = (timestamp: number): number => {
    return duration > 0 ? (timestamp / duration) * 100 : 0;
  };

  const filteredEvents = selectedEventType === 'all' 
    ? events 
    : events.filter(event => event.type === selectedEventType);

  const eventTypes = [...new Set(events.map(event => event.type))];

  return (
    <div className="w-full space-y-6">
      {/* Video Player Section */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <EnhancedVideoPlayer
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              className="w-full aspect-video"
            />
            
            {/* Annotation Overlay */}
            {showAnnotations && (
              <div className="absolute inset-0 pointer-events-none">
                {annotations
                  .filter(ann => Math.abs(ann.timestamp - currentTime) < 1)
                  .map(annotation => (
                    <div key={annotation.id} className="absolute">
                      {/* Render annotation based on type */}
                      {annotation.type === 'circle' && (
                        <div 
                          className="border-2 border-red-500 rounded-full"
                          style={{
                            left: annotation.data.x,
                            top: annotation.data.y,
                            width: annotation.data.radius * 2,
                            height: annotation.data.radius * 2,
                          }}
                        />
                      )}
                      {annotation.type === 'text' && (
                        <div 
                          className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm"
                          style={{
                            left: annotation.data.x,
                            top: annotation.data.y,
                          }}
                        >
                          {annotation.data.text}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline with Event Markers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Timeline & Events</span>
            <div className="flex items-center gap-2">
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline Slider with Event Markers */}
          <div className="relative">
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={(value) => handleSeek(value[0])}
              className="w-full"
            />
            
            {/* Event Markers on Timeline */}
            <div className="absolute top-0 left-0 w-full h-6 pointer-events-none">
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  className="absolute top-0 w-1 h-6 cursor-pointer pointer-events-auto"
                  style={{
                    left: `${getEventMarkerPosition(event.timestamp)}%`,
                    backgroundColor: event.color,
                  }}
                  onClick={() => handleEventClick(event)}
                  title={`${event.title} - ${formatTime(event.timestamp)}`}
                />
              ))}
            </div>
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Event List */}
          <div className="flex flex-wrap gap-2">
            {filteredEvents.map(event => (
              <Badge
                key={event.id}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                style={{ borderColor: event.color }}
                onClick={() => handleEventClick(event)}
              >
                {event.title} - {formatTime(event.timestamp)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Playback Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Playback Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" onClick={() => handleSeek(Math.max(0, currentTime - 10))}>
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button onClick={handlePlayPause} size="lg">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSeek(Math.min(duration, currentTime + 10))}>
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Playback Speed</label>
              <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25x</SelectItem>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm font-medium">Volume</span>
              </div>
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Annotation Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Annotation Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedAnnotationTool === 'circle' ? 'default' : 'outline'}
                onClick={() => setSelectedAnnotationTool('circle')}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 border-2 border-current rounded-full" />
                Circle
              </Button>
              <Button
                variant={selectedAnnotationTool === 'rectangle' ? 'default' : 'outline'}
                onClick={() => setSelectedAnnotationTool('rectangle')}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-3 border-2 border-current" />
                Rectangle
              </Button>
              <Button
                variant={selectedAnnotationTool === 'arrow' ? 'default' : 'outline'}
                onClick={() => setSelectedAnnotationTool('arrow')}
                className="flex items-center gap-2"
              >
                →
                Arrow
              </Button>
              <Button
                variant={selectedAnnotationTool === 'text' ? 'default' : 'outline'}
                onClick={() => setSelectedAnnotationTool('text')}
                className="flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Text
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                {showAnnotations ? 'Hide' : 'Show'} Annotations
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnnotations([])}
              >
                <Eraser className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Match Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">Event Timeline</TabsTrigger>
              <TabsTrigger value="heatmap">Player Heatmap</TabsTrigger>
              <TabsTrigger value="stats">Live Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {eventTypes.map(type => {
                  const count = events.filter(e => e.type === type).length;
                  return (
                    <div key={type} className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm capitalize">{type}s</div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="heatmap">
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Player heatmap visualization would go here</span>
              </div>
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Home Team</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Possession</span>
                      <span>58%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shots</span>
                      <span>12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passes</span>
                      <span>342</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Away Team</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Possession</span>
                      <span>42%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shots</span>
                      <span>8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passes</span>
                      <span>278</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
