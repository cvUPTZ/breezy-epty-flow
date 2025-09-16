
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Square, 
  Settings, 
  Brain,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';
import { productionMLDetectionService, MLModelConfig, DetectionRequest } from '@/services/productionMLDetectionService';
import { mlJobQueueService, QueuedMLJob, QueueStats } from '@/services/mlJobQueueService';
import { toast } from 'sonner';

/**
 * @interface EnhancedProductionDetectionPanelProps
 * @description Props for the EnhancedProductionDetectionPanel component.
 * @property {string} videoId - The ID of the video to be analyzed.
 * @property {function(results: any[]): void} onDetectionResults - Callback function to handle the final detection results.
 */
interface EnhancedProductionDetectionPanelProps {
  videoId: string;
  onDetectionResults: (results: any[]) => void;
}

/**
 * @component EnhancedProductionDetectionPanel
 * @description A control panel for managing production-grade, queue-based machine learning detection jobs.
 * It allows users to configure and submit a video for analysis, and then monitors the job's
 * progress in real-time.
 * @param {EnhancedProductionDetectionPanelProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
export const EnhancedProductionDetectionPanel: React.FC<EnhancedProductionDetectionPanelProps> = ({
  videoId,
  onDetectionResults,
}) => {
  const [currentJob, setCurrentJob] = useState<QueuedMLJob | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<'online' | 'offline' | 'checking'>('checking');
  const [availableModels, setAvailableModels] = useState<MLModelConfig[]>([]);
  
  // Configuration
  const [config, setConfig] = useState({
    provider: 'roboflow' as const,
    modelId: 'football-players-detection-3zvbc/9',
    frameRate: 2,
    confidenceThreshold: 0.6,
    trackPlayers: true,
    trackBall: true,
    processingMode: 'balanced' as const,
    priority: 'normal' as const,
  });

  const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';

  useEffect(() => {
    checkServiceHealth();
    loadQueueStats();
    const interval = setInterval(() => {
      checkServiceHealth();
      loadQueueStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let subscription: any;
    
    if (currentJob && isProcessing) {
      subscription = mlJobQueueService.subscribeToJobUpdates(
        currentJob.id,
        (updatedJob) => {
          setCurrentJob(updatedJob);
          
          if (updatedJob.status === 'completed') {
            setIsProcessing(false);
            if (updatedJob.results) {
              onDetectionResults(updatedJob.results);
              toast.success(`Detection completed! Found ${updatedJob.results.length} frames with detections.`);
            }
          } else if (updatedJob.status === 'failed') {
            setIsProcessing(false);
            toast.error(`Detection failed: ${updatedJob.error_message}`);
          }
        }
      );
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentJob, isProcessing, onDetectionResults]);

  const checkServiceHealth = async () => {
    try {
      const health = await productionMLDetectionService.healthCheck();
      setServiceHealth(health.status === 'online' ? 'online' : 'offline');
      setAvailableModels(health.availableModels || []);
    } catch (error) {
      setServiceHealth('offline');
    }
  };

  const loadQueueStats = async () => {
    try {
      const stats = await mlJobQueueService.getQueueStats();
      setQueueStats(stats);
    } catch (error) {
      console.error('Failed to load queue stats:', error);
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
      
      const modelConfig: MLModelConfig = {
        provider: config.provider,
        modelId: config.modelId,
        apiKey: import.meta.env.VITE_ROBOFLOW_API_KEY,
      };

      const jobId = await mlJobQueueService.submitJob(
        videoUrl,
        {
          modelConfig,
          frameRate: config.frameRate,
          confidenceThreshold: config.confidenceThreshold,
          trackPlayers: config.trackPlayers,
          trackBall: config.trackBall,
          processingMode: config.processingMode,
        },
        config.priority
      );

      const job = await mlJobQueueService.getJob(jobId);
      setCurrentJob(job);
      
      toast.success('Detection job submitted to queue!');
    } catch (error: any) {
      console.error('Failed to start detection:', error);
      toast.error(`Failed to start detection: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const cancelDetection = async () => {
    if (!currentJob) return;

    try {
      await mlJobQueueService.cancelJob(currentJob.id);
      setIsProcessing(false);
      setCurrentJob(null);
      toast.info('Detection cancelled');
    } catch (error: any) {
      console.error('Failed to cancel detection:', error);
      toast.error('Failed to cancel detection');
    }
  };

  const getStatusIcon = () => {
    if (!currentJob) return <Brain className="h-4 w-4" />;
    
    switch (currentJob.status) {
      case 'queued':
        return <Clock className="h-4 w-4 animate-pulse text-yellow-500" />;
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
            Production ML Detection
          </CardTitle>
          {getServiceStatusBadge()}
        </div>
        
        {/* Queue Stats */}
        {queueStats && (
          <div className="text-xs text-white/70 flex gap-4">
            <span>Queue: {queueStats.queued_jobs}</span>
            <span>Processing: {queueStats.processing_jobs}</span>
            <span>Est. Wait: {Math.round(queueStats.estimated_wait_time / 60)}min</span>
          </div>
        )}
        
        {currentJob && (
          <div className="text-xs text-white/70">
            Status: <span className="capitalize text-white">{currentJob.status}</span>
            {currentJob.status === 'queued' && queueStats && (
              <span className="ml-2">• Position in queue: {queueStats.queued_jobs}</span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {isProcessing && currentJob && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>
                {currentJob.status === 'queued' ? 'Waiting in queue...' : 'Processing...'}
              </span>
              <span>{Math.round(currentJob.progress)}%</span>
            </div>
            <Progress value={currentJob.progress} className="h-2 bg-white/10" />
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
              Start ML Detection
            </Button>
          ) : (
            <Button
              onClick={cancelDetection}
              variant="destructive"
              className="flex-1 text-sm h-9"
            >
              <Square className="h-4 w-4 mr-2" />
              Cancel Detection
            </Button>
          )}
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-xs text-white/70 block">ML Provider</label>
          <Select
            value={config.provider}
            onValueChange={(value: any) => setConfig({...config, provider: value})}
            disabled={isProcessing}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roboflow">Roboflow (Recommended)</SelectItem>
              <SelectItem value="yolo">YOLO v8</SelectItem>
              <SelectItem value="custom">Custom Model</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Selection */}
        <div className="space-y-2">
          <label className="text-xs text-white/70 block">Processing Priority</label>
          <Select
            value={config.priority}
            onValueChange={(value: any) => setConfig({...config, priority: value})}
            disabled={isProcessing}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Cheaper)</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High (Faster)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        {currentJob?.status === 'completed' && currentJob.results && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-xs text-green-400 font-medium mb-1">Detection Complete!</div>
            <div className="text-xs text-white/70">
              Processed {currentJob.results.length} frames
              <span className="ml-2">• Processing time: {Math.round((new Date(currentJob.completed_at!).getTime() - new Date(currentJob.started_at!).getTime()) / 1000)}s</span>
            </div>
          </div>
        )}

        {/* Service Info */}
        <div className="text-xs text-white/50 text-center">
          Production ML Detection • Queue-based processing
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
