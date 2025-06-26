import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { YouTubePlayerWithDetection } from './YouTubePlayerWithDetection';
import { YouTubePlayerInstance } from './YouTubePlayer';
import VideoPlayerControls from './VideoPlayerControls';
import { CompactVoiceChat } from '../voice/CompactVoiceChat';
import { VoiceCollaborationProvider, useVoiceCollaborationContext } from '@/context/VoiceCollaborationContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SimplePianoOverlay from './SimplePianoOverlay';
import { ProcessedDetectionResult } from '@/services/roboflowDetectionService';
import { useUnifiedTrackerConnection } from '@/hooks/useUnifiedTrackerConnection';

interface TrackerVideoInterfaceProps {
  initialVideoId: string;
  matchId: string;
}

interface PlayerControlEvent {
  type: 'PLAY' | 'PAUSE' | 'SEEK' | 'LOAD_VIDEO';
  videoId?: string;
  currentTime?: number;
  timestamp: number;
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
  const [detectionResults, setDetectionResults] = useState<ProcessedDetectionResult[]>([]);
  
  // Add refs to prevent rapid state changes
  const lastBroadcastRef = useRef<number>(0);
  const broadcastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize unified tracker connection for status reporting
  const { isConnected, broadcastStatus } = useUnifiedTrackerConnection(matchId, user?.id);

  // Set admin view based on user role - only once
  useEffect(() => {
    setIsAdminView(userRole === 'admin');
  }, [userRole]);

  // Update video ID when prop changes
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

  // Throttled broadcast function to prevent spam
  const throttledBroadcast = (statusData: any) => {
    const now = Date.now();
    const timeSinceLastBroadcast = now - lastBroadcastRef.current;
    
    // Minimum 2 seconds between broadcasts for UI actions
    if (timeSinceLastBroadcast < 2000) {
      return;
    }
    
    lastBroadcastRef.current = now;
    
    if (broadcastTimeoutRef.current) {
      clearTimeout(broadcastTimeoutRef.current);
    }
    
    broadcastTimeoutRef.current = setTimeout(() => {
      if (isConnected) {
        broadcastStatus(statusData);
      }
    }, 100);
  };

  // Single effect for initial connection - simplified
  useEffect(() => {
    if (!user?.id || !matchId || !isConnected) return;

    let mounted = true;
    
    // Single initial broadcast
    const initialTimer = setTimeout(() => {
      if (mounted && isConnected) {
        broadcastStatus({
          status: 'active',
          timestamp: Date.now(),
          action: 'video_tracker_loaded'
        });
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(initialTimer);
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current);
      }
    };
  }, [user?.id, matchId, isConnected, broadcastStatus]);

  const handlePlayerReady = (playerInstance: YouTubePlayerInstance) => {
    playerRef.current = playerInstance;
    console.log('Player is ready:', playerInstance);
    
    // Throttled player ready broadcast
    throttledBroadcast({
      status: 'active',
      timestamp: Date.now(),
      action: 'player_ready'
    });
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
    
    // Throttled recording broadcast
    throttledBroadcast({
      status: 'recording',
      timestamp: Date.now(),
      action: `recording_${eventType}`
    });
    
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

      // Throttled success broadcast
      throttledBroadcast({
        status: 'active',
        timestamp: Date.now(),
        action: `event_recorded_${eventType}`
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

  const handleDetectionResults = (results: ProcessedDetectionResult[]) => {
    console.log('Received AI detection results:', results);
    setDetectionResults(results);
    toast({
      title: 'AI Detection Complete',
      description: `Analyzed ${results.length} frames. Found ${results.reduce((sum, r) => sum + r.players.length, 0)} player detections.`,
    });
  };

  const togglePianoOverlay = () => {
    const newState = !showPianoOverlay;
    setShowPianoOverlay(newState);
    
    // Throttled overlay toggle broadcast
    throttledBroadcast({
      status: 'active',
      timestamp: Date.now(),
      action: newState ? 'event_tracker_opened' : 'event_tracker_closed'
    });
  };

  const toggleVoiceChat = () => {
    const newState = !showVoiceChat;
    setShowVoiceChat(newState);
    
    // Throttled voice chat toggle broadcast
    throttledBroadcast({
      status: 'active',
      timestamp: Date.now(),
      action: newState ? 'voice_chat_opened' : 'voice_chat_closed'
    });
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
      <div className="absolute top-16 right-4 w-80 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden"
           style={{ zIndex: isFullscreen ? 2147483647 : 50 }}>
        <div className="p-3 border-b border-white/10 bg-black/30 flex justify-between items-center">
          <h3 className="font-medium text-white text-sm">Voice Chat</h3>
          <button
            onClick={toggleVoiceChat}
            className="text-white/70 hover:text-white text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
          >
            ×
          </button>
        </div>
        <div className="p-3">
          <CompactVoiceChat
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
      {/* Connection Status Indicator for Debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 right-2 z-50 bg-black/70 text-white px-2 py-1 rounded text-xs">
          Connection: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      )}

      {/* Video Player and Controls Section */}
      <div className="flex-grow flex flex-col gap-2 min-h-0 max-w-full">
        <div className="relative flex-grow bg-black rounded-lg shadow-lg overflow-hidden w-full">
          {currentVideoId && matchId ? (
            <>
              <YouTubePlayerWithDetection
                videoId={currentVideoId}
                matchId={matchId}
                isAdmin={isAdminView}
                onPlayerReady={handlePlayerReady}
                onDetectionResults={handleDetectionResults}
              />
              
              {/* Control Buttons - Only show event tracker for all users */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {/* Event Tracker Toggle Button - Always available */}
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
        
        {/* Admin-only Video Player Controls */}
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
