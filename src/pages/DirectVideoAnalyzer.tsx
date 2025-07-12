
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DirectAnalysisInterface } from '@/components/video/DirectAnalysisInterface';
import { VideoJobService } from '@/services/videoJobService';
import { VideoChunkingService } from '@/services/videoChunkingService';
import { Upload, Link, X, FileVideo, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CachedVideo {
  fileName: string;
  url: string;
  uploadDate: string;
  fileSize: number;
}

const DirectVideoAnalyzer: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');
  const [submittedUrl, setSubmittedUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [cachedVideos, setCachedVideos] = useState<CachedVideo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load cached videos on component mount
  useEffect(() => {
    loadCachedVideos();
  }, []);

  const loadCachedVideos = () => {
    try {
      const cached = localStorage.getItem('cachedVideoUrls');
      if (cached) {
        const videos = JSON.parse(cached) as CachedVideo[];
        setCachedVideos(videos);
      }
    } catch (error) {
      console.error('Error loading cached videos:', error);
    }
  };

  const saveCachedVideo = (fileName: string, url: string, fileSize: number) => {
    try {
      const newVideo: CachedVideo = {
        fileName,
        url,
        uploadDate: new Date().toISOString(),
        fileSize
      };

      const existingVideos = cachedVideos.filter(v => v.fileName !== fileName);
      const updatedVideos = [newVideo, ...existingVideos].slice(0, 10); // Keep only last 10 videos
      
      localStorage.setItem('cachedVideoUrls', JSON.stringify(updatedVideos));
      setCachedVideos(updatedVideos);
    } catch (error) {
      console.error('Error saving cached video:', error);
    }
  };

  const deleteCachedVideo = (fileName: string) => {
    try {
      const updatedVideos = cachedVideos.filter(v => v.fileName !== fileName);
      localStorage.setItem('cachedVideoUrls', JSON.stringify(updatedVideos));
      setCachedVideos(updatedVideos);
      toast.success('Cached video removed');
    } catch (error) {
      console.error('Error deleting cached video:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

    // Check if this file is already cached
    const existingVideo = cachedVideos.find(v => v.fileName === file.name && v.fileSize === file.size);
    if (existingVideo) {
      setUploadedVideoUrl(existingVideo.url);
      setSubmittedUrl(existingVideo.url);
      toast.success('Using cached video - no upload needed!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

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
      
      // Save to cache
      saveCachedVideo(file.name, signedUrl, file.size);
      toast.success('Video uploaded and cached successfully');
      
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

  const handleUseCachedVideo = (video: CachedVideo) => {
    setUploadedVideoUrl(video.url);
    setSubmittedUrl(video.url);
    toast.success(`Using cached video: ${video.fileName}`);
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
              {cachedVideos.length > 0 && " Previously uploaded videos are cached for quick access."}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!submittedUrl ? (
            <div className="space-y-6">
              {/* Cached Videos Section */}
              {cachedVideos.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recently Uploaded Videos
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Click on any video to use it without re-uploading.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cachedVideos.map((video, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <FileVideo className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <span className="font-medium text-sm truncate">{video.fileName}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatFileSize(video.fileSize)} • {formatDate(video.uploadDate)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Button
                              onClick={() => handleUseCachedVideo(video)}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              Use Video
                            </Button>
                            <Button
                              onClick={() => deleteCachedVideo(video.fileName)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                    Uploaded videos are cached to avoid re-uploading.
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
