
import React, { useState, useRef, useEffect } from 'react';
import { YouTubePlayer, YouTubePlayerInstance } from './YouTubePlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Play, Square, Eye, EyeOff, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { ProcessedDetectionResult } from '@/services/roboflowDetectionService';
import { RoboflowVideoDetectionOverlay } from './RoboflowVideoDetectionOverlay';

/**
 * @interface YouTubePlayerWithDetectionProps
 * @description Props for the YouTubePlayerWithDetection component.
 * @property {string} videoId - The ID of the YouTube video.
 * @property {string} matchId - The ID of the match, used for real-time synchronization.
 * @property {boolean} isAdmin - Flag indicating if the user has admin controls.
 * @property {(player: YouTubePlayerInstance) => void} [onPlayerReady] - Callback when the player is ready.
 * @property {(event: any) => void} [onStateChange] - Callback on player state change.
 * @property {(results: ProcessedDetectionResult[]) => void} [onDetectionResults] - Callback to handle the results from the AI detection.
 */
interface YouTubePlayerWithDetectionProps {
  videoId: string;
  matchId: string;
  isAdmin: boolean;
  onPlayerReady?: (player: YouTubePlayerInstance) => void;
  onStateChange?: (event: any) => void;
  onDetectionResults?: (results: ProcessedDetectionResult[]) => void;
}

/**
 * @component YouTubePlayerWithDetection
 * @description An enhanced YouTube player component that integrates AI object detection capabilities.
 * It wraps the synchronized `YouTubePlayer` and adds a canvas overlay for displaying detection results
 * and a `RoboflowVideoDetectionOverlay` for controlling the analysis process.
 * @param {YouTubePlayerWithDetectionProps} props The props for the component.
 * @returns {JSX.Element} The rendered YouTube player with detection features.
 */
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
  const [showOverlays, setShowOverlays] = useState(true);
  const [showDetectionControls, setShowDetectionControls] = useState(false);
  
  // Volume controls for trackers
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  
  // Detection configuration
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);

  const handlePlayerReady = (player: YouTubePlayerInstance) => {
    playerRef.current = player;
    
    // Initialize volume state
    setVolume(player.getVolume());
    setIsMuted(player.isMuted());
    
    // Get the actual video element from the YouTube player
    const iframe = player.getIframe();
    if (iframe && iframe.contentDocument) {
      const video = iframe.contentDocument.querySelector('video');
      if (video) {
        videoElementRef.current = video;
      }
    }
    
    if (onPlayerReady) {
      onPlayerReady(player);
    }
  };

  const handleDetectionResults = (detectionResults: ProcessedDetectionResult[]) => {
    setResults(detectionResults);
    if (onDetectionResults) {
      onDetectionResults(detectionResults);
    }
  };

  // Volume controls for trackers
  const handleVolumeToggle = () => {
    if (!playerRef.current) return;
    
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    
    const newVolume = parseInt(e.target.value);
    playerRef.current.setVolume(newVolume);
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
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
      
      {/* Controls positioned based on user role */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {/* AI Detection Toggle - Available to both roles */}
        <Button
          onClick={() => setShowDetectionControls(!showDetectionControls)}
          variant={showDetectionControls ? "default" : "secondary"}
          size="sm"
          className="flex items-center gap-2"
        >
          🤖 AI Detection
        </Button>
        
        {/* Volume Controls for Trackers */}
        {!isAdmin && (
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <button
              onClick={handleVolumeToggle}
              className="text-white hover:text-gray-300 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              title="Volume"
            />
          </div>
        )}
        
        {showDetectionControls && (
          <RoboflowVideoDetectionOverlay
            videoElement={videoElementRef.current}
            isVisible={showDetectionControls}
            onDetectionResults={handleDetectionResults}
            canvasRef={canvasRef}
          />
        )}
      </div>
    </div>
  );
};
