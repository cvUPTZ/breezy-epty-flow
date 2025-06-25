
declare module 'roboflow' {
  export interface RoboflowConfig {
    publishable_key: string;
  }

  export interface RoboflowModelConfig {
    model: string;
    version: number;
  }

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

  export interface RoboflowModel {
    detect(input: string | Blob | File): Promise<RoboflowDetectionResult>;
  }

  export class Roboflow {
    constructor(config: RoboflowConfig);
    load(config: RoboflowModelConfig): Promise<RoboflowModel>;
  }
}
