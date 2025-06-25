import React, { useState, useRef, useEffect } from 'react';
import { YouTubePlayer, YouTubePlayerInstance } from './YouTubePlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Play, Square, Eye, EyeOff, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { ProcessedDetectionResult } from '@/services/roboflowDetectionService';
import { ProductionDetectionService, ServerDetectionResult } from '@/services/productionDetectionService';

interface YouTubePlayerWithDetectionProps {
  videoId: string;
  matchId: string;
  isAdmin: boolean;
  onPlayerReady?: (player: YouTubePlayerInstance) => void;
  onStateChange?: (event: any) => void;
  onDetectionResults?: (results: ProcessedDetectionResult[]) => void;
}

export const YouTubePlayerWithDetection: React.FC<YouTubePlayerWithDetectionProps> = ({
  videoId,
  matchId,
  isAdmin,
  onPlayerReady,
  onStateChange,
  onDetectionResults
}) => {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ServerDetectionResult[]>([]);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showDetectionControls, setShowDetectionControls] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  
  // Detection configuration
  const [frameRate, setFrameRate] = useState(1);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);

  // Check service status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const isAvailable = await ProductionDetectionService.checkServiceHealth();
      setServiceStatus(isAvailable ? 'online' : 'offline');
    };
    checkStatus();
  }, []);

  const handlePlayerReady = (player: YouTubePlayerInstance) => {
    playerRef.current = player;
    if (onPlayerReady) {
      onPlayerReady(player);
    }
  };

  const startServerSideDetection = async () => {
    if (!playerRef.current) {
      toast.error('Player not ready');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      console.log('Starting server-side AI detection...');
      toast.info('Starting server-side AI detection...');
      
      // Check service health first
      const isServiceHealthy = await ProductionDetectionService.checkServiceHealth();
      setServiceStatus(isServiceHealthy ? 'online' : 'offline');
      
      if (!isServiceHealthy) {
        throw new Error('AI detection service is currently unavailable. Please try again later.');
      }
      
      // Get the YouTube video URL
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Start the detection job
      const jobId = await ProductionDetectionService.startDetection({
        videoUrl,
        frameRate,
        confidenceThreshold,
        trackPlayers: true,
        trackBall: true,
        maxRetries: 3,
        timeout: 300,
        useSOTAML: true,
        modelType: "yolo11n",
        processingMode: "balanced",
        enableGPU: true,
        batchSize: 8,
        nmsThreshold: 0.4,
        maxDetections: 50
      });

      setCurrentJobId(jobId);
      toast.success(`Detection job started with ID: ${jobId}`);
      
      // Poll for results
      const detectionResults = await ProductionDetectionService.pollJobToCompletion(
        jobId,
        (progressValue) => {
          setProgress(progressValue);
        },
        undefined, // onResult callback
        30 // max wait 30 minutes
      );

      setResults(detectionResults);
      
      // Convert server results to frontend format for compatibility - fix the ball type issue
      const processedResults: ProcessedDetectionResult[] = detectionResults.map((result, index) => ({
        frameIndex: index,
        timestamp: result.timestamp,
        players: result.players,
        ball: result.ball || undefined, // Convert null to undefined to match type
        processing_time: result.processing_time,
        model_used: result.model_used
      }));

      if (onDetectionResults) {
        onDetectionResults(processedResults);
      }

      // Save results to database
      await ProductionDetectionService.saveResultsToDatabase(matchId, jobId, detectionResults);
      
      toast.success(`Detection complete! Found ${detectionResults.length} frames with detections.`);
      
    } catch (error: any) {
      console.error('Server-side detection failed:', error);
      
      // Update service status based on error
      if (error.message.includes('unavailable') || error.message.includes('connect')) {
        setServiceStatus('offline');
      }
      
      // Show user-friendly error messages
      if (error.message.includes('unavailable')) {
        toast.error('AI detection service is temporarily unavailable. Please try again later.');
      } else if (error.message.includes('timeout')) {
        toast.error('Detection service is not responding. Please check your connection and try again.');
      } else {
        toast.error(`Detection failed: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
      setCurrentJobId(null);
    }
  };

  const stopDetection = async () => {
    if (currentJobId) {
      try {
        await ProductionDetectionService.cancelJob(currentJobId);
        toast.info('Detection job cancelled');
      } catch (error: any) {
        console.error('Failed to cancel job:', error);
        toast.error('Failed to cancel detection job');
      }
    }
    setIsProcessing(false);
    setCurrentJobId(null);
  };

  const retryConnection = async () => {
    ProductionDetectionService.resetServiceStatus();
    const isAvailable = await ProductionDetectionService.checkServiceHealth();
    setServiceStatus(isAvailable ? 'online' : 'offline');
    
    if (isAvailable) {
      toast.success('AI detection service is now available!');
    } else {
      toast.error('AI detection service is still unavailable.');
    }
  };

  const renderDetectionOverlays = () => {
    if (!showOverlays || !canvasRef.current || !playerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find current frame results
    const currentTime = playerRef.current.getCurrentTime();
    const currentResult = results.find(r => 
      Math.abs(r.timestamp - currentTime) < 0.5
    );

    if (!currentResult) return;

    // Draw detections
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.font = '14px Arial';

    currentResult.players.forEach((player) => {
      if (player.confidence >= confidenceThreshold) {
        const { x, y, width, height } = player.bounding_box;
        
        ctx.strokeStyle = player.team === 'home' ? '#00ff00' : '#ff0000';
        ctx.strokeRect(x, y, width, height);
        
        ctx.fillStyle = player.team === 'home' ? '#00ff00' : '#ff0000';
        ctx.fillText(
          `Player ${player.confidence.toFixed(2)}`,
          x,
          y - 5
        );
      }
    });

    if (currentResult.ball && currentResult.ball.confidence >= confidenceThreshold) {
      const { x, y, width, height } = currentResult.ball.bounding_box;
      
      ctx.strokeStyle = '#ffff00';
      ctx.strokeRect(x, y, width, height);
      
      ctx.fillStyle = '#ffff00';
      ctx.fillText(
        `Ball ${currentResult.ball.confidence.toFixed(2)}`,
        x,
        y - 5
      );
    }
  };

  useEffect(() => {
    renderDetectionOverlays();
  }, [results, showOverlays, confidenceThreshold]);

  return (
    <div className="relative w-full h-full">
      <YouTubePlayer
        videoId={videoId}
        matchId={matchId}
        isAdmin={isAdmin}
        onPlayerReady={handlePlayerReady}
        onStateChange={onStateChange}
      />
      
      {/* Detection Canvas Overlay */}
      {showOverlays && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          width={1280}
          height={720}
          style={{ width: '100%', height: '100%' }}
        />
      )}
      
      {/* Detection Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {/* AI Detection Toggle */}
        <Button
          onClick={() => setShowDetectionControls(!showDetectionControls)}
          variant={showDetectionControls ? "default" : "secondary"}
          size="sm"
          className="flex items-center gap-2"
        >
          🤖 Production AI Detection
          {serviceStatus === 'online' && <Wifi className="h-3 w-3 text-green-500" />}
          {serviceStatus === 'offline' && <WifiOff className="h-3 w-3 text-red-500" />}
        </Button>
        
        {showDetectionControls && (
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">Production AI Detection</h3>
              <div className="flex items-center gap-2">
                <Badge variant="default">Server-Side</Badge>
                {serviceStatus === 'online' && (
                  <Badge variant="default" className="bg-green-600">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                )}
                {serviceStatus === 'offline' && (
                  <Badge variant="destructive">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
            </div>

            {/* Service Status Warning */}
            {serviceStatus === 'offline' && (
              <div className="mb-3 p-2 bg-red-900/50 border border-red-600/50 rounded text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Service Unavailable</div>
                  <div>The AI detection service is currently offline. Please try again later.</div>
                  <button 
                    onClick={retryConnection}
                    className="mt-1 text-red-300 underline hover:text-red-100"
                  >
                    Retry connection
                  </button>
                </div>
              </div>
            )}

            {serviceStatus === 'online' && (
              <div className="mb-3 p-2 bg-yellow-900/50 border border-yellow-600/50 rounded text-yellow-200 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Server-Side Processing</div>
                  <div>Uses backend service to download and analyze video. Processing may take several minutes.</div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 mb-3">
              <Button
                onClick={startServerSideDetection}
                disabled={isProcessing || serviceStatus === 'offline'}
                size="sm"
                className="flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                Start Detection
              </Button>
              
              {isProcessing && (
                <Button
                  onClick={stopDetection}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Square className="h-3 w-3" />
                  Cancel
                </Button>
              )}
              
              <Button
                onClick={() => setShowOverlays(!showOverlays)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                {showOverlays ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            
            {isProcessing && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>Processing video...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full h-1" />
                {currentJobId && (
                  <div className="text-xs text-white/50 mt-1">
                    Job ID: {currentJobId}
                  </div>
                )}
              </div>
            )}
            
            <div className="text-xs text-white/70">
              <div>Frames analyzed: {results.length}</div>
              <div>Players detected: {results.reduce((sum, r) => sum + r.players.length, 0)}</div>
              <div>Ball detections: {results.filter(r => r.ball).length}</div>
              <div>Model: YOLOv11 + GPU acceleration</div>
              <div>Status: {serviceStatus === 'online' ? 'Service Online' : serviceStatus === 'offline' ? 'Service Offline' : 'Checking...'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
