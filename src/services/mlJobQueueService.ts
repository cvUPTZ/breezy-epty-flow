
import { supabase } from '@/integrations/supabase/client';

export interface QueuedMLJob {
  id: string;
  video_url: string;
  user_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high';
  config: any;
  progress: number;
  error_message?: string;
  results?: any;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  estimated_completion?: string;
}

export interface QueueStats {
  total_jobs: number;
  queued_jobs: number;
  processing_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  average_processing_time: number;
  estimated_wait_time: number;
}

class MLJobQueueService {
  async submitJob(
    videoUrl: string,
    config: any,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // Use raw SQL query since ml_detection_jobs isn't in the generated types yet
    const { data, error } = await supabase.rpc('create_ml_job', {
      p_video_url: videoUrl,
      p_user_id: user.user.id,
      p_priority: priority,
      p_config: config
    });

    if (error) {
      throw new Error(`Failed to queue job: ${error.message}`);
    }

    // Trigger job processing
    await this.triggerJobProcessing();
    
    return data;
  }

  async getJob(jobId: string): Promise<QueuedMLJob | null> {
    try {
      const { data, error } = await supabase.rpc('get_ml_job', {
        p_job_id: jobId
      });

      if (error) {
        console.error('Error fetching job:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }

  async getUserJobs(limit: number = 10): Promise<QueuedMLJob[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    try {
      const { data, error } = await supabase.rpc('get_user_ml_jobs', {
        p_user_id: user.user.id,
        p_limit: limit
      });

      if (error) {
        console.error('Error fetching user jobs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user jobs:', error);
      return [];
    }
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    try {
      const { error } = await supabase.rpc('cancel_ml_job', {
        p_job_id: jobId,
        p_user_id: user.user.id
      });

      return !error;
    } catch (error) {
      console.error('Error cancelling job:', error);
      return false;
    }
  }

  async getQueueStats(): Promise<QueueStats> {
    try {
      const { data, error } = await supabase.rpc('get_ml_queue_stats');

      if (error) {
        console.error('Error fetching queue stats:', error);
        return this.getDefaultStats();
      }

      return data || this.getDefaultStats();
    } catch (error) {
      console.error('Error fetching queue stats:', error);
      return this.getDefaultStats();
    }
  }

  private getDefaultStats(): QueueStats {
    return {
      total_jobs: 0,
      queued_jobs: 0,
      processing_jobs: 0,
      completed_jobs: 0,
      failed_jobs: 0,
      average_processing_time: 0,
      estimated_wait_time: 0,
    };
  }

  private async triggerJobProcessing(): Promise<void> {
    try {
      await supabase.functions.invoke('process-ml-job-queue');
    } catch (error) {
      console.error('Failed to trigger job processing:', error);
    }
  }

  // Real-time subscription for job updates
  subscribeToJobUpdates(jobId: string, callback: (job: QueuedMLJob) => void) {
    return supabase
      .channel(`ml_job_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ml_detection_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          callback(payload.new as QueuedMLJob);
        }
      )
      .subscribe();
  }
}

export const mlJobQueueService = new MLJobQueueService();
