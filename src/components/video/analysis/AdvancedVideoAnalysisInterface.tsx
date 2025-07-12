
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, BarChart3 } from 'lucide-react';
import EnhancedVideoPlayer, { VideoPlayerRef } from '../EnhancedVideoPlayer';
import ProductionTacticalOverlay from './ProductionTacticalOverlay';
import { AnalysisStats } from './AnalysisStats';
import { EventTaggingSection } from './EventTaggingSection';
import { AnalysisControlPanel } from './AnalysisControlPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdvancedVideoAnalysisInterfaceProps {
  videoUrl: string;
}

export const AdvancedVideoAnalysisInterface: React.FC<AdvancedVideoAnalysisInterfaceProps> = ({ 
  videoUrl 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  
  const videoRef = useRef<VideoPlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor video dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (videoRef.current?.videoElement) {
        const video = videoRef.current.videoElement;
        setVideoDimensions({
          width: video.videoWidth || video.offsetWidth,
          height: video.videoHeight || video.offsetHeight
        });
      }
    };

    const interval = setInterval(updateDimensions, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleDurationChange = (duration: number) => {
    setDuration(duration);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current?.videoElement) {
      videoRef.current.videoElement.volume = newVolume / 100;
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current?.videoElement) {
      const newMuted = !isMuted;
      videoRef.current.videoElement.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Monitor fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="w-full">
      {/* Main Video Analysis Container */}
      <div 
        ref={containerRef}
        className={`relative bg-black rounded-lg overflow-hidden ${
          isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'
        }`}
      >
        {/* Enhanced Video Player */}
        <EnhancedVideoPlayer
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          className="w-full h-full"
        />

        {/* Tactical Overlay */}
        <ProductionTacticalOverlay
          videoElement={videoRef.current?.videoElement || null}
          videoUrl={videoUrl}
          videoDimensions={videoDimensions}
          currentTime={currentTime}
          isPlaying={isPlaying}
        />

        {/* Video Controls Overlay - Only show in fullscreen */}
        {isFullscreen && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              {/* Time Display */}
              <span className="text-white text-sm min-w-20">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Progress Slider */}
              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
              </div>

              {/* Volume Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMuteToggle}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              {/* Fullscreen Toggle */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Panels - Only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="mt-6">
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Analysis Controls
              </TabsTrigger>
              <TabsTrigger value="events">
                Event Tagging
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Statistics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="mt-4">
              <AnalysisControlPanel
                currentTime={currentTime}
                duration={duration}
                onSeek={(time: number) => handleSeek([time])}
                onPlayPause={handlePlayPause}
                isPlaying={isPlaying}
              />
            </TabsContent>
            
            <TabsContent value="events" className="mt-4">
              <EventTaggingSection
                currentTime={currentTime}
                videoUrl={videoUrl}
              />
            </TabsContent>
            
            <TabsContent value="stats" className="mt-4">
              <AnalysisStats
                videoUrl={videoUrl}
                currentTime={currentTime}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Basic Video Controls - Only show when not in fullscreen */}
      {!isFullscreen && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <span className="text-sm min-w-20">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMuteToggle}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleFullscreen}
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
