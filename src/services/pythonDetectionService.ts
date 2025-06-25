
// Python Detection Service API Client
export interface DetectionConfig {
  videoUrl: string;
  frameRate?: number;
  confidenceThreshold?: number;
  trackPlayers?: boolean;
  trackBall?: boolean;
}

export interface PlayerDetection {
  id: string;
  position: { x: number; y: number };
  confidence: number;
  team?: 'home' | 'away';
  jerseyNumber?: number;
  timestamp: number;
}

export interface BallDetection {
  position: { x: number; y: number };
  confidence: number;
  timestamp: number;
}

export interface DetectionResult {
  frameIndex: number;
  timestamp: number;
  players: PlayerDetection[];
  ball?: BallDetection;
  processing_time: number;
}

export interface DetectionJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  results?: DetectionResult[];
  error?: string;
}

class PythonDetectionService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    // This should be your PythonAnywhere URL
    this.baseUrl = import.meta.env.VITE_PYTHON_DETECTION_API_URL || 'https://yourusername.pythonanywhere.com/api';
    this.apiKey = import.meta.env.VITE_PYTHON_DETECTION_API_KEY;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Detection API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  async startDetection(config: DetectionConfig): Promise<{ job_id: string }> {
    console.log('Starting detection job with config:', config);
    return this.makeRequest<{ job_id: string }>('/detect/start', {
      method: 'POST',
      body: JSON.stringify(config),
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

  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.makeRequest<{ status: string; version: string }>('/health');
  }

  // Real-time detection for live streams or small video segments
  async detectFrame(frameData: string, config?: Partial<DetectionConfig>): Promise<DetectionResult> {
    return this.makeRequest<DetectionResult>('/detect/frame', {
      method: 'POST',
      body: JSON.stringify({
        frame_data: frameData,
        ...config,
      }),
    });
  }
}

export const pythonDetectionService = new PythonDetectionService();
