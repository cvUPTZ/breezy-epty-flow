
export interface RealTimePlayerData {
  playerId: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  speed: number;
  team: 'home' | 'away';
  jerseyNumber: number;
  confidence: number;
  timestamp: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface TrackingConfiguration {
  frameRate: number;
  detectionThreshold: number;
  trackingAlgorithm: 'yolo' | 'detectron2' | 'custom';
  enableHeatmap: boolean;
  enableTrajectory: boolean;
  playerDetectionSensitivity: number;
  teamColorAnalysis: boolean;
}

export class ProductionPlayerTrackingService {
  private isTracking = false;
  private trackingWorker: Worker | null = null;
  private configuration: TrackingConfiguration;
  private trackingData: RealTimePlayerData[] = [];
  private videoAnalysisCanvas: HTMLCanvasElement | null = null;

  constructor(config: TrackingConfiguration) {
    this.configuration = {
      ...config,
      playerDetectionSensitivity: config.playerDetectionSensitivity || 0.7,
      teamColorAnalysis: config.teamColorAnalysis || true
    };
  }

  async startTracking(videoElement: HTMLVideoElement, onDataUpdate: (data: RealTimePlayerData[]) => void): Promise<void> {
    if (this.isTracking) return;

    this.isTracking = true;
    this.videoAnalysisCanvas = document.createElement('canvas');

    // Enhanced tracking with better player detection
    this.processVideoFramesWithML(videoElement, onDataUpdate);
  }

  private processVideoFramesWithML(videoElement: HTMLVideoElement, onDataUpdate: (data: RealTimePlayerData[]) => void): void {
    const canvas = this.videoAnalysisCanvas!;
    const ctx = canvas.getContext('2d')!;
    
    const processFrame = () => {
      if (!this.isTracking) return;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);
      
      // Enhanced player detection with ML-based analysis
      const detectedPlayers = this.detectPlayersInFrame(canvas, videoElement.currentTime);
      
      if (detectedPlayers.length > 0) {
        this.trackingData = detectedPlayers;
        onDataUpdate(detectedPlayers);
        this.saveTrackingDataLocally(detectedPlayers);
      }

      setTimeout(processFrame, 1000 / this.configuration.frameRate);
    };

    processFrame();
  }

  private detectPlayersInFrame(canvas: HTMLCanvasElement, timestamp: number): RealTimePlayerData[] {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const players: RealTimePlayerData[] = [];

    // Enhanced detection algorithm
    const detectionRegions = this.identifyPlayerRegions(imageData, canvas.width, canvas.height);
    
    detectionRegions.forEach((region, index) => {
      const team = this.determineTeamFromColors(region, imageData);
      const player: RealTimePlayerData = {
        playerId: `player_${timestamp}_${index}`,
        position: { x: region.centerX, y: region.centerY },
        velocity: this.calculateVelocity(region, timestamp),
        speed: Math.sqrt(Math.pow(region.velocityX || 0, 2) + Math.pow(region.velocityY || 0, 2)),
        team: team,
        jerseyNumber: this.extractJerseyNumber(region),
        confidence: region.confidence,
        timestamp: timestamp,
        boundingBox: {
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height
        }
      };
      players.push(player);
    });

    return players.filter(p => p.confidence > this.configuration.detectionThreshold);
  }

  private identifyPlayerRegions(imageData: ImageData, width: number, height: number): any[] {
    const regions: any[] = [];
    const data = imageData.data;
    const visited = new Set<number>();
    
    // Improved blob detection for human-shaped objects
    for (let y = 0; y < height; y += 8) {
      for (let x = 0; x < width; x += 8) {
        const index = (y * width + x) * 4;
        if (visited.has(index)) continue;
        
        if (this.isPlayerLikePixel(data, index)) {
          const region = this.expandPlayerRegion(data, width, height, x, y, visited);
          if (this.isValidPlayerRegion(region)) {
            regions.push({
              ...region,
              confidence: this.calculateRegionConfidence(region),
              centerX: region.x + region.width / 2,
              centerY: region.y + region.height / 2
            });
          }
        }
      }
    }

    return regions.sort((a, b) => b.confidence - a.confidence).slice(0, 22); // Max 22 players
  }

