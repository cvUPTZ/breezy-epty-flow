
import React, { useState, useRef, useEffect } from 'react';
import { YouTubePlayer, YouTubePlayerInstance } from './YouTubePlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Play, Square, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ProcessedDetectionResult } from '@/services/roboflowDetectionService';
import { RoboflowVideoDetectionOverlay } from './RoboflowVideoDetectionOverlay';

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
  const [showRoboflowOverlay, setShowRoboflowOverlay] = useState(false);
  
  // Detection configuration
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);

  const handlePlayerReady = (player: YouTubePlayerInstance) => {
    playerRef.current = player;
    if (onPlayerReady) {
      onPlayerReady(player);
    }
  };

  const startRoboflowDetection = () => {
    setShowRoboflowOverlay(true);
  };

  const handleDetectionResults = (detectionResults: ProcessedDetectionResult[]) => {
    setResults(detectionResults);
    if (onDetectionResults) {
      onDetectionResults(detectionResults);
    }
  };

  const renderDetectionOverlays = () => {
    if (!showOverlays || !canvasRef.current || !playerRef.current || results.length === 0) return;

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
          🤖 AI Detection
        </Button>
        
        {showDetectionControls && (
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">AI Detection</h3>
              <Badge variant="outline">Roboflow Service</Badge>
            </div>

            <div className="mb-3 p-2 bg-blue-900/50 border border-blue-600/50 rounded text-blue-200 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Roboflow AI Detection</div>
                <div>AI detection runs using the Roboflow service for accurate player and ball detection.</div>
              </div>
            </div>
            
            <div className="flex gap-2 mb-3">
              <Button
                onClick={startRoboflowDetection}
                disabled={isProcessing}
                size="sm"
                className="flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                Start Detection
              </Button>
              
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
              </div>
            )}
            
            <div className="text-xs text-white/70">
              <div>Frames analyzed: {results.length}</div>
              <div>Players detected: {results.reduce((sum, r) => sum + r.players.length, 0)}</div>
              <div>Ball detections: {results.filter(r => r.ball).length}</div>
              <div>Status: Roboflow service ready</div>
            </div>
          </div>
        )}
      </div>

      {/* Roboflow Detection Overlay */}
      {showRoboflowOverlay && (
        <RoboflowVideoDetectionOverlay
          videoId={videoId}
          isVisible={showRoboflowOverlay}
          onClose={() => setShowRoboflowOverlay(false)}
          onDetectionResults={handleDetectionResults}
          isFullscreen={false}
        />
      )}
    </div>
  );
};
