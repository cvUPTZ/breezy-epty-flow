import React, { useState, useRef, useEffect } from 'react';
import { YouTubePlayer, YouTubePlayerInstance } from './YouTubePlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Play, Square, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { roboflowDetectionService, ProcessedDetectionResult } from '@/services/roboflowDetectionService';

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
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessedDetectionResult[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showDetectionControls, setShowDetectionControls] = useState(false);
  
  // Detection configuration
  const [frameRate, setFrameRate] = useState(1);
  const [maxFrames, setMaxFrames] = useState(50);
  const [modelUrl, setModelUrl] = useState('football-players-detection-3zvbc/9');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);

  const handlePlayerReady = (player: YouTubePlayerInstance) => {
    playerRef.current = player;
    
    // Try to get the underlying video element for detection
    setTimeout(() => {
      const iframe = document.querySelector(`iframe[src*="${videoId}"]`) as HTMLIFrameElement;
      if (iframe) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          const video = iframeDoc?.querySelector('video') as HTMLVideoElement;
          if (video) {
            videoElementRef.current = video;
            console.log('Found YouTube video element for detection');
          }
        } catch (e) {
          console.log('Cannot access YouTube iframe due to CORS, will use canvas capture method');
        }
      }
    }, 1000);
    
    if (onPlayerReady) {
      onPlayerReady(player);
    }
  };

  const initializeDetection = async () => {
    try {
      console.log('Initializing Roboflow detection service...');
      toast.info('Initializing AI detection...');
      const success = await roboflowDetectionService.initialize(modelUrl);
      if (success) {
        setIsInitialized(true);
        toast.success('AI detection ready!');
        console.log('Roboflow service initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Roboflow:', error);
      toast.error('Failed to initialize AI detection');
    }
  };

  const captureVideoFrame = (): HTMLCanvasElement | null => {
    if (!playerRef.current) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Get player dimensions
    const playerElement = document.querySelector(`iframe[src*="${videoId}"]`) as HTMLIFrameElement;
    if (!playerElement) return null;

    canvas.width = 1280; // Standard YouTube resolution
    canvas.height = 720;

    try {
      // If we have direct video access, use it
      if (videoElementRef.current) {
        ctx.drawImage(videoElementRef.current, 0, 0, canvas.width, canvas.height);
        return canvas;
      }
      
      // Otherwise, try to capture the iframe (this may not work due to CORS)
      ctx.drawImage(playerElement, 0, 0, canvas.width, canvas.height);
      return canvas;
    } catch (error) {
      console.error('Cannot capture video frame due to CORS restrictions');
      toast.error('Cannot capture video frames. YouTube CORS restrictions prevent direct analysis.');
      return null;
    }
  };

  const startDetection = async () => {
    if (!playerRef.current || !isInitialized) {
      toast.error('Player or AI detection not ready');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      console.log('Starting video detection...');
      
      // Create a mock video element for the detection service
      const mockVideo = {
        currentTime: 0,
        duration: playerRef.current.getDuration(),
        videoWidth: 1280,
        videoHeight: 720,
        addEventListener: () => {},
        removeEventListener: () => {}
      } as any;

      const totalFrames = Math.min(Math.floor(mockVideo.duration * frameRate), maxFrames);
      const detectionResults: ProcessedDetectionResult[] = [];

      for (let i = 0; i < totalFrames; i++) {
        const timeToSeek = i / frameRate;
        
        // Seek to specific time
        playerRef.current.seekTo(timeToSeek, true);
        
        // Wait for seek to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Capture frame
        const canvas = captureVideoFrame();
        if (!canvas) {
          console.warn('Could not capture frame at time:', timeToSeek);
          continue;
        }

        // Convert canvas to blob for detection
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
        });

        // Run detection on the frame
        try {
          mockVideo.currentTime = timeToSeek;
          const result = await roboflowDetectionService.detectFromVideoFrame(mockVideo, i);
          
          if (result) {
            detectionResults.push(result);
            setResults(prev => [...prev, result]);
          }
        } catch (detectionError) {
          console.error('Detection failed for frame:', i, detectionError);
        }

        // Update progress
        const progressPercent = ((i + 1) / totalFrames) * 100;
        setProgress(progressPercent);

        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (onDetectionResults) {
        onDetectionResults(detectionResults);
      }
      
      toast.success(`Detection complete! Analyzed ${detectionResults.length} frames.`);
    } catch (error: any) {
      console.error('Detection failed:', error);
      toast.error(`Detection failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
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

  useEffect(() => {
    if (showDetectionControls && !isInitialized) {
      initializeDetection();
    }
  }, [showDetectionControls]);

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
          🤖 AI Detection
        </Button>
        
        {showDetectionControls && (
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">AI Detection</h3>
              <Badge variant={isInitialized ? "default" : "secondary"}>
                {isInitialized ? 'Ready' : 'Initializing...'}
              </Badge>
            </div>
            
            <div className="flex gap-2 mb-3">
              <Button
                onClick={startDetection}
                disabled={isProcessing || !isInitialized}
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
