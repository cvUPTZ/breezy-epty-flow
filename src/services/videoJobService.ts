
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VideoJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VideoJobConfig {
  source_type: 'youtube' | 'upload';
  enableAIAnalysis: boolean;
  enableSegmentation: boolean;
  segmentDuration?: number;
}

export interface VideoJob {
  id: string;
  user_id: string;
  status: VideoJobStatus;
  video_title?: string;
  video_duration?: number;
  progress: number;
  error_message?: string;
  job_config?: VideoJobConfig;
  input_video_path?: string;
  output_video_path?: string;
  created_at: string;
  updated_at?: string;
}

export class VideoJobService {
  static async getJobsByUser(userId: string): Promise<VideoJob[]> {
    const { data, error } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching video jobs:', error);
      throw error;
    }

    return (data || []).map(job => ({
      ...job,
      created_at: job.created_at || new Date().toISOString(),
      progress: job.progress || 0,
      video_title: job.video_title || undefined,
      video_duration: job.video_duration || undefined,
      error_message: job.error_message || undefined,
      job_config: job.job_config ? job.job_config as VideoJobConfig : undefined,
      input_video_path: job.input_video_path || undefined,
      output_video_path: job.output_video_path || undefined,
      updated_at: job.updated_at || undefined,
    }));
  }

  static async getUserJobs(userId: string): Promise<VideoJob[]> {
    const { data, error } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user video jobs:', error);
      throw error;
    }

    return (data || []).map(job => ({
      ...job,
      created_at: job.created_at || new Date().toISOString(),
      progress: job.progress || 0,
      video_title: job.video_title || undefined,
      video_duration: job.video_duration || undefined,
      error_message: job.error_message || undefined,
      job_config: job.job_config ? job.job_config as VideoJobConfig : undefined,
      input_video_path: job.input_video_path || undefined,
      output_video_path: job.output_video_path || undefined,
      updated_at: job.updated_at || undefined,
    }));
  }

  static async uploadVideo(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading video:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data.path;
  }

  static async getVideoDownloadUrl(path: string): Promise<string> {
    const { data } = await supabase.storage
      .from('videos')
      .createSignedUrl(path, 3600);

    if (!data?.signedUrl) {
      throw new Error('Failed to generate download URL');
    }

    return data.signedUrl;
  }

  static async deleteJob(jobId: string): Promise<boolean> {
    const { error } = await supabase
      .from('video_jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting video job:', error);
      return false;
    }

    return true;
  }

  static async pollJobStatus(
    jobId: string, 
    onUpdate: (job: VideoJob | null) => void
  ): Promise<() => void> {
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('video_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) {
          console.error('Error polling job status:', error);
          onUpdate(null);
          return;
        }

        const job: VideoJob = {
          ...data,
          created_at: data.created_at || new Date().toISOString(),
          progress: data.progress || 0,
          video_title: data.video_title || undefined,
          video_duration: data.video_duration || undefined,
          error_message: data.error_message || undefined,
          job_config: data.job_config ? data.job_config as VideoJobConfig : undefined,
          input_video_path: data.input_video_path || undefined,
          output_video_path: data.output_video_path || undefined,
          updated_at: data.updated_at || undefined,
        };

        onUpdate(job);

        // Stop polling if job is complete
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error in poll job status:', error);
        onUpdate(null);
      }
    }, 2000);

    // Return cleanup function
    return () => clearInterval(pollInterval);
  }
}
