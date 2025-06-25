
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Square, Eye, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pythonDetectionService, DetectionJob, DetectionResult } from '@/services/pythonDetectionService';

interface PlayerBallDetectionPanelProps {
  videoId?: string;
  onDetectionResults?: (results: DetectionResult[]) => void;
}

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Player & Ball Detection
          <Badge variant={serviceStatus === 'online' ? 'default' : 'destructive'}>
            {serviceStatus === 'online' ? 'Service Online' : 'Service Offline'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video URL Input */}
        <div className="space-y-2">
          <Label htmlFor="video-url">Video URL</Label>
          <Input
            id="video-url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={isDetecting}
          />
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="frame-rate">Frame Rate (fps)</Label>
            <Input
              id="frame-rate"
              type="number"
              min="1"
              max="30"
              value={config.frameRate}
              onChange={(e) => setConfig(prev => ({ ...prev, frameRate: parseInt(e.target.value) || 5 }))}
              disabled={isDetecting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confidence">Confidence Threshold</Label>
            <Input
              id="confidence"
              type="number"
              min="0.1"
              max="1"
              step="0.1"
              value={config.confidenceThreshold}
              onChange={(e) => setConfig(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) || 0.5 }))}
              disabled={isDetecting}
            />
          </div>
        </div>

        {/* Detection Options */}
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="track-players"
              checked={config.trackPlayers}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, trackPlayers: checked }))}
              disabled={isDetecting}
            />
            <Label htmlFor="track-players">Track Players</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="track-ball"
              checked={config.trackBall}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, trackBall: checked }))}
              disabled={isDetecting}
            />
            <Label htmlFor="track-ball">Track Ball</Label>
          </div>
        </div>

        {/* Job Status */}
        {currentJob && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Job Status:</span>
              <Badge variant={getStatusBadgeVariant(currentJob.status)}>
                {currentJob.status}
              </Badge>
            </div>
            {currentJob.progress !== undefined && (
              <Progress value={currentJob.progress} className="w-full" />
            )}
            {currentJob.status === 'processing' && (
              <p className="text-xs text-muted-foreground">
                Processing frames... This may take several minutes depending on video length.
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isDetecting ? (
            <Button
              onClick={startDetection}
              disabled={!videoUrl || serviceStatus === 'offline'}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Detection
            </Button>
          ) : (
            <Button
              onClick={stopDetection}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {currentJob?.status === 'processing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {currentJob?.status === 'processing' ? 'Processing...' : 'Cancel'}
            </Button>
          )}
          <Button
            onClick={checkServiceHealth}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Check Service
          </Button>
        </div>

        {serviceStatus === 'offline' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Detection service is offline. Please ensure your Python service is deployed and running on PythonAnywhere.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
