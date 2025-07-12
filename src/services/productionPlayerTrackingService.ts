
import { supabase } from '@/integrations/supabase/client';

export interface RealTimePlayerData {
  playerId: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  speed: number;
  team: 'home' | 'away';
  jerseyNumber: number;
  confidence: number;
  timestamp: number;
}

export interface TrackingConfiguration {
  frameRate: number;
  detectionThreshold: number;
  trackingAlgorithm: 'yolo' | 'detectron2' | 'custom';
  enableHeatmap: boolean;
  enableTrajectory: boolean;
}

export class ProductionPlayerTrackingService {
  private isTracking = false;
  private trackingWorker: Worker | null = null;
  private configuration: TrackingConfiguration;

  constructor(config: TrackingConfiguration) {
    this.configuration = config;
  }

  async startTracking(videoElement: HTMLVideoElement, onDataUpdate: (data: RealTimePlayerData[]) => void): Promise<void> {
    if (this.isTracking) return;

    this.isTracking = true;

    // Initialize tracking worker
    this.trackingWorker = new Worker('/workers/player-tracking-worker.js');
    
    this.trackingWorker.onmessage = (event) => {
      const { type, data } = event.data;
      
      if (type === 'tracking_data') {
        onDataUpdate(data);
        this.saveTrackingData(data);
      }
    };

    // Start video frame processing
    this.processVideoFrames(videoElement);
  }

  private processVideoFrames(videoElement: HTMLVideoElement): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const processFrame = () => {
      if (!this.isTracking) return;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      if (this.trackingWorker) {
        this.trackingWorker.postMessage({
          type: 'process_frame',
          imageData: imageData,
          timestamp: videoElement.currentTime,
          config: this.configuration
        });
      }

      setTimeout(processFrame, 1000 / this.configuration.frameRate);
    };

    processFrame();
  }

  private async saveTrackingData(data: RealTimePlayerData[]): Promise<void> {
    try {
      const trackingRecords = data.map(player => ({
        player_id: player.playerId,
        position_x: player.position.x,
        position_y: player.position.y,
        velocity_x: player.velocity.x,
        velocity_y: player.velocity.y,
        speed: player.speed,
        team: player.team,
        jersey_number: player.jerseyNumber,
        confidence: player.confidence,
        timestamp: player.timestamp,
        created_at: new Date().toISOString()
      }));

      await supabase
        .from('player_tracking_data')
        .insert(trackingRecords);
    } catch (error) {
      console.error('Failed to save tracking data:', error);
    }
  }

  stopTracking(): void {
    this.isTracking = false;
    
    if (this.trackingWorker) {
      this.trackingWorker.terminate();
      this.trackingWorker = null;
    }
  }

  async generateHeatmap(playerId: string, timeRange: { start: number; end: number }): Promise<HeatmapPoint[]> {
    const { data, error } = await supabase
      .from('player_tracking_data')
      .select('position_x, position_y, timestamp')
      .eq('player_id', playerId)
      .gte('timestamp', timeRange.start)
      .lte('timestamp', timeRange.end);

    if (error || !data) return [];

    // Generate heatmap points with intensity based on time spent in areas
    const heatmapGrid: { [key: string]: number } = {};
    const gridSize = 20;

    data.forEach(point => {
      const gridX = Math.floor(point.position_x / gridSize);
      const gridY = Math.floor(point.position_y / gridSize);
      const key = `${gridX},${gridY}`;
      heatmapGrid[key] = (heatmapGrid[key] || 0) + 1;
    });

    return Object.entries(heatmapGrid).map(([key, intensity]) => {
      const [x, y] = key.split(',').map(Number);
      return {
        x: x * gridSize + gridSize / 2,
        y: y * gridSize + gridSize / 2,
        intensity: Math.min(intensity / 10, 1) // Normalize intensity
      };
    });
  }
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}
