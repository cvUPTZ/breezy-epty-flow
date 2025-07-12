
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type VideoJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'queued' | 'uploading';

export interface VideoJob {
  id: string;
  created_at: string;
  updated_at: string | null;
  status: VideoJobStatus;
  input_video_path: string;
  video_title?: string;
  video_duration?: number;
  result_data?: any;
  error_message?: string;
  progress: number;
  user_id: string;
  job_config?: {
    source_type: 'youtube' | 'upload';
    enableAIAnalysis: boolean;
    enableSegmentation: boolean;
    segmentDuration?: number;
  };
}

export class VideoJobService {
  static async createJob(jobData: {
    input_video_path: string;
    video_title?: string;
    video_duration?: number;
    user_id: string;
    job_config?: any;
  }): Promise<VideoJob> {
    const { data, error } = await supabase
      .from('video_jobs')
      .insert({
        ...jobData,
        status: 'pending' as const,
        progress: 0
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create job: ${error.message}`);
    
    return {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
      status: (data.status || 'pending') as VideoJobStatus,
      video_title: data.video_title || undefined,
      video_duration: data.video_duration || undefined,
      error_message: data.error_message || undefined,
      user_id: data.user_id!
    };
  }

  static async getUserJobs(userId: string): Promise<VideoJob[]> {
    const { data, error } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch jobs: ${error.message}`);
    
    return data.map(job => ({
      ...job,
      created_at: job.created_at || new Date().toISOString(),
      status: (job.status || 'pending') as VideoJobStatus,
      video_title: job.video_title || undefined,
      video_duration: job.video_duration || undefined,
      error_message: job.error_message || undefined,
      user_id: job.user_id!
    }));
  }

  static async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `public/${fileName}`;

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file);

    if (error) throw new Error(`Upload failed: ${error.message}`);
    return data.path;
  }

  static async getVideoDownloadUrl(path: string): Promise<string> {
    const { data } = await supabase.storage
      .from('videos')
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (!data?.signedUrl) throw new Error('Failed to get signed URL');
    return data.signedUrl;
  }

  static async deleteJob(jobId: string): Promise<void> {
    const { error } = await supabase
      .from('video_jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw new Error(`Failed to delete job: ${error.message}`);
  }

  static async updateJobStatus(jobId: string, status: VideoJobStatus, progress?: number, resultData?: any, errorMessage?: string): Promise<void> {
    const updateData: any = { status };
    if (progress !== undefined) updateData.progress = progress;
    if (resultData) updateData.result_data = resultData;
    if (errorMessage) updateData.error_message = errorMessage;

    const { error } = await supabase
      .from('video_jobs')
      .update(updateData)
      .eq('id', jobId);

    if (error) throw new Error(`Failed to update job: ${error.message}`);
  }

  static async pollJobStatus(jobId: string, callback: (job: VideoJob | null) => void): Promise<() => void> {
    const intervalId = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('video_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) {
          console.error('Error polling job status:', error);
          callback(null);
          return;
        }

        const job: VideoJob = {
          ...data,
          created_at: data.created_at || new Date().toISOString(),
          status: (data.status || 'pending') as VideoJobStatus,
          video_title: data.video_title || undefined,
          video_duration: data.video_duration || undefined,
          error_message: data.error_message || undefined,
          user_id: data.user_id!
        };

        callback(job);

        // Stop polling if job is complete or failed
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error in polling:', error);
        callback(null);
      }
    }, 2000); // Poll every 2 seconds

    // Return stop function
    return () => clearInterval(intervalId);
  }
}
