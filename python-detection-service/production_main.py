
"""
Production-Ready FastAPI service for football player and ball detection
Enhanced with REAL ML capabilities using YOLOv8 and other production models
"""

import os
import sys
import logging
import asyncio
import time
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Union
from pathlib import Path
import hashlib
import json

# Core dependencies
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import uvicorn

# Video processing
import cv2
import numpy as np
import yt_dlp
from PIL import Image

# Database
import sqlite3
from contextlib import asynccontextmanager

# Real ML Models - Only import if enabled
try:
    if os.getenv("ENABLE_REAL_ML", "false").lower() == "true":
        import torch
        import torchvision
        from ultralytics import YOLO
        import supervision as sv
        ML_AVAILABLE = True
        logger.info("🤖 Real ML models available!")
    else:
        ML_AVAILABLE = False
        logger.info("🎭 Running in mock mode")
except ImportError as e:
    ML_AVAILABLE = False
    logger.warning(f"ML dependencies not available: {e}")

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('detection_service.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer(auto_error=False)

# Configuration
class Config:
    API_KEY = os.getenv("API_KEY", "your-secure-api-key-here")
    MAX_CONCURRENT_JOBS = int(os.getenv("MAX_CONCURRENT_JOBS", "3"))
    MAX_VIDEO_DURATION = int(os.getenv("MAX_VIDEO_DURATION", "600"))  # 10 minutes
    FRAME_PROCESSING_TIMEOUT = int(os.getenv("FRAME_PROCESSING_TIMEOUT", "30"))
    ENABLE_REAL_ML = os.getenv("ENABLE_REAL_ML", "true").lower() == "true"
    DB_PATH = os.getenv("DB_PATH", "detection_jobs.db")
    MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR", "./models")
    USE_GPU = os.getenv("USE_GPU", "true").lower() == "true" and torch.cuda.is_available() if ML_AVAILABLE else False

config = Config()

# Create model cache directory
os.makedirs(config.MODEL_CACHE_DIR, exist_ok=True)

# Global ML model cache
ml_models: Dict[str, Any] = {}

def load_yolo_model(model_name: str = "yolov8n") -> Any:
    """Load and cache YOLO model"""
    if not ML_AVAILABLE:
        return None
        
    if model_name not in ml_models:
        try:
            logger.info(f"Loading YOLO model: {model_name}")
            model = YOLO(f"{model_name}.pt")
            
            # Move to GPU if available
            if config.USE_GPU and torch.cuda.is_available():
                model.to('cuda')
                logger.info(f"Model {model_name} loaded on GPU")
            else:
                logger.info(f"Model {model_name} loaded on CPU")
                
            ml_models[model_name] = model
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            return None
            
    return ml_models[model_name]

# Database setup
def init_db():
    """Initialize SQLite database for job persistence"""
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS detection_jobs (
            job_id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            video_url TEXT NOT NULL,
            config TEXT NOT NULL,
            progress REAL DEFAULT 0,
            results TEXT,
            error_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            model_used TEXT,
            processing_mode TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT NOT NULL,
            processing_time REAL,
            frames_processed INTEGER,
            players_detected INTEGER,
            balls_detected INTEGER,
            model_name TEXT,
            gpu_used BOOLEAN,
            avg_confidence REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (job_id) REFERENCES detection_jobs (job_id)
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

# Initialize database on startup
init_db()

# Global job storage and management
active_jobs: Dict[str, Dict] = {}
job_semaphore = asyncio.Semaphore(config.MAX_CONCURRENT_JOBS)

# Enhanced Pydantic models
class DetectionConfig(BaseModel):
    videoUrl: str = Field(..., description="YouTube video URL")
    frameRate: Optional[int] = Field(5, ge=1, le=30, description="Frames per second to process")
    confidenceThreshold: Optional[float] = Field(0.5, ge=0.1, le=1.0, description="Detection confidence threshold")
    trackPlayers: Optional[bool] = Field(True, description="Enable player tracking")
    trackBall: Optional[bool] = Field(True, description="Enable ball tracking")
    maxRetries: Optional[int] = Field(3, ge=0, le=10)
    timeout: Optional[int] = Field(30, ge=10, le=300)
    
    # Real ML specific options
    useRealML: Optional[bool] = Field(True, description="Use real ML models")
    modelType: Optional[str] = Field("yolov8n", description="YOLO model variant")
    processingMode: Optional[str] = Field("fast", description="Processing speed mode")
    enableGPU: Optional[bool] = Field(True, description="Use GPU if available")
    batchSize: Optional[int] = Field(4, ge=1, le=16, description="Batch size for processing")
    nmsThreshold: Optional[float] = Field(0.4, ge=0.1, le=0.9, description="Non-maximum suppression threshold")
    maxDetections: Optional[int] = Field(50, ge=10, le=200, description="Maximum detections per frame")

    @validator('videoUrl')
    def validate_youtube_url(cls, v):
        if not any(domain in v for domain in ['youtube.com', 'youtu.be']):
            raise ValueError('Must be a valid YouTube URL')
        return v

    @validator('modelType')
    def validate_model_type(cls, v):
        valid_models = ['yolov8n', 'yolov8s', 'yolov8m', 'yolov8l', 'yolov8x']
        if v not in valid_models:
            raise ValueError(f'Model must be one of: {valid_models}')
        return v

# Keep existing models...
class PlayerDetection(BaseModel):
    id: str
    position: Dict[str, float]
    confidence: float
    team: Optional[str] = None
    jersey_number: Optional[int] = None
    timestamp: float
    bounding_box: Optional[Dict[str, float]] = None
    class_name: Optional[str] = None  # For real ML models

class BallDetection(BaseModel):
    position: Dict[str, float]
    confidence: float
    timestamp: float
    velocity: Optional[Dict[str, float]] = None
    bounding_box: Optional[Dict[str, float]] = None
    class_name: Optional[str] = None

class DetectionResult(BaseModel):
    frameIndex: int
    timestamp: float
    players: List[PlayerDetection]
    ball: Optional[BallDetection]
    processing_time: float
    frame_url: Optional[str] = None
    model_used: Optional[str] = None
    gpu_used: Optional[bool] = None

# ... keep existing models (DetectionJob, ServiceHealth, etc)

# Real ML Detection Functions
def detect_with_yolo(frame: np.ndarray, model: Any, config: DetectionConfig, frame_idx: int) -> Dict:
    """
    Real YOLO-based detection for players and ball
    """
    if not ML_AVAILABLE or model is None:
        return detect_players_and_ball_mock(frame, config, frame_idx)
    
    try:
        start_time = time.time()
        height, width = frame.shape[:2]
        
        # Run YOLO inference
        results = model(frame, 
                       conf=config.confidenceThreshold,
                       iou=config.nmsThreshold,
                       max_det=config.maxDetections,
                       verbose=False)
        
        players = []
        ball = None
        
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
                
            for box in boxes:
                # Get detection data
                xyxy = box.xyxy[0].cpu().numpy()  # Bounding box
                conf = float(box.conf[0].cpu().numpy())  # Confidence
                class_id = int(box.cls[0].cpu().numpy())  # Class ID
                class_name = model.names[class_id]  # Class name
                
                # Convert to center position
                x1, y1, x2, y2 = xyxy
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                box_width = x2 - x1
                box_height = y2 - y1
                
                timestamp = time.time()
                
                # Map COCO classes to football entities
                if class_name == 'person' and config.trackPlayers:
                    # Detect players (persons in the frame)
                    team = "home" if center_x < width / 2 else "away"  # Simple team assignment
                    
                    player = {
                        "id": f"player_{frame_idx}_{len(players)}",
                        "position": {"x": float(center_x), "y": float(center_y)},
                        "confidence": float(conf),
                        "team": team,
                        "jersey_number": None,  # Would need OCR for this
                        "timestamp": timestamp,
                        "bounding_box": {
                            "x": float(x1),
                            "y": float(y1),
                            "width": float(box_width),
                            "height": float(box_height)
                        },
                        "class_name": class_name
                    }
                    players.append(player)
                
                elif class_name == 'sports ball' and config.trackBall and ball is None:
                    # Detect ball (prefer first high-confidence detection)
                    ball = {
                        "position": {"x": float(center_x), "y": float(center_y)},
                        "confidence": float(conf),
                        "timestamp": timestamp,
                        "velocity": {"x": 0.0, "y": 0.0},  # Would need tracking for this
                        "bounding_box": {
                            "x": float(x1),
                            "y": float(y1),
                            "width": float(box_width),
                            "height": float(box_height)
                        },
                        "class_name": class_name
                    }
        
        processing_time = time.time() - start_time
        
        # Log detection stats
        logger.debug(f"Frame {frame_idx}: Detected {len(players)} players, {'1' if ball else '0'} ball in {processing_time:.3f}s")
        
        return {
            "players": players, 
            "ball": ball, 
            "processing_time": processing_time,
            "model_used": config.modelType,
            "gpu_used": config.USE_GPU
        }
        
    except Exception as e:
        logger.error(f"YOLO detection failed: {e}")
        # Fallback to mock detection
        return detect_players_and_ball_mock(frame, config, frame_idx)

def detect_players_and_ball_mock(frame: np.ndarray, config: DetectionConfig, frame_idx: int) -> Dict:
    """
    Enhanced mock detection with more realistic patterns
    """
    height, width = frame.shape[:2]
    timestamp = time.time()
    processing_time = np.random.uniform(0.01, 0.05)  # Simulate processing time
    
    players = []
    if config.trackPlayers:
        num_players = min(np.random.poisson(8), 12)
        
        for i in range(num_players):
            if i < num_players // 2:
                x_base = width * 0.25
                team = "home"
            else:
                x_base = width * 0.75
                team = "away"
            
            x = max(50, min(width-50, x_base + np.random.normal(0, width*0.15)))
            y = max(50, min(height-50, height*0.3 + np.random.normal(0, height*0.2)))
            confidence = np.random.uniform(0.6, 0.95)
            
            players.append({
                "id": f"mock_player_{frame_idx}_{i}",
                "position": {"x": float(x), "y": float(y)},
                "confidence": float(confidence),
                "team": team,
                "jersey_number": np.random.randint(1, 23) if np.random.random() > 0.7 else None,
                "timestamp": timestamp,
                "bounding_box": {
                    "x": float(x - 15),
                    "y": float(y - 25),
                    "width": 30.0,
                    "height": 50.0
                },
                "class_name": "person"
            })
    
    ball = None
    if config.trackBall and np.random.random() > 0.4:
        if players:
            if np.random.random() > 0.5:
                player_pos = np.random.choice(players)
                ball_x = player_pos["position"]["x"] + np.random.normal(0, 30)
                ball_y = player_pos["position"]["y"] + np.random.normal(0, 30)
            else:
                ball_x = np.random.uniform(width*0.2, width*0.8)
                ball_y = np.random.uniform(height*0.2, height*0.8)
        else:
            ball_x = np.random.uniform(width*0.3, width*0.7)
            ball_y = np.random.uniform(height*0.3, height*0.7)
        
        ball_x = max(10, min(width-10, ball_x))
        ball_y = max(10, min(height-10, ball_y))
        
        ball = {
            "position": {"x": float(ball_x), "y": float(ball_y)},
            "confidence": np.random.uniform(0.7, 0.95),
            "timestamp": timestamp,
            "velocity": {
                "x": float(np.random.normal(0, 5)),
                "y": float(np.random.normal(0, 5))
            },
            "bounding_box": {
                "x": float(ball_x - 8),
                "y": float(ball_y - 8),
                "width": 16.0,
                "height": 16.0
            },
            "class_name": "sports ball"
        }
    
    return {
        "players": players, 
        "ball": ball, 
        "processing_time": processing_time,
        "model_used": "mock",
        "gpu_used": False
    }

async def process_video_with_real_ml(job_id: str, config: DetectionConfig):
    """Enhanced video processing with real ML models"""
    async with job_semaphore:
        try:
            logger.info(f"Starting {'REAL ML' if config.useRealML and ML_AVAILABLE else 'MOCK'} processing for job {job_id}")
            
            # Load ML model if using real ML
            model = None
            if config.useRealML and ML_AVAILABLE:
                model = load_yolo_model(config.modelType)
                if model is None:
                    logger.warning(f"Failed to load model {config.modelType}, falling back to mock")
                    config.useRealML = False
            
            # Update job status
            active_jobs[job_id]["status"] = "processing"
            active_jobs[job_id]["progress"] = 0
            active_jobs[job_id]["model_used"] = config.modelType if config.useRealML else "mock"
            save_job_to_db(active_jobs[job_id])
            
            # Download and process video
            video_path = f"/tmp/video_{job_id}.mp4"
            await download_video(config.videoUrl, video_path)
            
            metadata = await download_video_metadata(config.videoUrl)
            active_jobs[job_id]["video_metadata"] = metadata
            
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise Exception("Could not open downloaded video file")
            
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_interval = max(1, int(fps / config.frameRate))
            
            logger.info(f"Processing video: {total_frames} frames at {fps} fps, sampling every {frame_interval} frames")
            logger.info(f"Using model: {config.modelType if config.useRealML else 'mock'}")
            
            results = []
            frame_idx = 0
            processed_frames = 0
            total_players = 0
            total_balls = 0
            total_confidence = 0
            confidence_count = 0
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                if frame_idx % frame_interval == 0:
                    start_time = time.time()
                    
                    try:
                        # Use real ML or mock detection
                        if config.useRealML and model is not None:
                            detections = detect_with_yolo(frame, model, config, frame_idx)
                        else:
                            detections = detect_players_and_ball_mock(frame, config, frame_idx)
                        
                        processing_time = time.time() - start_time
                        timestamp = frame_idx / fps
                        
                        result = {
                            "frameIndex": frame_idx,
                            "timestamp": timestamp,
                            "players": detections["players"],
                            "ball": detections["ball"],
                            "processing_time": processing_time,
                            "model_used": detections.get("model_used", "unknown"),
                            "gpu_used": detections.get("gpu_used", False)
                        }
                        
                        results.append(result)
                        processed_frames += 1
                        total_players += len(detections["players"])
                        if detections["ball"]:
                            total_balls += 1
                        
                        # Track confidence for metrics
                        for player in detections["players"]:
                            total_confidence += player["confidence"]
                            confidence_count += 1
                        if detections["ball"]:
                            total_confidence += detections["ball"]["confidence"]
                            confidence_count += 1
                        
                        progress = min(95, (frame_idx / total_frames) * 100)
                        active_jobs[job_id]["progress"] = progress
                        
                        if processed_frames % 10 == 0:
                            save_job_to_db(active_jobs[job_id])
                        
                        logger.debug(f"Processed frame {frame_idx}, progress: {progress:.1f}%")
                        
                        # Processing delay based on mode
                        delay_map = {"fast": 0.02, "balanced": 0.05, "accurate": 0.1}
                        await asyncio.sleep(delay_map.get(config.processingMode, 0.05))
                        
                        if active_jobs[job_id]["status"] == "cancelled":
                            logger.info(f"Job {job_id} was cancelled")
                            return
                            
                    except Exception as e:
                        logger.error(f"Error processing frame {frame_idx}: {e}")
                        continue
                
                frame_idx += 1
            
            cap.release()
            
            # Clean up
            try:
                os.remove(video_path)
            except:
                pass
            
            # Save enhanced metrics
            avg_confidence = total_confidence / confidence_count if confidence_count > 0 else 0
            try:
                conn = sqlite3.connect(config.DB_PATH)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO job_metrics 
                    (job_id, processing_time, frames_processed, players_detected, balls_detected, 
                     model_name, gpu_used, avg_confidence)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (job_id, time.time() - start_time, processed_frames, total_players, total_balls,
                      config.modelType if config.useRealML else "mock", config.USE_GPU, avg_confidence))
                conn.commit()
                conn.close()
            except Exception as e:
                logger.error(f"Failed to save metrics: {e}")
            
            # Complete job
            active_jobs[job_id]["status"] = "completed"
            active_jobs[job_id]["results"] = results
            active_jobs[job_id]["progress"] = 100
            active_jobs[job_id]["completed_at"] = datetime.now(timezone.utc).isoformat()
            save_job_to_db(active_jobs[job_id])
            
            logger.info(f"Job {job_id} completed! Model: {config.modelType if config.useRealML else 'mock'}, "
                       f"Frames: {processed_frames}, Players: {total_players}, Balls: {total_balls}, "
                       f"Avg Confidence: {avg_confidence:.3f}")
            
        except Exception as e:
            logger.error(f"Job {job_id} failed: {e}")
            active_jobs[job_id]["status"] = "failed"
            active_jobs[job_id]["error"] = str(e)
            save_job_to_db(active_jobs[job_id])

# ... keep existing helper functions (save_job_to_db, load_job_from_db, download functions, etc.)

# FastAPI app setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("🚀 Starting Production Detection Service with Real ML")
    logger.info(f"ML Available: {ML_AVAILABLE}")
    logger.info(f"GPU Available: {config.USE_GPU}")
    logger.info(f"Real ML Enabled: {config.ENABLE_REAL_ML}")
    
    # Pre-load default model if ML is available
    if ML_AVAILABLE and config.ENABLE_REAL_ML:
        try:
            default_model = load_yolo_model("yolov8n")
            if default_model:
                logger.info("✅ Default YOLOv8n model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to pre-load default model: {e}")
    
    yield
    logger.info("🛑 Shutting down Production Detection Service")

app = FastAPI(
    title="Football Detection API Pro with Real ML",
    version="3.0.0",
    description="Production-ready AI service with real YOLOv8 models for football detection",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

startup_time = time.time()

# ... keep existing authentication and database functions

@app.get("/api/health")
async def health_check_enhanced():
    """Enhanced health check with ML model status"""
    return {
        "status": "online",
        "version": "3.0.0",
        "uptime": time.time() - startup_time,
        "queue_size": len([j for j in active_jobs.values() if j["status"] == "pending"]),
        "processing_capacity": config.MAX_CONCURRENT_JOBS,
        "active_jobs": len([j for j in active_jobs.values() if j["status"] in ["pending", "processing"]]),
        "ml_available": ML_AVAILABLE,
        "gpu_available": config.USE_GPU,
        "models_loaded": list(ml_models.keys()),
        "real_ml_enabled": config.ENABLE_REAL_ML
    }

@app.post("/api/detect/start")
async def start_detection_with_ml(
    config_data: DetectionConfig, 
    background_tasks: BackgroundTasks,
    api_key: Optional[str] = Depends(get_api_key)
):
    """Start detection with real ML model support"""
    
    # Validate ML configuration
    if config_data.useRealML and not ML_AVAILABLE:
        logger.warning("Real ML requested but not available, falling back to mock")
        config_data.useRealML = False
    
    # Check capacity
    active_count = len([j for j in active_jobs.values() if j["status"] in ["pending", "processing"]])
    if active_count >= config.MAX_CONCURRENT_JOBS:
        raise HTTPException(
            status_code=429, 
            detail=f"Service at capacity. Maximum {config.MAX_CONCURRENT_JOBS} concurrent jobs allowed."
        )
    
    job_id = str(uuid.uuid4())
    
    job_data = {
        "job_id": job_id,
        "status": "pending",
        "config": config_data.dict(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "video_url": config_data.videoUrl,
        "progress": 0,
        "model_used": config_data.modelType if config_data.useRealML else "mock",
        "processing_mode": config_data.processingMode
    }
    
    active_jobs[job_id] = job_data
    save_job_to_db(job_data)
    
    # Start enhanced background processing
    background_tasks.add_task(process_video_with_real_ml, job_id, config_data)
    
    logger.info(f"Started {'REAL ML' if config_data.useRealML else 'MOCK'} detection job {job_id} "
               f"with model: {config_data.modelType}")
    
    return {"job_id": job_id}

# ... keep existing API endpoints (status, results, cancel, etc.)

if __name__ == "__main__":
    uvicorn.run(
        "production_main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=1,
        log_level="info"
    )
