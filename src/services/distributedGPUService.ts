// Distributed GPU Network Service - Manages inference across multiple GPU nodes
export interface GPUNode {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  gpuInfo: {
    name: string;
    memoryTotal: number;
    computeCapability: string;
    driverVersion: string;
    cudaVersion: string;
  };
  performance: {
    averageInferenceTime: number; // ms per frame
    queueLength: number;
    utilization: number; // 0-100%
    temperature: number;
    powerDraw: number;
  };
  capabilities: string[];
  location: string;
  lastHeartbeat: string;
  priority: number; // Higher = better priority
}

export interface InferenceJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  assignedNodeId?: string;
  videoUrl: string;
  config: {
    modelType: 'yolo-v8' | 'yolo-v9' | 'football-detection' | 'custom';
    confidenceThreshold: number;
    frameRate: number;
    maxFrames?: number;
    trackPlayers: boolean;
    trackBall: boolean;
    trackReferee: boolean;
  };
  results: DetectionFrame[];
  metrics: {
    totalFrames: number;
    processedFrames: number;
    detectedPlayers: number;
    detectedBalls: number;
    averageProcessingTime: number;
    estimatedTimeRemaining?: number;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface DetectionFrame {
  frameIndex: number;
  timestamp: number;
  detections: Array<{
    class: 'player' | 'ball' | 'referee' | 'goalpost' | 'field_line';
    confidence: number;
    bbox: { x: number; y: number; width: number; height: number };
    team?: 'home' | 'away';
    jerseyNumber?: number;
    tracking_id?: string;
    attributes?: Record<string, any>;
  }>;
  processingTime: number;
  nodeId: string;
}

export interface NetworkStats {
  totalNodes: number;
  onlineNodes: number;
  busyNodes: number;
  totalGPUs: number;
  totalVRAM: number;
  averageUtilization: number;
  queuedJobs: number;
  processingJobs: number;
  completedJobs24h: number;
}

export interface LoadBalancingConfig {
  algorithm: 'round_robin' | 'least_loaded' | 'performance_based' | 'geographic';
  preferredLocations?: string[];
  maxQueueLength?: number;
  failoverEnabled: boolean;
  retryAttempts: number;
}

class DistributedGPUService {
  private httpBaseUrl: string;
  private wsBaseUrl: string;
  private accessToken: string | null = null;
  private wsConnection: WebSocket | null = null;
  private nodes: Map<string, GPUNode> = new Map();
  private jobs: Map<string, InferenceJob> = new Map();
  private loadBalancing: LoadBalancingConfig;

  private eventListeners: {
    nodeUpdate: ((node: GPUNode) => void)[];
    nodeRemoved: ((nodeId: string) => void)[];
    jobUpdate: ((job: InferenceJob) => void)[];
    networkStats: ((stats: NetworkStats) => void)[];
  } = {
    nodeUpdate: [],
    nodeRemoved: [],
    jobUpdate: [],
    networkStats: [],
  };

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
    this.httpBaseUrl = `${supabaseUrl}/functions/v1/gpu-network-manager`;
    this.wsBaseUrl = supabaseUrl.replace(/^http/, 'ws') + '/functions/v1/gpu-network-manager';

    this.loadBalancing = {
      algorithm: 'performance_based',
      failoverEnabled: true,
      retryAttempts: 3,
    };
  }

  // Initialize connection to GPU network
  async connect(accessToken: string): Promise<boolean> {
    this.accessToken = accessToken;

    try {
      // First, get initial list of nodes
      const response = await fetch(`${this.httpBaseUrl}/gpu-nodes`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const initialNodes = await response.json();

      this.nodes.clear();
      for (const node of initialNodes) {
        this.nodes.set(node.id, node);
      }

      // Establish WebSocket connection for real-time updates
      await this.connectWebSocket();

      return true;
    } catch (error) {
      console.error('Failed to connect to GPU network:', error);
      return false;
    }
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wsConnection = new WebSocket(`${this.wsBaseUrl}?token=${this.accessToken}`);

      this.wsConnection.onopen = () => {
        console.log('Connected to GPU network via WebSocket');
        resolve();
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.wsConnection.onclose = () => {
        console.log('WebSocket connection closed, attempting to reconnect...');
        setTimeout(() => this.reconnectWebSocket(), 5000);
      };
    });
  }

  private async reconnectWebSocket(): Promise<void> {
    if (this.accessToken) {
      try {
        await this.connectWebSocket();
      } catch (error) {
        console.error('Failed to reconnect WebSocket:', error);
      }
    }
  }

  private handleWebSocketMessage(message: any): void {
    const { type, payload } = message;
    let statsChanged = false;
    switch (type) {
      case 'node_added':
      case 'node_updated':
        this.nodes.set(payload.id, payload);
        this.eventListeners.nodeUpdate.forEach((listener) => listener(payload));
        statsChanged = true;
        break;
      case 'node_removed':
        this.nodes.delete(payload.id);
        this.eventListeners.nodeRemoved.forEach((listener) => listener(payload.id));
        statsChanged = true;
        break;
      case 'job_update':
        this.jobs.set(payload.id, payload);
        this.eventListeners.jobUpdate.forEach((listener) => listener(payload));
        statsChanged = true;
        break;
    }
    if (statsChanged) {
        this.eventListeners.networkStats.forEach(listener => listener(this.getNetworkStats()));
    }
  }

  async addNode(nodeData: Partial<GPUNode> & { endpoint: string; api_key: string }): Promise<GPUNode> {
    if (!this.accessToken) throw new Error('Not connected');

    const response = await fetch(`${this.httpBaseUrl}/gpu-nodes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nodeData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add node: ${errorText}`);
    }
    return await response.json();
  }

  async removeNode(nodeId: string): Promise<void> {
    if (!this.accessToken) throw new Error('Not connected');

    const response = await fetch(`${this.httpBaseUrl}/gpu-nodes/${nodeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove node: ${errorText}`);
    }
  }

  async sendHeartbeat(nodeId: string, status: string, performance: any): Promise<void> {
    if (!this.accessToken) throw new Error('Not connected');

    await fetch(`${this.httpBaseUrl}/gpu-nodes/${nodeId}/heartbeat`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, performance })
    });
  }

  // Submit inference job to network
  async submitInferenceJob(config: {
    videoUrl: string;
    modelType: 'yolo-v8' | 'yolo-v9' | 'football-detection' | 'custom';
    confidenceThreshold: number;
    frameRate: number;
    maxFrames?: number;
    trackPlayers: boolean;
    trackBall: boolean;
    trackReferee: boolean;
  }): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Not connected to GPU network');
    }

    const response = await fetch(`${this.httpBaseUrl}/jobs/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config,
        loadBalancing: this.loadBalancing
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to submit job: ${response.statusText}`);
    }

    const result = await response.json();
    return result.jobId;
  }

  getOptimalNode(requirements?: { minVRAM?: number; preferredLocation?: string }): GPUNode | null {
    const availableNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'online' && (node.performance?.queueLength ?? 0) < 10);

    if (availableNodes.length === 0) return null;

    switch (this.loadBalancing.algorithm) {
      case 'least_loaded':
        return availableNodes.reduce((best, node) => 
          (node.performance?.queueLength ?? 0) < (best.performance?.queueLength ?? 0) ? node : best
        );
      
      case 'performance_based':
        return availableNodes.reduce((best, node) => {
          const nodeScore = this.calculateNodeScore(node);
          const bestScore = this.calculateNodeScore(best);
          return nodeScore > bestScore ? node : best;
        });
      
      case 'geographic':
        if (requirements?.preferredLocation) {
          const localNodes = availableNodes.filter(node => 
            node.location === requirements.preferredLocation
          );
          if (localNodes.length > 0) {
            return localNodes.reduce((best, node) => 
              this.calculateNodeScore(node) > this.calculateNodeScore(best) ? node : best
            );
          }
        }
        return availableNodes[0];
      
      case 'round_robin':
      default:
        return availableNodes[Math.floor(Math.random() * availableNodes.length)];
    }
  }

  private calculateNodeScore(node: GPUNode): number {
    const utilizationScore = (100 - (node.performance?.utilization ?? 0)) / 100;
    const queueScore = Math.max(0, (10 - (node.performance?.queueLength ?? 0)) / 10);
    const performanceScore = 1 / Math.max(1, node.performance?.averageInferenceTime ?? Infinity);
    const priorityScore = node.priority / 100;
    
    return (utilizationScore * 0.3 + queueScore * 0.3 + performanceScore * 0.2 + priorityScore * 0.2);
  }

  getJobStatus(jobId: string): InferenceJob | null {
    return this.jobs.get(jobId) || null;
  }

  async cancelJob(jobId: string): Promise<void> {
    if (!this.accessToken) throw new Error('Not connected');

    await fetch(`${this.httpBaseUrl}/jobs/${jobId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  getNetworkStats(): NetworkStats {
    const nodes = Array.from(this.nodes.values());
    const jobs = Array.from(this.jobs.values());
    
    const onlineNodes = nodes.filter(n => n.status === 'online');
    const busyNodes = nodes.filter(n => n.status === 'busy');

    return {
      totalNodes: nodes.length,
      onlineNodes: onlineNodes.length,
      busyNodes: busyNodes.length,
      totalGPUs: nodes.length,
      totalVRAM: nodes.reduce((sum, n) => sum + (n.gpuInfo?.memoryTotal || 0), 0),
      averageUtilization: onlineNodes.length > 0
          ? onlineNodes.reduce((sum, n) => sum + (n.performance?.utilization || 0), 0) / onlineNodes.length
          : 0,
      queuedJobs: jobs.filter(j => j.status === 'queued').length,
      processingJobs: jobs.filter(j => j.status === 'processing').length,
      completedJobs24h: jobs.filter(j => {
        const completedAt = new Date(j.completedAt || 0);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return j.status === 'completed' && completedAt > dayAgo;
      }).length
    };
  }

  onNodeUpdate(callback: (node: GPUNode) => void): () => void {
    this.eventListeners.nodeUpdate.push(callback);
    return () => {
      const index = this.eventListeners.nodeUpdate.indexOf(callback);
      if (index > -1) this.eventListeners.nodeUpdate.splice(index, 1);
    };
  }

  onNodeRemoved(callback: (nodeId: string) => void): () => void {
    this.eventListeners.nodeRemoved.push(callback);
    return () => {
      const index = this.eventListeners.nodeRemoved.indexOf(callback);
      if (index > -1) this.eventListeners.nodeRemoved.splice(index, 1);
    };
  }

  onJobUpdate(callback: (job: InferenceJob) => void): () => void {
    this.eventListeners.jobUpdate.push(callback);
    return () => {
      const index = this.eventListeners.jobUpdate.indexOf(callback);
      if (index > -1) this.eventListeners.jobUpdate.splice(index, 1);
    };
  }

  onNetworkStatsUpdate(callback: (stats: NetworkStats) => void): () => void {
    this.eventListeners.networkStats.push(callback);
    return () => {
      const index = this.eventListeners.networkStats.indexOf(callback);
      if (index > -1) this.eventListeners.networkStats.splice(index, 1);
    };
  }

  getNodes(): GPUNode[] {
    return Array.from(this.nodes.values());
  }

  setLoadBalancingConfig(config: Partial<LoadBalancingConfig>): void {
    this.loadBalancing = { ...this.loadBalancing, ...config };
  }

  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.nodes.clear();
    this.jobs.clear();
    this.accessToken = null;
  }
}

export const distributedGPUService = new DistributedGPUService();