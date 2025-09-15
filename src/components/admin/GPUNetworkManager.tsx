import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
  Clock, 
  Globe, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface AddNodeFormData {
  name: string;
  endpoint: string;
  api_key: string;
  location: string;
  priority: number;
  capabilities: string[];
}

export const GPUNetworkManager: React.FC = () => {
  const [nodes, setNodes] = useState<GPUNode[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GPUNode | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [newNode, setNewNode] = useState<AddNodeFormData>({
    name: '',
    endpoint: '',
    api_key: '',
    location: 'US-East',
    priority: 50,
    capabilities: ['yolo', 'detection'],
  });

  const loadNetworkData = useCallback(async () => {
    setLoading(true);
    try {
      setNodes(distributedGPUService.getNodes());
      setNetworkStats(distributedGPUService.getNetworkStats());
    } catch (error) {
      console.error('Failed to load network data:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        toast.error('You must be logged in to connect.');
        setLoading(false);
        return;
      }
      setUserId(session.user.id);
      const success = await distributedGPUService.connect(session.access_token);
      if (success) {
        setIsConnected(true);
        toast.success('Connected to GPU network');
        await loadNetworkData();
        setupEventListeners();
      } else {
        toast.error('Failed to connect to GPU network');
      }
    } catch (err: any) {
      toast.error(`Connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = useCallback(() => {
    const onUpdateUnsubscribe = distributedGPUService.onNodeUpdate((node) => {
        setNodes(prev => {
            const index = prev.findIndex(n => n.id === node.id);
            if (index >= 0) {
                return [...prev.slice(0, index), node, ...prev.slice(index + 1)];
            }
            return [...prev, node];
        });
    });

    const onRemovedUnsubscribe = distributedGPUService.onNodeRemoved((nodeId) => {
        setNodes(prev => prev.filter(n => n.id !== nodeId));
    });

    const onStatsUpdateUnsubscribe = distributedGPUService.onNetworkStatsUpdate((stats) => {
      setNetworkStats(stats);
    });

    return () => {
        onUpdateUnsubscribe();
        onRemovedUnsubscribe();
        onStatsUpdateUnsubscribe();
    };
  }, []);

  const handleAddNode = async () => {
    if (!userId) {
        toast.error("User not authenticated.");
        return;
    }
    setActionLoading('add');
    try {
      const nodeToAdd = {
        ...newNode,
        owner_id: userId,
        status: 'offline',
      };
      await distributedGPUService.addNode(nodeToAdd as any);
      toast.success(`Node "${newNode.name}" added successfully.`);
      setShowAddDialog(false);
      setNewNode({
        name: '',
        endpoint: '',
        api_key: '',
        location: 'US-East',
        priority: 50,
        capabilities: ['yolo', 'detection'],
      });
    } catch (error: any) {
      toast.error(`Failed to add node: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveNode = async (nodeId: string) => {
    setActionLoading(nodeId);
    try {
      await distributedGPUService.removeNode(nodeId);
      toast.success('Node removed from network');
    } catch (error: any) {
      toast.error(`Failed to remove node: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'busy': return 'secondary';
      case 'offline': return 'destructive';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'busy': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    if (isConnected) {
        const cleanup = setupEventListeners();
        return cleanup;
    }
  }, [isConnected, setupEventListeners]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GPU Network Manager</h1>
          <p className="text-muted-foreground">Manage distributed GPU nodes for inference processing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadNetworkData}
            disabled={loading || !isConnected}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {!isConnected && (
            <Button onClick={handleConnect} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect to Network'}
            </Button>
          )}
        </div>
      </div>

      {isConnected && networkStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Server className="h-4 w-4" />Total Nodes</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.totalNodes}</div>
              <div className="text-xs text-muted-foreground">{networkStats.onlineNodes} online</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Activity className="h-4 w-4" />Network Load</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(networkStats.averageUtilization || 0).toFixed(1)}%</div>
              <Progress value={networkStats.averageUtilization} className="h-2 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" />Queue</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.queuedJobs}</div>
              <div className="text-xs text-muted-foreground">{networkStats.processingJobs} processing</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" />Completed (24h)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{networkStats.completedJobs24h}</div></CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" />GPU Nodes ({nodes.length})</CardTitle>
            {isConnected && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Node</Button></DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Add New GPU Node</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nodeName">Node Name</Label>
                      <Input id="nodeName" value={newNode.name} onChange={(e) => setNewNode({...newNode, name: e.target.value})} placeholder="e.g., Production-RTX-4060-01" />
                    </div>
                    <div>
                      <Label htmlFor="endpoint">Endpoint URL</Label>
                      <Input id="endpoint" value={newNode.endpoint} onChange={(e) => setNewNode({...newNode, endpoint: e.target.value})} placeholder="https://node.example.com:8080" />
                    </div>
                    <div>
                      <Label htmlFor="nodeApiKey">Node API Key</Label>
                      <Input id="nodeApiKey" type="password" value={newNode.api_key} onChange={(e) => setNewNode({...newNode, api_key: e.target.value})} placeholder="Enter node's secret API key" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Location</Label>
                        <Select value={newNode.location} onValueChange={(value) => setNewNode({...newNode, location: value})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
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
                        <Input type="number" min="0" max="100" value={newNode.priority} onChange={(e) => setNewNode({...newNode, priority: parseInt(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div>
                      <Label>Capabilities</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['yolo', 'detection', 'tracking', 'segmentation', 'classification'].map((cap) => (
                          <Badge key={cap} variant={newNode.capabilities.includes(cap) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => {
                              const caps = newNode.capabilities.includes(cap) ? newNode.capabilities.filter(c => c !== cap) : [...newNode.capabilities, cap];
                              setNewNode({...newNode, capabilities: caps});
                          }}>{cap}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleAddNode} disabled={actionLoading === 'add'} className="w-full">
                      {actionLoading === 'add' ? 'Adding...' : 'Add Node to Network'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8 text-muted-foreground">Connect to the network to manage GPU nodes.</div>
          ) : nodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No GPU nodes configured. Add your first node to get started.</div>
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
                          {node.gpuInfo?.name && <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{node.gpuInfo.name}</span>}
                          {node.location && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{node.location}</span>}
                          {node.performance?.queueLength !== undefined && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Queue: {node.performance.queueLength}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {node.performance && (
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
                      )}
                      <Button variant="outline" size="sm" onClick={() => { setSelectedNode(node); setShowDetailsDialog(true); }}><Eye className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={actionLoading === node.id}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Remove Node</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove "{node.name}" from the network? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveNode(node.id)}>Remove Node</AlertDialogAction>
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
              {selectedNode.gpuInfo && (
                <div>
                  <h3 className="font-medium mb-3">GPU Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><Label>GPU Model</Label><div className="font-mono">{selectedNode.gpuInfo.name}</div></div>
                    <div><Label>Memory</Label><div className="font-mono">{selectedNode.gpuInfo.memoryTotal} MB</div></div>
                    <div><Label>Driver Version</Label><div className="font-mono">{selectedNode.gpuInfo.driverVersion}</div></div>
                    <div><Label>CUDA Version</Label><div className="font-mono">{selectedNode.gpuInfo.cudaVersion}</div></div>
                  </div>
                </div>
              )}
              {selectedNode.performance && (
                <div>
                  <h3 className="font-medium mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><Zap className="h-4 w-4" /><span className="text-sm">GPU Utilization</span></div>
                      <Progress value={selectedNode.performance.utilization} />
                      <span className="text-xs text-muted-foreground">{selectedNode.performance.utilization}%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><Thermometer className="h-4 w-4" /><span className="text-sm">Temperature</span></div>
                      <div className="text-2xl font-mono">{selectedNode.performance.temperature}°C</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><Zap className="h-4 w-4" /><span className="text-sm">Power Draw</span></div>
                      <div className="text-2xl font-mono">{selectedNode.performance.powerDraw}W</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span className="text-sm">Queue Length</span></div>
                      <div className="text-2xl font-mono">{selectedNode.performance.queueLength}</div>
                    </div>
                  </div>
                </div>
              )}
              {selectedNode.capabilities && (
                <div>
                  <h3 className="font-medium mb-3">Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.capabilities.map((capability) => (<Badge key={capability} variant="outline">{capability}</Badge>))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="font-medium mb-3">System Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><Label>Location</Label><div>{selectedNode.location}</div></div>
                  <div><Label>Priority</Label><div>{selectedNode.priority}</div></div>
                  {selectedNode.lastHeartbeat && (
                    <div><Label>Last Heartbeat</Label><div className="font-mono">{new Date(selectedNode.lastHeartbeat).toLocaleString()}</div></div>
                  )}
                  {selectedNode.performance?.averageInferenceTime && (
                    <div><Label>Average Inference Time</Label><div className="font-mono">{selectedNode.performance.averageInferenceTime}ms</div></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};