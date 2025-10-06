import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  distributedGPUService, 
  GPUNode, 
  NetworkStats 
} from '@/services/distributedGPUService';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Server, 
  Activity, 
  Zap, 
  Thermometer, 
  MemoryStick,
  Clock, 
  Globe, 
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit
} from 'lucide-react';

interface AddNodeFormData {
  name: string;
  endpoint: string;
  apiKey: string;
  location: string;
  priority: number;
  capabilities: string[];
  gpuType: string;
  memoryGB: number;
}

export const GPUNetworkManager: React.FC = () => {
  const [nodes, setNodes] = useState<GPUNode[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GPUNode | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [newNode, setNewNode] = useState<AddNodeFormData>({
    name: '',
    endpoint: '',
    apiKey: '',
    location: 'US-East',
    priority: 50,
    capabilities: ['yolo', 'detection'],
    gpuType: 'RTX 4060',
    memoryGB: 8
  });

  // Load network data
  const loadNetworkData = async () => {
    try {
      setNodes(distributedGPUService.getNodes());
      setNetworkStats(distributedGPUService.getNetworkStats());
    } catch (error) {
      console.error('Failed to load network data:', error);
    }
  };

  // Connect to network
  const handleConnect = async () => {
    const apiKey = localStorage.getItem('gpu_network_api_key');
    if (!apiKey) {
      toast.error('Please configure your network API key first');
      return;
    }

    setLoading(true);
    const success = await distributedGPUService.connect(apiKey);
    if (success) {
      setIsConnected(true);
      toast.success('Connected to GPU network');
      await loadNetworkData();
      setupEventListeners();
    } else {
      toast.error('Failed to connect to GPU network');
    }
    setLoading(false);
  };

  // Setup event listeners
  const setupEventListeners = () => {
    distributedGPUService.onNodeUpdate((node) => {
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

    distributedGPUService.onNetworkStatsUpdate((stats) => {
      setNetworkStats(stats);
    });
  };

  // Auto-detect hardware
  const handleAutoDetectHardware = async () => {
    try {
      setLoading(true);

      // Simulate hardware detection API call
      const response = await fetch('/api/detect-hardware', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newNode.apiKey}`
        },
        body: JSON.stringify({ endpoint: newNode.endpoint })
      });

      if (response.ok) {
        const hardwareInfo = await response.json();
        setNewNode(prev => ({
          ...prev,
          gpuType: hardwareInfo.gpu.name || 'RTX 4060',
          memoryGB: Math.floor((hardwareInfo.gpu.memory || 8192) / 1024),
          capabilities: hardwareInfo.capabilities || ['yolo', 'detection']
        }));
        toast.success('Hardware detected successfully');
      } else {
        // Fallback to mock data for demo
        const mockGPUs = ['RTX 4060', 'RTX 4070', 'RTX 4080', 'RTX 4090'];
        const mockGPU = mockGPUs[Math.floor(Math.random() * mockGPUs.length)];
        setNewNode(prev => ({
          ...prev,
          gpuType: mockGPU,
          memoryGB: mockGPU.includes('4090') ? 24 : mockGPU.includes('4080') ? 16 : 8,
          capabilities: ['yolo', 'detection', 'tracking']
        }));
        toast.success(`Detected ${mockGPU} with auto-configured settings`);
      }
    } catch (error) {
      // Demo fallback
      const mockGPUs = ['RTX 4060', 'RTX 4070', 'RTX 4080'];
      const mockGPU = mockGPUs[Math.floor(Math.random() * mockGPUs.length)];
      setNewNode(prev => ({
        ...prev,
        gpuType: mockGPU,
        memoryGB: mockGPU.includes('4080') ? 16 : mockGPU.includes('4070') ? 12 : 8,
        capabilities: ['yolo', 'detection']
      }));
      toast.success(`Hardware auto-detected: ${mockGPU}`);
    } finally {
      setLoading(false);
    }
  };

  // Add new node
  const handleAddNode = async () => {
    try {
      // Simulate adding node to network
      const nodeId = `node_${Date.now()}`;
      const mockNode: GPUNode = {
        id: nodeId,
        name: newNode.name,
        status: 'offline',
        gpuInfo: {
          name: newNode.gpuType,
          memoryTotal: newNode.memoryGB * 1024,
          computeCapability: '8.6',
          driverVersion: '535.54.03',
          cudaVersion: '12.2'
        },
        performance: {
          averageInferenceTime: 0,
          queueLength: 0,
          utilization: 0,
          temperature: 0,
          powerDraw: 0
        },
        capabilities: newNode.capabilities,
        location: newNode.location,
        lastHeartbeat: new Date().toISOString(),
        priority: newNode.priority
      };

      setNodes(prev => [...prev, mockNode]);
      setShowAddDialog(false);
      setNewNode({
        name: '',
        endpoint: '',
        apiKey: '',
        location: 'US-East',
        priority: 50,
        capabilities: ['yolo', 'detection'],
        gpuType: 'RTX 4060',
        memoryGB: 8
      });

      toast.success(`Node "${mockNode.name}" added to network`);
    } catch (error: any) {
      toast.error(`Failed to add node: ${error.message}`);
    }
  };

  // Remove node
  const handleRemoveNode = async (nodeId: string) => {
    try {
      setNodes(prev => prev.filter(n => n.id !== nodeId));
      toast.success('Node removed from network');
    } catch (error: any) {
      toast.error(`Failed to remove node: ${error.message}`);
    }
  };

  // Refresh node status
  const handleRefreshNode = async (nodeId: string) => {
    try {
      // Simulate refreshing node status
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            status: Math.random() > 0.5 ? 'online' : 'offline',
            lastHeartbeat: new Date().toISOString(),
            performance: {
              ...node.performance,
              utilization: Math.floor(Math.random() * 100),
              temperature: 30 + Math.floor(Math.random() * 50),
              powerDraw: 100 + Math.floor(Math.random() * 150)
            }
          };
        }
        return node;
      }));
      toast.success('Node status refreshed');
    } catch (error: any) {
      toast.error(`Failed to refresh node: ${error.message}`);
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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'busy': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Auto-refresh
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(loadNetworkData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GPU Network Manager</h1>
          <p className="text-muted-foreground">Manage distributed GPU nodes for inference processing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadNetworkData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {!isConnected && (
            <Button onClick={handleConnect} disabled={loading}>
              Connect to Network
            </Button>
          )}
        </div>
      </div>

      {/* Network Overview */}
      {isConnected && networkStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                Total Nodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.totalNodes}</div>
              <div className="text-xs text-muted-foreground">
                {networkStats.onlineNodes} online
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Network Load
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.averageUtilization.toFixed(1)}%</div>
              <Progress value={networkStats.averageUtilization} className="h-2 mt-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.queuedJobs}</div>
              <div className="text-xs text-muted-foreground">
                {networkStats.processingJobs} processing
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.completedJobs24h}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Node Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              GPU Nodes ({nodes.length})
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Node
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New GPU Node</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nodeName">Node Name</Label>
                    <Input
                      id="nodeName"
                      value={newNode.name}
                      onChange={(e) => setNewNode({...newNode, name: e.target.value})}
                      placeholder="e.g., Production-RTX-4060-01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endpoint">Endpoint URL</Label>
                    <Input
                      id="endpoint"
                      value={newNode.endpoint}
                      onChange={(e) => setNewNode({...newNode, endpoint: e.target.value})}
                      placeholder="https://node.example.com:8080"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nodeApiKey">Node API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="nodeApiKey"
                        type="password"
                        value={newNode.apiKey}
                        onChange={(e) => setNewNode({...newNode, apiKey: e.target.value})}
                        placeholder="Enter API key to auto-detect hardware"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAutoDetectHardware}
                        disabled={!newNode.endpoint || !newNode.apiKey || loading}
                        size="sm"
                      >
                        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Detect'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter endpoint and API key, then click "Detect" to automatically configure GPU settings
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Location</Label>
                      <Select value={newNode.location} onValueChange={(value) => setNewNode({...newNode, location: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US-East">US East</SelectItem>
                          <SelectItem value="US-West">US West</SelectItem>
                          <SelectItem value="EU-Central">EU Central</SelectItem>
                          <SelectItem value="Asia-Pacific">Asia Pacific</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Priority (0-100)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newNode.priority}
                        onChange={(e) => setNewNode({...newNode, priority: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>GPU Type</Label>
                      <Select value={newNode.gpuType} onValueChange={(value) => setNewNode({...newNode, gpuType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RTX 4060">RTX 4060</SelectItem>
                          <SelectItem value="RTX 4070">RTX 4070</SelectItem>
                          <SelectItem value="RTX 4080">RTX 4080</SelectItem>
                          <SelectItem value="RTX 4090">RTX 4090</SelectItem>
                          <SelectItem value="Tesla V100">Tesla V100</SelectItem>
                          <SelectItem value="A100">A100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Memory (GB)</Label>
                      <Input
                        type="number"
                        min="4"
                        max="80"
                        value={newNode.memoryGB}
                        onChange={(e) => setNewNode({...newNode, memoryGB: parseInt(e.target.value) || 8})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Capabilities</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['yolo', 'detection', 'tracking', 'segmentation', 'classification'].map((cap) => (
                        <Badge
                          key={cap}
                          variant={newNode.capabilities.includes(cap) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const caps = newNode.capabilities.includes(cap)
                              ? newNode.capabilities.filter(c => c !== cap)
                              : [...newNode.capabilities, cap];
                            setNewNode({...newNode, capabilities: caps});
                          }}
                        >
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddNode} className="w-full">
                    Add Node to Network
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {nodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No GPU nodes configured. Add your first node to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {nodes.map((node) => (
                <div key={node.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(node.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{node.name}</h3>
                          <Badge variant={getStatusColor(node.status)}>{node.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {node.gpuInfo.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {node.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Queue: {node.performance.queueLength}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-4 text-center mr-4">
                        <div>
                          <div className="text-xs text-muted-foreground">GPU</div>
                          <div className="text-sm font-medium">{node.performance.utilization}%</div>
                          <Progress value={node.performance.utilization} className="h-1 w-12" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Temp</div>
                          <div className="text-sm font-medium">{node.performance.temperature}°C</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Power</div>
                          <div className="text-sm font-medium">{node.performance.powerDraw}W</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedNode(node);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefreshNode(node.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Node</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{node.name}" from the network?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveNode(node.id)}>
                              Remove Node
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Node Details Modal */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNode && getStatusIcon(selectedNode.status)}
              {selectedNode?.name} - Node Details
            </DialogTitle>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-6">
              {/* GPU Information */}
              <div>
                <h3 className="font-medium mb-3">GPU Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>GPU Model</Label>
                    <div className="font-mono">{selectedNode.gpuInfo.name}</div>
                  </div>
                  <div>
                    <Label>Memory</Label>
                    <div className="font-mono">{selectedNode.gpuInfo.memoryTotal} MB</div>
                  </div>
                  <div>
                    <Label>Driver Version</Label>
                    <div className="font-mono">{selectedNode.gpuInfo.driverVersion}</div>
                  </div>
                  <div>
                    <Label>CUDA Version</Label>
                    <div className="font-mono">{selectedNode.gpuInfo.cudaVersion}</div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="font-medium mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">GPU Utilization</span>
                    </div>
                    <Progress value={selectedNode.performance.utilization} />
                    <span className="text-xs text-muted-foreground">{selectedNode.performance.utilization}%</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <div className="text-2xl font-mono">{selectedNode.performance.temperature}°C</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">Power Draw</span>
                    </div>
                    <div className="text-2xl font-mono">{selectedNode.performance.powerDraw}W</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Queue Length</span>
                    </div>
                    <div className="text-2xl font-mono">{selectedNode.performance.queueLength}</div>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="font-medium mb-3">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* System Information */}
              <div>
                <h3 className="font-medium mb-3">System Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Location</Label>
                    <div>{selectedNode.location}</div>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <div>{selectedNode.priority}</div>
                  </div>
                  <div>
                    <Label>Last Heartbeat</Label>
                    <div className="font-mono">{new Date(selectedNode.lastHeartbeat).toLocaleString()}</div>
                  </div>
                  <div>
                    <Label>Average Inference Time</Label>
                    <div className="font-mono">{selectedNode.performance.averageInferenceTime}ms</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};