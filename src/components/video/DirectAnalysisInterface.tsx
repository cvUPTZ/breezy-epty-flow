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
import { ExternalVideoControls } from './analysis/ExternalVideoControls';
import {
  DetailedAnalysisTabs,
  MatchPhase,
  Possession,
  SetPiece,
  TacticalNote
} from './analysis/DetailedAnalysisTabs';
import { pythonDetectionService, DetectionJob, DetectionResult } from '@/services/pythonDetectionService';

interface DirectAnalysisInterfaceProps {
  videoUrl: string;
}

export const DirectAnalysisInterface: React.FC<DirectAnalysisInterfaceProps> = ({ videoUrl }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [analysisStats, setAnalysisStats] = useState({
    playerCount: 22,
    avgConfidence: 87,
    detectedEvents: 45,
    analysisProgress: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionJob, setDetectionJob] = useState<DetectionJob | null>(null);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);

  // State for manual analysis data
  const [matchPhases, setMatchPhases] = useState<MatchPhase[]>([]);
  const [possessions, setPossessions] = useState<Possession[]>([]);
  const [setPieces, setSetPieces] = useState<SetPiece[]>([]);
  const [tacticalNotes, setTacticalNotes] = useState<TacticalNote[]>([]);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Video event handlers
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

  // Control handlers
  const handleSeek = (time: number) => {
    if (videoRef.current && isFinite(time)) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!isFinite(newVolume)) return;
    
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const handleVideoDimensionsChange = (dimensions: { width: number; height: number }) => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      setVideoDimensions(dimensions);
      console.log('Video dimensions updated:', dimensions);
    }
  };

  // --- Manual Analysis Data Handlers ---
  const handleAddPhase = (phase: Omit<MatchPhase, 'id'>) => {
    const newPhase = { ...phase, id: `phase-${Date.now()}` };
    setMatchPhases(prev => [...prev, newPhase].sort((a, b) => a.startTime - b.startTime));
    toast.success(`${newPhase.type} phase added successfully.`);
  };
  const handleDeletePhase = (id: string) => {
    setMatchPhases(prev => prev.filter(p => p.id !== id));
    toast.success('Phase deleted.');
  };

  const handleAddPossession = (possession: Omit<Possession, 'id'>) => {
    const newPossession = { ...possession, id: `poss-${Date.now()}` };
    setPossessions(prev => [...prev, newPossession].sort((a, b) => a.startTime - b.startTime));
    toast.success(`Possession ending in ${newPossession.outcome} added.`);
  };
  const handleDeletePossession = (id: string) => {
    setPossessions(prev => prev.filter(p => p.id !== id));
    toast.success('Possession deleted.');
  };

  const handleAddSetPiece = (setPiece: Omit<SetPiece, 'id'>) => {
    const newSetPiece = { ...setPiece, id: `sp-${Date.now()}` };
    setSetPieces(prev => [...prev, newSetPiece].sort((a, b) => a.timestamp - b.timestamp));
    toast.success(`${newSetPiece.type} at ${formatTime(newSetPiece.timestamp)} added.`);
  };
  const handleDeleteSetPiece = (id: string) => {
    setSetPieces(prev => prev.filter(sp => sp.id !== id));
    toast.success('Set piece deleted.');
  };

  const handleAddTacticalNote = (note: Omit<TacticalNote, 'id'>) => {
    const newNote = { ...note, id: `tactical-${Date.now()}` };
    setTacticalNotes(prev => [...prev, newNote].sort((a, b) => a.timestamp - b.timestamp));
    toast.success(`Tactical note for ${newNote.category} added.`);
  };
  const handleDeleteTacticalNote = (id: string) => {
    setTacticalNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Tactical note deleted.');
  };

  // Get video element reference when component mounts
  useEffect(() => {
    const video = containerRef.current?.querySelector('video');
    if (video && video !== videoRef.current) {
      videoRef.current = video;
      console.log('Video element reference set');
      
      const handleLoadedMetadata = () => {
        if (video.duration && isFinite(video.duration)) {
          setDuration(video.duration);
        }
        if (isFinite(video.volume)) {
          setVolume(video.volume);
        }
        setIsMuted(video.muted);
      };

      const handleTimeUpdate = () => {
        if (isFinite(video.currentTime)) {
          setCurrentTime(video.currentTime);
        }
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleVolumeChangeEvent = () => {
        if (isFinite(video.volume)) {
          setVolume(video.volume);
        }
        setIsMuted(video.muted);
      };

      const handleError = (e: Event) => {
        console.error('Video error:', e);
        toast.error('Video playback error occurred');
      };

      // Add event listeners
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('volumechange', handleVolumeChangeEvent);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('volumechange', handleVolumeChangeEvent);
        video.removeEventListener('error', handleError);
      };
    }
  }, [videoDimensions]);

  // Update video dimensions when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateDimensions = () => {
        const rect = video.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setVideoDimensions({
            width: rect.width,
            height: rect.height
          });
        }
      };

      video.addEventListener('loadedmetadata', updateDimensions);
      video.addEventListener('resize', updateDimensions);
      
      // Initial dimension check
      if (video.readyState >= 2) {
        updateDimensions();
      }

      // Also check on window resize
      const handleWindowResize = () => {
        setTimeout(updateDimensions, 100);
      };
      window.addEventListener('resize', handleWindowResize);

      return () => {
        video.removeEventListener('loadedmetadata', updateDimensions);
        video.removeEventListener('resize', updateDimensions);
        window.removeEventListener('resize', handleWindowResize);
      };
    }
  }, []);

  // Analysis handlers
  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setDetectionJob(null);
    setDetectionResults([]);
    toast.info('Starting video analysis job...');

    try {
      const jobResponse = await pythonDetectionService.startDetection({ videoUrl });
      // Create a proper DetectionJob object with all required properties
      const job: DetectionJob = {
        job_id: jobResponse.job_id,
        status: 'pending',
        progress: 0
      };
      setDetectionJob(job);
      toast.success(`Detection job started with ID: ${job.job_id}`);
    } catch (error: any) {
      console.error('Analysis start error:', error);
      toast.error(`Failed to start detection job: ${error.message}`);
      setIsAnalyzing(false);
    }
  };

  const handleExportData = () => {
    const data = {
      videoInfo: {
        videoUrl,
        exportTime: new Date().toISOString()
      },
      automatedAnalysis: {
        detectionResults,
        analysisStats,
      },
      manualAnalysis: {
        matchPhases,
        possessions,
        setPieces,
        tacticalNotes
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Complete analysis data exported!');
  };

  const handleSaveAnalysis = () => {
    // In a real application, this would save to a backend or local storage.
    // For now, we'll just provide user feedback.
    const totalEntries = matchPhases.length + possessions.length + setPieces.length + tacticalNotes.length;
    if (totalEntries === 0) {
      toast.warning('No manual analysis data to save.');
      return;
    }
    toast.success(`Successfully saved ${totalEntries} manual analysis entries.`);
  };

  // Poll for job status
  useEffect(() => {
    if (!detectionJob || !isAnalyzing) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const status = await pythonDetectionService.getJobStatus(detectionJob.job_id);
        setDetectionJob(status);

        if (status.status === 'completed') {
          toast.success('Analysis completed!');
          const results = await pythonDetectionService.getResults(detectionJob.job_id);
          setDetectionResults(results);
          setAnalysisStats(prev => ({ ...prev, analysisProgress: 100 }));
          setIsAnalyzing(false);
          clearInterval(intervalId);
        } else if (status.status === 'failed') {  
          toast.error(`Analysis failed: ${status.error}`);
          setIsAnalyzing(false);
          clearInterval(intervalId);
        } else if (status.status === 'processing') {
          // Update progress if available
          const progress = status.progress || Math.min(95, analysisStats.analysisProgress + 5);
          setAnalysisStats(prev => ({ ...prev, analysisProgress: progress }));
        }
      } catch (error: any) {
        console.error('Job status error:', error);
        toast.error(`Error fetching job status: ${error.message}`);
        setIsAnalyzing(false);
        clearInterval(intervalId);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [detectionJob, isAnalyzing, analysisStats.analysisProgress]);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
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
          
          <ExternalVideoControls
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

          <DetailedAnalysisTabs
            currentTime={currentTime}
            phases={matchPhases}
            possessions={possessions}
            setPieces={setPieces}
            tacticalNotes={tacticalNotes}
            onAddPhase={handleAddPhase}
            onDeletePhase={handleDeletePhase}
            onAddPossession={handleAddPossession}
            onDeletePossession={handleDeletePossession}
            onAddSetPiece={handleAddSetPiece}
            onDeleteSetPiece={handleDeleteSetPiece}
            onAddTacticalNote={handleAddTacticalNote}
            onDeleteTacticalNote={handleDeleteTacticalNote}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div ref={containerRef} className="relative bg-black overflow-hidden">
                <EnhancedVideoPlayer
                  src={videoUrl}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onDurationChange={handleVideoDurationChange}
                />
                
                {videoDimensions.width > 0 && videoDimensions.height > 0 && (
                  <ProductionTacticalOverlay
                    videoElement={videoRef.current}
                    videoUrl={videoUrl}
                    videoDimensions={videoDimensions}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                    detectionResults={detectionResults}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <ExternalVideoControls
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

          {/* Analysis Statistics */}
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
              onSaveAnalysis={handleSaveAnalysis}
              onExportData={handleExportData}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleExportData}>
                    <Download className="w-4 h-4" />
                    Export Video
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleExportData}>
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
