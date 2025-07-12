// src/services/videoJobService.ts
import { supabase } from '@/integrations/supabase/client';
import { VideoChunkingService, ChunkedVideoMetadata } from './videoChunkingService';

export interface VideoJob {
  id: string;
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed' | 'pending';
  progress?: number;
  fileName?: string;
  createdAt?: string;
  created_at: string;
  updated_at: string;
  segmentId?: string;
  results?: any;
  result_data?: any;
  error?: string;
  error_message?: string;
  colabLogUrl?: string;
  input_video_path: string;
  video_title?: string;
  video_duration?: number;
  user_id: string;
  job_config?: {
    source_type: 'youtube' | 'upload';
    enableAIAnalysis: boolean;
    enableSegmentation: boolean;
    segmentDuration?: number;
  };
  chunked_video_metadata?: ChunkedVideoMetadata;
}

/**
 * Simplified Video Service for direct video processing without job queues.
 * Focuses on basic video upload and URL handling with chunking support.
 */
export class VideoJobService {
  static sanitizeFileName(fileName: string): string {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }

  static async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<string> {
    console.log(`Starting upload for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    try {
      if (VideoChunkingService.needsChunking(file)) {
        console.log('File size exceeds limit, using chunking approach');
        return await this.uploadVideoWithChunking(file, onProgress);
      } else {
        console.log('File size acceptable, using direct upload');
        return await this.uploadVideoDirectly(file, onProgress);
      }
    } catch (error: any) {
      console.error('Upload failed with error:', error);
      throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
    }
  }

  private static async uploadVideoDirectly(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const sanitizedName = this.sanitizeFileName(file.name.replace(/\.[^/.]+$/, ''));
    const fileName = `${timestamp}_${sanitizedName}.${fileExtension}`;

    console.log('Starting direct upload:', { originalName: file.name, fileName, size: file.size });

    if (onProgress) onProgress(10);

    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { 
          cacheControl: '3600', 
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('Direct upload error:', error);
        throw new Error(`Failed to upload video: ${error.message}`);
      }
      
      if (onProgress) onProgress(100);
      console.log('Direct upload successful:', data);
      return data.path;
      
    } catch (error: any) {
      console.error('Direct upload exception:', error);
      throw error;
    }
  }

  private static async uploadVideoWithChunking(file: File, onProgress?: (progress: number) => void): Promise<string> {
    console.log('Starting chunked upload process');
    
    try {
      if (onProgress) onProgress(5);

      console.log('Splitting file into chunks...');
      const { chunks, metadata } = await VideoChunkingService.splitVideoFile(file);
      console.log(`File split into ${chunks.length} chunks successfully`);

      if (onProgress) onProgress(15);

      const chunkProgress = (chunkProgressPercent: number) => {
        if (onProgress) {
          // Reserve 15-95% for chunk upload progress
          const totalProgress = 15 + (chunkProgressPercent * 0.8);
          console.log(`Reporting progress: ${totalProgress.toFixed(1)}%`);
          onProgress(totalProgress);
        }
      };

      console.log('Starting chunk uploads...');
      const chunkedMetadata = await VideoChunkingService.uploadVideoChunks(
        chunks, 
        metadata, 
        chunkProgress
      );

      if (onProgress) onProgress(100);

      const metadataPath = `chunked:${JSON.stringify(chunkedMetadata)}`;
      console.log('Chunked upload completed successfully');
      
      return metadataPath;
    } catch (error: any) {
      console.error('Chunked upload failed:', error);
      throw new Error(`Chunked upload failed: ${error.message || 'Unknown error'}`);
    }
  }

  static async getVideoDownloadUrl(videoPath: string): Promise<string> {
    console.log(`Getting download URL for path: ${videoPath.substring(0, 50)}...`);
    
    try {
      if (videoPath.startsWith('chunked:')) {
        const metadataJson = videoPath.replace('chunked:', '');
        const metadata: ChunkedVideoMetadata = JSON.parse(metadataJson);
        
        console.log('Getting URL for chunked video');
        return await VideoChunkingService.getChunkedVideoUrl(metadata);
      } else {
        const { data, error } = await supabase.storage.from('videos').createSignedUrl(videoPath, 3600);
        if (error) throw new Error(`Failed to get download URL: ${error.message}`);
        return data.signedUrl;
      }
    } catch (error: any) {
      console.error('Failed to get video download URL:', error);
      throw new Error(`Failed to get video URL: ${error.message || 'Unknown error'}`);
    }
  }

  static async deleteVideoFile(videoPath: string): Promise<void> {
    if (videoPath && !videoPath.includes('youtube.com') && !videoPath.includes('youtu.be')) {
      if (videoPath.startsWith('chunked:')) {
        const metadataJson = videoPath.replace('chunked:', '');
        const metadata: ChunkedVideoMetadata = JSON.parse(metadataJson);
        await VideoChunkingService.deleteVideoChunks(metadata);
      } else {
        await supabase.storage.from('videos').remove([videoPath]);
      }
    }
  }

  static async pollJobStatus(jobId: string, callback: (job: VideoJob | null) => void, intervalMs: number = 5000): Promise<() => void> {
    console.warn(`VideoJobService.pollJobStatus is a stub and does not perform real polling for job ID: ${jobId}. Interval: ${intervalMs}ms`);
    return () => {
      console.warn(`Polling stopped for job ID: ${jobId} (stub)`);
    };
  }

  static async getUserJobs(userId?: string): Promise<VideoJob[]> {
    console.warn(`VideoJobService.getUserJobs is a stub and will return an empty array for user ID: ${userId || 'undefined'}`);
    return [];
  }

  static async deleteJob(jobId: string): Promise<void> {
    console.warn(`VideoJobService.deleteJob is a stub and does not delete job ID: ${jobId}`);
    return Promise.resolve();
  }
}
