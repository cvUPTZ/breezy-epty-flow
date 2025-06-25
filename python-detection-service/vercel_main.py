
"""
Vercel-optimized FastAPI service for SOTA football detection
"""

import os
import sys
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import asyncio

# Add the current directory to Python path for Vercel
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Core dependencies
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse

# Use msgspec for better performance
import msgspec
from msgspec import Struct

import cv2
import numpy as np
import yt_dlp

# ML Models (with fallback for Vercel)
try:
    import torch
    from ultralytics import YOLO
    ML_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("🚀 SOTA ML models available on Vercel!")
except ImportError as e:
    ML_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"ML dependencies not available on Vercel: {e}")

# Logging setup
logging.basicConfig(level=logging.INFO)

# Security
security = HTTPBearer(auto_error=False)

# Vercel-optimized configuration
class VercelConfig:
    API_KEY = os.getenv("API_KEY", "your-secure-api-key-here")
    MAX_CONCURRENT_JOBS = 2  # Reduced for Vercel limits
    MAX_VIDEO_DURATION = 300  # 5 minutes max for Vercel
    FRAME_PROCESSING_TIMEOUT = 15  # Reduced timeout
    ENABLE_SOTA_ML = os.getenv("ENABLE_SOTA_ML", "true").lower() == "true"
    USE_GPU = False  # Vercel doesn't support GPU
    MODEL_CACHE_DIR = "/tmp/sota_models"  # Vercel temp directory

config = VercelConfig()

# Global model cache for Vercel
vercel_models: Dict[str, Any] = {}

def load_vercel_yolo_model(model_name: str = "yolo11n") -> Any:
    """Load and cache YOLO model optimized for Vercel"""
    if not ML_AVAILABLE:
        return None
        
    if model_name not in vercel_models:
        try:
            logger.info(f"Loading YOLO model for Vercel: {model_name}")
            
            # Use lightweight models for Vercel
            model_map = {
                "yolo11n": "yolo11n.pt",  # Nano - best for Vercel
                "yolo11s": "yolo11s.pt",  # Small - if needed
            }
            
            model_file = model_map.get(model_name, "yolo11n.pt")
            model = YOLO(model_file)
            
            # CPU optimization for Vercel
            model.to('cpu')
            logger.info(f"Vercel Model {model_name} loaded on CPU")
                
            vercel_models[model_name] = model
        except Exception as e:
            logger.error(f"Failed to load model {model_name} on Vercel: {e}")
            return None
            
    return vercel_models[model_name]

# Data structures (same as SOTA)
class DetectionConfig(Struct):
    videoUrl: str
    frameRate: int = 3  # Reduced for Vercel
    confidenceThreshold: float = 0.6
    trackPlayers: bool = True
    trackBall: bool = True
    maxRetries: int = 2  # Reduced for Vercel
    timeout: int = 15   # Reduced for Vercel
    
    # Vercel-specific options
    useSOTAML: bool = True
    modelType: str = "yolo11n"  # Force nano model
    processingMode: str = "fast"
    enableGPU: bool = False     # Force CPU
    batchSize: int = 4          # Reduced batch size
    nmsThreshold: float = 0.4
    maxDetections: int = 30     # Reduced for performance

class PlayerDetection(Struct):
    id: str
    position: Dict[str, float]
    confidence: float
    team: Optional[str] = None
    jersey_number: Optional[int] = None
    timestamp: float
    bounding_box: Optional[Dict[str, float]] = None

class BallDetection(Struct):
    position: Dict[str, float]
    confidence: float
    timestamp: float
    bounding_box: Optional[Dict[str, float]] = None

class DetectionResult(Struct):
    frameIndex: int
    timestamp: float
    players: List[PlayerDetection]
    ball: Optional[BallDetection]
    processing_time: float
    model_used: str = "yolo11n"
    gpu_used: bool = False

# Vercel-optimized detection function
def detect_with_vercel_yolo(frame: np.ndarray, model: Any, config: DetectionConfig, frame_idx: int) -> Dict:
    """Vercel-optimized YOLO detection"""
    if not ML_AVAILABLE or model is None:
        return detect_players_and_ball_mock(frame, config, frame_idx)
    
    try:
        start_time = time.time()
        height, width = frame.shape[:2]
        
        # Vercel-optimized inference
        results = model(frame, 
                       conf=config.confidenceThreshold,
                       iou=config.nmsThreshold,
                       max_det=config.maxDetections,
                       verbose=False,
                       device='cpu')  # Force CPU for Vercel
        
        players = []
        ball = None
        
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
                
            for box in boxes:
                xyxy = box.xyxy[0].cpu().numpy().astype(np.float32)
                conf = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                class_name = model.names[class_id]
                
                x1, y1, x2, y2 = xyxy
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                box_width = x2 - x1
                box_height = y2 - y1
                
                timestamp = time.time()
                
                if class_name == 'person' and config.trackPlayers:
                    team = "home" if center_x < width / 2 else "away"
                    
                    player = PlayerDetection(
                        id=f"player_{frame_idx}_{len(players)}",
                        position={"x": float(center_x), "y": float(center_y)},
                        confidence=float(conf),
                        team=team,
                        timestamp=timestamp,
                        bounding_box={
                            "x": float(x1), "y": float(y1),
                            "width": float(box_width), "height": float(box_height)
                        }
                    )
                    players.append(player)
                
                elif class_name == 'sports ball' and config.trackBall and ball is None:
                    ball = BallDetection(
                        position={"x": float(center_x), "y": float(center_y)},
                        confidence=float(conf),
                        timestamp=timestamp,
                        bounding_box={
                            "x": float(x1), "y": float(y1),
                            "width": float(box_width), "height": float(box_height)
                        }
                    )
        
        processing_time = time.time() - start_time
        
        return {
            "players": players, 
            "ball": ball, 
            "processing_time": processing_time,
            "model_used": config.modelType,
            "gpu_used": False
        }
        
    except Exception as e:
        logger.error(f"Vercel YOLO detection failed: {e}")
        return detect_players_and_ball_mock(frame, config, frame_idx)

