
// Production ML Detection Service - Supports multiple ML backends
export interface MLModelConfig {
  provider: 'roboflow' | 'custom' | 'yolo' | 'detectron2';
  modelId: string;
  apiKey?: string;
  endpoint?: string;
  version?: string;
}

export interface DetectionRequest {
  videoUrl: string;
  frameRate: number;
  confidenceThreshold: number;
  modelConfig: MLModelConfig;
  trackPlayers: boolean;
  trackBall: boolean;
  maxFrames?: number;
  processingMode: 'fast' | 'balanced' | 'accurate';
}

export interface MLDetectionResult {
  frameIndex: number;
  timestamp: number;
  detections: Array<{
    class: 'player' | 'ball' | 'referee';
    confidence: number;
    bbox: { x: number; y: number; width: number; height: number };
    team?: 'home' | 'away';
    attributes?: Record<string, any>;
  }>;
  processingTime: number;
  modelUsed: string;
}

export interface MLDetectionJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: MLDetectionResult[];
  error?: string;
  startedAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
}

class ProductionMLDetectionService {
  private baseUrl: string;
  private fallbackProviders: MLModelConfig[] = [
    {
      provider: 'roboflow',
      modelId: 'football-players-detection-3zvbc/9',
      apiKey: import.meta.env.VITE_ROBOFLOW_API_KEY
    },
    {
      provider: 'custom',
      modelId: 'yolov8n-football',
      endpoint: import.meta.env.VITE_CUSTOM_ML_ENDPOINT
    }
  ];

  constructor() {
    this.baseUrl = import.meta.env.VITE_ML_DETECTION_SERVICE_URL || 'http://localhost:8000';
  }

  async startDetection(request: DetectionRequest): Promise<string> {
    console.log('Starting production ML detection:', request);
    
    // Try primary provider first, fall back to alternatives
    for (const provider of this.getProviders(request.modelConfig)) {
      try {
        const jobId = await this.attemptDetection({ ...request, modelConfig: provider });
        return jobId;
      } catch (error) {
        console.warn(`Provider ${provider.provider} failed, trying next:`, error);
        continue;
      }
    }
    
    throw new Error('All ML detection providers failed');
  }

  private getProviders(primaryConfig: MLModelConfig): MLModelConfig[] {
    return [primaryConfig, ...this.fallbackProviders.filter(p => p.provider !== primaryConfig.provider)];
  }

  private async attemptDetection(request: DetectionRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/detect/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.modelConfig.apiKey ? `Bearer ${request.modelConfig.apiKey}` : undefined,
      }.filter(Boolean),
      body: JSON.stringify({
        video_url: request.videoUrl,
        model_config: request.modelConfig,
        detection_config: {
          frame_rate: request.frameRate,
          confidence_threshold: request.confidenceThreshold,
          track_players: request.trackPlayers,
          track_ball: request.trackBall,
          max_frames: request.maxFrames,
          processing_mode: request.processingMode,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Detection service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.job_id;
  }

  async getJobStatus(jobId: string): Promise<MLDetectionJob> {
    const response = await fetch(`${this.baseUrl}/api/detect/status/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.status}`);
    }

    return response.json();
  }

  async getResults(jobId: string): Promise<MLDetectionResult[]> {
    const response = await fetch(`${this.baseUrl}/api/detect/results/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get results: ${response.status}`);
    }

    return response.json();
  }

  async cancelJob(jobId: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/detect/cancel/${jobId}`, {
      method: 'POST'
    });
  }

  async healthCheck(): Promise<{ status: string; availableModels: MLModelConfig[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.json();
    } catch (error) {
      return { status: 'offline', availableModels: [] };
    }
  }
}

export const productionMLDetectionService = new ProductionMLDetectionService();