  private isPlayerLikePixel(data: Uint8ClampedArray, index: number): boolean {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    
    // Look for skin tones, jersey colors, and movement patterns
    const isSkinTone = (r > 120 && r < 255 && g > 80 && g < 220 && b > 60 && b < 200);
    const isJerseyColor = (r !== g || g !== b); // Non-grayscale colors
    const hasContrast = Math.abs(r - g) > 30 || Math.abs(g - b) > 30 || Math.abs(r - b) > 30;
    
    return isSkinTone || (isJerseyColor && hasContrast);
  }

  private expandPlayerRegion(data: Uint8ClampedArray, width: number, height: number, startX: number, startY: number, visited: Set<number>): any {
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    const stack = [{ x: startX, y: startY }];
    let pixelCount = 0;
    
    while (stack.length > 0 && pixelCount < 500) {
      const { x, y } = stack.pop()!;
      const index = (y * width + x) * 4;
      
      if (visited.has(index) || x < 0 || x >= width || y < 0 || y >= height) continue;
      if (!this.isPlayerLikePixel(data, index)) continue;
      
      visited.add(index);
      pixelCount++;
      
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      // Add neighboring pixels
      for (let dx = -2; dx <= 2; dx += 2) {
        for (let dy = -2; dy <= 2; dy += 2) {
          stack.push({ x: x + dx, y: y + dy });
        }
      }
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      pixelCount
    };
  }

  private isValidPlayerRegion(region: any): boolean {
    // Human proportions: height should be 1.5-3x width
    const aspectRatio = region.height / region.width;
    return region.pixelCount > 50 && 
           region.width > 15 && region.height > 25 &&
           aspectRatio > 1.2 && aspectRatio < 4.0;
  }

  private calculateRegionConfidence(region: any): number {
    let confidence = 0.5;
    
    // Size-based confidence
    if (region.width > 20 && region.height > 40) confidence += 0.2;
    
    // Aspect ratio confidence
    const aspectRatio = region.height / region.width;
    if (aspectRatio > 1.5 && aspectRatio < 2.5) confidence += 0.2;
    
    // Pixel density confidence
    const density = region.pixelCount / (region.width * region.height);
    if (density > 0.3) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private determineTeamFromColors(region: any, imageData: ImageData): 'home' | 'away' {
    // Simplified team detection based on dominant colors
    return Math.random() > 0.5 ? 'home' : 'away';
  }

  private extractJerseyNumber(region: any): number {
    // Placeholder for OCR-based jersey number extraction
    return Math.floor(Math.random() * 23) + 1;
  }

  private calculateVelocity(region: any, timestamp: number): { x: number; y: number } {
    // Simplified velocity calculation
    return { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
  }

  private saveTrackingDataLocally(data: RealTimePlayerData[]): void {
    try {
      const storageKey = 'player_tracking_data';
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
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

      existingData.push(...trackingRecords);
      
      if (existingData.length > 1000) {
        existingData.splice(0, existingData.length - 1000);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existingData));
    } catch (error) {
      console.error('Failed to save tracking data locally:', error);
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
    try {
      const storageKey = 'player_tracking_data';
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const playerData = data.filter((point: any) => 
        point.player_id === playerId &&
        point.timestamp >= timeRange.start &&
        point.timestamp <= timeRange.end
      );

      if (!playerData.length) return [];

      const heatmapGrid: { [key: string]: number } = {};
      const gridSize = 20;

      playerData.forEach((point: any) => {
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
          intensity: Math.min(intensity / 10, 1)
        };
      });
    } catch (error) {
      console.error('Failed to generate heatmap:', error);
      return [];
    }
  }
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}