def detect_players_and_ball_mock(frame: np.ndarray, config: DetectionConfig, frame_idx: int) -> Dict:
    """Optimized mock detection for Vercel fallback"""
    height, width = frame.shape[:2]
    timestamp = time.time()
    processing_time = np.random.uniform(0.01, 0.05)
    
    players = []
    if config.trackPlayers:
        num_players = min(np.random.poisson(8), 12)
        
        for i in range(num_players):
            team = "home" if i < num_players // 2 else "away"
            x_base = width * (0.3 if team == "home" else 0.7)
            
            x = max(50, min(width-50, x_base + np.random.normal(0, width*0.1)))
            y = max(50, min(height-50, height*0.5 + np.random.normal(0, height*0.15)))
            
            player = PlayerDetection(
                id=f"vercel_player_{frame_idx}_{i}",
                position={"x": float(x), "y": float(y)},
                confidence=float(np.random.uniform(0.75, 0.95)),
                team=team,
                timestamp=timestamp,
                bounding_box={
                    "x": float(x - 15), "y": float(y - 25),
                    "width": 30.0, "height": 50.0
                }
            )
            players.append(player)
    
    ball = None
    if config.trackBall and np.random.random() > 0.4:
        ball_x = np.random.uniform(width*0.25, width*0.75)
        ball_y = np.random.uniform(height*0.25, height*0.75)
        
        ball = BallDetection(
            position={"x": float(ball_x), "y": float(ball_y)},
            confidence=float(np.random.uniform(0.8, 0.95)),
            timestamp=timestamp,
            bounding_box={
                "x": float(ball_x - 8), "y": float(ball_y - 8),
                "width": 16.0, "height": 16.0
            }
        )
    
    return {
        "players": players, 
        "ball": ball, 
        "processing_time": processing_time,
        "model_used": "vercel_mock",
        "gpu_used": False
    }

# In-memory storage for Vercel (no persistent DB)
vercel_jobs: Dict[str, Dict] = {}

# FastAPI app optimized for Vercel
app = FastAPI(
    title="SOTA Football Detection API (Vercel)",
    version="4.0.0-vercel",
    description="Vercel-optimized AI service with YOLOv11 and advanced detection"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

startup_time = time.time()

@app.get("/api/health")
async def health_check_vercel():
    """Vercel health check"""
    return {
        "status": "online",
        "version": "4.0.0-vercel",
        "service": "SOTA Football Detection (Vercel)",
        "platform": "vercel",
        "uptime": time.time() - startup_time,
        "ml_available": ML_AVAILABLE,
        "gpu_available": False,
        "models_loaded": list(vercel_models.keys()),
        "features": [
            "YOLOv11 (CPU)",
            "Vercel Serverless",
            "Fast Processing",
            "Mock Fallback"
        ]
    }

# Authentication helper
async def get_api_key(credentials: HTTPAuthorizationCredentials = Security(security)):
    if not credentials or credentials.credentials != config.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    return credentials.credentials

@app.post("/api/detect/start")
async def start_vercel_detection(
    config_data: DetectionConfig,
    api_key: Optional[str] = Depends(get_api_key)
):
    """Start detection optimized for Vercel"""
    
    job_id = str(uuid.uuid4())
    
    # Pre-validate for Vercel limits
    if config_data.frameRate > 5:
        config_data.frameRate = 5  # Limit frame rate
    
    if config_data.batchSize > 4:
        config_data.batchSize = 4  # Limit batch size
    
    job_data = {
        "job_id": job_id,
        "status": "pending",
        "config": msgspec.to_builtins(config_data),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "video_url": config_data.videoUrl,
        "progress": 0,
        "platform": "vercel"
    }
    
    vercel_jobs[job_id] = job_data
    
    logger.info(f"Started Vercel detection job {job_id}")
    
    return {"job_id": job_id, "platform": "vercel"}

@app.get("/api/detect/status/{job_id}")
async def get_vercel_job_status(job_id: str):
    """Get job status on Vercel"""
    if job_id not in vercel_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return vercel_jobs[job_id]

# Vercel serverless handler
handler = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
