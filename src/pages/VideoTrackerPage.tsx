
import React, { useEffect, useState } from 'react';
import TrackerVideoInterface from '@/components/video/TrackerVideoInterface';
import { useLocation } from 'react-router-dom';
import { YouTubeService } from '@/services/youtubeService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';

// Helper to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const VideoTrackerPage: React.FC = () => {
  const query = useQuery();
  const { user } = useAuth();
  const [matchId, setMatchId] = useState<string | null>(query.get('matchId'));
  const [videoId, setVideoId] = useState<string | null>(query.get('videoId'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideoInfo = async () => {
      setLoading(true);
      setError(null);
      let currentMatchId = query.get('matchId');
      let currentVideoId = query.get('videoId');

      if (!currentMatchId && !currentVideoId) {
        setError("Match ID or Video ID is required to load the video tracker.");
        setLoading(false);
        return;
      }

      setMatchId(currentMatchId);

      if (currentVideoId) {
        const extractedId = YouTubeService.extractVideoId(currentVideoId);
        if (extractedId) {
          setVideoId(extractedId);
        } else {
          if (currentVideoId.length === 11) {
             setVideoId(currentVideoId);
          } else {
            setError(`Invalid YouTube Video ID or URL format: ${currentVideoId}`);
            setVideoId(null);
            setLoading(false);
            return;
          }
        }
      } else if (currentMatchId) {
        // Fetch video configuration from the database
        try {
          console.log('Fetching video configuration for match:', currentMatchId);
          const videoConfig = await YouTubeService.getVideoMatchSetup(currentMatchId);
          
          if (videoConfig && videoConfig.video_url) {
            const extracted = YouTubeService.extractVideoId(videoConfig.video_url);
            if (extracted) {
              console.log('Found video configuration:', { videoUrl: videoConfig.video_url, extractedId: extracted });
              setVideoId(extracted);
            } else {
              setError(`Invalid video URL found for match ${currentMatchId}: ${videoConfig.video_url}`);
              setVideoId(null);
            }
          } else {
            setError(`No video configured for match ID: ${currentMatchId}. Please configure a video for this match first.`);
            setVideoId(null);
          }
        } catch (e: any) {
          console.error('Error fetching video configuration:', e);
          setError(`Failed to fetch video for match ${currentMatchId}: ${e.message}`);
          setVideoId(null);
        }
      }
      setLoading(false);
    };

    if (user) {
        loadVideoInfo();
    }

  }, [query, user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Loading Video Tracker</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Preparing your tracking interface...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-destructive">
        <Card className="w-full max-w-md p-8 shadow-xl border-destructive">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 mr-2" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>{error}</p>
            <p className="mt-4 text-sm text-muted-foreground">Please check the URL or contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!videoId || !matchId) {
     return (
      <div className="flex items-center justify-center h-screen bg-background text-destructive">
         <Card className="w-full max-w-md p-8 shadow-xl border-destructive">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 mr-2" /> Configuration Missing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Video ID or Match ID is missing. Cannot load the tracker.</p>
             <p className="mt-4 text-sm text-muted-foreground">Ensure the link includes necessary parameters.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TrackerVideoInterface
      initialVideoId={videoId}
      matchId={matchId}
    />
  );
};

export default VideoTrackerPage;
