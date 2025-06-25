
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Loader2, Play, Square, Settings, Eye, AlertTriangle, 
  CheckCircle, XCircle, RefreshCw, ExternalLink, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhancedPythonDetectionService, DetectionJob, DetectionResult } from '@/services/enhancedPythonDetectionService';

interface ProductionPlayerBallDetectionPanelProps {
  videoId?: string;
  onDetectionResults?: (results: DetectionResult[]) => void;
}

export const ProductionPlayerBallDetectionPanel: React.FC<ProductionPlayerBallDetectionPanelProps> = ({
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
  const [serviceHealth, setServiceHealth] = useState<'unknown' | 'online' | 'offline' | 'degraded'>('unknown');
  const [showSettings, setShowSettings] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [videoValidation, setVideoValidation] = useState<{
    valid: boolean;
    metadata?: any;
    error?: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Health check on mount and periodically
  useEffect(() => {
    checkServiceHealth();
    healthCheckIntervalRef.current = setInterval(checkServiceHealth, 30000); // Every 30 seconds

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, []);

  // Poll job status while detecting
  useEffect(() => {
    if (isDetecting && currentJob?.job_id) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await enhancedPythonDetectionService.getJobStatus(currentJob.job_id);
          setCurrentJob(status);

          if (status.status === 'completed') {
            setIsDetecting(false);
            if (status.results) {
              setResults(status.results);
              onDetectionResults?.(status.results);
              setShowResults(true);
            }
            toast({
              title: 'Detection Complete! 🎉',
              description: `Successfully processed ${status.results?.length || 0} frames with ${
                status.results?.reduce((acc, r) => acc + r.players.length, 0) || 0
              } player detections.`,
            });
          } else if (status.status === 'failed') {
            setIsDetecting(false);
            toast({
              title: 'Detection Failed ❌',
              description: status.error || 'Unknown error occurred during processing.',
              variant: 'destructive',
            });
          }
        } catch (error: any) {
          console.error('Error polling job status:', error);
          setIsDetecting(false);
          toast({
            title: 'Connection Lost 📡',
            description: 'Lost connection to detection service. Please check your internet connection.',
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

  const checkServiceHealth = useCallback(async () => {
    try {
      const health = await enhancedPythonDetectionService.healthCheck();
      setServiceHealth(health.status);
    } catch (error) {
      console.error('Service health check failed:', error);
      setServiceHealth('offline');
    }
  }, []);

  const validateVideoUrl = useCallback(async (url: string) => {
    if (!url) return;
    
    setIsValidating(true);
    try {
      const validation = await enhancedPythonDetectionService.validateVideoUrl(url);
      setVideoValidation(validation);
      
      if (!validation.valid) {
        toast({
          title: 'Invalid Video URL ⚠️',
          description: validation.error || 'Please check the video URL and try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Video validation failed:', error);
      setVideoValidation({ valid: false, error: error.message });
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const startDetection = async () => {
    if (!videoUrl) {
      toast({
        title: 'Missing Video URL 📎',
        description: 'Please provide a YouTube video URL to start detection.',
        variant: 'destructive',
      });
      return;
    }

    if (videoValidation && !videoValidation.valid) {
      toast({
        title: 'Invalid Video URL ⚠️',
        description: 'Please enter a valid YouTube video URL.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDetecting(true);
      setResults([]);
      
      const result = await enhancedPythonDetectionService.startDetection({
        videoUrl,
        frameRate: config.frameRate,
        confidenceThreshold: config.confidenceThreshold,
        trackPlayers: config.trackPlayers,
        trackBall: config.trackBall,
      });

      setCurrentJob({ 
        job_id: result.job_id, 
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      toast({
        title: 'Detection Started! 🚀',
        description: `Job ${result.job_id.slice(0, 8)}... has been queued for processing.`,
      });
    } catch (error: any) {
      console.error('Error starting detection:', error);
      setIsDetecting(false);
      toast({
        title: 'Detection Failed to Start ❌',
        description: error.message || 'Failed to start detection service. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stopDetection = async () => {
    if (currentJob?.job_id) {
      try {
        await enhancedPythonDetectionService.cancelJob(currentJob.job_id);
        setIsDetecting(false);
        setCurrentJob(null);
        toast({
          title: 'Detection Cancelled 🛑',
          description: 'The detection job has been successfully cancelled.',
        });
      } catch (error: any) {
        console.error('Error cancelling detection:', error);
        toast({
          title: 'Cancellation Failed ⚠️',
          description: error.message || 'Failed to cancel detection job.',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusIcon = () => {
    switch (currentJob?.status) {
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'failed': return <XCircle className="h-3 w-3 text-red-400" />;
      case 'processing': return <Loader2 className="h-3 w-3 animate-spin text-blue-400" />;
      default: return <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />;
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

  const getServiceHealthIcon = () => {
    switch (serviceHealth) {
      case 'online': return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'degraded': return <AlertTriangle className="h-3 w-3 text-yellow-400" />;
      case 'offline': return <XCircle className="h-3 w-3 text-red-400" />;
      default: return <Loader2 className="h-3 w-3 animate-spin text-gray-400" />;
    }
  };

  return (
    <div className="space-y-3 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-white/70" />
          <span className="font-medium text-sm">AI Detection Pro</span>
          <div className="flex items-center gap-1">
            {getServiceHealthIcon()}
            <Badge 
              variant={serviceHealth === 'online' ? 'default' : 'destructive'}
              className="text-xs px-1.5 py-0.5"
            >
              {serviceHealth}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={checkServiceHealth}
            className="text-white/70 hover:text-white h-6 w-6 p-0"
            title="Refresh service status"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white/70 hover:text-white h-6 w-6 p-0"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Video URL Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value);
              setVideoValidation(null);
            }}
            onBlur={() => validateVideoUrl(videoUrl)}
            disabled={isDetecting}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm h-8 flex-1"
          />
          {isValidating && <Loader2 className="h-4 w-4 animate-spin text-white/70 mt-2" />}
        </div>
        
        {videoValidation && videoValidation.valid && videoValidation.metadata && (
          <Card className="bg-green-500/10 border-green-400/20">
            <CardContent className="p-2">
              <div className="flex items-center gap-2 text-xs text-green-300">
                <CheckCircle className="h-3 w-3" />
                <span className="font-medium">{videoValidation.metadata.title}</span>
                <span className="text-green-400/70">• {Math.round(videoValidation.metadata.duration / 60)}min</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Settings Panel */}
      <Collapsible open={showSettings} onOpenChange={setShowSettings}>
        <CollapsibleContent className="space-y-2">
          <Card className="bg-black/20 border-white/10">
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Frame Rate (fps)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={config.frameRate}
                    onChange={(e) => setConfig(prev => ({ ...prev, frameRate: parseInt(e.target.value) || 5 }))}
                    disabled={isDetecting}
                    className="bg-white/10 border-white/20 text-white text-xs h-7"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-white/70 text-xs">Confidence (%)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="100"
                    value={Math.round(config.confidenceThreshold * 100)}
                    onChange={(e) => setConfig(prev => ({ ...prev, confidenceThreshold: (parseInt(e.target.value) || 50) / 100 }))}
                    disabled={isDetecting}
                    className="bg-white/10 border-white/20 text-white text-xs h-7"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="track-players"
                    checked={config.trackPlayers}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, trackPlayers: checked }))}
                    disabled={isDetecting}
                    className="scale-75"
                  />
                  <Label htmlFor="track-players" className="text-white/70 text-xs">Players</Label>
                </div>
                <div className="flex items-center space-x-2">
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
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Job Status */}
      {currentJob && (
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-xs text-white/70">Status:</span>
                <Badge variant={getStatusBadgeVariant(currentJob.status)} className="text-xs">
                  {currentJob.status}
                </Badge>
              </div>
              <span className="text-xs text-white/50">
                Job: {currentJob.job_id.slice(0, 8)}...
              </span>
            </div>
            
            {currentJob.progress !== undefined && (
              <div className="space-y-1">
                <Progress value={currentJob.progress} className="h-2" />
                <div className="text-xs text-white/50 text-center">
                  {Math.round(currentJob.progress)}% complete
                </div>
              </div>
            )}
            
            {currentJob.video_metadata && (
              <div className="text-xs text-white/50 grid grid-cols-2 gap-2">
                <span>Duration: {Math.round(currentJob.video_metadata.duration / 60)}min</span>
                <span>Frames: {currentJob.video_metadata.total_frames}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!isDetecting ? (
          <Button
            onClick={startDetection}
            disabled={!videoUrl || serviceHealth === 'offline' || (videoValidation && !videoValidation.valid)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs h-8 px-4 flex-1"
          >
            <Play className="h-3 w-3" />
            Start AI Detection
          </Button>
        ) : (
          <Button
            onClick={stopDetection}
            variant="destructive"
            className="flex items-center gap-2 text-xs h-8 px-4 flex-1"
          >
            <Square className="h-3 w-3" />
            Cancel Detection
          </Button>
        )}
        
        {results.length > 0 && (
          <Button
            onClick={() => setShowResults(!showResults)}
            variant="outline"
            size="sm"
            className="text-white border-white/20 hover:bg-white/10 text-xs h-8 px-3"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${showResults ? 'rotate-180' : ''}`} />
            Results ({results.length})
          </Button>
        )}
      </div>

      {/* Results Panel */}
      {showResults && results.length > 0 && (
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Detection Results</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDetectionResults?.(results)}
                  className="text-white/70 hover:text-white text-xs h-6 px-2"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-white/5 rounded">
                  <div className="text-lg font-bold text-blue-400">
                    {results.reduce((acc, r) => acc + r.players.length, 0)}
                  </div>
                  <div className="text-white/70">Players</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded">
                  <div className="text-lg font-bold text-green-400">
                    {results.filter(r => r.ball).length}
                  </div>
                  <div className="text-white/70">Ball Frames</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded">
                  <div className="text-lg font-bold text-purple-400">
                    {results.length}
                  </div>
                  <div className="text-white/70">Total Frames</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Warning */}
      {serviceHealth === 'offline' && (
        <Card className="bg-red-500/10 border-red-400/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-red-300 text-xs">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <div className="font-medium">Detection service offline</div>
                <div className="text-red-400/70">Please deploy the Python service to PythonAnywhere first.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
