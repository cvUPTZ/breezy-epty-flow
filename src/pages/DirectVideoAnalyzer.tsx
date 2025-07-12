
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DirectAnalysisInterface } from '@/components/video/DirectAnalysisInterface';
import { VideoJobService } from '@/services/videoJobService';
import { VideoChunkingService } from '@/services/videoChunkingService';
import { Upload, Link, X, FileVideo } from 'lucide-react';
import { toast } from 'sonner';

const DirectVideoAnalyzer: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');
  const [submittedUrl, setSubmittedUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError('Please enter a video URL.');
      return;
    }
    try {
      new URL(videoUrl);
      setError('');
      setSubmittedUrl(videoUrl);
      toast.success('Video URL loaded successfully');
    } catch (_) {
      setError('Invalid URL format. Please enter a valid video URL.');
      setSubmittedUrl('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Check file size and show appropriate message
      const fileSizeMB = file.size / 1024 / 1024;
      const needsChunking = VideoChunkingService.needsChunking(file);
      
      if (needsChunking) {
        setUploadStatus(`Large file detected (${fileSizeMB.toFixed(1)}MB). Splitting into chunks...`);
        toast.info('Large file detected. Using chunked upload for optimal performance.');
      } else {
        setUploadStatus(`Uploading ${file.name} (${fileSizeMB.toFixed(1)}MB)...`);
      }

      const videoPath = await VideoJobService.uploadVideo(file, (progress) => {
        setUploadProgress(progress);
        
        if (needsChunking) {
          if (progress < 15) {
            setUploadStatus('Preparing file for chunked upload...');
          } else if (progress < 95) {
            setUploadStatus(`Uploading video chunks... ${Math.round(progress)}%`);
          } else {
            setUploadStatus('Finalizing upload...');
          }
        } else {
          setUploadStatus(`Uploading... ${Math.round(progress)}%`);
        }
      });
      
      const signedUrl = await VideoJobService.getVideoDownloadUrl(videoPath);
      
      setUploadProgress(100);
      setUploadedVideoUrl(signedUrl);
      setSubmittedUrl(signedUrl);
      setUploadStatus('Upload completed successfully!');
      toast.success('Video uploaded successfully');
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('');
      }, 2000);
    } catch (e: any) {
      setError('Failed to upload video: ' + e.message);
      toast.error('Failed to upload video: ' + e.message);
      setUploadProgress(0);
      setUploadStatus('');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = () => {
    setVideoUrl('');
    setUploadedVideoUrl('');
    setSubmittedUrl('');
    setError('');
    setUploadStatus('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Direct Video Analyzer</CardTitle>
          {!submittedUrl && (
            <CardDescription>
              Upload a video file or enter a video URL to start analyzing directly. Files larger than 40MB will be automatically split into chunks for optimal upload performance.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!submittedUrl ? (
            <div className="space-y-6">
              {/* URL Input Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Video URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUrlSubmit} className="space-y-4">
                    <Input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="e.g., https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                      className="w-full"
                    />
                    <Button type="submit" disabled={!videoUrl.trim()}>
                      Load Video
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="text-center text-gray-500 font-medium">OR</div>

              {/* File Upload Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Video File
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Supports files up to several GB. Large files will be automatically chunked for reliable upload.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="w-full"
                    />
                    {isUploading && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600 flex items-center gap-2">
                            <FileVideo className="h-4 w-4" />
                            {uploadStatus}
                          </span>
                          <span className="text-blue-600 font-medium">{Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress 
                          value={uploadProgress} 
                          className="w-full h-3"
                          indicatorClassName="bg-blue-500 transition-all duration-300"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <div className="truncate mr-2">
                  <p className="text-sm font-medium">Loaded Video:</p>
                  <p className="text-sm text-blue-600 truncate">
                    {uploadedVideoUrl ? 'Uploaded video file' : submittedUrl}
                  </p>
                </div>
                <Button onClick={handleReset} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Load Different Video
                </Button>
              </div>
              <DirectAnalysisInterface videoUrl={submittedUrl} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectVideoAnalyzer;
