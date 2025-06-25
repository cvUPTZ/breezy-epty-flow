
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

  static async startDetection(config: ServerDetectionConfig): Promise<string> {
    try {
      console.log('Starting production detection with config:', config);
      
      const response = await fetch(`${this.baseUrl}/detect/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Server error ${response.status}: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Detection job started:', data);
      
      return data.job_id;
    } catch (error: any) {
      console.error('Failed to start detection:', error);
      throw new Error(`Failed to start detection: ${error.message}`);
    }
  }

  static async getJobStatus(jobId: string): Promise<ServerDetectionJob> {
    try {
      const response = await fetch(`${this.baseUrl}/detect/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to get job status:', error);
      throw new Error(`Failed to get job status: ${error.message}`);
    }
  }

  static async getJobResults(jobId: string): Promise<ServerDetectionResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/detect/results/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Results fetch failed: ${response.status}`);
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
      const response = await fetch(`${this.baseUrl}/detect/cancel/${jobId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Cancel failed: ${response.status}`);
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

      // Save job metadata
      const { error: jobError } = await supabase
        .from('video_jobs')
        .upsert({
          id: jobId,
          status: 'completed',
          result_data: { detections: results },
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

  // Health check for the production service
  static async checkServiceHealth(): Promise<{
    status: string;
    version: string;
    gpu_available: boolean;
    models_loaded: string[];
    queue_size: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Service health check failed:', error);
      throw new Error(`Service unavailable: ${error.message}`);
    }
  }
}
