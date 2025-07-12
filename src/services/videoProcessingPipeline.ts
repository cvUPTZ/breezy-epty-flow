
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProcessingPipelineConfig {
  source_type: 'youtube' | 'upload';
  enableAIAnalysis: boolean;
  enableSegmentation: boolean;
  segmentDuration?: number;
}

interface VideoJob {
  id: string;
  user_id: string;
  status: string;
  video_title?: string;
  video_duration?: number;
  progress: number;
  error_message?: string;
  job_config?: ProcessingPipelineConfig;
  input_video_path?: string;
  result_data?: any;
  created_at: string;
  updated_at?: string;
}

export class VideoProcessingPipeline {
  static async processVideoComplete(
    videoUrl: string,
    userId: string,
    config: ProcessingPipelineConfig
  ): Promise<VideoJob> {
    try {
      // Create initial job record
      const { data: job, error: jobError } = await supabase
        .from('video_jobs')
        .insert({
          user_id: userId,
          status: 'pending',
          job_config: config as any,
          input_video_path: videoUrl,
          progress: 0
        })
        .select()
        .single();

      if (jobError || !job) {
        throw new Error(`Failed to create job: ${jobError?.message}`);
      }

      const videoJob: VideoJob = {
        ...job,
        user_id: job.user_id || '',
        created_at: job.created_at || new Date().toISOString(),
        progress: job.progress || 0,
        video_title: job.video_title || undefined,
        video_duration: job.video_duration || undefined,
        error_message: job.error_message || undefined,
        job_config: job.job_config ? job.job_config as unknown as ProcessingPipelineConfig : undefined,
        input_video_path: job.input_video_path || undefined,
        result_data: job.result_data || undefined,
        updated_at: job.updated_at || undefined,
      };

      // Update to processing
      const processingJob = await this.updateJobStatus(job.id, 'processing', 10);

      try {
        // Submit to Colab for processing
        const { data: colabData, error: colabError } = await supabase.functions.invoke('submit-to-colab', {
          body: {
            video_url: videoUrl,
            job_id: job.id,
            config: config
          }
        });

        if (colabError) {
          throw new Error(`Colab submission failed: ${colabError.message}`);
        }

        // Update progress
        const progressJob = await this.updateJobStatus(job.id, 'processing', 50);

        return processingJob;

      } catch (processingError) {
        console.error('Processing error:', processingError);
        
        // Fallback to Gemini processing for YouTube videos
        if (config.source_type === 'youtube') {
          return await this.fallbackToGeminiProcessing(job.id, videoUrl, config);
        }
        
        throw processingError;
      }

    } catch (error) {
      console.error('Video processing pipeline error:', error);
      toast.error(`Video processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private static async updateJobStatus(
    jobId: string, 
    status: string, 
    progress?: number
  ): Promise<VideoJob> {
    const updateData: any = { status };
    if (progress !== undefined) {
      updateData.progress = progress;
    }

    const { data, error } = await supabase
      .from('video_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update job status: ${error?.message}`);
    }

    return {
      ...data,
      user_id: data.user_id || '',
      created_at: data.created_at || new Date().toISOString(),
      progress: data.progress || 0,
      video_title: data.video_title || undefined,
      video_duration: data.video_duration || undefined,
      error_message: data.error_message || undefined,
      job_config: data.job_config ? data.job_config as unknown as ProcessingPipelineConfig : undefined,
      input_video_path: data.input_video_path || undefined,
      result_data: data.result_data || undefined,
      updated_at: data.updated_at || undefined,
    };
  }

  private static async fallbackToGeminiProcessing(
    jobId: string,
    videoUrl: string,
    config: ProcessingPipelineConfig
  ): Promise<VideoJob> {
    try {
      console.log('Falling back to Gemini processing...');
      
      const progressJob = await this.updateJobStatus(jobId, 'processing', 25);

      const { data: geminiData, error: geminiError } = await supabase.functions.invoke('process-video-gemini', {
        body: {
          video_url: videoUrl,
          job_id: jobId,
          config: config
        }
      });

      if (geminiError) {
        throw new Error(`Gemini processing failed: ${geminiError.message}`);
      }

      const processingJob = await this.updateJobStatus(jobId, 'processing', 75);

      // Complete the job
      const completedJob = await this.updateJobStatus(jobId, 'completed', 100);

      return completedJob;

    } catch (error) {
      console.error('Gemini fallback failed:', error);
      
      // Mark job as failed
      const failedJob = await this.updateJobStatus(jobId, 'failed', 0);
      
      const { error: updateError } = await supabase
        .from('video_jobs')
        .update({
          error_message: error instanceof Error ? error.message : 'Unknown error during processing'
        })
        .eq('id', jobId);

      if (updateError) {
        console.error('Failed to update error message:', updateError);
      }

      return failedJob;
    }
  }

  static async handleJobCallback(jobId: string, status: string, results?: any, error?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        progress: status === 'completed' ? 100 : status === 'failed' ? 0 : undefined
      };

      if (results) {
        updateData.result_data = results;
      }

      if (error) {
        updateData.error_message = error;
      }

      const { error: updateError } = await supabase
        .from('video_jobs')
        .update(updateData)
        .eq('id', jobId);

      if (updateError) {
        console.error('Failed to update job from callback:', updateError);
        throw updateError;
      }

      console.log(`Job ${jobId} updated to status: ${status}`);

    } catch (callbackError) {
      console.error('Job callback handling failed:', callbackError);
      throw callbackError;
    }
  }
}
