
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

    const { data, error } = await supabase
      .from('ml_detection_jobs')
      .insert({
        video_url: videoUrl,
        user_id: user.user.id,
        status: 'queued',
        priority,
        config,
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to queue job: ${error.message}`);
    }

    // Trigger job processing
    await this.triggerJobProcessing();
    
    return data.id;
  }

  async getJob(jobId: string): Promise<QueuedMLJob | null> {
    const { data, error } = await supabase
      .from('ml_detection_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      return null;
    }

    return data;
  }

  async getUserJobs(limit: number = 10): Promise<QueuedMLJob[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from('ml_detection_jobs')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user jobs:', error);
      return [];
    }

    return data || [];
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('ml_detection_jobs')
      .update({ 
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('user_id', user.user.id);

    return !error;
  }

  async getQueueStats(): Promise<QueueStats> {
    const { data, error } = await supabase
      .rpc('get_ml_queue_stats');

    if (error) {
      console.error('Error fetching queue stats:', error);
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

    return data;
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
