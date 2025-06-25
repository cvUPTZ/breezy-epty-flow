
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Play, 
  Square, 
  Settings, 
  ChevronDown, 
  Activity, 
  Zap,
  Brain,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { enhancedPythonDetectionService, DetectionResult, DetectionJob } from '@/services/enhancedPythonDetectionService';
import { toast } from 'sonner';

interface ProductionPlayerBallDetectionPanelProps {
  videoId: string;
  onDetectionResults: (results: DetectionResult[]) => void;
}

export const ProductionPlayerBallDetectionPanel: React.FC<ProductionPlayerBallDetectionPanelProps> = ({
  videoId,
  onDetectionResults,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<DetectionJob | null>(null);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<'online' | 'offline' | 'checking'>('checking');
  
  // Automatically construct YouTube URL from videoId
  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  
  // Enhanced configuration with real ML options
  const [config, setConfig] = useState({
    frameRate: 2,
    confidenceThreshold: 0.6,
    trackPlayers: true,
    trackBall: true,
    useRealML: true, // Enable real ML models
    modelType: 'yolov8n', // YOLOv8 nano for speed
    processingMode: 'fast', // fast, balanced, accurate
    maxRetries: 3,
    timeout: 60
  });

  // Check service health on mount
  useEffect(() => {
    checkServiceHealth();
    const interval = setInterval(checkServiceHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Poll job status when processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentJob && isProcessing) {
      interval = setInterval(async () => {
        try {
          const jobStatus = await enhancedPythonDetectionService.getJobStatus(currentJob.job_id);
          setCurrentJob(jobStatus);
          setProgress(jobStatus.progress || 0);
          
          if (jobStatus.status === 'completed') {
            const results = await enhancedPythonDetectionService.getResults(currentJob.job_id);
            onDetectionResults(results);
            setIsProcessing(false);
            toast.success(`Detection completed! Found data in ${results.length} frames.`);
          } else if (jobStatus.status === 'failed') {
            setIsProcessing(false);
            toast.error(`Detection failed: ${jobStatus.error}`);
          }
        } catch (error: any) {
          console.error('Failed to get job status:', error);
          toast.error('Failed to get job status');
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentJob, isProcessing, onDetectionResults]);

  const checkServiceHealth = async () => {
    try {
      const health = await enhancedPythonDetectionService.healthCheck();
      setServiceHealth(health.status === 'online' ? 'online' : 'offline');
    } catch (error) {
      setServiceHealth('offline');
    }
  };

  const startDetection = async () => {
    if (!videoId) {
      toast.error('No video selected');
      return;
    }

    if (serviceHealth === 'offline') {
      toast.error('Detection service is offline. Please try again later.');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      
      // Validate video first
      const validation = await enhancedPythonDetectionService.validateVideoUrl(videoUrl);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid video URL');
      }

      // Start detection with real ML configuration
      const detectionConfig = {
        videoUrl,
        frameRate: config.frameRate,
        confidenceThreshold: config.confidenceThreshold,
        trackPlayers: config.trackPlayers,
        trackBall: config.trackBall,
        maxRetries: config.maxRetries,
        timeout: config.timeout,
        // Real ML specific options
        useRealML: config.useRealML,
        modelType: config.modelType,
        processingMode: config.processingMode,
        enableGPU: true, // Use GPU acceleration if available
        batchSize: config.processingMode === 'fast' ? 8 : 4,
        nmsThreshold: 0.4, // Non-maximum suppression
        maxDetections: 50, // Max detections per frame
      };

      const job = await enhancedPythonDetectionService.startDetection(detectionConfig);
      
      const initialJob: DetectionJob = {
        job_id: job.job_id,
        status: 'pending',
        progress: 0,
        results: undefined,
        error: undefined,
        created_at: new Date().toISOString(),
      };
      
      setCurrentJob(initialJob);
      
      toast.success('Detection started with real ML models!');
    } catch (error: any) {
      console.error('Failed to start detection:', error);
      toast.error(`Failed to start detection: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const stopDetection = async () => {
    if (!currentJob) return;

    try {
      await enhancedPythonDetectionService.cancelJob(currentJob.job_id);
      setIsProcessing(false);
      setCurrentJob(null);
      setProgress(0);
      toast.info('Detection cancelled');
    } catch (error: any) {
      console.error('Failed to cancel detection:', error);
      toast.error('Failed to cancel detection');
    }
  };

  const getStatusIcon = () => {
    if (!currentJob) return <Brain className="h-4 w-4" />;
    
    switch (currentJob.status) {
      case 'pending':
        return <Activity className="h-4 w-4 animate-pulse text-yellow-500" />;
      case 'processing':
        return <Zap className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getServiceStatusBadge = () => {
    const variants = {
      online: 'bg-green-500/20 text-green-400 border-green-500/30',
      offline: 'bg-red-500/20 text-red-400 border-red-500/30',
      checking: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };

    return (
      <Badge variant="outline" className={`text-xs ${variants[serviceHealth]}`}>
        {serviceHealth === 'online' && '🟢 Service Online'}
        {serviceHealth === 'offline' && '🔴 Service Offline'}
        {serviceHealth === 'checking' && '🟡 Checking...'}
      </Badge>
    );
  };

  return (
    <Card className="w-full bg-black/5 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
            {getStatusIcon()}
            Real ML Detection
          </CardTitle>
          {getServiceStatusBadge()}
        </div>
        {currentJob && (
          <div className="text-xs text-white/70">
            Status: <span className="capitalize text-white">{currentJob.status}</span>
            {currentJob.video_metadata && (
              <span className="ml-2">• {Math.round(currentJob.video_metadata.duration / 60)}min video</span>
            )}
          </div>
        )}
        {/* Show current video URL */}
        {videoUrl && (
          <div className="text-xs text-white/50 truncate">
            Video: {videoUrl}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>Processing with {config.useRealML ? config.modelType.toUpperCase() : 'Mock'} model...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
            <div className="text-xs text-white/50 text-center">
              Mode: {config.processingMode} • Confidence: {config.confidenceThreshold}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isProcessing ? (
            <Button
              onClick={startDetection}
              disabled={serviceHealth === 'offline' || !videoId}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm h-9"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Real ML Detection
            </Button>
          ) : (
            <Button
              onClick={stopDetection}
              variant="destructive"
              className="flex-1 text-sm h-9"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Detection
            </Button>
          )}
          
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Real ML Configuration Settings */}
        <Collapsible open={showSettings} onOpenChange={setShowSettings}>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-white/70 hover:text-white">
            <ChevronDown className={`h-3 w-3 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
            Real ML Model Settings
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
            {/* Model Selection */}
            <div>
              <label className="text-xs text-white/70 block mb-1">ML Model</label>
              <select
                value={config.modelType}
                onChange={(e) => setConfig({...config, modelType: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                disabled={isProcessing}
              >
                <option value="yolov8n">YOLOv8 Nano (Fastest)</option>
                <option value="yolov8s">YOLOv8 Small (Balanced)</option>
                <option value="yolov8m">YOLOv8 Medium (Better Accuracy)</option>
                <option value="yolov8l">YOLOv8 Large (Best Accuracy)</option>
              </select>
            </div>

            {/* Processing Mode */}
            <div>
              <label className="text-xs text-white/70 block mb-1">Processing Mode</label>
              <select
                value={config.processingMode}
                onChange={(e) => setConfig({...config, processingMode: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                disabled={isProcessing}
              >
                <option value="fast">Fast (2x speed, good accuracy)</option>
                <option value="balanced">Balanced (1x speed, better accuracy)</option>
                <option value="accurate">Accurate (0.5x speed, best accuracy)</option>
              </select>
            </div>

            {/* Frame Rate */}
            <div>
              <label className="text-xs text-white/70 block mb-1">
                Frame Rate: {config.frameRate} FPS
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={config.frameRate}
                onChange={(e) => setConfig({...config, frameRate: parseInt(e.target.value)})}
                className="w-full accent-purple-500"
                disabled={isProcessing}
              />
            </div>

            {/* Confidence Threshold */}
            <div>
              <label className="text-xs text-white/70 block mb-1">
                Confidence: {(config.confidenceThreshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.3"
                max="0.9"
                step="0.05"
                value={config.confidenceThreshold}
                onChange={(e) => setConfig({...config, confidenceThreshold: parseFloat(e.target.value)})}
                className="w-full accent-purple-500"
                disabled={isProcessing}
              />
            </div>

            {/* Detection Options */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={config.trackPlayers}
                  onChange={(e) => setConfig({...config, trackPlayers: e.target.checked})}
                  className="accent-purple-500"
                  disabled={isProcessing}
                />
                Players
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={config.trackBall}
                  onChange={(e) => setConfig({...config, trackBall: e.target.checked})}
                  className="accent-purple-500"
                  disabled={isProcessing}
                />
                Ball
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={config.useRealML ?? false}
                  onChange={(e) => setConfig({...config, useRealML: e.target.checked})}
                  className="accent-purple-500"
                  disabled={isProcessing}
                />
                Real ML
              </label>
            </div>

            {/* Advanced Settings */}
            <div className="pt-2 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/70 block mb-1">Max Retries</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={config.maxRetries}
                    onChange={(e) => setConfig({...config, maxRetries: parseInt(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 block mb-1">Timeout (s)</label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={config.timeout}
                    onChange={(e) => setConfig({...config, timeout: parseInt(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Results Summary */}
        {currentJob?.results && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-xs text-green-400 font-medium mb-1">Detection Complete!</div>
            <div className="text-xs text-white/70">
              Processed {currentJob.results.length} frames
              {currentJob.video_metadata && (
                <span> from {Math.round(currentJob.video_metadata.duration / 60)}min video</span>
              )}
            </div>
          </div>
        )}

        {/* Service Info */}
        <div className="text-xs text-white/50 text-center">
          {config.useRealML 
            ? `Real ML: ${config.modelType.toUpperCase()} on ${config.processingMode} mode`
            : 'Mock detection mode (for testing)'
          }
        </div>

        {/* Video Not Available Warning */}
        {!videoId && (
          <div className="p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-200">
            No video loaded. Please select a YouTube video to analyze.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
