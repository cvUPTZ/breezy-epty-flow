
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings } from 'lucide-react';
import { VideoPlayerControls } from './VideoPlayerControls';
import EventTaggingSection from './EventTaggingSection';
import { AnnotationToolbox } from './AnnotationToolbox';
import TacticalAnnotationOverlay from './TacticalAnnotationOverlay';
import PlayerTrackingService from './PlayerTrackingService';
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

interface PlayerPosition {
  id: string;
  x: number;
  y: number;
  team: 'home' | 'away';
  jerseyNumber?: number;
  isCorrectPosition?: boolean;
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
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>([]);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

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

  const handleTrackingData = useCallback((trackingData: any[]) => {
    // Convert tracking data to player positions
    const positions: PlayerPosition[] = trackingData.map(data => ({
      id: data.playerId,
      x: data.position.x,
      y: data.position.y,
      team: data.team,
      jerseyNumber: data.jerseyNumber,
      isCorrectPosition: Math.random() > 0.3 // Mock tactical analysis
    }));
    setPlayerPositions(positions);
  }, []);

  const handleAnalysisUpdate = useCallback((analysis: any) => {
    // Handle analysis updates from the tracking service
    console.log('Analysis update:', analysis);
  }, []);

  const handleAnnotationSave = useCallback((annotations: any[]) => {
    console.log('Annotations saved:', annotations);
    toast.success('Tactical annotations saved successfully');
  }, []);

  // Update video dimensions when video loads
  useEffect(() => {
    const updateDimensions = () => {
      if (videoRef.current) {
        const video = videoRef.current as any;
        if (video.videoWidth && video.videoHeight) {
          setVideoDimensions({
            width: 640, // Standard player width
            height: 360  // Standard player height
          });
        }
      }
    };

    const timer = setTimeout(updateDimensions, 1000);
    return () => clearTimeout(timer);
  }, [videoUrl]);

  // Start tracking when video plays
  useEffect(() => {
    setIsTrackingActive(isPlaying);
  }, [isPlaying]);

  return (
    <div className="w-full space-y-6">
      {/* Video Player Section with Overlays */}
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
            
            {/* Tactical Annotation Overlay */}
            <TacticalAnnotationOverlay
              videoDimensions={videoDimensions}
              currentTime={currentTime}
              onAnnotationSave={handleAnnotationSave}
              playerPositions={playerPositions}
            />
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

      {/* Control Panel and AI Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* AI Player Tracking */}
        <PlayerTrackingService
          videoUrl={videoUrl}
          currentTime={currentTime}
          isTracking={isTrackingActive}
          onTrackingData={handleTrackingData}
          onAnalysisUpdate={handleAnalysisUpdate}
        />

        {/* Quick Analysis Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" size="sm">
              Analyze Formation
            </Button>
            <Button className="w-full" size="sm" variant="outline">
              Check Offside
            </Button>
            <Button className="w-full" size="sm" variant="outline">
              Measure Distances
            </Button>
            <Button className="w-full" size="sm" variant="outline">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Visualization Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Match Analysis & Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tracking" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tracking">Player Tracking</TabsTrigger>
              <TabsTrigger value="tactical">Tactical Analysis</TabsTrigger>
              <TabsTrigger value="heatmap">Heatmaps</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracking" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{playerPositions.length}</div>
                  <div className="text-sm">Players Tracked</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">24.3</div>
                  <div className="text-sm">Avg Speed (km/h)</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tactical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-lg font-bold text-green-700">Formation Stability</div>
                  <div className="text-2xl font-bold text-green-600">87%</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-lg font-bold text-yellow-700">Compactness</div>
                  <div className="text-2xl font-bold text-yellow-600">72%</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-lg font-bold text-red-700">Violations</div>
                  <div className="text-2xl font-bold text-red-600">3</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="heatmap">
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Player movement heatmaps will be displayed here</span>
              </div>
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Team Performance</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Possession</span>
                      <span>58%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pass Accuracy</span>
                      <span>84%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance Covered</span>
                      <span>89.2 km</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Tactical Metrics</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Formation Discipline</span>
                      <span>Good</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pressing Intensity</span>
                      <span>High</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Width Usage</span>
                      <span>Optimal</span>
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
