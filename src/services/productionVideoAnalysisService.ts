
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
  private static readonly STORAGE_KEY = 'video_analysis_jobs';

  static async startAnalysis(videoUrl: string, options: {
    enablePlayerTracking: boolean;
    enableEventDetection: boolean;
    enableHeatmaps: boolean;
    enableTrajectories: boolean;
  }): Promise<VideoAnalysisJob> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const jobData: VideoAnalysisJob = {
      id: jobId,
      videoUrl: videoUrl,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    // Save job to local storage
    this.saveJobLocally(jobData);

    // Start processing (simulate async processing)
    this.processVideo(jobId, videoUrl, options);

    return jobData;
  }

  private static async processVideo(jobId: string, videoUrl: string, options: any) {
    try {
      // Update status to processing
      this.updateJobStatus(jobId, { status: 'processing', progress: 10 });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.updateJobStatus(jobId, { progress: 50 });

      await new Promise(resolve => setTimeout(resolve, 2000));
      this.updateJobStatus(jobId, { progress: 80 });

      // Generate mock results
      const results: AnalysisResults = {
        playerTracking: [
          {
            playerId: 'player_1',
            timestamp: 0,
            position: { x: 100, y: 200 },
            velocity: 15,
            team: 'home',
            confidence: 0.9
          }
        ],
        events: [
          {
            id: 'event_1',
            type: 'pass',
            timestamp: 5.2,
            playerId: 'player_1',
            position: { x: 150, y: 180 },
            confidence: 0.85
          }
        ],
        statistics: {
          possession: { home: 65, away: 35 },
          passes: { home: 120, away: 85 },
          shots: { home: 8, away: 5 },
          distance: { home: 45.2, away: 38.7 }
        },
        heatmaps: [],
        trajectories: []
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update job as completed
      this.updateJobStatus(jobId, { 
        status: 'completed', 
        progress: 100, 
        results: results 
      });

    } catch (error: any) {
      this.updateJobStatus(jobId, { 
        status: 'failed', 
        error: error.message 
      });
    }
  }

  private static saveJobLocally(job: VideoAnalysisJob): void {
    try {
      const existingJobs = this.getJobsFromStorage();
      existingJobs.push(job);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingJobs));
    } catch (error) {
      console.error('Failed to save job locally:', error);
    }
  }

  private static updateJobStatus(jobId: string, updates: Partial<VideoAnalysisJob>): void {
    try {
      const jobs = this.getJobsFromStorage();
      const jobIndex = jobs.findIndex(job => job.id === jobId);
      
      if (jobIndex !== -1) {
        jobs[jobIndex] = { ...jobs[jobIndex], ...updates };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(jobs));
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  }

  private static getJobsFromStorage(): VideoAnalysisJob[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get jobs from storage:', error);
      return [];
    }
  }

  static async getJobStatus(jobId: string): Promise<VideoAnalysisJob | null> {
    try {
      const jobs = this.getJobsFromStorage();
      return jobs.find(job => job.id === jobId) || null;
    } catch (error) {
      console.error('Failed to get job status:', error);
      return null;
    }
  }

  static async getUserJobs(limit: number = 10): Promise<VideoAnalysisJob[]> {
    try {
      const jobs = this.getJobsFromStorage();
      return jobs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get user jobs:', error);
      return [];
    }
  }
}
