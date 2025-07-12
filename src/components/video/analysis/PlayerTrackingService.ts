import { DetectionConfig, DetectionJob, DetectionResult } from '@/types/detection';

const API_URL = import.meta.env.VITE_PYTHON_DETECTION_API_URL || 'http://localhost:8000/api';
const API_KEY = import.meta.env.VITE_PYTHON_DETECTION_API_KEY || 'your-secure-api-key-here';

class PlayerTrackingService {
  async startDetection(config: DetectionConfig): Promise<string> {
    const response = await fetch(`${API_URL}/detect/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to start detection');
    }

    const data = await response.json();
    return data.job_id;
  }

  async getJobStatus(jobId: string): Promise<DetectionJob> {
    const response = await fetch(`${API_URL}/detect/status/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get job status');
    }

    return response.json();
  }

  async getResults(jobId: string): Promise<DetectionResult[]> {
    const response = await fetch(`${API_URL}/detect/results/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get results');
    }

    return response.json();
  }
}

export default new PlayerTrackingService();
