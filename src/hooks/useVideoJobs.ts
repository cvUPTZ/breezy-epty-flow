
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { VideoJobService, VideoJob } from '@/services/videoJobService';
import { VideoProcessingPipeline, ProcessingPipelineConfig } from '@/services/videoProcessingPipeline';
import { toast } from 'sonner';

export const useVideoJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const userJobs = await VideoJobService.getUserJobs(user.id);
      setJobs(userJobs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load video jobs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (videoUrl: string, config: ProcessingPipelineConfig): Promise<VideoJob | null> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return null;
    }

    try {
      const job = await VideoProcessingPipeline.processVideoComplete(videoUrl, user.id, config);
      setJobs((prev: VideoJob[]) => [job, ...prev]);
      toast.success('Video processing started');
      return job;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create video job';
      toast.error(errorMessage);
      return null;
    }
  };

  const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
      const success = await VideoJobService.deleteJob(jobId);
      if (success) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
        toast.success('Job deleted successfully');
      } else {
        toast.error('Failed to delete job');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job';
      toast.error(errorMessage);
      return false;
    }
  };

  const updateJob = (updatedJob: VideoJob) => {
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
  };

  useEffect(() => {
    loadJobs();
  }, [user?.id]);

  return {
    jobs,
    loading,
    error,
    createJob,
    deleteJob,
    updateJob,
    refreshJobs: loadJobs,
  };
};
