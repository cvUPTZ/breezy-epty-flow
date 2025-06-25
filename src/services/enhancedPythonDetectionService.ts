
// Enhanced Production-Ready Python Detection Service
export interface DetectionConfig {
  videoUrl: string;
  frameRate?: number;
  confidenceThreshold?: number;
  trackPlayers?: boolean;
  trackBall?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface PlayerDetection {
  id: string;
  position: { x: number; y: number };
  confidence: number;
  team?: 'home' | 'away';
  jerseyNumber?: number;
  timestamp: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface BallDetection {
  position: { x: number; y: number };
  confidence: number;
  timestamp: number;
  velocity?: { x: number; y: number };
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface DetectionResult {
  frameIndex: number;
  timestamp: number;
  players: PlayerDetection[];
  ball?: BallDetection;
  processing_time: number;
  frame_url?: string;
}

export interface DetectionJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  results?: DetectionResult[];
  error?: string;
  created_at: string;
  completed_at?: string;
  video_metadata?: {
    duration: number;
    fps: number;
    total_frames: number;
    resolution: { width: number; height: number };
  };
}

export interface ServiceHealth {
  status: 'online' | 'offline' | 'degraded';
  version: string;
  uptime: number;
  queue_size?: number;
  processing_capacity?: number;
}

class EnhancedPythonDetectionService {
  private baseUrl: string;
  private apiKey?: string;
  private maxRetries: number = 3;
  private timeout: number = 30000; // 30 seconds
  private retryDelay: number = 1000; // 1 second

  constructor() {
    this.baseUrl = import.meta.env.VITE_PYTHON_DETECTION_API_URL || 'https://yourusername.pythonanywhere.com/api';
    this.apiKey = import.meta.env.VITE_PYTHON_DETECTION_API_KEY;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    retries: number = this.maxRetries
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }

      if (retries > 0 && this.shouldRetry(error)) {
        console.warn(`Request failed, retrying in ${this.retryDelay}ms. Retries left: ${retries - 1}`);
        await this.delay(this.retryDelay);
        return this.makeRequest<T>(endpoint, options, retries - 1);
      }

      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.name === 'AbortError' ||
      error.message.includes('fetch') ||
      error.message.includes('5')
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async startDetection(config: DetectionConfig): Promise<{ job_id: string }> {
    console.log('Starting enhanced detection job with config:', config);
    
    const enhancedConfig = {
      ...config,
      maxRetries: config.maxRetries || this.maxRetries,
      timeout: config.timeout || this.timeout,
    };

    return this.makeRequest<{ job_id: string }>('/detect/start', {
      method: 'POST',
      body: JSON.stringify(enhancedConfig),
    });
  }

  async getJobStatus(jobId: string): Promise<DetectionJob> {
    return this.makeRequest<DetectionJob>(`/detect/status/${jobId}`);
  }

  async getResults(jobId: string): Promise<DetectionResult[]> {
    return this.makeRequest<DetectionResult[]>(`/detect/results/${jobId}`);
  }

  async cancelJob(jobId: string): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/detect/cancel/${jobId}`, {
      method: 'POST',
    });
  }

  async healthCheck(): Promise<ServiceHealth> {
    return this.makeRequest<ServiceHealth>('/health');
  }

  async detectFrame(frameData: string, config?: Partial<DetectionConfig>): Promise<DetectionResult> {
    return this.makeRequest<DetectionResult>('/detect/frame', {
      method: 'POST',
      body: JSON.stringify({
        frame_data: frameData,
        ...config,
      }),
    });
  }

  async getServiceStats(): Promise<{
    total_jobs: number;
    active_jobs: number;
    completed_jobs: number;
    failed_jobs: number;
    average_processing_time: number;
  }> {
    return this.makeRequest('/stats');
  }

  async validateVideoUrl(videoUrl: string): Promise<{
    valid: boolean;
    metadata?: {
      title: string;
      duration: number;
      thumbnail: string;
    };
    error?: string;
  }> {
    return this.makeRequest('/validate/video', {
      method: 'POST',
      body: JSON.stringify({ video_url: videoUrl }),
    });
  }
}

export const enhancedPythonDetectionService = new EnhancedPythonDetectionService();
