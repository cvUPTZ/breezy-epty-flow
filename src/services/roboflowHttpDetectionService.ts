
import { toast } from 'sonner';
import { apiKeyService } from './apiKeyService';

export interface RoboflowDetection {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoboflowDetectionResult {
  predictions: RoboflowDetection[];
  image: {
    width: number;
    height: number;
  };
  inference_id: string;
  time: number;
}

export interface ProcessedDetectionResult {
  frameIndex: number;
  timestamp: number;
  players: Array<{
    id: string;
    position: { x: number; y: number };
    confidence: number;
    team?: string;
    bounding_box: { x: number; y: number; width: number; height: number };
  }>;
  ball?: {
    position: { x: number; y: number };
    confidence: number;
    bounding_box: { x: number; y: number; width: number; height: number };
  };
  processing_time: number;
  model_used: string;
}

export class RoboflowHttpDetectionService {
  private static instance: RoboflowHttpDetectionService;
  private apiKey: string | null = null;
  private isInitialized = false;
  private currentModelUrl = "football-players-detection-3zvbc/9";

  static getInstance(): RoboflowHttpDetectionService {
    if (!RoboflowHttpDetectionService.instance) {
      RoboflowHttpDetectionService.instance = new RoboflowHttpDetectionService();
    }
    return RoboflowHttpDetectionService.instance;
  }

  async initialize(modelUrl?: string): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      this.apiKey = await apiKeyService.getRoboflowApiKey();
      if (!this.apiKey) {
        toast.error('Roboflow API key not found. Please configure it in Settings.');
        return false;
      }

      if (modelUrl) {
        this.currentModelUrl = modelUrl;
      }

      this.isInitialized = true;
      console.log('Roboflow HTTP detection service initialized successfully');
      return true;

    } catch (error: any) {
      console.error('Failed to initialize Roboflow HTTP service:', error);
      toast.error(`Failed to initialize Roboflow: ${error.message}`);
      return false;
    }
  }

  private async detectFromBlob(blob: Blob): Promise<RoboflowDetectionResult | null> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    const formData = new FormData();
    formData.append('file', blob);

    const response = await fetch(
      `https://detect.roboflow.com/${this.currentModelUrl}?api_key=${this.apiKey}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async detectFromVideoFrame(
    videoElement: HTMLVideoElement,
    frameIndex: number = 0
  ): Promise<ProcessedDetectionResult | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      const startTime = performance.now();

      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);

      // Convert to blob for Roboflow API
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      });

      // Run inference
      const results = await this.detectFromBlob(blob);
      if (!results) return null;

      const processingTime = performance.now() - startTime;

      // Process results into our format
      return this.processDetectionResults(results, frameIndex, processingTime, videoElement.currentTime);

    } catch (error: any) {
      console.error('Detection failed:', error);
      toast.error(`Detection failed: ${error.message}`);
      return null;
    }
  }

  async detectFromImageUrl(
    imageUrl: string,
    frameIndex: number = 0
  ): Promise<ProcessedDetectionResult | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      const startTime = performance.now();

      // Fetch image and convert to blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const blob = await response.blob();

      // Run inference
      const results = await this.detectFromBlob(blob);
      if (!results) return null;

      const processingTime = performance.now() - startTime;

      return this.processDetectionResults(results, frameIndex, processingTime, 0);

    } catch (error: any) {
      console.error('Detection failed:', error);
      toast.error(`Detection failed: ${error.message}`);
      return null;
    }
  }

  private processDetectionResults(
    results: RoboflowDetectionResult,
    frameIndex: number,
    processingTime: number,
    timestamp: number
  ): ProcessedDetectionResult {
    const players: any[] = [];
    let ball: any = null;

    results.predictions.forEach((detection, index) => {
      const centerX = detection.x;
      const centerY = detection.y;
      const width = detection.width;
      const height = detection.height;

      const boundingBox = {
        x: centerX - width / 2,
        y: centerY - height / 2,
        width,
        height
      };

      // Classify as player or ball based on class name
      const className = detection.class.toLowerCase();
      
      if (className.includes('player') || className.includes('person')) {
        // Determine team based on position (simple heuristic)
        const team = centerX < results.image.width / 2 ? 'home' : 'away';
        
        players.push({
          id: `player_${frameIndex}_${index}`,
          position: { x: centerX, y: centerY },
          confidence: detection.confidence,
          team,
          bounding_box: boundingBox
        });
      } else if (className.includes('ball') || className.includes('football') || className.includes('soccer')) {
        if (!ball || detection.confidence > ball.confidence) {
          ball = {
            position: { x: centerX, y: centerY },
            confidence: detection.confidence,
            bounding_box: boundingBox
          };
        }
      }
    });

    return {
      frameIndex,
      timestamp,
      players,
      ball,
      processing_time: processingTime,
      model_used: 'roboflow-http'
    };
  }

  async processVideoInBatches(
    videoElement: HTMLVideoElement,
    options: {
      frameRate?: number;
      maxFrames?: number;
      onProgress?: (progress: number) => void;
      onFrameResult?: (result: ProcessedDetectionResult) => void;
    } = {}
  ): Promise<ProcessedDetectionResult[]> {
    const {
      frameRate = 1, // Process 1 frame per second
      maxFrames = 100,
      onProgress,
      onFrameResult
    } = options;

    const results: ProcessedDetectionResult[] = [];
    const duration = videoElement.duration;
    const totalFrames = Math.min(Math.floor(duration * frameRate), maxFrames);

    for (let i = 0; i < totalFrames; i++) {
      try {
        const timeToSeek = (i / frameRate);
        
        // Seek to specific time
        videoElement.currentTime = timeToSeek;
        
        // Wait for seek to complete
        await new Promise(resolve => {
          const onSeeked = () => {
            videoElement.removeEventListener('seeked', onSeeked);
            resolve(void 0);
          };
          videoElement.addEventListener('seeked', onSeeked);
        });

        // Process frame
        const result = await this.detectFromVideoFrame(videoElement, i);
        
        if (result) {
          results.push(result);
          onFrameResult?.(result);
        }

        // Update progress
        const progress = ((i + 1) / totalFrames) * 100;
        onProgress?.(progress);

        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error processing frame ${i}:`, error);
      }
    }

    return results;
  }

  isAvailable(): boolean {
    return this.isInitialized && this.apiKey !== null;
  }

  async changeModel(modelUrl: string): Promise<boolean> {
    try {
      this.currentModelUrl = modelUrl;
      console.log(`Model changed to: ${modelUrl}`);
      return true;
    } catch (error) {
      console.error('Failed to change model:', error);
      return false;
    }
  }
}

export const roboflowHttpDetectionService = RoboflowHttpDetectionService.getInstance();
