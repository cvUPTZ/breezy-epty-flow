
import { YouTubeService } from './youtubeService';

export interface ProcessedVideoInfo {
  originalUrl: string;
  processedUrl: string;
  isYouTube: boolean;
  videoId?: string;
  title?: string;
  thumbnail?: string;
  duration?: number;
  requiresProcessing: boolean;
}

export class YouTubeUrlProcessor {
  static isYouTubeUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
    } catch {
      return false;
    }
  }

  static async processVideoUrl(url: string): Promise<ProcessedVideoInfo> {
    const isYouTube = this.isYouTubeUrl(url);
    
    if (!isYouTube) {
      return {
        originalUrl: url,
        processedUrl: url,
        isYouTube: false,
        requiresProcessing: false,
      };
    }

    // Extract video ID for YouTube
    const videoId = YouTubeService.extractVideoId(url);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    try {
      // Try to get video information
      const videoInfo = await YouTubeService.getVideoInfo(url);
      
      return {
        originalUrl: url,
        processedUrl: url, // For now, keep original URL
        isYouTube: true,
        videoId,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        duration: YouTubeService.parseDuration(videoInfo.duration) || 0,
        requiresProcessing: true, // YouTube videos need backend processing for direct playback
      };
    } catch (error) {
      console.warn('Failed to get YouTube video info:', error);
      
      return {
        originalUrl: url,
        processedUrl: url,
        isYouTube: true,
        videoId,
        requiresProcessing: true,
      };
    }
  }
}
