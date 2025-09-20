import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DirectAnalysisInterface } from '@/components/video/DirectAnalysisInterface';
import { VideoJobService } from '@/services/videoJobService';
import { VideoChunkingService } from '@/services/videoChunkingService';
import { Upload, Link, X, FileVideo, Clock, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface CachedVideo {
  fileName: string;
  url: string;
  uploadDate: string;
  fileSize: number;
  videoPath?: string; // Store original path for URL regeneration
  expiresAt?: string; // Track URL expiration
}

const DirectVideoAnalyzer: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');
  const [submittedUrl, setSubmittedUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [videoError, setVideoError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [cachedVideos, setCachedVideos] = useState<CachedVideo[]>([]);
  const [isRefreshingUrl, setIsRefreshingUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load cached videos on component mount
  useEffect(() => {
    loadCachedVideos();
  }, []);

  const loadCachedVideos = () => {
    try {
      const cached = localStorage.getItem('cachedVideoUrls');
      if (cached) {
        const videos = JSON.parse(cached) as CachedVideo[];
        // Clean up expired URLs
        const validVideos = videos.filter(video => {
          if (!video.expiresAt) return true;
          return new Date(video.expiresAt) > new Date();
        });
        
        if (validVideos.length !== videos.length) {
          localStorage.setItem('cachedVideoUrls', JSON.stringify(validVideos));
        }
        setCachedVideos(validVideos);
      }
    } catch (error) {
      console.error('Error loading cached videos:', error);
    }
  };

  const saveCachedVideo = (fileName: string, url: string, fileSize: number, videoPath?: string) => {
    try {
      // Set expiration time to 23 hours from now (assuming 24h signed URL validity)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 23);

      const newVideo: CachedVideo = {
        fileName,
        url,
        uploadDate: new Date().toISOString(),
        fileSize,
        videoPath,
        expiresAt: expiresAt.toISOString()
      };

      const existingVideos = cachedVideos.filter(v => v.fileName !== fileName);
      const updatedVideos = [newVideo, ...existingVideos].slice(0, 10);
      
      localStorage.setItem('cachedVideoUrls', JSON.stringify(updatedVideos));
      setCachedVideos(updatedVideos);
    } catch (error) {
      console.error('Error saving cached video:', error);
    }
  };

  const refreshVideoUrl = async (video: CachedVideo) => {
    if (!video.videoPath) {
      toast.error('Cannot refresh URL - original video path not found');
      return;
    }

    setIsRefreshingUrl(video.fileName);
    try {
      const newSignedUrl = await VideoJobService.getVideoDownloadUrl(video.videoPath);
      
      // Update the cached video with new URL
      const updatedVideos = cachedVideos.map(v => 
        v.fileName === video.fileName 
          ? { ...v, url: newSignedUrl, expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString() }
          : v
      );
      
      localStorage.setItem('cachedVideoUrls', JSON.stringify(updatedVideos));
      setCachedVideos(updatedVideos);
      
      // If this is the currently selected video, update the URL
      if (submittedUrl === video.url) {
        setSubmittedUrl(newSignedUrl);
        setUploadedVideoUrl(newSignedUrl);
        setVideoError('');
      }
      
      toast.success('Video URL refreshed successfully');
    } catch (error: any) {
      toast.error('Failed to refresh URL: ' + error.message);
    } finally {
      setIsRefreshingUrl('');
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

  const isUrlExpiringSoon = (video: CachedVideo): boolean => {
    if (!video.expiresAt) return false;
    const expiryTime = new Date(video.expiresAt);
    const now = new Date();
    const hoursTillExpiry = (expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursTillExpiry < 2; // Warn if less than 2 hours
  };

  const validateVideoUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => resolve(true);
      video.onerror = () => resolve(false);
      video.src = url;
    });
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

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError('Please enter a video URL.');
      return;
    }
    
    try {
      new URL(videoUrl);
      setError('');
      setVideoError('');
      
      // Validate the video URL
      toast.info('Validating video URL...');
      const isValid = await validateVideoUrl(videoUrl);
      
      if (!isValid) {
        setError('The provided URL does not appear to be a valid video file or is not accessible.');
        return;
      }
      
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

    // Validate video file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      toast.error('Please select a valid video file.');
      return;
    }

    // Check supported video formats
    const supportedFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'];
    const isFormatSupported = supportedFormats.some(format => 
      file.type === format || file.name.toLowerCase().includes(format.split('/')[1])
    );

    if (!isFormatSupported) {
      toast.warn('Video format may not be supported by all browsers. MP4 is recommended for best compatibility.');
    }

    // Check if this file is already cached and URL is still valid
    const existingVideo = cachedVideos.find(v => 
      v.fileName === file.name && 
      v.fileSize === file.size &&
      (!v.expiresAt || new Date(v.expiresAt) > new Date())
    );
    
    if (existingVideo) {
      // Validate cached URL is still working
      const isValid = await validateVideoUrl(existingVideo.url);
      if (isValid) {
        setUploadedVideoUrl(existingVideo.url);
        setSubmittedUrl(existingVideo.url);
        setVideoError('');
        toast.success('Using cached video - no upload needed!');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      } else {
        // URL is expired, remove from cache
        deleteCachedVideo(existingVideo.fileName);
        toast.info('Cached video URL expired, uploading fresh copy...');
      }
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    setVideoError('');

    try {
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
      
      // Validate the uploaded video URL
      const isValid = await validateVideoUrl(signedUrl);
      if (!isValid) {
        throw new Error('Uploaded video file appears to be corrupted or in an unsupported format');
      }
      
      setUploadProgress(100);
      setUploadedVideoUrl(signedUrl);
      setSubmittedUrl(signedUrl);
      setUploadStatus('Upload completed successfully!');
      
      // Save to cache with video path for future URL regeneration
      saveCachedVideo(file.name, signedUrl, file.size, videoPath);
      toast.success('Video uploaded and cached successfully');
      
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

  const handleUseCachedVideo = async (video: CachedVideo) => {
    // Check if URL is expiring soon and needs refresh
    if (isUrlExpiringSoon(video) && video.videoPath) {
      toast.info('Video URL is expiring soon, refreshing...');
      await refreshVideoUrl(video);
      return;
    }

    // Validate URL is still working
    const isValid = await validateVideoUrl(video.url);
    if (!isValid) {
      if (video.videoPath) {
        toast.info('Cached URL is no longer valid, refreshing...');
        await refreshVideoUrl(video);
      } else {
        toast.error('Cached video URL is no longer valid and cannot be refreshed');
        deleteCachedVideo(video.fileName);
      }
      return;
    }

    setUploadedVideoUrl(video.url);
    setSubmittedUrl(video.url);
    setVideoError('');
    toast.success(`Using cached video: ${video.fileName}`);
  };

  const handleVideoError = (error: any) => {
    console.error('Video error:', error);
    setVideoError('Video failed to load. This may be due to an expired URL, unsupported format, or network issues.');
    
    // If it's a cached video with a path, offer to refresh
    const currentVideo = cachedVideos.find(v => v.url === submittedUrl);
    if (currentVideo && currentVideo.videoPath) {
      toast.error('Video failed to load. Click the refresh button to get a new URL.');
    }
  };

  const handleReset = () => {
    setVideoUrl('');
    setUploadedVideoUrl('');
    setSubmittedUrl('');
    setError('');
    setVideoError('');
    setUploadStatus('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="container mx-auto p-4">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Direct Video Analyzer</CardTitle>
                {!submittedUrl && (
                  <CardDescription>
                    Upload a video file or enter a video URL to start analyzing directly. 
                    Supported formats: MP4, WebM, OGG (MP4 recommended for best compatibility).
                    Files larger than 40MB will be automatically split into chunks for optimal upload performance.
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
                            Click on any video to use it without re-uploading. URLs are automatically refreshed when they expire.
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
                                    {isUrlExpiringSoon(video) && (
                                      <AlertTriangle className="h-3 w-3 text-amber-500" title="URL expiring soon" />
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {formatFileSize(video.fileSize)} • {formatDate(video.uploadDate)}
                                    {video.expiresAt && (
                                      <span className="ml-2">
                                        • Expires: {formatDate(video.expiresAt)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <Button
                                    onClick={() => handleUseCachedVideo(video)}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    disabled={isRefreshingUrl === video.fileName}
                                  >
                                    Use Video
                                  </Button>
                                  {video.videoPath && (
                                    <Button
                                      onClick={() => refreshVideoUrl(video)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-blue-600 hover:text-blue-700"
                                      disabled={isRefreshingUrl === video.fileName}
                                      title="Refresh URL"
                                    >
                                      {isRefreshingUrl === video.fileName ? (
                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <RefreshCw className="h-3 w-3" />
                                      )}
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => deleteCachedVideo(video.fileName)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700"
                                    disabled={isRefreshingUrl === video.fileName}
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
                        <CardDescription className="text-sm">
                          Enter a direct link to a video file. Ensure the URL is publicly accessible and points to a video file.
                        </CardDescription>
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
                          Upload video files up to several GB. Supports MP4, WebM, MOV, AVI formats.
                          Large files are automatically chunked for reliable upload. Videos are cached with automatic URL refresh.
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
                      <div className="flex gap-2">
                        {/* Show refresh button for cached videos */}
                        {uploadedVideoUrl && cachedVideos.find(v => v.url === submittedUrl)?.videoPath && (
                          <Button 
                            onClick={() => {
                              const video = cachedVideos.find(v => v.url === submittedUrl);
                              if (video) refreshVideoUrl(video);
                            }}
                            variant="outline" 
                            size="sm"
                            disabled={isRefreshingUrl !== ''}
                            title="Refresh video URL"
                          >
                            {isRefreshingUrl ? (
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Refresh URL
                          </Button>
                        )}
                        <Button onClick={handleReset} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Load Different Video
                        </Button>
                      </div>
                    </div>
                    
                    {videoError && (
                      <div className="mb-4 text-amber-600 text-sm bg-amber-50 p-3 rounded-md flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          {videoError}
                          {uploadedVideoUrl && cachedVideos.find(v => v.url === submittedUrl)?.videoPath && (
                            <div className="mt-2">
                              <Button 
                                onClick={() => {
                                  const video = cachedVideos.find(v => v.url === submittedUrl);
                                  if (video) refreshVideoUrl(video);
                                }}
                                size="sm"
                                variant="outline"
                                disabled={isRefreshingUrl !== ''}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Try Refreshing URL
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <DirectAnalysisInterface 
                      videoUrl={submittedUrl} 
                      onVideoError={handleVideoError}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DirectVideoAnalyzer;
