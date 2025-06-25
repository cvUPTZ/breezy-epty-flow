
# Football Detection Service - Production Deployment Guide

## 🚀 Production Features

This enhanced version includes:

- ✅ **Robust Error Handling**: Comprehensive error handling and retry logic
- ✅ **Database Persistence**: SQLite database for job tracking and metrics
- ✅ **Rate Limiting**: Concurrent job limits and resource management
- ✅ **Authentication**: API key-based security
- ✅ **Monitoring**: Health checks, metrics, and logging
- ✅ **Video Validation**: Pre-processing URL validation
- ✅ **Progress Tracking**: Real-time job progress updates
- ✅ **Resource Management**: Memory and processing optimization
- ✅ **Cancellation Support**: Graceful job cancellation
- ✅ **Service Statistics**: Performance metrics and analytics

## 🛠 Installation & Setup

### 1. PythonAnywhere Deployment

1. **Upload Files**
   ```bash
   # Upload production_main.py and requirements_production.txt
   # to your PythonAnywhere directory
   ```

2. **Install Dependencies**
   ```bash
   pip3.10 install --user -r requirements_production.txt
   ```

3. **Configure Environment Variables**
   ```bash
   # In your PythonAnywhere console
   echo 'export API_KEY="your-secure-api-key-here"' >> ~/.bashrc
   echo 'export MAX_CONCURRENT_JOBS="3"' >> ~/.bashrc
   echo 'export MAX_VIDEO_DURATION="600"' >> ~/.bashrc
   echo 'export ENABLE_REAL_ML="false"' >> ~/.bashrc
   source ~/.bashrc
   ```

4. **Update WSGI Configuration**
   ```python
   # In /var/www/yourusername_pythonanywhere_com_wsgi.py
   import sys
   import os
   
   # Add your project directory to the sys.path
   path = '/home/yourusername/detection-service'
   if path not in sys.path:
       sys.path.append(path)
   
   from production_main import app as application
   ```

5. **Test the Service**
   ```bash
   # Test locally first
   python3.10 production_main.py
   ```

### 2. Lovable App Configuration

Update your Lovable app environment variables:

```env
VITE_PYTHON_DETECTION_API_URL=https://yourusername.pythonanywhere.com/api
VITE_PYTHON_DETECTION_API_KEY=your-secure-api-key-here
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_KEY` | `your-secure-api-key-here` | API authentication key |
| `MAX_CONCURRENT_JOBS` | `3` | Maximum concurrent processing jobs |
| `MAX_VIDEO_DURATION` | `600` | Maximum video length (seconds) |
| `FRAME_PROCESSING_TIMEOUT` | `30` | Frame processing timeout |
| `ENABLE_REAL_ML` | `false` | Enable real ML models |
| `DB_PATH` | `detection_jobs.db` | Database file path |

### Service Limits

- **Video Duration**: Max 10 minutes (configurable)
- **Concurrent Jobs**: 3 simultaneous jobs (configurable)
- **Frame Rate**: 1-30 fps processing
- **File Size**: Automatic quality reduction to 720p
- **Timeout**: 30-second frame processing timeout

## 📊 API Endpoints

### Core Detection API

- `POST /api/detect/start` - Start detection job
- `GET /api/detect/status/{job_id}` - Get job status
- `GET /api/detect/results/{job_id}` - Get detection results
- `POST /api/detect/cancel/{job_id}` - Cancel job

### Validation & Health

- `POST /api/validate/video` - Validate video URL
- `GET /api/health` - Service health check
- `GET /api/stats` - Service statistics

### Real-time Detection

- `POST /api/detect/frame` - Process single frame

## 🔒 Security Features

### API Key Authentication
```python
# Include in request headers
Authorization: Bearer your-api-key-here
```

### Rate Limiting
- Maximum concurrent jobs enforced
- Resource usage monitoring
- Automatic cleanup of old jobs

### Input Validation
- URL validation for YouTube videos
- Parameter bounds checking
- Malicious input filtering

## 📈 Monitoring & Analytics

### Health Monitoring
```bash
curl https://yourusername.pythonanywhere.com/api/health
```

Response:
```json
{
  "status": "online",
  "version": "2.0.0",
  "uptime": 3600,
  "queue_size": 1,
  "processing_capacity": 3,
  "active_jobs": 2
}
```

### Service Statistics
```bash
curl https://yourusername.pythonanywhere.com/api/stats
```

Response:
```json
{
  "total_jobs": 150,
  "active_jobs": 2,
  "completed_jobs": 140,
  "failed_jobs": 8,
  "average_processing_time": 45.2
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Video Download Fails**
   - Check YouTube URL format
   - Verify video is public
   - Check video duration limits

2. **Service Offline**
   - Check PythonAnywhere console logs
   - Verify WSGI configuration
   - Check file permissions

3. **Slow Processing**
   - Reduce frame rate setting
   - Check concurrent job limits
   - Monitor system resources

### Debugging Commands

```bash
# Check service logs
tail -f detection_service.log

# Test database
sqlite3 detection_jobs.db ".tables"

# Monitor active jobs
curl https://yourusername.pythonanywhere.com/api/health

# Validate video URL
curl -X POST https://yourusername.pythonanywhere.com/api/validate/video \
  -H "Content-Type: application/json" \
  -d '{"video_url": "https://youtube.com/watch?v=..."}'
```

## 🔮 Future Enhancements

### Real ML Integration

To enable real machine learning models:

1. **Install ML Dependencies**
   ```bash
   pip install torch torchvision ultralytics
   ```

2. **Update Configuration**
   ```bash
   export ENABLE_REAL_ML="true"
   ```

3. **Add Model Files**
   - Download YOLOv8 models
   - Configure detection classes
   - Implement real detection logic

### Scaling Options

- **Redis Queue**: For job distribution
- **Database Upgrade**: PostgreSQL for larger scale
- **Load Balancing**: Multiple service instances
- **CDN Integration**: For result caching

## 📞 Support

For issues and questions:
- Check PythonAnywhere console logs
- Review API documentation
- Monitor service health endpoint
- Contact support with job IDs for debugging

---

**Note**: This is a production-ready template. For actual football detection, integrate real ML models like YOLOv8 trained on football datasets.
