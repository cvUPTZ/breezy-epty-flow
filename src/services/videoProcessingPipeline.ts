
import { VideoJobService, VideoJob, VideoJobStatus } from './videoJobService';
import { supabase } from '@/integrations/supabase/client';

export class VideoProcessingPipeline {
  private static processJob(data: any): VideoJob {
    return {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
      status: (data.status || 'pending') as VideoJobStatus,
      video_title: data.video_title || undefined,
      video_duration: data.video_duration || undefined,
      error_message: data.error_message || undefined,
      user_id: data.user_id!,
      progress: data.progress || 0
    };
  }

  static async processVideo(videoUrl: string, userId: string, options: {
    enableAIAnalysis?: boolean;
    enableSegmentation?: boolean;
    segmentDuration?: number;
  } = {}): Promise<VideoJob> {
    const jobConfig = {
      source_type: videoUrl.includes('youtube') ? 'youtube' as const : 'upload' as const,
      enableAIAnalysis: options.enableAIAnalysis || true,
      enableSegmentation: options.enableSegmentation || false,
      segmentDuration: options.segmentDuration
    };

    const job = await VideoJobService.createJob({
      input_video_path: videoUrl,
      user_id: userId,
      job_config: jobConfig
    });

    try {
      await VideoJobService.updateJobStatus(job.id, 'processing', 10);

      if (jobConfig.source_type === 'youtube') {
        return await this.processYouTubeVideo(job);
      } else {
        return await this.processUploadedVideo(job);
      }
    } catch (error: any) {
      await VideoJobService.updateJobStatus(job.id, 'failed', undefined, undefined, error.message);
      throw error;
    }
  }

  private static async processYouTubeVideo(job: VideoJob): Promise<VideoJob> {
    try {
      const { data, error } = await supabase.functions.invoke('process-video-gemini', {
        body: {
          videoPath: job.input_video_path,
          jobId: job.id
        }
      });

      if (error) throw error;

      const updatedJob = await this.refreshJob(job.id);
      return this.processJob(updatedJob);
    } catch (error: any) {
      await VideoJobService.updateJobStatus(job.id, 'failed', undefined, undefined, error.message);
      throw error;
    }
  }

  private static async processUploadedVideo(job: VideoJob): Promise<VideoJob> {
    try {
      const { data, error } = await supabase.functions.invoke('submit-to-colab', {
        body: {
          videoUrl: job.input_video_path,
          jobId: job.id,
          config: job.job_config
        }
      });

      if (error) throw error;

      const updatedJob = await this.refreshJob(job.id);
      return this.processJob(updatedJob);
    } catch (error: any) {
      await VideoJobService.updateJobStatus(job.id, 'failed', undefined, undefined, error.message);
      throw error;
    }
  }

  private static async refreshJob(jobId: string): Promise<any> {
    const { data, error } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw error;
    return data;
  }

  static async processVideoSegment(videoUrl: string, startTime: number, endTime: number, focus: string = 'events'): Promise<any> {
    const { data, error } = await supabase.functions.invoke('process-video-segment', {
      body: {
        videoPath: videoUrl,
        startTime,
        endTime,
        focus
      }
    });

    if (error) throw error;
    return data;
  }

  static async splitVideo(videoUrl: string, segmentDuration: number = 60): Promise<string[]> {
    const { data, error } = await supabase.functions.invoke('split-video', {
      body: {
        videoUrl,
        segmentDuration
      }
    });

    if (error) throw error;
    return data.segments || [];
  }
}
