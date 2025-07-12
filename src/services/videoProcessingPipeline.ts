
import { supabase } from '@/integrations/supabase/client';
import { YouTubeService } from './youtubeService';
import { AIProcessingService } from './aiProcessingService';
import { VideoJob, VideoJobStatus } from './videoJobService';

export interface ProcessingPipelineConfig {
  enableYouTubeDownload: boolean;
  enableAIAnalysis: boolean;
  enableSegmentation: boolean;
  segmentDuration?: number; // in seconds
  aiProcessingFocus?: 'events' | 'tracking' | 'statistics' | 'all';
}

export class VideoProcessingPipeline {
  // Create complete processing pipeline
  static async processVideoComplete(
    source: { type: 'youtube', url: string } | { type: 'upload', file: File },
    config: ProcessingPipelineConfig
  ): Promise<VideoJob> {
    let videoPath: string;
    let videoInfo: any = {};

    // Step 1: Handle video source
    if (source.type === 'youtube') {
      if (!config.enableYouTubeDownload) {
        throw new Error('YouTube download not enabled');
      }

      // Get video info
      const ytInfo = await YouTubeService.getVideoInfo(source.url);
      videoInfo = {
        title: ytInfo.title,
        duration: this.parseDurationToSeconds(ytInfo.duration)
      };

      // Download video
      videoPath = await YouTubeService.downloadVideo(source.url);
    } else {
      // Upload file directly
      const timestamp = Date.now();
      const fileName = `${timestamp}-${source.file.name}`;
      const filePath = `public/${fileName}`;

      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, source.file);

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      videoPath = data.path;
      videoInfo = {
        title: source.file.name.replace(/\.[^/.]+$/, ""),
        duration: 0 // Will be determined during processing
      };
    }

