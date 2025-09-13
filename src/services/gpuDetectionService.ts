// GPU-based Detection Service - Interfaces with RTX 4060 PC Client
export interface GPUMetrics {
  utilization: number; // 0-100%
  memoryUsed: number; // MB
  memoryTotal: number; // MB
  temperature: number; // Celsius
  powerDraw: number; // Watts
  clockSpeed: number; // MHz
}

export interface PCNodeConfig {
  apiKey: string;
  nodeId: string;
  serverUrl?: string;
  heartbeatInterval?: number; // seconds, default 30
}

export interface GPUDetectionRequest {
  videoUrl: string;
  frameRate: number;
  confidenceThreshold: number;
  trackPlayers: boolean;
  trackBall: boolean;
  maxFrames?: number;
  processingMode: 'fast' | 'balanced' | 'accurate';
  useGPUAcceleration?: boolean;
}

export interface GPUDetectionResult {
  frameIndex: number;
  timestamp: number;
  detections: Array<{
    class: 'player' | 'ball' | 'referee';
    confidence: number;
    bbox: { x: number; y: number; width: number; height: number };
    team?: 'home' | 'away';
    jerseyNumber?: number;
    attributes?: Record<string, any>;
  }>;
  processingTime: number;
  gpuMetrics: GPUMetrics;
  modelUsed: string;
}

export interface GPUDetectionJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'queued';
  progress: number;
  results: GPUDetectionResult[];
  error?: string;
  startedAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
  nodeId: string;
  gpuInfo: {
    name: string;
    driverVersion: string;
    cudaVersion: string;
    computeCapability: string;
  };
}

export interface PCNodeStatus {
  nodeId: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  lastHeartbeat: string;
  gpuMetrics: GPUMetrics;
  activeJobs: number;
  totalJobs: number;
  uptime: number;
  version: string;
  capabilities: string[];
}

class GPUDetectionService {
  private config: PCNodeConfig | null = null;
  private baseUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.baseUrl = 'http://localhost:8080'; // Default PC client port
  }

  // Initialize connection with PC node
  async initializeNode(config: PCNodeConfig): Promise<boolean> {
    this.config = config;
    if (config.serverUrl) {
      this.baseUrl = config.serverUrl;
    }

    try {
      // Validate API key and establish connection
      const response = await this.makeAuthenticatedRequest('/api/node/register', {
        method: 'POST',
        body: JSON.stringify({
          nodeId: config.nodeId,
          capabilities: ['yolo', 'detection', 'tracking', 'gpu-acceleration']
        })
      });

      if (response.success) {
        this.startHeartbeat(config.heartbeatInterval || 30);
        console.log('GPU Detection Service initialized successfully');
        return true;
      }
      
      throw new Error(response.error || 'Failed to register node');
    } catch (error) {
      console.error('Failed to initialize GPU detection service:', error);
      return false;
    }
  }

  // Start detection job on GPU
  async startDetection(request: GPUDetectionRequest): Promise<string> {
    if (!this.config) {
      throw new Error('GPU Detection Service not initialized. Please configure your PC node first.');
    }

    console.log('Starting GPU detection job:', request);
    
    try {
      const response = await this.makeAuthenticatedRequest('/api/detect/start', {
        method: 'POST',
        body: JSON.stringify({
          video_url: request.videoUrl,
          detection_config: {
            frame_rate: request.frameRate,
            confidence_threshold: request.confidenceThreshold,
            track_players: request.trackPlayers,
            track_ball: request.trackBall,
            max_frames: request.maxFrames,
            processing_mode: request.processingMode,
            gpu_acceleration: request.useGPUAcceleration !== false,
          }
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to start detection job');
      }

      return response.jobId;
    } catch (error) {
      console.error('Error starting GPU detection:', error);
      throw new Error(`GPU detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get job status with GPU metrics
  async getJobStatus(jobId: string): Promise<GPUDetectionJob> {
    const response = await this.makeAuthenticatedRequest(`/api/detect/status/${jobId}`);
    
    if (!response.success) {
      throw new Error(`Failed to get job status: ${response.error}`);
    }

    return response.job;
  }

  // Get detection results
  async getResults(jobId: string): Promise<GPUDetectionResult[]> {
    const response = await this.makeAuthenticatedRequest(`/api/detect/results/${jobId}`);
    
    if (!response.success) {
      throw new Error(`Failed to get results: ${response.error}`);
    }

    return response.results;
  }

  // Cancel running job
  async cancelJob(jobId: string): Promise<void> {
    await this.makeAuthenticatedRequest(`/api/detect/cancel/${jobId}`, {
      method: 'POST'
    });
  }

  // Get current GPU metrics
  async getGPUMetrics(): Promise<GPUMetrics> {
    const response = await this.makeAuthenticatedRequest('/api/gpu/metrics');
    
    if (!response.success) {
      throw new Error(`Failed to get GPU metrics: ${response.error}`);
    }

    return response.metrics;
  }

  // Get PC node status
  async getNodeStatus(): Promise<PCNodeStatus> {
    const response = await this.makeAuthenticatedRequest('/api/node/status');
    
    if (!response.success) {
      throw new Error(`Failed to get node status: ${response.error}`);
    }

    return response.status;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; nodeInfo: any }> {
    try {
      const response = await this.makeAuthenticatedRequest('/api/health');
      return {
        status: response.success ? 'online' : 'offline',
        nodeInfo: response.nodeInfo || {}
      };
    } catch (error) {
      return { 
        status: 'offline', 
        nodeInfo: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // Test connection (single test and exit)
  async testConnection(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.status === 'online';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Install dependencies on PC (if needed)
  async installDependencies(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest('/api/install/deps', {
        method: 'POST'
      });
      return response.success;
    } catch (error) {
      console.error('Failed to install dependencies:', error);
      return false;
    }
  }

  // Private methods
  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.config) {
      throw new Error('Service not initialized');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Node-ID': this.config.nodeId,
      ...(options.headers as Record<string, string> || {})
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your PC node configuration.');
        }
        if (response.status === 404) {
          throw new Error('PC client not found. Make sure gpu_monitor.py is running.');
        }
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - PC client may be offline');
      }

      // Auto-retry logic
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.warn(`Request failed, retrying... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        await this.delay(1000 * this.reconnectAttempts); // Exponential backoff
        return this.makeAuthenticatedRequest(endpoint, options);
      }

      this.reconnectAttempts = 0;
      throw error;
    }
  }

  private startHeartbeat(intervalSeconds: number): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.makeAuthenticatedRequest('/api/heartbeat', {
          method: 'POST',
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            status: 'alive'
          })
        });
        this.reconnectAttempts = 0; // Reset on successful heartbeat
      } catch (error) {
        console.warn('Heartbeat failed:', error);
      }
    }, intervalSeconds * 1000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup
  destroy(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export const gpuDetectionService = new GPUDetectionService();