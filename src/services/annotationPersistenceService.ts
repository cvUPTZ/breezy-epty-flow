
interface AnnotationData {
  id: string;
  videoId: string;
  timestamp: number;
  type: string;
  points: any;
  color: string;
  label?: string;
  measurement?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class AnnotationPersistenceService {
  private static STORAGE_KEY = 'video_annotations';

  static async saveAnnotations(
    videoId: string,
    timestamp: number,
    annotations: any[]
  ): Promise<void> {
    try {
      const userId = 'current-user'; // In production, get from auth context
      const now = new Date().toISOString();

      const annotationData: AnnotationData[] = annotations.map((annotation, index) => ({
        id: `${videoId}-${timestamp}-${index}`,
        videoId,
        timestamp,
        type: annotation.type,
        points: annotation.points,
        color: annotation.color,
        label: annotation.label,
        measurement: annotation.measurement,
        userId,
        createdAt: now,
        updatedAt: now
      }));

      // Get existing annotations
      const existing = this.getStoredAnnotations();
      
      // Remove old annotations for this video and timestamp
      const filtered = existing.filter(
        ann => !(ann.videoId === videoId && Math.abs(ann.timestamp - timestamp) < 1)
      );

      // Add new annotations
      const updated = [...filtered, ...annotationData];

      // Store back
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

      console.log(`Saved ${annotationData.length} annotations for video ${videoId} at ${timestamp}s`);
    } catch (error) {
      console.error('Failed to save annotations:', error);
      throw error;
    }
  }

  static async loadAnnotations(videoId: string): Promise<any[]> {
    try {
      const stored = this.getStoredAnnotations();
      const videoAnnotations = stored.filter(ann => ann.videoId === videoId);

      console.log(`Loaded ${videoAnnotations.length} annotations for video ${videoId}`);
      
      return videoAnnotations.map(ann => ({
        id: ann.id,
        type: ann.type,
        points: ann.points,
        color: ann.color,
        label: ann.label,
        measurement: ann.measurement,
        timestamp: ann.timestamp
      }));
    } catch (error) {
      console.error('Failed to load annotations:', error);
      return [];
    }
  }

  static async deleteAnnotations(videoId: string, timestamp?: number): Promise<void> {
    try {
      const existing = this.getStoredAnnotations();
      
      const filtered = existing.filter(ann => {
        if (ann.videoId !== videoId) return true;
        if (timestamp !== undefined) {
          return Math.abs(ann.timestamp - timestamp) >= 1;
        }
        return false;
      });

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      console.log(`Deleted annotations for video ${videoId}${timestamp ? ` at ${timestamp}s` : ''}`);
    } catch (error) {
      console.error('Failed to delete annotations:', error);
      throw error;
    }
  }

  static async getUserAnnotations(userId: string): Promise<any[]> {
    try {
      const stored = this.getStoredAnnotations();
      return stored.filter(ann => ann.userId === userId);
    } catch (error) {
      console.error('Failed to get user annotations:', error);
      return [];
    }
  }

  private static getStoredAnnotations(): AnnotationData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse stored annotations:', error);
      return [];
    }
  }

  static clearAllAnnotations(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Cleared all stored annotations');
  }
}
