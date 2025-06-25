
# SOTA AI Detection Service - Vercel Deployment

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

## Manual Deployment Steps

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Environment Variables

Set these in your Vercel project dashboard:

- `API_KEY`: Your secure API key
- `ENABLE_SOTA_ML`: Set to "true" to enable ML models
- `PYTHONPATH`: Set to "python-detection-service"

## API Endpoints

After deployment, your API will be available at:

- **Health Check**: `https://your-app.vercel.app/api/health`
- **Start Detection**: `https://your-app.vercel.app/api/detect/start`
- **Job Status**: `https://your-app.vercel.app/api/detect/status/{job_id}`

## Vercel Optimizations

- **CPU-only models**: Optimized for Vercel's serverless environment
- **Reduced timeouts**: 15-second processing limit
- **Lightweight dependencies**: Minimal package footprint
- **Memory efficient**: Optimized for Vercel's 1GB memory limit
- **Fast startup**: Models cached in memory

## Testing Your Deployment

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test detection (replace with your API key)
curl -X POST https://your-app.vercel.app/api/detect/start \
  -H "Authorization: Bearer your-secure-detection-key-2024" \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://youtube.com/watch?v=example"}'
```

## Performance Expectations

- **Cold start**: 3-5 seconds
- **Warm requests**: 0.5-2 seconds
- **Processing**: 0.1-0.5 seconds per frame
- **Memory usage**: 200-500MB
- **Concurrent requests**: Up to 10

## Limitations on Vercel

- No GPU acceleration (CPU only)
- 10-second function timeout (configurable up to 60s on Pro)
- 1GB memory limit
- No persistent storage (jobs stored in memory)

## Upgrading to Pro

For better performance, consider Vercel Pro:
- 60-second timeouts
- More memory
- Better performance
- Priority support
