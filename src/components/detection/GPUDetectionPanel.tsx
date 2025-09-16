import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  gpuDetectionService, 
  GPUDetectionJob, 
  GPUDetectionResult, 
  PCNodeConfig,
  PCNodeStatus,
  GPUMetrics 
} from '@/services/gpuDetectionService';
import { Play, Square, Settings, Zap, Thermometer, MemoryStick, Gauge } from 'lucide-react';

/**
 * @interface GPUDetectionPanelProps
 * @description Props for the GPUDetectionPanel component.
 * @property {string} videoUrl - The URL of the video to be analyzed.
 * @property {function(results: GPUDetectionResult[]): void} [onDetectionResults] - Optional callback for when detection results are available.
 * @property {function(job: GPUDetectionJob): void} [onJobUpdate] - Optional callback for job status updates.
 */
interface GPUDetectionPanelProps {
  videoUrl: string;
  onDetectionResults?: (results: GPUDetectionResult[]) => void;
  onJobUpdate?: (job: GPUDetectionJob) => void;
}

/**
 * @component GPUDetectionPanel
 * @description A control panel for managing video detection tasks on a dedicated, local GPU-enabled PC node.
 * It handles node connection, displays real-time GPU metrics, and allows for the configuration
 * and execution of detection jobs.
 * @param {GPUDetectionPanelProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
export const GPUDetectionPanel: React.FC<GPUDetectionPanelProps> = ({
  videoUrl,
  onDetectionResults,
  onJobUpdate
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<GPUDetectionJob | null>(null);
  const [nodeStatus, setNodeStatus] = useState<PCNodeStatus | null>(null);
  const [gpuMetrics, setGpuMetrics] = useState<GPUMetrics | null>(null);
  
  // Configuration
  const [apiKey, setApiKey] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [frameRate, setFrameRate] = useState(30);
  const [trackPlayers, setTrackPlayers] = useState(true);
  const [trackBall, setTrackBall] = useState(true);
  const [processingMode, setProcessingMode] = useState<'fast' | 'balanced' | 'accurate'>('balanced');
  const [useGPUAcceleration, setUseGPUAcceleration] = useState(true);

  // Initialize PC node connection
  const handleInitializeNode = async () => {
    if (!apiKey || !nodeId) {
      toast.error('Please enter API key and Node ID');
      return;
    }

    const config: PCNodeConfig = {
      apiKey,
      nodeId,
      heartbeatInterval: 30
    };

    const success = await gpuDetectionService.initializeNode(config);
    if (success) {
      setIsInitialized(true);
      toast.success('Connected to GPU PC node successfully!');
      await loadGPUMetrics();
      await loadNodeStatus();
    } else {
      toast.error('Failed to connect to PC node. Make sure gpu_monitor.py is running.');
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    const isOnline = await gpuDetectionService.testConnection();
    if (isOnline) {
      toast.success('PC node is online and responding!');
    } else {
      toast.error('PC node is offline or unreachable');
    }
  };

  // Load GPU metrics
  const loadGPUMetrics = async () => {
    try {
      const metrics = await gpuDetectionService.getGPUMetrics();
      setGpuMetrics(metrics);
    } catch (error) {
      console.error('Failed to load GPU metrics:', error);
    }
  };

  // Load node status
  const loadNodeStatus = async () => {
    try {
      const status = await gpuDetectionService.getNodeStatus();
      setNodeStatus(status);
    } catch (error) {
      console.error('Failed to load node status:', error);
    }
  };

  // Start detection
  const handleStartDetection = async () => {
    if (!videoUrl) {
      toast.error('Please provide a video URL');
      return;
    }

    if (!isInitialized) {
      toast.error('Please initialize PC node connection first');
      return;
    }

    setIsProcessing(true);
    try {
      const jobId = await gpuDetectionService.startDetection({
        videoUrl,
        frameRate,
        confidenceThreshold,
        trackPlayers,
        trackBall,
        processingMode,
        useGPUAcceleration
      });

      toast.success('GPU detection job started!');
      
      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const job = await gpuDetectionService.getJobStatus(jobId);
          setCurrentJob(job);
          onJobUpdate?.(job);

          if (job.status === 'completed') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            
            const results = await gpuDetectionService.getResults(jobId);
            onDetectionResults?.(results);
            toast.success(`Detection completed! Found ${results.length} frames with detections.`);
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            toast.error(`Detection failed: ${job.error}`);
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 2000);

    } catch (error: any) {
      setIsProcessing(false);
      toast.error(`Failed to start detection: ${error.message}`);
    }
  };

  // Cancel detection
  const handleCancelDetection = async () => {
    if (!currentJob) return;

    try {
      await gpuDetectionService.cancelJob(currentJob.jobId);
      setIsProcessing(false);
      setCurrentJob(null);
      toast.info('Detection job cancelled');
    } catch (error: any) {
      toast.error(`Failed to cancel job: ${error.message}`);
    }
  };

  // Auto-refresh metrics when initialized
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      loadGPUMetrics();
      loadNodeStatus();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [isInitialized]);

  return (
    <div className="space-y-4">
      {/* Node Configuration */}
      {!isInitialized && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              GPU PC Node Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your PC node API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nodeId">Node ID</Label>
              <Input
                id="nodeId"
                placeholder="Enter your PC node ID"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInitializeNode} className="flex-1">
                Connect to PC Node
              </Button>
              <Button variant="outline" onClick={handleTestConnection}>
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GPU Metrics Dashboard */}
      {isInitialized && gpuMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              RTX 4060 Status
              <Badge variant={nodeStatus?.status === 'online' ? 'default' : 'destructive'}>
                {nodeStatus?.status || 'Unknown'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">GPU Utilization</span>
                </div>
                <Progress value={gpuMetrics.utilization} className="h-2" />
                <span className="text-xs text-muted-foreground">{gpuMetrics.utilization}%</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4" />
                  <span className="text-sm">Memory</span>
                </div>
                <Progress value={(gpuMetrics.memoryUsed / gpuMetrics.memoryTotal) * 100} className="h-2" />
                <span className="text-xs text-muted-foreground">
                  {gpuMetrics.memoryUsed}MB / {gpuMetrics.memoryTotal}MB
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  <span className="text-sm">Temperature</span>
                </div>
                <div className="text-lg font-mono">{gpuMetrics.temperature}°C</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Power Draw</span>
                </div>
                <div className="text-lg font-mono">{gpuMetrics.powerDraw}W</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detection Controls */}
      {isInitialized && (
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
                <Label>Confidence Threshold: {confidenceThreshold}</Label>
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
                  id="useGPU"
                  checked={useGPUAcceleration}
                  onCheckedChange={setUseGPUAcceleration}
                />
                <Label htmlFor="useGPU">GPU Acceleration</Label>
              </div>
            </div>

            <div>
              <Label>Processing Mode</Label>
              <div className="flex gap-2 mt-2">
                {(['fast', 'balanced', 'accurate'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={processingMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProcessingMode(mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Job Status */}
            {currentJob && (
              <div className="space-y-2">
                <Label>Job Status</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{currentJob.jobId}</span>
                    <Badge variant={
                      currentJob.status === 'completed' ? 'default' :
                      currentJob.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {currentJob.status}
                    </Badge>
                  </div>
                  <Progress value={currentJob.progress} className="mt-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentJob.progress}% complete
                    {currentJob.estimatedTimeRemaining && (
                      <span> • {Math.round(currentJob.estimatedTimeRemaining / 1000)}s remaining</span>
                    )}
                  </div>
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
                {isProcessing ? 'Processing...' : 'Start GPU Detection'}
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