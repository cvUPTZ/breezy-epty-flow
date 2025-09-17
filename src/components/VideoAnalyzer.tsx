
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Upload, Download } from 'lucide-react';
import { pythonDetectionService, DetectionJob, DetectionResult } from '@/services/pythonDetectionService';
import { toast } from 'sonner';

interface VideoAnalyzerProps {
  onAnalysisComplete?: (analysis: any) => void;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({
  onAnalysisComplete
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionJob, setDetectionJob] = useState<DetectionJob | null>(null);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl('');
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(event.target.value);
    setVideoFile(null);
  };

  const handleAnalyze = async () => {
    if (!videoFile && !videoUrl) {
      toast.error('Please upload a video file or provide a video URL');
      return;
    }

    setIsAnalyzing(true);
    setDetectionJob(null);
    setDetectionResults([]);
    toast.info('Starting video analysis job...');

    try {
      const jobResponse = await pythonDetectionService.startDetection({ videoUrl });
      // Create a proper DetectionJob object with all required properties
      const job: DetectionJob = {
        job_id: jobResponse.job_id,
        status: 'pending',
        progress: 0
      };
      setDetectionJob(job);
      toast.success(`Detection job started with ID: ${job.job_id}`);
    } catch (error: any) {
      toast.error(`Failed to start detection job: ${error.message}`);
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!detectionJob || !isAnalyzing) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const status = await pythonDetectionService.getJobStatus(detectionJob.job_id);
        setDetectionJob(status);

        if (status.status === 'completed') {
          toast.success('Analysis completed!');
          const results = await pythonDetectionService.getResults(detectionJob.job_id);
          setDetectionResults(results);
          setIsAnalyzing(false);
          onAnalysisComplete?.(results);
          clearInterval(intervalId);
        } else if (status.status === 'failed') {
          toast.error(`Analysis failed: ${status.error}`);
          setIsAnalyzing(false);
          clearInterval(intervalId);
        }
      } catch (error: any) {
        toast.error(`Error fetching job status: ${error.message}`);
        setIsAnalyzing(false);
        clearInterval(intervalId);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [detectionJob, isAnalyzing, onAnalysisComplete]);

  const handleExportResults = () => {
    if (detectionResults.length === 0) return;
    
    const dataStr = JSON.stringify(detectionResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'video-analysis-results.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Video Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="video-file">Upload Video File</Label>
            <Input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="mt-1"
            />
          </div>

          <div className="text-center text-gray-500">or</div>

          <div>
            <Label htmlFor="video-url">Video URL</Label>
            <Input
              id="video-url"
              type="url"
              placeholder="https://example.com/video.mp4"
              value={videoUrl}
              onChange={handleUrlChange}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!videoFile && !videoUrl)}
            className="w-full"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Video'}
          </Button>
        </CardContent>
      </Card>

      {isAnalyzing && detectionJob && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Job ID: {detectionJob.job_id}</Label>
              <div className="flex items-center gap-2">
                <Label>Status:</Label>
                <span className="text-sm font-semibold">{detectionJob.status}</span>
              </div>
              {detectionJob.progress !== undefined && (
                <div className="flex items-center gap-2">
                  <Label>Progress:</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${detectionJob.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{detectionJob.progress.toFixed(2)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {detectionResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Analysis Results
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportResults}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Frames Processed</Label>
              <div className="text-lg font-semibold">{detectionResults.length}</div>
            </div>
            <div>
              <Label>Total Players Detected</Label>
              <div className="text-lg font-semibold">
                {detectionResults.reduce((acc, r) => acc + r.players.length, 0)}
              </div>
            </div>
            <div>
              <Label>Total Balls Detected</Label>
              <div className="text-lg font-semibold">
                {detectionResults.filter(r => r.ball).length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoAnalyzer;
