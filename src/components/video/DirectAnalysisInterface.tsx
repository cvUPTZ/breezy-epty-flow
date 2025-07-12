import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, BarChart3, Download, Upload, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';
import { ProductionTacticalOverlay } from './analysis/ProductionTacticalOverlay';
import { AnalysisControlPanel } from './analysis/AnalysisControlPanel';

interface DirectAnalysisInterfaceProps {
  videoUrl: string;
}

export const DirectAnalysisInterface: React.FC<DirectAnalysisInterfaceProps> = ({ videoUrl }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [analysisStats, setAnalysisStats] = useState({
    playerCount: 22,
    avgConfidence: 87,
    detectedEvents: 45,
    analysisProgress: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleVideoTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleVideoDurationChange = (dur: number) => {
    setDuration(dur);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleVideoDimensionsChange = (dimensions: { width: number; height: number }) => {
    setVideoDimensions(dimensions);
    console.log('Video dimensions updated:', dimensions);
  };

  // Get video element reference when component mounts
  useEffect(() => {
    const video = containerRef.current?.querySelector('video');
    if (video && video !== videoRef.current) {
      videoRef.current = video;
      console.log('Video element reference set:', video);
    }
  }, [videoDimensions]);

  // Update video dimensions when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateDimensions = () => {
        const rect = video.getBoundingClientRect();
        setVideoDimensions({
          width: rect.width,
          height: rect.height
        });
        console.log('Video dimensions from rect:', rect.width, rect.height);
      };

      video.addEventListener('loadedmetadata', updateDimensions);
      video.addEventListener('resize', updateDimensions);
      
      // Initial dimension check
      if (video.readyState >= 2) {
        updateDimensions();
      }

      return () => {
        video.removeEventListener('loadedmetadata', updateDimensions);
        video.removeEventListener('resize', updateDimensions);
      };
    }
  }, [videoRef.current]);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info('Starting video analysis...');
    
    // Simulate analysis progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setAnalysisStats(prev => ({ ...prev, analysisProgress: i }));
    }
    
    setIsAnalyzing(false);
    toast.success('Analysis completed successfully!');
  };

  const handleSaveAnnotations = () => {
    toast.success('Annotations saved successfully!');
  };

  const handleExportData = () => {
    toast.success('Analysis data exported!');
  };

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Analysis</h1>
          <p className="text-muted-foreground">Advanced tactical analysis and annotation tools</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Activity className="w-3 h-3 mr-1" />
            Live Analysis
          </Badge>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Users className="w-3 h-3 mr-1" />
            {analysisStats.playerCount} Players
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="advanced" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Basic Playback
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Advanced Analysis
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Controls
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <EnhancedVideoPlayer
                  src={videoUrl}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onDurationChange={handleVideoDurationChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div ref={containerRef} className="relative bg-black">
                <EnhancedVideoPlayer
                  src={videoUrl}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onDurationChange={handleVideoDurationChange}
                />
                
                {/* Production Tactical Overlay with Drawing Tools */}
                {videoDimensions.width > 0 && videoDimensions.height > 0 && (
                  <ProductionTacticalOverlay
                    videoElement={videoRef.current}
                    videoUrl={videoUrl}
                    videoDimensions={videoDimensions}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Players Detected</p>
                    <p className="font-semibold">{analysisStats.playerCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    <p className="font-semibold">{analysisStats.avgConfidence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Events Detected</p>
                    <p className="font-semibold">{analysisStats.detectedEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Analysis Status</p>
                    <p className="font-semibold">{isAnalyzing ? 'Processing...' : 'Ready'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalysisControlPanel
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onSeek={handleSeek}
              onPlayPause={handlePlayPause}
              isAnalyzing={isAnalyzing}
              analysisProgress={analysisStats.analysisProgress}
              playerCount={analysisStats.playerCount}
              avgConfidence={analysisStats.avgConfidence}
              onStartAnalysis={handleStartAnalysis}
              onSaveAnnotations={handleSaveAnnotations}
              onExportData={handleExportData}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Video
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import Config
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </div>
                
                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analysis Progress</span>
                      <span>{analysisStats.analysisProgress}%</span>
                    </div>
                    <Progress value={analysisStats.analysisProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
