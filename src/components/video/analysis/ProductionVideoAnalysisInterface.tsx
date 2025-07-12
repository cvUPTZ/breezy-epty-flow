
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Play, Pause, RotateCcw, Download, Maximize, Volume2, VolumeX } from 'lucide-react';
import { ProductionTacticalOverlay } from './ProductionTacticalOverlay';
import { ProductionVideoAnalysisService } from '@/services/productionVideoAnalysisService';
import { toast } from 'sonner';

export const ProductionVideoAnalysisInterface: React.FC = () => {
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
    // In production, this would use a YouTube downloader service
    setVideoSrc(url);
    toast.success('YouTube video loaded');
  };

  const togglePlayPause = () => {
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newVolume = parseFloat(e.target.value);
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
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

  const toggleFullscreen = () => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <Card>
            <CardContent className="p-0">
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
                
                {/* Custom Video Controls Overlay */}
                <div className={`absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 z-40 ${isFullscreen ? 'z-[10000]' : ''}`}>
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300 transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                    title="Volume"
                  />
                  
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-gray-300 transition-colors ml-2"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    <Maximize size={20} />
                  </button>
                </div>
                
                {/* Tactical Overlay */}
                <ProductionTacticalOverlay
                  videoElement={videoRef.current}
                  videoUrl={videoSrc}
                  videoDimensions={videoDimensions}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                />
              </div>

              {/* Video Controls */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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

export default ProductionVideoAnalysisInterface;
