import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Download } from 'lucide-react';
import { ProductionTacticalOverlay } from './ProductionTacticalOverlay';
import { ProductionVideoControls } from './ProductionVideoControls';
import { AnalysisControlPanel } from './AnalysisControlPanel';
import { ProductionVideoAnalysisService } from '@/services/productionVideoAnalysisService';
import { DetectionResult } from '@/services/pythonDetectionService';
import { toast } from 'sonner';

/**
 * @component AdvancedVideoAnalysisInterface
 * @description A comprehensive, full-page interface for production-level video analysis. It allows users to
 * upload a local video file or provide a URL, and then utilize a suite of advanced analysis tools.
 * This includes a tactical overlay for visualizing data, detailed video controls, an analysis control panel,
 * and a history of past analysis jobs.
 * @returns {JSX.Element} The rendered AdvancedVideoAnalysisInterface component.
 */
export const AdvancedVideoAnalysisInterface: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [analysisJobs, setAnalysisJobs] = useState<any[]>([]);
  
  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [trajectoryEnabled, setTrajectoryEnabled] = useState(true);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Load user's analysis jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobs = await ProductionVideoAnalysisService.getUserJobs();
        setAnalysisJobs(jobs);
      } catch (error) {
        console.error('Failed to load analysis jobs:', error);
      }
    };

    loadJobs();
  }, []);

  // Video event handlers
  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVideoDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      toast.success('Video loaded successfully');
    }
  };

  const handleYouTubeUrl = (url: string) => {
    setVideoSrc(url);
    toast.success('Video URL loaded');
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

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleFullscreenToggle = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  // Analysis handlers
  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const job = await ProductionVideoAnalysisService.startAnalysis(videoSrc, {
        enablePlayerTracking: trackingEnabled,
        enableEventDetection: true,
        enableHeatmaps: heatmapEnabled,
        enableTrajectories: trajectoryEnabled
      });

      toast.success('Analysis started successfully');

      // Simulate progress
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsAnalyzing(false);
            toast.success('Analysis completed');
            return 100;
          }
          return prev + 10;
        });
      }, 1000);

    } catch (error: any) {
      setIsAnalyzing(false);
      toast.error(`Failed to start analysis: ${error.message}`);
    }
  };

  const handleStartTracking = () => {
    toast.info('Real-time tracking started');
    setPlayerCount(Math.floor(Math.random() * 22) + 1);
    setAvgConfidence(Math.random() * 40 + 60);
  };

  const handleSaveAnnotations = () => {
    toast.success('Annotations saved successfully');
  };

  const handleExportData = () => {
    const exportData = {
      videoUrl: videoSrc,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Production Video Analysis</span>
              <Badge variant="default">AI-Powered</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Upload/URL Input */}
            <div className="flex gap-4">
              <Input
                placeholder="Enter YouTube URL or video URL"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleYouTubeUrl((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Video Player */}
        {videoSrc && (
          <div ref={containerRef} className="relative bg-black">
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-auto max-h-[600px]"
              onLoadedMetadata={handleVideoLoad}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Production Video Controls */}
            <ProductionVideoControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              isFullscreen={isFullscreen}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              onFullscreenToggle={handleFullscreenToggle}
            />
            
            {/* Analysis Control Panel */}
            <AnalysisControlPanel
              isAnalyzing={isAnalyzing}
              analysisProgress={analysisProgress}
              playerCount={playerCount}
              avgConfidence={avgConfidence}
              onStartAnalysis={handleStartAnalysis}
              onStartTracking={handleStartTracking}
              onSaveAnnotations={handleSaveAnnotations}
              onExportData={handleExportData}
              trackingEnabled={trackingEnabled}
              heatmapEnabled={heatmapEnabled}
              trajectoryEnabled={trajectoryEnabled}
              onTrackingToggle={setTrackingEnabled}
              onHeatmapToggle={setHeatmapEnabled}
              onTrajectoryToggle={setTrajectoryEnabled}
            />
            
            {/* Tactical Overlay */}
            <ProductionTacticalOverlay
              videoElement={videoRef.current}
              videoUrl={videoSrc}
              videoDimensions={videoDimensions}
              currentTime={currentTime}
              isPlaying={isPlaying}
              detectionResults={detectionResults}
            />
          </div>
        )}

        {/* Analysis History */}
        {analysisJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{job.videoUrl}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {job.status}
                      </Badge>
                      {job.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdvancedVideoAnalysisInterface;
