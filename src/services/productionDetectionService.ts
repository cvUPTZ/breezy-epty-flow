
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServerDetectionConfig {
  videoUrl: string;
  frameRate?: number;
  confidenceThreshold?: number;
  trackPlayers?: boolean;
  trackBall?: boolean;
  maxRetries?: number;
  timeout?: number;
  useSOTAML?: boolean;
  modelType?: string;
  processingMode?: string;
  enableGPU?: boolean;
  batchSize?: number;
  nmsThreshold?: number;
  maxDetections?: number;
}

export interface ServerDetectionJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results?: any;
  error?: string;
  created_at: string;
  updated_at?: string;
}

export interface ServerDetectionResult {
  frameIndex: number;
  timestamp: number;
  players: Array<{
    id: string;
    position: { x: number; y: number };
    confidence: number;
    team?: string;
    bounding_box: { x: number; y: number; width: number; height: number };
    jersey_number?: number;
  }>;
  ball?: {
    position: { x: number; y: number };
    confidence: number;
    bounding_box: { x: number; y: number; width: number; height: number };
  };
  processing_time: number;
  model_used: string;
  gpu_used: boolean;
}

export class ProductionDetectionService {
  private static baseUrl = process.env.VITE_PYTHON_DETECTION_API_URL || 'https://zackbeg.pythonanywhere.com/api';
  private static apiKey = process.env.VITE_PYTHON_DETECTION_API_KEY || 'your-secure-detection-key-2024';
  
  // Add a flag to track if the service is available
  private static serviceAvailable: boolean | null = null;
  private static lastHealthCheck = 0;
  private static healthCheckInterval = 5 * 60 * 1000; // 5 minutes

