
import React, { useState, useRef, useEffect } from 'react';
import { YouTubePlayer, YouTubePlayerInstance, PlayerControlEvent } from './YouTubePlayer';
import VideoPlayerControls from './VideoPlayerControls';
import { EnhancedPianoInput } from '../match/EnhancedPianoInput';
import { EnhancedVoiceChat } from '../voice/EnhancedVoiceChat';
import { VoiceCollaborationProvider, useVoiceCollaborationContext } from '@/context/VoiceCollaborationContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventType } from '@/types/eventData';

interface TrackerVideoInterfaceProps {
  initialVideoId: string;
  matchId: string;
}

// Create a separate component that uses the context
const TrackerVideoContent: React.FC<TrackerVideoInterfaceProps> = ({ initialVideoId, matchId }) => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const voiceCollabCtx = useVoiceCollaborationContext();
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState(initialVideoId);
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    setIsAdminView(userRole === 'admin');
  }, [userRole]);

  useEffect(() => {
    setCurrentVideoId(initialVideoId);
  }, [initialVideoId]);

  const handlePlayerReady = (playerInstance: YouTubePlayerInstance) => {
    playerRef.current = playerInstance;
    console.log('Player is ready:', playerInstance);
  };

  const sendAdminPlayerEvent = (event: Omit<PlayerControlEvent, 'timestamp'>) => {
    const channel = supabase.channel(`video-control-${matchId}`);
    if (isAdminView && channel && playerRef.current) {
      const fullEvent: PlayerControlEvent = { ...event, timestamp: Date.now() };
      console.log('Admin sending player control event from TrackerVideoInterface:', fullEvent);
      channel.send({
        type: 'broadcast',
        event: 'player-control',
        payload: fullEvent,
      });

      if (event.type === 'LOAD_VIDEO' && event.videoId) {
         setCurrentVideoId(event.videoId);
      }
    }
  };

  const handleRecordEventWithVideoTime = async (eventType: EventType): Promise<any | null> => {
    if (!playerRef.current) {
      toast({ title: "Player Error", description: "YouTube player is not available.", variant: "destructive" });
      return null;
    }
    if (!user) {
        toast({ title: "Auth Error", description: "User not authenticated.", variant: "destructive" });
        return null;
    }

    const videoTimestamp = playerRef.current.getCurrentTime();

    const eventToInsert = {
      match_id: matchId,
      event_type: eventType,
      player_id: null,
      team: null,
      coordinates: null,
      details: {
        video_timestamp: videoTimestamp,
        recorded_by_video_tracker: true
      },
      created_by: user.id,
    };

    console.log("Recording event with video time:", eventToInsert);

    try {
      const { data, error } = await supabase
        .from('match_events')
        .insert(eventToInsert)
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Event Recorded", description: `${eventType} at ${videoTimestamp.toFixed(2)}s (video time).` });
      return data;
    } catch (error: any) {
      console.error('Error recording video event:', error);
      toast({ title: "Recording Error", description: `Failed to record event: ${error.message}`, variant: "destructive" });
      return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-full max-h-screen overflow-hidden">
      {/* Video Player and Controls Section */}
      <div className="flex-grow lg:w-2/3 flex flex-col gap-2">
        <div className="aspect-video bg-black rounded-lg shadow-lg overflow-hidden">
          {currentVideoId && matchId ? (
            <YouTubePlayer
              videoId={currentVideoId}
              matchId={matchId}
              isAdmin={isAdminView}
              onPlayerReady={handlePlayerReady}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Select a video to start.
            </div>
          )}
        </div>
        {isAdminView && playerRef.current && (
          <VideoPlayerControls
            player={playerRef.current}
            initialVideoId={currentVideoId}
            onSendEvent={sendAdminPlayerEvent}
          />
        )}
      </div>

      {/* Piano Input and Voice Chat Section */}
      <div className="lg:w-1/3 flex flex-col gap-4 overflow-y-auto">
        {matchId && user && (
          <EnhancedPianoInput
            onEventRecord={handleRecordEventWithVideoTime}
            matchId={matchId}
          />
        )}

        {matchId && user && userRole && (
          <EnhancedVoiceChat
            matchId={`video-${matchId}`}
            userId={user.id}
            userRole={userRole}
            userName={user.email || user.id}
            voiceCollabCtx={voiceCollabCtx}
          />
        )}
      </div>
    </div>
  );
};

const TrackerVideoInterface: React.FC<TrackerVideoInterfaceProps> = (props) => {
  return (
    <VoiceCollaborationProvider>
      <TrackerVideoContent {...props} />
    </VoiceCollaborationProvider>
  );
};

export default TrackerVideoInterface;
