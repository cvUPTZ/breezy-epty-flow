
import { supabase } from '@/integrations/supabase/client';

export interface PersistentAnnotation {
  id: string;
  videoId: string;
  timestamp: number;
  type: 'circle' | 'line' | 'arrow' | 'distance' | 'spotlight' | 'trajectory' | 'area';
  points: Array<{ x: number; y: number }>;
  color: string;
  label?: string;
  measurement?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class AnnotationPersistenceService {
  static async saveAnnotations(videoId: string, timestamp: number, annotations: any[]): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const annotationRecords = annotations.map(annotation => ({
      video_id: videoId,
      timestamp: timestamp,
      type: annotation.type,
      points: annotation.points,
      color: annotation.color,
      label: annotation.label,
      measurement: annotation.measurement,
      user_id: user.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('video_annotations')
      .insert(annotationRecords);

    if (error) {
      throw new Error(`Failed to save annotations: ${error.message}`);
    }
  }

  static async loadAnnotations(videoId: string, timestamp?: number): Promise<PersistentAnnotation[]> {
    let query = supabase
      .from('video_annotations')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true });

    if (timestamp !== undefined) {
      query = query.eq('timestamp', timestamp);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to load annotations:', error);
      return [];
    }

    return (data || []).map(record => ({
      id: record.id,
      videoId: record.video_id,
      timestamp: record.timestamp,
      type: record.type,
      points: record.points,
      color: record.color,
      label: record.label,
      measurement: record.measurement,
      userId: record.user_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    }));
  }

  static async updateAnnotation(annotationId: string, updates: Partial<PersistentAnnotation>): Promise<void> {
    const { error } = await supabase
      .from('video_annotations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', annotationId);

    if (error) {
      throw new Error(`Failed to update annotation: ${error.message}`);
    }
  }

  static async deleteAnnotation(annotationId: string): Promise<void> {
    const { error } = await supabase
      .from('video_annotations')
      .delete()
      .eq('id', annotationId);

    if (error) {
      throw new Error(`Failed to delete annotation: ${error.message}`);
    }
  }

  static async getAnnotationsByTimeRange(videoId: string, startTime: number, endTime: number): Promise<PersistentAnnotation[]> {
    const { data, error } = await supabase
      .from('video_annotations')
      .select('*')
      .eq('video_id', videoId)
      .gte('timestamp', startTime)
      .lte('timestamp', endTime)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Failed to load annotations by time range:', error);
      return [];
    }

    return (data || []).map(record => ({
      id: record.id,
      videoId: record.video_id,
      timestamp: record.timestamp,
      type: record.type,
      points: record.points,
      color: record.color,
      label: record.label,
      measurement: record.measurement,
      userId: record.user_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    }));
  }
}
