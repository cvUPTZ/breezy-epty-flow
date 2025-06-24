
import React, { useState, useRef, useEffect } from 'react';
import { YouTubePlayer, YouTubePlayerInstance, PlayerControlEvent } from './YouTubePlayer';
import VideoPlayerControls from './VideoPlayerControls';
import EnhancedPianoInput from '../match/EnhancedPianoInput';
import { EnhancedVoiceChat } from '../voice/EnhancedVoiceChat';
import { VoiceCollaborationProvider, useVoiceCollaborationContext } from '@/context/VoiceCollaborationContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventType } from '@/types';
import TrackerPianoInput from '../TrackerPianoInput';

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
  const [showPianoOverlay, setShowPianoOverlay] = useState(false);

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

  const handleRecordEventWithVideoTime = async (
    eventTypeKey: string,
    playerId?: number,
    teamContext?: 'home' | 'away',
    details?: Record<string, any>
  ): Promise<any | null> => {
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
      event_type: eventTypeKey,
      player_id: playerId || null,
      team: teamContext || null,
      coordinates: null,
      details: {
        video_timestamp: videoTimestamp,
        recorded_by_video_tracker: true,
        ...details
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

      toast({ title: "Event Recorded", description: `${eventTypeKey} at ${videoTimestamp.toFixed(2)}s (video time).` });
      return data;
    } catch (error: any) {
      console.error('Error recording video event:', error);
      toast({ title: "Recording Error", description: `Failed to record event: ${error.message}`, variant: "destructive" });
      return null;
    }
  };

  const togglePianoOverlay = () => {
    setShowPianoOverlay(!showPianoOverlay);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-full max-h-screen overflow-hidden">
      {/* Video Player and Controls Section */}
      <div className="flex-grow lg:w-2/3 flex flex-col gap-2">
        <div className="relative aspect-video bg-black rounded-lg shadow-lg overflow-hidden">
          {currentVideoId && matchId ? (
            <>
              <YouTubePlayer
                videoId={currentVideoId}
                matchId={matchId}
                isAdmin={isAdminView}
                onPlayerReady={handlePlayerReady}
              />
              
              {/* Piano Input Overlay */}
              {showPianoOverlay && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                  <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Event Tracker</h3>
                      <button
                        onClick={togglePianoOverlay}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                      >
                        ×
                      </button>
                    </div>
                    <TrackerPianoInput
                      matchId={matchId}
                      onRecordEvent={handleRecordEventWithVideoTime}
                    />
                  </div>
                </div>
              )}
              
              {/* Piano Toggle Button */}
              <button
                onClick={togglePianoOverlay}
                className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-20"
              >
                🎹 Piano
              </button>
            </>
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

      {/* Voice Chat Section */}
      <div className="lg:w-1/3 flex flex-col gap-4 overflow-y-auto">
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