    // Step 2: Create job record
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User must be authenticated');
    }

    const jobData = {
      input_video_path: videoPath,
      video_title: videoInfo.title,
      video_duration: videoInfo.duration,
      user_id: user.user.id,
      status: 'pending' as const,
      progress: 0,
      job_config: {
        source_type: source.type,
        enableAIAnalysis: config.enableAIAnalysis,
        enableSegmentation: config.enableSegmentation,
        segmentDuration: config.segmentDuration
      }
    };

    const insertResult = await supabase
      .from('video_jobs')
      .insert(jobData)
      .select('*')
      .single();

    if (insertResult.error) {
      throw new Error(`Failed to create job: ${insertResult.error.message}`);
    }

    // Convert database response to VideoJob format - ensure user_id is string
    let currentJobState: VideoJob = {
      ...insertResult.data,
      created_at: insertResult.data.created_at || new Date().toISOString(),
      video_title: insertResult.data.video_title || undefined,
      video_duration: insertResult.data.video_duration || undefined,
      error_message: insertResult.data.error_message || undefined,
      user_id: insertResult.data.user_id!, // Assert non-null since we checked earlier
      status: (insertResult.data.status || 'pending') as VideoJobStatus,
      progress: insertResult.data.progress || 0,
      job_config: {
        source_type: source.type,
        enableAIAnalysis: config.enableAIAnalysis,
        enableSegmentation: config.enableSegmentation,
        segmentDuration: config.segmentDuration
      }
    };

    // Immediately update job status to 'processing' after creation
    const updateResult = await supabase
      .from('video_jobs')
      .update({ status: 'processing' as const })
      .eq('id', currentJobState.id)
      .select('*')
      .single();

    if (updateResult.error) {
      console.error(`Failed to update job status to 'processing' for job ${currentJobState.id}:`, updateResult.error.message);
    } else if (updateResult.data) {
      currentJobState = {
        ...updateResult.data,
        created_at: updateResult.data.created_at || new Date().toISOString(),
        video_title: updateResult.data.video_title || undefined,
        video_duration: updateResult.data.video_duration || undefined,
        error_message: updateResult.data.error_message || undefined,
        user_id: updateResult.data.user_id!, // Assert non-null
        status: (updateResult.data.status || 'processing') as VideoJobStatus,
        progress: updateResult.data.progress || 0,
        job_config: currentJobState.job_config
      };
    }

    // Step 3: AI Processing with fallback
    if (config.enableAIAnalysis) {
      try {
        console.log(`Attempting primary AI processing for job ${currentJobState.id}...`);
        await AIProcessingService.submitToColabWorker(currentJobState.id);
        
        const updateAfterPrimary = await supabase
          .from('video_jobs')
          .update({ status: 'processing' as const })
          .eq('id', currentJobState.id)
          .select('*')
          .single();
        
        if (updateAfterPrimary.error) throw updateAfterPrimary.error;
        if (updateAfterPrimary.data) {
          currentJobState = {
            ...updateAfterPrimary.data,
            created_at: updateAfterPrimary.data.created_at || new Date().toISOString(),
            video_title: updateAfterPrimary.data.video_title || undefined,
            video_duration: updateAfterPrimary.data.video_duration || undefined,
            error_message: updateAfterPrimary.data.error_message || undefined,
            user_id: updateAfterPrimary.data.user_id!, // Assert non-null
            status: (updateAfterPrimary.data.status || 'processing') as VideoJobStatus,
            progress: updateAfterPrimary.data.progress || 0,
            job_config: currentJobState.job_config
          };
        }
        console.log(`Job ${currentJobState.id} status updated to 'processing'.`);

      } catch (primaryError: any) {
        console.error(`Primary AI processing failed for job ${currentJobState.id}:`, primaryError.message);
        
        // Fallback logic for YouTube videos
        if (source.type === 'youtube' && config.enableAIAnalysis) {
          console.log(`Attempting fallback AI analysis for YouTube video (job ${currentJobState.id}) using 'analyze-youtube-video' function...`);
          try {
            // Fetch Gemini API Key
            const { data: apiKeyData, error: apiKeyError } = await supabase.functions.invoke('get-gemini-api-key');
            if (apiKeyError || !apiKeyData || !apiKeyData.apiKey) {
              const errorMsg = apiKeyError?.message || "Gemini API key not found or function invocation failed.";
              console.error(`Failed to retrieve Gemini API key for fallback analysis (job ${currentJobState.id}):`, errorMsg);
              
              const updateAfterFallbackFail = await supabase
                .from('video_jobs')
                .update({ 
                  status: 'failed' as const, 
                  error_message: errorMsg 
                })
                .eq('id', currentJobState.id)
                .select('*')
                .single();
              
              if (updateAfterFallbackFail.data) {
                currentJobState = {
                  ...updateAfterFallbackFail.data,
                  created_at: updateAfterFallbackFail.data.created_at || new Date().toISOString(),
                  video_title: updateAfterFallbackFail.data.video_title || undefined,
                  video_duration: updateAfterFallbackFail.data.video_duration || undefined,
                  error_message: updateAfterFallbackFail.data.error_message || undefined,
                  user_id: updateAfterFallbackFail.data.user_id!, // Assert non-null
                  status: (updateAfterFallbackFail.data.status || 'failed') as VideoJobStatus,
                  progress: updateAfterFallbackFail.data.progress || 0,
                  job_config: currentJobState.job_config
                };
              }
              return currentJobState;
            }
            const retrievedApiKey = apiKeyData.apiKey;

            // Call 'analyze-youtube-video'
            const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('analyze-youtube-video', {
              body: { videoUrl: source.url, apiKey: retrievedApiKey }
            });

            if (fallbackError) {
              throw fallbackError;
            }

            // Fallback succeeded
            console.log(`Fallback AI analysis successful for job ${currentJobState.id}.`);
            const updateAfterFallback = await supabase
              .from('video_jobs')
              .update({ 
                status: 'completed' as const, 
                result_data: fallbackData.analysisResult, 
                error_message: null 
              })
              .eq('id', currentJobState.id)
              .select('*')
              .single();
            
            if (updateAfterFallback.error) throw updateAfterFallback.error;
            if (updateAfterFallback.data) {
              currentJobState = {
                ...updateAfterFallback.data,
                created_at: updateAfterFallback.data.created_at || new Date().toISOString(),
                video_title: updateAfterFallback.data.video_title || undefined,
                video_duration: updateAfterFallback.data.video_duration || undefined,
                error_message: updateAfterFallback.data.error_message || undefined,
                user_id: updateAfterFallback.data.user_id!, // Assert non-null
                status: (updateAfterFallback.data.status || 'completed') as VideoJobStatus,
                progress: updateAfterFallback.data.progress || 0,
                job_config: currentJobState.job_config
              };
            }

          } catch (fallbackCatchError: any) {
            console.error(`Fallback AI analysis failed for job ${currentJobState.id}:`, fallbackCatchError.message);
            const updateAfterFallbackCatch = await supabase
              .from('video_jobs')
              .update({ 
                status: 'failed' as const, 
                error_message: fallbackCatchError.message 
              })
              .eq('id', currentJobState.id)
              .select('*')
              .single();
            
            if (updateAfterFallbackCatch.data) {
              currentJobState = {
                ...updateAfterFallbackCatch.data,
                created_at: updateAfterFallbackCatch.data.created_at || new Date().toISOString(),
                video_title: updateAfterFallbackCatch.data.video_title || undefined,
                video_duration: updateAfterFallbackCatch.data.video_duration || undefined,
                error_message: updateAfterFallbackCatch.data.error_message || undefined,
                user_id: updateAfterFallbackCatch.data.user_id!, // Assert non-null
                status: (updateAfterFallbackCatch.data.status || 'failed') as VideoJobStatus,
                progress: updateAfterFallbackCatch.data.progress || 0,
                job_config: currentJobState.job_config
              };
            }
          }
        } else {
          // No fallback applicable
          const updateNoFallback = await supabase
            .from('video_jobs')
            .update({ 
              status: 'failed' as const, 
              error_message: primaryError.message 
            })
            .eq('id', currentJobState.id)
            .select('*')
            .single();
          
          if (updateNoFallback.data) {
            currentJobState = {
              ...updateNoFallback.data,
              created_at: updateNoFallback.data.created_at || new Date().toISOString(),
              video_title: updateNoFallback.data.video_title || undefined,
              video_duration: updateNoFallback.data.video_duration || undefined,
              error_message: updateNoFallback.data.error_message || undefined,
              user_id: updateNoFallback.data.user_id!, // Assert non-null
              status: (updateNoFallback.data.status || 'failed') as VideoJobStatus,
              progress: updateNoFallback.data.progress || 0,
              job_config: currentJobState.job_config
            };
          }
        }
      }
    } else {
      // AI analysis not enabled, update status accordingly
      const updateNoAI = await supabase
        .from('video_jobs')
        .update({ status: 'completed' as const })
        .eq('id', currentJobState.id)
        .select('*')
        .single();
      
      if (updateNoAI.data) {
        currentJobState = {
          ...updateNoAI.data,
          created_at: updateNoAI.data.created_at || new Date().toISOString(),
          video_title: updateNoAI.data.video_title || undefined,
          video_duration: updateNoAI.data.video_duration || undefined,
          error_message: updateNoAI.data.error_message || undefined,
          user_id: updateNoAI.data.user_id!, // Assert non-null
          status: (updateNoAI.data.status || 'completed') as VideoJobStatus,
          progress: updateNoAI.data.progress || 0,
          job_config: currentJobState.job_config
        };
      }
    }
    return currentJobState;
  }

  // Split video into segments for processing
  static async splitVideoIntoSegments(
    videoPath: string, 
    segmentDuration: number = 300 // 5 minutes default
  ): Promise<string[]> {
    const { data, error } = await supabase.functions.invoke('split-video', {
      body: { videoPath, segmentDuration }
    });

    if (error) {
      throw new Error(`Video splitting failed: ${error.message}`);
    }

    return data.segmentPaths;
  }

  // Process multiple segments in parallel
  static async processSegmentsInParallel(
    segmentPaths: string[],
    maxConcurrent: number = 3
  ): Promise<Array<{ segmentPath: string; result: any; error?: string }>> {
    const results = [];
    
    for (let i = 0; i < segmentPaths.length; i += maxConcurrent) {
      const batch = segmentPaths.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (segmentPath) => {
        try {
          const result = await AIProcessingService.processVideoWithGemini(segmentPath);
          return { segmentPath, result };
        } catch (error: any) {
          return { segmentPath, result: null, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  // Monitor job progress
  static async getJobProgress(jobId: string): Promise<{
    status: string;
    progress: number;
    currentStep?: string;
    error?: string;
  }> {
    const { data, error } = await supabase
      .from('video_jobs')
      .select('status, progress, error_message')
      .eq('id', jobId)
      .single();

    if (error) {
      throw new Error(`Failed to get job progress: ${error.message}`);
    }

    return {
      status: data.status || 'pending',
      progress: data.progress || 0,
      error: data.error_message || undefined
    };
  }

  // Helper to parse ISO 8601 duration to seconds
  private static parseDurationToSeconds(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }
}
