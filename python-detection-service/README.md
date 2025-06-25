
# Football Detection Service - PythonAnywhere Deployment

## Overview
This FastAPI service provides player and ball detection for football videos using computer vision.

## Deployment to PythonAnywhere

### 1. Upload Files
1. Log into your PythonAnywhere account
2. Open a Bash console
3. Create a new directory: `mkdir detection-service && cd detection-service`
4. Upload `main.py` and `requirements.txt` to this directory

### 2. Install Dependencies
```bash
pip3.10 install --user -r requirements.txt
```

### 3. Configure Web App
1. Go to Web tab in PythonAnywhere dashboard
2. Create new web app (choose "Manual configuration" -> Python 3.10)
3. Set source code directory to: `/home/yourusername/detection-service`
4. Edit WSGI configuration file (`/var/www/yourusername_pythonanywhere_com_wsgi.py`):

```python
import sys
path = '/home/yourusername/detection-service'
if path not in sys.path:
    sys.path.append(path)

from main import app as application
```

### 4. Environment Variables (Optional)
In your PythonAnywhere console, you can set environment variables:
```bash
echo 'export API_KEY="your-api-key"' >> ~/.bashrc
source ~/.bashrc
```

### 5. Update Lovable App Configuration
In your Lovable app, set the environment variable:
- `VITE_PYTHON_DETECTION_API_URL=https://yourusername.pythonanywhere.com/api`
- `VITE_PYTHON_DETECTION_API_KEY=your-api-key` (if using authentication)

## Real Implementation Notes

This is a template service. For production use, you'll need to:

1. **Replace mock detection with real ML models:**
   - Use YOLOv8 or YOLOv5 for object detection
   - Train custom models on football data
   - Use tracking algorithms like DeepSORT

2. **Add proper authentication:**
   - Implement API key validation
   - Add rate limiting

3. **Optimize performance:**
   - Use GPU acceleration if available
   - Implement frame batching
   - Add caching for processed videos

4. **Add database storage:**
   - Store job results in database
   - Implement proper job management

## API Endpoints

- `GET /api/health` - Service health check
- `POST /api/detect/start` - Start detection job
- `GET /api/detect/status/{job_id}` - Get job status
- `GET /api/detect/results/{job_id}` - Get detection results
- `POST /api/detect/cancel/{job_id}` - Cancel job
- `POST /api/detect/frame` - Real-time frame detection