  private static async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced to 10 seconds

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server took too long to respond');
      }
      // Mark service as unavailable on fetch failures
      this.serviceAvailable = false;
      throw error;
    }
  }

  static async startDetection(config: ServerDetectionConfig): Promise<string> {
    try {
      console.log('Starting production detection with config:', config);
      console.log('API URL:', this.baseUrl);
      
      // Check service health first
      const isHealthy = await this.checkServiceHealth();
      if (!isHealthy) {
        throw new Error('Detection service is not available. Please try again later or contact support.');
      }
      
      const response = await this.makeRequest(`${this.baseUrl}/detect/start`, {
        method: 'POST',
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        let errorMessage = `Server error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Detection job started:', data);
      
      return data.job_id;
    } catch (error: any) {
      console.error('Failed to start detection:', error);
      
      // Provide more user-friendly error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Unable to connect to AI detection service. The service may be temporarily unavailable.');
      }
      if (error.message.includes('CORS')) {
        throw new Error('Connection blocked by browser security. Please contact support.');
      }
      if (error.message.includes('timeout')) {
        throw new Error('AI detection service is not responding. Please try again later.');
      }
      
      throw new Error(`Detection failed: ${error.message}`);
    }
  }

  static async getJobStatus(jobId: string): Promise<ServerDetectionJob> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/detect/status/${jobId}`);

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to get job status:', error);
      throw new Error(`Failed to get job status: ${error.message}`);
    }
  }

  static async getJobResults(jobId: string): Promise<ServerDetectionResult[]> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/detect/results/${jobId}`);

      if (!response.ok) {
        throw new Error(`Results fetch failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error: any) {
      console.error('Failed to get job results:', error);
      throw new Error(`Failed to get job results: ${error.message}`);
    }
  }

  static async pollJobToCompletion(
    jobId: string,
    onProgress?: (progress: number) => void,
    onResult?: (result: ServerDetectionResult) => void,
    maxWaitMinutes: number = 30
  ): Promise<ServerDetectionResult[]> {
    const maxAttempts = maxWaitMinutes * 12; // Poll every 5 seconds
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const job = await this.getJobStatus(jobId);
          
          if (onProgress) {
            onProgress(job.progress);
          }

          if (job.status === 'completed') {
            const results = await this.getJobResults(jobId);
            console.log(`Detection completed with ${results.length} results`);
            resolve(results);
            return;
          }

          if (job.status === 'failed') {
            reject(new Error(job.error || 'Detection job failed'));
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('Detection timeout - job took too long'));
            return;
          }

          // Continue polling
          setTimeout(poll, 5000);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  static async cancelJob(jobId: string): Promise<void> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/detect/cancel/${jobId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Cancel failed: ${response.status} ${response.statusText}`);
      }

      console.log('Detection job cancelled:', jobId);
    } catch (error: any) {
      console.error('Failed to cancel job:', error);
      throw new Error(`Failed to cancel job: ${error.message}`);
    }
  }

  // Store results in Supabase for persistence
  static async saveResultsToDatabase(
    matchId: string,
    jobId: string,
    results: ServerDetectionResult[]
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Save job metadata - fix the type error by properly typing the JSON data
      const { error: jobError } = await supabase
        .from('video_jobs')
        .upsert({
          id: jobId,
          status: 'completed',
          result_data: { detections: results } as any, // Cast to any for JSON compatibility
          user_id: user.user.id,
          input_video_path: `match_${matchId}`,
          video_title: `AI Detection for Match ${matchId}`,
          progress: 100
        });

      if (jobError) {
        console.error('Failed to save job to database:', jobError);
      }

      // Convert detection results to match events
      const events = results.flatMap(result => {
        const events = [];
        
        // Add player detections as events
        result.players.forEach(player => {
          events.push({
            match_id: matchId,
            event_type: 'player_detection',
            timestamp: Math.round(result.timestamp * 1000), // Convert to milliseconds
            coordinates: player.position,
            details: {
              confidence: player.confidence,
              team: player.team,
              jersey_number: player.jersey_number,
              bounding_box: player.bounding_box,
              ai_generated: true,
              model_used: result.model_used
            },
            created_by: user.user.id
          });
        });

        // Add ball detection as event
        if (result.ball) {
          events.push({
            match_id: matchId,
            event_type: 'ball_detection',
            timestamp: Math.round(result.timestamp * 1000),
            coordinates: result.ball.position,
            details: {
              confidence: result.ball.confidence,
              bounding_box: result.ball.bounding_box,
              ai_generated: true,
              model_used: result.model_used
            },
            created_by: user.user.id
          });
        }

        return events;
      });

      // Batch insert events
      if (events.length > 0) {
        const { error: eventsError } = await supabase
          .from('match_events')
          .insert(events);

        if (eventsError) {
          console.error('Failed to save events to database:', eventsError);
        } else {
          console.log(`Saved ${events.length} AI-generated events to database`);
        }
      }

    } catch (error: any) {
      console.error('Failed to save results to database:', error);
      toast.error(`Failed to save results: ${error.message}`);
    }
  }

  // Health check for the production service with caching
  static async checkServiceHealth(): Promise<boolean> {
    try {
      const now = Date.now();
      
      // Use cached result if recent
      if (this.serviceAvailable !== null && (now - this.lastHealthCheck) < this.healthCheckInterval) {
        return this.serviceAvailable;
      }

      console.log('Checking service health at:', `${this.baseUrl}/health`);
      
      const response = await this.makeRequest(`${this.baseUrl}/health`);

      if (!response.ok) {
        this.serviceAvailable = false;
        this.lastHealthCheck = now;
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      const healthData = await response.json();
      console.log('Service health:', healthData);
      
      this.serviceAvailable = true;
      this.lastHealthCheck = now;
      return true;
    } catch (error: any) {
      console.error('Service health check failed:', error);
      this.serviceAvailable = false;
      this.lastHealthCheck = Date.now();
      
      // Don't throw for health checks, just return false
      return false;
    }
  }

  // Public method to check if service is available
  static isServiceAvailable(): boolean {
    return this.serviceAvailable === true;
  }

  // Reset service availability (useful for retry scenarios)
  static resetServiceStatus(): void {
    this.serviceAvailable = null;
    this.lastHealthCheck = 0;
  }
}
