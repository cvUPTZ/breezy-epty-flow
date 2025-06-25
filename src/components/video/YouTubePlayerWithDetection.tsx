
import React, { useState, useRef, useEffect } from 'react';
import { YouTubePlayer, YouTubePlayerInstance } from './YouTubePlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Play, Square, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ProcessedDetectionResult } from '@/services/roboflowDetectionService';

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
  const [results, setResults] = useState<ProcessedDetectionResult[]>([]);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showDetectionControls, setShowDetectionControls] = useState(false);
  
  // Detection configuration
  const [frameRate, setFrameRate] = useState(1);
  const [maxFrames, setMaxFrames] = useState(50);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);

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
      
      // Get the YouTube video URL
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Call our production detection service
      const response = await fetch('/api/detect/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_PYTHON_DETECTION_API_KEY || 'demo-key'}`
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        throw new Error(`Detection service error: ${response.status}`);
      }

      const { job_id } = await response.json();
      
      // Poll for results
      await pollDetectionResults(job_id);
      
    } catch (error: any) {
      console.error('Server-side detection failed:', error);
      toast.error(`Detection failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const pollDetectionResults = async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/detect/status/${jobId}`);
        const jobData = await response.json();
        
        setProgress(jobData.progress || 0);
        
        if (jobData.status === 'completed' && jobData.results) {
          // Process results into our format
          const detectionResults = processServerResults(jobData.results);
          setResults(detectionResults);
          
          if (onDetectionResults) {
            onDetectionResults(detectionResults);
          }
          
          toast.success(`Detection complete! Found ${detectionResults.length} frames with detections.`);
          return;
        }
        
        if (jobData.status === 'failed') {
          throw new Error(jobData.error || 'Detection job failed');
        }
        
        // Continue polling if still processing
        if (jobData.status === 'processing' && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else if (attempts >= maxAttempts) {
          throw new Error('Detection timeout');
        }
        
      } catch (error: any) {
        console.error('Polling error:', error);
        toast.error(`Polling failed: ${error.message}`);
      }
    };
    
    poll();
  };

  const processServerResults = (serverResults: any): ProcessedDetectionResult[] => {
    // Convert server response to our frontend format
    return serverResults.map((result: any, index: number) => ({
      frameIndex: index,
      timestamp: result.timestamp || (index / frameRate),
      players: result.players || [],
      ball: result.ball || null,
      processing_time: result.processing_time || 0,
      model_used: result.model_used || 'server-side'
    }));
  };

  const stopDetection = () => {
    setIsProcessing(false);
    toast.info('Detection stopped');
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
          🤖 Server AI Detection
        </Button>
        
        {showDetectionControls && (
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">Production AI Detection</h3>
              <Badge variant="default">Server-Side</Badge>
            </div>
            
            <div className="flex gap-2 mb-3">
              <Button
                onClick={startServerSideDetection}
                disabled={isProcessing}
                size="sm"
                className="flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                Start
              </Button>
              
              {isProcessing && (
                <Button
                  onClick={stopDetection}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Square className="h-3 w-3" />
                  Stop
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
                  <span>Processing...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full h-1" />
              </div>
            )}
            
            <div className="text-xs text-white/70">
              <div>Frames: {results.length}</div>
              <div>Players: {results.reduce((sum, r) => sum + r.players.length, 0)}</div>
              <div>Ball detections: {results.filter(r => r.ball).length}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
