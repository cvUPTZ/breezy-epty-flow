
import { supabase } from '@/integrations/supabase/client';

export interface VideoAnalysisJob {
  id: string;
  videoUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results?: AnalysisResults;
  error?: string;
  createdAt: string;
}

export interface AnalysisResults {
  playerTracking: PlayerTrackingData[];
  events: MatchEvent[];
  statistics: MatchStatistics;
  heatmaps: HeatmapData[];
  trajectories: TrajectoryData[];
}

export interface PlayerTrackingData {
  playerId: string;
  timestamp: number;
  position: { x: number; y: number };
  velocity: number;
  team: 'home' | 'away';
  confidence: number;
}

export interface MatchEvent {
  id: string;
  type: string;
  timestamp: number;
  playerId?: string;
  position: { x: number; y: number };
  confidence: number;
}

export interface MatchStatistics {
  possession: { home: number; away: number };
  passes: { home: number; away: number };
  shots: { home: number; away: number };
  distance: { home: number; away: number };
}

export interface HeatmapData {
  playerId: string;
  positions: Array<{ x: number; y: number; intensity: number }>;
}

export interface TrajectoryData {
  id: string;
  type: 'ball' | 'player';
  points: Array<{ x: number; y: number; timestamp: number }>;
}

export class ProductionVideoAnalysisService {
  private static readonly API_ENDPOINT = import.meta.env.VITE_ANALYSIS_API_URL || 'https://api.your-analysis-service.com';

  static async startAnalysis(videoUrl: string, options: {
    enablePlayerTracking: boolean;
    enableEventDetection: boolean;
    enableHeatmaps: boolean;
    enableTrajectories: boolean;
  }): Promise<VideoAnalysisJob> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const jobData = {
      video_url: videoUrl,
      user_id: user.user.id,
      status: 'pending',
      progress: 0,
      options: options,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('video_analysis_jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create analysis job: ${error.message}`);

    // Start processing
    this.processVideo(data.id, videoUrl, options);

    return {
      id: data.id,
      videoUrl: data.video_url,
      status: data.status,
      progress: data.progress,
      createdAt: data.created_at
    };
  }

  private static async processVideo(jobId: string, videoUrl: string, options: any) {
    try {
      // Update status to processing
      await supabase
        .from('video_analysis_jobs')
        .update({ status: 'processing', progress: 10 })
        .eq('id', jobId);

      // Call external analysis service
      const response = await fetch(`${this.API_ENDPOINT}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, options, jobId })
      });

      if (!response.ok) {
        throw new Error(`Analysis service error: ${response.statusText}`);
      }

      const results = await response.json();

      // Store results
      await supabase
        .from('video_analysis_jobs')
        .update({ 
          status: 'completed', 
          progress: 100, 
          results: results 
        })
        .eq('id', jobId);

    } catch (error: any) {
      await supabase
        .from('video_analysis_jobs')
        .update({ 
          status: 'failed', 
          error: error.message 
        })
        .eq('id', jobId);
    }
  }

  static async getJobStatus(jobId: string): Promise<VideoAnalysisJob | null> {
    const { data, error } = await supabase
      .from('video_analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      videoUrl: data.video_url,
      status: data.status,
      progress: data.progress,
      results: data.results,
      error: data.error,
      createdAt: data.created_at
    };
  }

  static async getUserJobs(limit: number = 10): Promise<VideoAnalysisJob[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from('video_analysis_jobs')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map(job => ({
      id: job.id,
      videoUrl: job.video_url,
      status: job.status,
      progress: job.progress,
      results: job.results,
      error: job.error,
      createdAt: job.created_at
    }));
  }
}
