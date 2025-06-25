import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Play, Square, Settings, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { roboflowDetectionService, ProcessedDetectionResult } from '@/services/roboflowDetectionService';

interface RoboflowVideoDetectionOverlayProps {
  videoId: string;
  isVisible: boolean;
  onClose: () => void;
  onDetectionResults: (results: ProcessedDetectionResult[]) => void;
  isFullscreen?: boolean;
}

export const RoboflowVideoDetectionOverlay: React.FC<RoboflowVideoDetectionOverlayProps> = ({
  videoId,
  isVisible,
  onClose,
  onDetectionResults,
  isFullscreen = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessedDetectionResult[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  
  // Configuration
  const [frameRate, setFrameRate] = useState(1);
  const [maxFrames, setMaxFrames] = useState(50);
  const [modelUrl, setModelUrl] = useState('football-players-detection-3zvbc/9');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isVisible && !isInitialized) {
      initializeRoboflow();
    }
  }, [isVisible]);

  const initializeRoboflow = async () => {
    try {
      console.log('Initializing HTTP-based Roboflow detection service...');
      toast.info('Initializing Roboflow AI detection...');
      const success = await roboflowDetectionService.initialize(modelUrl);
      if (success) {
        setIsInitialized(true);
        toast.success('Roboflow AI detection ready!');
        console.log('HTTP-based Roboflow service initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Roboflow HTTP service:', error);
      toast.error('Failed to initialize AI detection');
    }
  };

  const startDetection = async () => {
    if (!videoRef.current || !isInitialized) {
      toast.error('Video or AI detection not ready');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      console.log('Starting HTTP-based detection...');
      const detectionResults = await roboflowDetectionService.processVideoInBatches(
        videoRef.current,
        {
          frameRate,
          maxFrames,
          onProgress: setProgress,
          onFrameResult: (result) => {
            setResults(prev => [...prev, result]);
          }
        }
      );

      onDetectionResults(detectionResults);
      toast.success(`Detection complete! Found ${detectionResults.length} frames with detections.`);
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

  const changeModel = async () => {
    setIsInitialized(false);
    const success = await roboflowDetectionService.changeModel(modelUrl);
    setIsInitialized(success);
    if (success) {
      toast.success('Model changed successfully');
    }
  };

  const renderDetectionOverlays = () => {
    if (!showOverlays || !canvasRef.current || !videoRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find current frame results
    const currentTime = videoRef.current.currentTime;
    const currentResult = results.find(r => 
      Math.abs(r.timestamp - currentTime) < 0.5
    );

    if (!currentResult) return null;

    // Draw player detections
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.font = '14px Arial';

    currentResult.players.forEach((player, index) => {
      if (player.confidence >= confidenceThreshold) {
        const { x, y, width, height } = player.bounding_box;
        
        // Draw bounding box
        ctx.strokeStyle = player.team === 'home' ? '#00ff00' : '#ff0000';
        ctx.strokeRect(x, y, width, height);
        
        // Draw label
        ctx.fillStyle = player.team === 'home' ? '#00ff00' : '#ff0000';
        ctx.fillText(
          `Player ${player.confidence.toFixed(2)}`,
          x,
          y - 5
        );
      }
    });

    // Draw ball detection
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

  if (!isVisible) return null;

  const overlayContent = (
    <div 
      className="fixed inset-4 bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl flex flex-col"
      style={{ zIndex: isFullscreen ? 2147483647 : 1000 }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            🤖
          </div>
          <div>
            <h2 className="text-white font-semibold">Roboflow AI Detection</h2>
            <p className="text-white/70 text-sm">HTTP-based browser detection</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isInitialized ? "default" : "secondary"}>
            {isInitialized ? 'Ready' : 'Initializing...'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Video Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={`https://www.youtube.com/watch?v=${videoId}`}
              className="w-full h-full object-contain"
              controls
              onTimeUpdate={renderDetectionOverlays}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              width={1280}
              height={720}
            />
          </div>
          
          {/* Video Controls */}
          <div className="flex-shrink-0 mt-4 flex gap-2">
            <Button
              onClick={startDetection}
              disabled={isProcessing || !isInitialized}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Detection
            </Button>
            
            {isProcessing && (
              <Button
                onClick={stopDetection}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
            
            <Button
              onClick={() => setShowOverlays(!showOverlays)}
              variant="outline"
              className="flex items-center gap-2"
            >
              {showOverlays ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showOverlays ? 'Hide' : 'Show'} Overlays
            </Button>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="flex-shrink-0 mt-4">
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>Processing frames...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </div>

        {/* Settings Panel */}
        <Card className="w-80 bg-black/50 border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Detection Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Model</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={modelUrl}
                  onChange={(e) => setModelUrl(e.target.value)}
                  placeholder="model-id/version"
                  className="bg-white/10 border-white/20 text-white"
                />
                <Button onClick={changeModel} size="sm" variant="outline">
                  Load
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-white">Frame Rate (fps)</Label>
              <Input
                type="number"
                value={frameRate}
                onChange={(e) => setFrameRate(Number(e.target.value))}
                min="0.1"
                max="10"
                step="0.1"
                className="bg-white/10 border-white/20 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-white">Max Frames</Label>
              <Input
                type="number"
                value={maxFrames}
                onChange={(e) => setMaxFrames(Number(e.target.value))}
                min="1"
                max="500"
                className="bg-white/10 border-white/20 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-white">Confidence Threshold</Label>
              <Input
                type="number"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                min="0"
                max="1"
                step="0.1"
                className="bg-white/10 border-white/20 text-white mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-white">Show Overlays</Label>
              <Switch
                checked={showOverlays}
                onCheckedChange={setShowOverlays}
              />
            </div>

            {/* Results Summary */}
            <div className="pt-4 border-t border-white/20">
              <h4 className="text-white font-medium mb-2">Results</h4>
              <div className="text-sm text-white/70">
                <div>Frames processed: {results.length}</div>
                <div>Players detected: {results.reduce((sum, r) => sum + r.players.length, 0)}</div>
                <div>Ball detections: {results.filter(r => r.ball).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isFullscreen) {
    return createPortal(overlayContent, document.body);
  }

  return overlayContent;
};
