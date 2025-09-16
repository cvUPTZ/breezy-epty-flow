
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Square, Settings, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pythonDetectionService, DetectionJob, DetectionResult } from '@/services/pythonDetectionService';

/**
 * @interface PlayerBallDetectionPanelProps
 * @description Props for the PlayerBallDetectionPanel component.
 * @property {string} [videoId] - The ID of the video to be analyzed.
 * @property {function(results: DetectionResult[]): void} [onDetectionResults] - Optional callback for when detection results are available.
 */
interface PlayerBallDetectionPanelProps {
  videoId?: string;
  onDetectionResults?: (results: DetectionResult[]) => void;
}

/**
 * @component PlayerBallDetectionPanel
 * @description A control panel for initiating and monitoring a player and ball detection
 * job on the backend Python service. It provides settings for the detection and
 * displays the job's progress.
 * @param {PlayerBallDetectionPanelProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
export const PlayerBallDetectionPanel: React.FC<PlayerBallDetectionPanelProps> = ({
  videoId,
  onDetectionResults,
}) => {
  const { toast } = useToast();
  const [currentJob, setCurrentJob] = useState<DetectionJob | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [config, setConfig] = useState({
    frameRate: 5,
    confidenceThreshold: 0.5,
    trackPlayers: true,
    trackBall: true,
  });
  const [serviceStatus, setServiceStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const [showSettings, setShowSettings] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check service health on mount
  useEffect(() => {
    checkServiceHealth();
  }, []);

  // Poll job status while detecting
  useEffect(() => {
    if (isDetecting && currentJob?.job_id) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await pythonDetectionService.getJobStatus(currentJob.job_id);
          setCurrentJob(status);

          if (status.status === 'completed') {
            setIsDetecting(false);
            if (status.results) {
              onDetectionResults?.(status.results);
            }
            toast({
              title: 'Detection Complete',
              description: `Processed ${status.results?.length || 0} frames successfully.`,
            });
          } else if (status.status === 'failed') {
            setIsDetecting(false);
            toast({
              title: 'Detection Failed',
              description: status.error || 'Unknown error occurred.',
              variant: 'destructive',
            });
          }
        } catch (error: any) {
          console.error('Error polling job status:', error);
          setIsDetecting(false);
          toast({
            title: 'Connection Error',
            description: 'Lost connection to detection service.',
            variant: 'destructive',
          });
        }
      }, 2000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isDetecting, currentJob?.job_id, onDetectionResults, toast]);

  const checkServiceHealth = async () => {
    try {
      await pythonDetectionService.healthCheck();
      setServiceStatus('online');
    } catch (error) {
      console.error('Detection service health check failed:', error);
      setServiceStatus('offline');
    }
  };

  const startDetection = async () => {
    if (!videoUrl) {
      toast({
        title: 'Missing Video URL',
        description: 'Please provide a video URL to start detection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDetecting(true);
      const result = await pythonDetectionService.startDetection({
        videoUrl,
        frameRate: config.frameRate,
        confidenceThreshold: config.confidenceThreshold,
        trackPlayers: config.trackPlayers,
        trackBall: config.trackBall,
      });

      setCurrentJob({ job_id: result.job_id, status: 'pending' });
      toast({
        title: 'Detection Started',
        description: `Job ${result.job_id} has been queued for processing.`,
      });
    } catch (error: any) {
      console.error('Error starting detection:', error);
      setIsDetecting(false);
      toast({
        title: 'Detection Failed',
        description: error.message || 'Failed to start detection service.',
        variant: 'destructive',
      });
    }
  };

  const stopDetection = async () => {
    if (currentJob?.job_id) {
      try {
        await pythonDetectionService.cancelJob(currentJob.job_id);
        setIsDetecting(false);
        setCurrentJob(null);
        toast({
          title: 'Detection Cancelled',
          description: 'The detection job has been cancelled.',
        });
      } catch (error: any) {
        console.error('Error cancelling detection:', error);
        toast({
          title: 'Cancellation Failed',
          description: error.message || 'Failed to cancel detection job.',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-white/70" />
          <span className="font-medium text-white text-sm">AI Detection</span>
          <Badge 
            variant={serviceStatus === 'online' ? 'default' : 'destructive'}
            className="text-xs"
          >
            {serviceStatus === 'online' ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-white/70 hover:text-white h-6 w-6 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Video URL Input */}
      <div className="space-y-1">
        <Input
          placeholder="YouTube video URL..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          disabled={isDetecting}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm h-8"
        />
      </div>

      {/* Settings Panel (collapsible) */}
      {showSettings && (
        <div className="space-y-2 bg-black/20 rounded-lg p-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Frame Rate</Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={config.frameRate}
                onChange={(e) => setConfig(prev => ({ ...prev, frameRate: parseInt(e.target.value) || 5 }))}
                disabled={isDetecting}
                className="bg-white/10 border-white/20 text-white text-xs h-6"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white/70 text-xs">Confidence</Label>
              <Input
                type="number"
                min="0.1"
                max="1"
                step="0.1"
                value={config.confidenceThreshold}
                onChange={(e) => setConfig(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) || 0.5 }))}
                disabled={isDetecting}
                className="bg-white/10 border-white/20 text-white text-xs h-6"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center space-x-1">
              <Switch
                id="track-players"
                checked={config.trackPlayers}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, trackPlayers: checked }))}
                disabled={isDetecting}
                className="scale-75"
              />
              <Label htmlFor="track-players" className="text-white/70 text-xs">Players</Label>
            </div>
            <div className="flex items-center space-x-1">
              <Switch
                id="track-ball"
                checked={config.trackBall}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, trackBall: checked }))}
                disabled={isDetecting}
                className="scale-75"
              />
              <Label htmlFor="track-ball" className="text-white/70 text-xs">Ball</Label>
            </div>
          </div>
        </div>
      )}

      {/* Job Status */}
      {currentJob && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">Status:</span>
            <Badge variant={getStatusBadgeVariant(currentJob.status)} className="text-xs">
              {currentJob.status}
            </Badge>
          </div>
          {currentJob.progress !== undefined && (
            <Progress value={currentJob.progress} className="h-1" />
          )}
          {currentJob.status === 'processing' && (
            <p className="text-xs text-white/50">
              Processing frames...
            </p>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="flex gap-2">
        {!isDetecting ? (
          <Button
            onClick={startDetection}
            disabled={!videoUrl || serviceStatus === 'offline'}
            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-3"
          >
            <Play className="h-3 w-3" />
            Start Detection
          </Button>
        ) : (
          <Button
            onClick={stopDetection}
            variant="destructive"
            className="flex items-center gap-1 text-xs h-7 px-3"
          >
            {currentJob?.status === 'processing' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Square className="h-3 w-3" />
            )}
            {currentJob?.status === 'processing' ? 'Processing...' : 'Cancel'}
          </Button>
        )}
        <Button
          onClick={checkServiceHealth}
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white text-xs h-7 px-2"
        >
          Check
        </Button>
      </div>

      {/* Offline Warning */}
      {serviceStatus === 'offline' && (
        <div className="p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-200">
          Detection service offline. Deploy to PythonAnywhere first.
        </div>
      )}
    </div>
  );
};
