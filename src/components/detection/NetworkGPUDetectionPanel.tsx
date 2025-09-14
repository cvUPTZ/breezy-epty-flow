import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  distributedGPUService, 
  GPUNode, 
  InferenceJob, 
  NetworkStats 
} from '@/services/distributedGPUService';
import { 
  Play, 
  Square, 
  Settings, 
  Network, 
  Zap, 
  Server, 
  Activity,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface NetworkGPUDetectionPanelProps {
  videoUrl: string;
  onDetectionResults?: (results: any[]) => void;
  onJobUpdate?: (job: InferenceJob) => void;
}

export const NetworkGPUDetectionPanel: React.FC<NetworkGPUDetectionPanelProps> = ({
  videoUrl,
  onDetectionResults,
  onJobUpdate
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<InferenceJob | null>(null);
  const [nodes, setNodes] = useState<GPUNode[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  
  // Configuration
  const [apiKey, setApiKey] = useState('');
  const [modelType, setModelType] = useState<'yolo-v8' | 'yolo-v9' | 'football-detection' | 'custom'>('football-detection');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [frameRate, setFrameRate] = useState(30);
  const [maxFrames, setMaxFrames] = useState<number | undefined>(50);
  const [trackPlayers, setTrackPlayers] = useState(true);
  const [trackBall, setTrackBall] = useState(true);
  const [trackReferee, setTrackReferee] = useState(false);

  // Connect to GPU network
  const handleConnect = async () => {
    if (!apiKey) {
      toast.error('Please enter your API key');
      return;
    }

    const success = await distributedGPUService.connect(apiKey);
    if (success) {
      setIsConnected(true);
      toast.success('Connected to GPU network successfully!');
      loadNetworkData();
      setupEventListeners();
    } else {
      toast.error('Failed to connect to GPU network');
    }
  };

  // Load network data
  const loadNetworkData = () => {
    setNodes(distributedGPUService.getNodes());
    setNetworkStats(distributedGPUService.getNetworkStats());
  };

  // Setup event listeners
  const setupEventListeners = () => {
    const unsubscribeNode = distributedGPUService.onNodeUpdate((node) => {
      setNodes(prev => {
        const updated = [...prev];
        const index = updated.findIndex(n => n.id === node.id);
        if (index >= 0) {
          updated[index] = node;
        } else {
          updated.push(node);
        }
        return updated;
      });
    });

    const unsubscribeJob = distributedGPUService.onJobUpdate((job) => {
      setCurrentJob(job);
      onJobUpdate?.(job);
      
      if (job.status === 'completed') {
        setIsProcessing(false);
        onDetectionResults?.(job.results);
        toast.success(`Detection completed! Processed ${job.metrics.processedFrames} frames.`);
      } else if (job.status === 'failed') {
        setIsProcessing(false);
        toast.error(`Detection failed: ${job.error}`);
      }
    });

    const unsubscribeStats = distributedGPUService.onNetworkStatsUpdate((stats) => {
      setNetworkStats(stats);
    });

    return () => {
      unsubscribeNode();
      unsubscribeJob();
      unsubscribeStats();
    };
  };

  // Start detection
  const handleStartDetection = async () => {
    if (!videoUrl) {
      toast.error('Please provide a video URL');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect to GPU network first');
      return;
    }

    setIsProcessing(true);
    try {
      const jobId = await distributedGPUService.submitInferenceJob({
        videoUrl,
        modelType,
        confidenceThreshold,
        frameRate,
        maxFrames,
        trackPlayers,
        trackBall,
        trackReferee
      });

      toast.success('Detection job submitted to GPU network!');
      
      // Poll for initial job status
      const pollInterval = setInterval(() => {
        const job = distributedGPUService.getJobStatus(jobId);
        if (job) {
          setCurrentJob(job);
          if (job.status === 'completed' || job.status === 'failed') {
            clearInterval(pollInterval);
          }
        }
      }, 1000);

    } catch (error: any) {
      setIsProcessing(false);
      toast.error(`Failed to start detection: ${error.message}`);
    }
  };

  // Cancel detection
  const handleCancelDetection = async () => {
    if (!currentJob) return;

    try {
      await distributedGPUService.cancelJob(currentJob.id);
      setIsProcessing(false);
      setCurrentJob(null);
      toast.info('Detection job cancelled');
    } catch (error: any) {
      toast.error(`Failed to cancel job: ${error.message}`);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'busy': return 'secondary';
      case 'offline': return 'destructive';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  // Auto-refresh network stats
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      loadNetworkData();
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="space-y-4">
      {/* Network Connection */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Connect to GPU Network
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey">Network API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your GPU network API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <Button onClick={handleConnect} className="w-full">
              <Network className="h-4 w-4 mr-2" />
              Connect to Network
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Network Status Dashboard */}
      {isConnected && networkStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Network Status
              <Badge variant="default">Connected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span className="text-sm">Online Nodes</span>
                </div>
                <div className="text-2xl font-bold">{networkStats.onlineNodes}/{networkStats.totalNodes}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Avg. Utilization</span>
                </div>
                <div className="text-2xl font-bold">{networkStats.averageUtilization.toFixed(1)}%</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Queue Length</span>
                </div>
                <div className="text-2xl font-bold">{networkStats.queuedJobs}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Completed 24h</span>
                </div>
                <div className="text-2xl font-bold">{networkStats.completedJobs24h}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Nodes */}
      {isConnected && nodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available GPU Nodes ({nodes.filter(n => n.status === 'online').length} online)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nodes.slice(0, 6).map((node) => (
                <div key={node.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(node.status)}>{node.status}</Badge>
                    <div>
                      <div className="font-medium">{node.name}</div>
                      <div className="text-sm text-muted-foreground">{node.gpuInfo.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{node.performance.utilization}%</div>
                    <div className="text-xs text-muted-foreground">Queue: {node.performance.queueLength}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detection Configuration */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Detection Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Model Type</Label>
                <Select value={modelType} onValueChange={(value: any) => setModelType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="football-detection">Football Detection</SelectItem>
                    <SelectItem value="yolo-v8">YOLO v8</SelectItem>
                    <SelectItem value="yolo-v9">YOLO v9</SelectItem>
                    <SelectItem value="custom">Custom Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Frame Rate: {frameRate} FPS</Label>
                <Slider
                  value={[frameRate]}
                  onValueChange={(value) => setFrameRate(value[0])}
                  max={60}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Confidence: {confidenceThreshold}</Label>
                <Slider
                  value={[confidenceThreshold]}
                  onValueChange={(value) => setConfidenceThreshold(value[0])}
                  max={1}
                  min={0.1}
                  step={0.05}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Max Frames</Label>
                <Input
                  type="number"
                  value={maxFrames || ''}
                  onChange={(e) => setMaxFrames(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="trackPlayers"
                  checked={trackPlayers}
                  onCheckedChange={setTrackPlayers}
                />
                <Label htmlFor="trackPlayers">Track Players</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="trackBall"
                  checked={trackBall}
                  onCheckedChange={setTrackBall}
                />
                <Label htmlFor="trackBall">Track Ball</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="trackReferee"
                  checked={trackReferee}
                  onCheckedChange={setTrackReferee}
                />
                <Label htmlFor="trackReferee">Track Referee</Label>
              </div>
            </div>

            {/* Current Job Status */}
            {currentJob && (
              <div className="space-y-2">
                <Label>Job Status</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">{currentJob.id}</span>
                    <div className="flex items-center gap-2">
                      {currentJob.status === 'processing' && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <Badge variant={
                        currentJob.status === 'completed' ? 'default' :
                        currentJob.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {currentJob.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {currentJob.assignedNodeId && (
                    <div className="text-xs text-muted-foreground mb-2">
                      Assigned to: {nodes.find(n => n.id === currentJob.assignedNodeId)?.name || currentJob.assignedNodeId}
                    </div>
                  )}
                  
                  <Progress value={currentJob.progress} className="mb-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>Progress: {currentJob.progress}%</div>
                    <div>Frames: {currentJob.metrics.processedFrames}/{currentJob.metrics.totalFrames}</div>
                    <div>Players: {currentJob.metrics.detectedPlayers}</div>
                    <div>Balls: {currentJob.metrics.detectedBalls}</div>
                  </div>
                  
                  {currentJob.metrics.estimatedTimeRemaining && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Estimated time remaining: {Math.round(currentJob.metrics.estimatedTimeRemaining / 1000)}s
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleStartDetection}
                disabled={isProcessing || !videoUrl}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing on Network...' : 'Start Network Detection'}
              </Button>
              
              {isProcessing && (
                <Button variant="outline" onClick={handleCancelDetection}>
                  <Square className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};