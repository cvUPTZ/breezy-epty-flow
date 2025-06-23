
import { supabase } from '@/integrations/supabase/client';

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  url: string;
  formats: Array<{
    quality: string;
    format: string;
    size: string;
  }>;
}

interface VideoTrackerAssignmentPayload {
  tracker_id: string;
  assigned_event_types: string[];
}

export class YouTubeService {
  // Get YouTube API key from Supabase secrets
  private static async getApiKey(): Promise<string> {
    const { data } = await supabase.functions.invoke('get-youtube-api-key');
    if (!data?.apiKey) {
      throw new Error('YouTube API key not configured');
    }
    return data.apiKey;
  }

  // Extract video ID from YouTube URL
  static extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // Get video information from YouTube API
  static async getVideoInfo(videoUrl: string): Promise<YouTubeVideoInfo> {
    const videoId = this.extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const apiKey = await this.getApiKey();
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = data.items[0];
    return {
      id: videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      duration: video.contentDetails.duration,
      thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
      url: videoUrl,
      formats: [
        { quality: '720p', format: 'mp4', size: 'Unknown' },
        { quality: '480p', format: 'mp4', size: 'Unknown' },
        { quality: '360p', format: 'mp4', size: 'Unknown' }
      ]
    };
  }

  // Request video download (calls edge function)
  static async downloadVideo(videoUrl: string, quality: string = '720p'): Promise<string> {
    const { data, error } = await supabase.functions.invoke('download-youtube-video', {
      body: { videoUrl, quality }
    });

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    return data.filePath;
  }

  static async saveVideoMatchSetup(
    matchId: string,
    videoUrl: string,
    assignments: VideoTrackerAssignmentPayload[],
    createdById: string
  ): Promise<{ videoSetting: any; assignmentResults: any[] }> {
    if (!matchId || !videoUrl) {
      throw new Error('Match ID and Video URL are required for video setup.');
    }
    if (!createdById) {
      throw new Error('User ID of the creator is required.');
    }

    // Step 1: Create or update the video entry in match_video_settings
    const videoSetting = await this.addVideoToMatch(matchId, videoUrl, createdById);
    if (!videoSetting || !videoSetting.id) {
      throw new Error('Failed to save video settings for the match.');
    }
    const matchVideoId = videoSetting.id;

    // Step 2: Clear existing assignments for this match_video_id
    try {
      await (supabase as any)
        .from('video_tracker_assignments')
        .delete()
        .eq('match_video_id', matchVideoId);
    } catch (deleteError) {
      console.error('Error clearing previous video tracker assignments:', deleteError);
    }

    // Step 3: Insert new assignments
    let assignmentResults: any[] = [];
    if (assignments && assignments.length > 0) {
      const newAssignmentsData = assignments.map(assignment => ({
        match_video_id: matchVideoId,
        tracker_id: assignment.tracker_id,
        assigned_event_types: assignment.assigned_event_types,
        assigned_by: createdById,
        status: 'pending',
      }));

      try {
        const { data, error } = await (supabase as any)
          .from('video_tracker_assignments')
          .insert(newAssignmentsData)
          .select();

        if (error) {
          throw new Error(`Failed to save video tracker assignments: ${error.message}`);
        }

        assignmentResults = data || [];
        console.log('Video tracker assignments saved:', assignmentResults);
      } catch (insertError) {
        console.error('Error inserting video tracker assignments:', insertError);
      }
    }

    return { videoSetting, assignmentResults };
  }

  static async getVideoMatchSetup(matchId: string): Promise<any | null> {
    console.log('Getting video match setup for matchId:', matchId);
    
    try {
      const { data, error } = await (supabase as any)
        .from('match_video_settings')
        .select(`
          *,
          video_tracker_assignments (*)
        `)
        .eq('match_id', matchId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting video match setup:', error);
      return null;
    }
  }

  static async getTrackerVideoAssignments(trackerId: string): Promise<any[]> {
    console.log('Getting video assignments for trackerId:', trackerId);
    
    try {
      const { data, error } = await (supabase as any)
        .from('video_tracker_assignments')
        .select(`
          *,
          match_video_settings (
            video_url,
            video_title,
            video_description,
            duration_seconds,
            match_id,
            matches (name, home_team_name, away_team_name)
          )
        `)
        .eq('tracker_id', trackerId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting tracker video assignments:', error);
      return [];
    }
  }

  static async addVideoToMatch(
    matchId: string,
    videoUrl: string,
    userId?: string,
    existingVideoSettingId?: string | null
  ): Promise<any> {
    if (!matchId || !videoUrl) {
      throw new Error('Match ID and Video URL are required.');
    }

    const videoDetails = await this.getVideoInfo(videoUrl).catch(err => {
      console.warn(`Could not fetch video info for ${videoUrl}: ${err.message}. Proceeding without extra details.`);
      return null;
    });

    const videoData = {
      match_id: matchId,
      video_url: videoUrl,
      video_title: videoDetails?.title,
      video_description: videoDetails?.description,
      duration_seconds: videoDetails?.duration ? YouTubeService.parseDuration(videoDetails.duration) : null,
      created_by: userId,
      updated_at: new Date().toISOString(),
    };

    if (existingVideoSettingId) {
      const { data, error } = await (supabase as any)
        .from('match_video_settings')
        .update(videoData)
        .eq('id', existingVideoSettingId)
        .eq('match_id', matchId)
        .select()
        .single();
      if (error) throw error;
      console.log('Video setting updated for match:', matchId, data);
      return data;
    } else {
      const { data: existing, error: fetchError } = await (supabase as any)
        .from('match_video_settings')
        .select('id')
        .eq('match_id', matchId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
         console.error('Error checking for existing video setting:', fetchError);
      }

      if (existing) {
        const { data, error } = await (supabase as any)
          .from('match_video_settings')
          .update(videoData)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        console.log('Video setting updated (via upsert logic) for match:', matchId, data);
        return data;
      } else {
        const { data, error } = await (supabase as any)
          .from('match_video_settings')
          .insert({ ...videoData, created_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        console.log('Video setting created for match:', matchId, data);
        return data;
      }
    }
  }

  // Helper to parse ISO 8601 duration (e.g., PT1M35S) to seconds
  static parseDuration(isoDuration: string): number | null {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDuration.match(regex);
    if (!matches) return null;
    const hours = parseInt(matches[1] || '0');
    const minutes = parseInt(matches[2] || '0');
    const seconds = parseInt(matches[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  }
}
