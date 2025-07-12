export interface DetectionConfig {
  videoUrl: string;
  frameRate?: number;
  confidenceThreshold?: number;
  trackPlayers?: boolean;
  trackBall?: boolean;
  useRealML?: boolean;
  modelType?: string;
}

export interface DetectionJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  results?: DetectionResult[];
  error?: string;
}

export interface PlayerDetection {
  id: string;
  position: { x: number; y: number };
  confidence: number;
  team?: string;
  jersey_number?: number;
  timestamp: number;
  bounding_box?: { x: number; y: number; width: number; height: number };
  class_name?: string;
}

export interface BallDetection {
  position: { x: number; y: number };
  confidence: number;
  timestamp: number;
  velocity?: { x: number; y: number };
  bounding_box?: { x: number; y: number; width: number; height: number };
  class_name?: string;
}

export interface DetectionResult {
  frameIndex: number;
  timestamp: number;
  players: PlayerDetection[];
  ball?: BallDetection;
  processing_time: number;
  frame_url?: string;
  model_used?: string;
  gpu_used?: boolean;
}
