
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { YouTubePlayer, YouTubePlayerInstance, PlayerControlEvent } from './YouTubePlayer';
import VideoPlayerControls from './VideoPlayerControls';
import { EnhancedVoiceChat } from '../voice/EnhancedVoiceChat';
import { VoiceCollaborationProvider, useVoiceCollaborationContext } from '@/context/VoiceCollaborationContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SimplePianoOverlay from './SimplePianoOverlay';

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
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsAdminView(userRole === 'admin');
  }, [userRole]);

  useEffect(() => {
    setCurrentVideoId(initialVideoId);
  }, [initialVideoId]);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Debug voice collaboration context
  useEffect(() => {
    console.log('TrackerVideoInterface - Voice collaboration context:', voiceCollabCtx);
    console.log('TrackerVideoInterface - Match ID for voice chat:', matchId);
    console.log('TrackerVideoInterface - User for voice chat:', user);
    console.log('TrackerVideoInterface - User role for voice chat:', userRole);
  }, [voiceCollabCtx, matchId, user, userRole]);

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

  const handleRecordEvent = async (eventType: string): Promise<void> => {
    if (!playerRef.current) {
      toast({ title: "Player Error", description: "YouTube player is not available.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Auth Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }

    setIsRecording(true);
    
    try {
      const videoTimestamp = playerRef.current.getCurrentTime();

      const eventToInsert = {
        match_id: matchId,
        event_type: eventType,
        player_id: null,
        team: null,
        coordinates: null,
        details: {
          video_timestamp: videoTimestamp,
          recorded_by_video_tracker: true,
        },
        created_by: user.id,
      };

      console.log("Recording event with video time:", eventToInsert);

      const { data, error } = await supabase
        .from('match_events')
        .insert(eventToInsert)
        .select()
        .single();

      if (error) throw error;

      toast({ 
        title: "Event Recorded", 
        description: `${eventType} recorded at ${videoTimestamp.toFixed(2)}s (video time).` 
      });
    } catch (error: any) {
      console.error('Error recording video event:', error);
      toast({ 
        title: "Recording Error", 
        description: `Failed to record event: ${error.message}`, 
        variant: "destructive" 
      });
    } finally {
      setIsRecording(false);
    }
  };

  const togglePianoOverlay = () => {
    setShowPianoOverlay(!showPianoOverlay);
  };

  const toggleVoiceChat = () => {
    setShowVoiceChat(!showVoiceChat);
  };

  const renderEventTracker = () => {
    if (!showPianoOverlay) return null;

    const overlay = (
      <SimplePianoOverlay
        onRecordEvent={handleRecordEvent}
        onClose={togglePianoOverlay}
        isRecording={isRecording}
      />
    );

    // Render in portal when in fullscreen to ensure it appears above the video
    if (isFullscreen) {
      return createPortal(overlay, document.body);
    }

    return overlay;
  };

  const renderVoiceChat = () => {
    if (!showVoiceChat || !matchId || !user || !userRole) return null;

    const voiceChatOverlay = (
      <div className="absolute top-16 right-4 w-80 max-h-96 bg-white/95 backdrop-blur-lg border border-gray-200 rounded-lg shadow-xl overflow-hidden"
           style={{ zIndex: isFullscreen ? 2147483647 : 50 }}>
        <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Voice Chat</h3>
          <button
            onClick={toggleVoiceChat}
            className="text-gray-500 hover:text-gray-700 text-lg font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-3 max-h-80 overflow-y-auto">
          <div className="text-xs text-gray-600 mb-2">
            <p>Match: {matchId}</p>
            <p>User: {user.email || user.id}</p>
            <p>Role: {userRole}</p>
          </div>
          <EnhancedVoiceChat
            matchId={matchId}
            userId={user.id}
            userRole={userRole}
            userName={user.email || user.id}
            voiceCollabCtx={voiceCollabCtx}
          />
        </div>
      </div>
    );

    // Render in portal when in fullscreen to ensure it appears above the video
    if (isFullscreen) {
      return createPortal(voiceChatOverlay, document.body);
    }

    return voiceChatOverlay;
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-screen overflow-hidden">
      {/* Video Player and Controls Section */}
      <div className="flex-grow flex flex-col gap-2 min-h-0 max-w-full">
        <div className="relative flex-grow bg-black rounded-lg shadow-lg overflow-hidden w-full">
          {currentVideoId && matchId ? (
            <>
              <YouTubePlayer
                videoId={currentVideoId}
                matchId={matchId}
                isAdmin={isAdminView}
                onPlayerReady={handlePlayerReady}
              />
              
              {/* Control Buttons */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {/* Event Tracker Toggle Button */}
                <button
                  onClick={togglePianoOverlay}
                  className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                    showPianoOverlay 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm border border-white/20'
                  }`}
                  style={{ 
                    zIndex: isFullscreen ? 2147483646 : 40 
                  }}
                >
                  <span className="text-lg">⚽</span>
                  {showPianoOverlay ? 'Close Tracker' : 'Event Tracker'}
                </button>

                {/* Voice Chat Toggle Button */}
                {matchId && user && userRole && (
                  <button
                    onClick={toggleVoiceChat}
                    className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                      showVoiceChat 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm border border-white/20'
                    }`}
                    style={{ 
                      zIndex: isFullscreen ? 2147483646 : 40 
                    }}
                  >
                    <span className="text-lg">🎤</span>
                    {showVoiceChat ? 'Close Voice' : 'Voice Chat'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Select a video to start.
            </div>
          )}
        </div>
        {isAdminView && playerRef.current && !isFullscreen && (
          <div className="flex-shrink-0 w-full">
            <VideoPlayerControls
              player={playerRef.current}
              initialVideoId={currentVideoId}
              onSendEvent={sendAdminPlayerEvent}
            />
          </div>
        )}
      </div>

      {/* Event Tracker Overlay */}
      {renderEventTracker()}

      {/* Voice Chat Overlay */}
      {renderVoiceChat()}
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
