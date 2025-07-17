import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { YouTubePlayerWithDetection } from './YouTubePlayerWithDetection';
import { YouTubePlayerInstance } from './YouTubePlayer';
import VideoPlayerControls from './VideoPlayerControls';
import { CompactVoiceChat } from '../voice/CompactVoiceChat';
import { VoiceCollaborationProvider, useVoiceCollaborationContext } from '@/context/VoiceCollaborationContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DedicatedTrackerUI from '@/components/match/DedicatedTrackerUI';
import GamepadConfig from '@/components/gamepad/GamepadConfig';
import { ProcessedDetectionResult } from '@/services/roboflowDetectionService';
import { useUnifiedTrackerConnection } from '@/hooks/useUnifiedTrackerConnection';
import { useGamepadTracker } from '@/hooks/useGamepadTracker';

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
  const [showGamepadConfig, setShowGamepadConfig] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detectionResults, setDetectionResults] = useState<ProcessedDetectionResult[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignedEventTypes, setAssignedEventTypes] = useState<string[]>([]);
  const [assignedPlayer, setAssignedPlayer] = useState<any>(null);
  
  // State to track the last triggered event from the gamepad
  const [lastGamepadTriggeredEvent, setLastGamepadTriggeredEvent] = useState<string | null>(null);

  // Initialize unified tracker connection for status reporting
  const { isConnected, broadcastStatus } = useUnifiedTrackerConnection(matchId, user?.id);

  // Available event types for gamepad mapping
  const availableEvents = ['goal', 'shot', 'pass', 'tackle', 'foul', 'save', 'corner', 'throw_in', 'free_kick', 'penalty'];

  // Gamepad button mapping state
  const [gamepadButtonMapping, setGamepadButtonMapping] = useState<{ [buttonIndex: number]: string }>({
    0: 'goal',      // A Button
    1: 'shot',      // B Button
    2: 'pass',      // X Button
    3: 'tackle',    // Y Button
    4: 'foul',      // Left Bumper
    5: 'save'       // Right Bumper
  });

  // IMPORTANT: Use useCallback to memoize the handleRecordEvent function
  // This prevents the gamepad hook from restarting on every render
  const handleRecordEvent = useCallback(async (eventType: string): Promise<void> => {
    // console.log('TrackerVideoInterface: handleRecordEvent called with:', eventType);

    if (!playerRef.current) {
      toast({ title: "Player Error", description: "YouTube player is not available.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Auth Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }

    setIsRecording(true);
    // Signal that an event is being recorded (for UI feedback)
    setLastGamepadTriggeredEvent(eventType); 
    // console.log('TrackerVideoInterface: setLastGamepadTriggeredEvent called with:', eventType);

    // Broadcast recording status
    if (isConnected) {
      broadcastStatus({
        status: 'recording',
        timestamp: Date.now(),
        action: `recording_${eventType}`
      });
    }
    
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
          recorded_via_gamepad: true, // We know this came from gamepad since this hook is used
        },
        created_by: user.id,
      };

      // console.log("Recording event with video time:", eventToInsert);

      const { data, error } = await supabase
        .from('match_events')
        .insert(eventToInsert)
        .select()
        .single();

      if (error) throw error;

      toast({ 
        title: "Event Recorded", 
        description: `${eventType} recorded at ${videoTimestamp.toFixed(2)}s (video time) via gamepad.` 
      });

      // Broadcast success status
      if (isConnected) {
        broadcastStatus({
          status: 'active',
          timestamp: Date.now(),
          action: `event_recorded_${eventType}`
        });
      }
    } catch (error: any) {
      console.error('Error recording video event:', error);
      toast({ 
        title: "Recording Error", 
        description: `Failed to record event: ${error.message}`, 
        variant: "destructive" 
      });
    } finally {
      setIsRecording(false);
      // Clear the triggered event after a short delay to allow UI to show it
      setTimeout(() => {
        setLastGamepadTriggeredEvent(null);
        // console.log('TrackerVideoInterface: cleared lastGamepadTriggeredEvent');
      }, 1000); 
    }
  }, [user, isConnected, broadcastStatus, toast]); // Dependencies for useCallback

  // Initialize gamepad tracker with memoized callback
  const { isConnected: gamepadConnected } = useGamepadTracker({
    buttonMapping: gamepadButtonMapping,
    onEventTrigger: handleRecordEvent 
  });

  // Set admin view based on user role - only once
  useEffect(() => {
    setIsAdminView(userRole === 'admin');
  }, [userRole]);

  // Update video ID when prop changes
  useEffect(() => {
    setCurrentVideoId(initialVideoId);
  }, [initialVideoId]);

  // Fetch tracker assignments
  useEffect(() => {
    if (user?.id && matchId) {
      fetchTrackerAssignments();
    }
  }, [user?.id, matchId]);

  const fetchTrackerAssignments = async () => {
    if (!user?.id || !matchId) return;

    try {
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', user.id);

      if (error) throw error;

      setAssignments(data || []);
      
      // Extract event types
      const eventTypes = Array.from(new Set(data?.flatMap(assignment => assignment.assigned_event_types || []) || []));
      setAssignedEventTypes(eventTypes);

      // For now, get the first assigned player (you can modify this logic as needed)
      if (data && data.length > 0) {
        const firstAssignment = data[0];
        // You'll need to fetch player details based on player_id and team
        // For now, creating a simple player object
        setAssignedPlayer({
          id: firstAssignment.player_id,
          name: `Player ${firstAssignment.player_id}`,
          teamId: firstAssignment.player_team_id,
          teamName: firstAssignment.player_team_id === 'home' ? 'Home Team' : 'Away Team'
        });
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Enhanced connection and status reporting
  useEffect(() => {
    if (!user?.id || !matchId) return;

    let mounted = true;
    let statusInterval: NodeJS.Timeout | null = null;

    const startStatusReporting = () => {
      // Initial status broadcast
      if (mounted && isConnected) {
        // console.log('TrackerVideoInterface: Broadcasting initial active status');
        broadcastStatus({
          status: 'active',
          timestamp: Date.now(),
          action: 'video_tracker_connected'
        });
      }

      // Set up regular status updates every 10 seconds
      statusInterval = setInterval(() => {
        if (mounted && isConnected) {
          // console.log('TrackerVideoInterface: Broadcasting periodic active status');
          broadcastStatus({
            status: 'active',
            timestamp: Date.now(),
            action: 'video_tracker_active'
          });
        }
      }, 10000);
    };

    // Wait for connection to be established
    if (isConnected) {
      startStatusReporting();
    } else {
      // Retry connection establishment
      const connectionTimeout = setTimeout(() => {
        if (mounted && !isConnected) {
          // console.log('TrackerVideoInterface: Connection timeout, retrying...');
          // The connection hook will handle retries
        }
      }, 5000);

      return () => {
        clearTimeout(connectionTimeout);
      };
    }

    return () => {
      mounted = false;
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [user?.id, matchId, isConnected, broadcastStatus]);

  const handlePlayerReady = useCallback((playerInstance: YouTubePlayerInstance) => {
    playerRef.current = playerInstance;
    // console.log('Player is ready:', playerInstance);
    
    // Broadcast player ready status
    if (isConnected) {
      broadcastStatus({
        status: 'active',
        timestamp: Date.now(),
        action: 'player_ready'
      });
    }
  }, [isConnected, broadcastStatus]);

  const sendAdminPlayerEvent = useCallback((event: Omit<PlayerControlEvent, 'timestamp'>) => {
    const channel = supabase.channel(`video-control-${matchId}`);
    if (isAdminView && channel && playerRef.current) {
      const fullEvent: PlayerControlEvent = { ...event, timestamp: Date.now() };
      // console.log('Admin sending player control event from TrackerVideoInterface:', fullEvent);
      channel.send({
        type: 'broadcast',
        event: 'player-control',
        payload: fullEvent,
      });

      if (event.type === 'LOAD_VIDEO' && event.videoId) {
         setCurrentVideoId(event.videoId);
      }
    }
  }, [isAdminView, matchId]);

  const handleDetectionResults = useCallback((results: ProcessedDetectionResult[]) => {
    // console.log('Received AI detection results:', results);
    setDetectionResults(results);
    toast({
      title: 'AI Detection Complete',
      description: `Analyzed ${results.length} frames. Found ${results.reduce((sum, r) => sum + r.players.length, 0)} player detections.`,
    });
  }, [toast]);

  const togglePianoOverlay = useCallback(() => {
    const newState = !showPianoOverlay;
    setShowPianoOverlay(newState);
    
    // Broadcast overlay toggle status
    if (isConnected) {
      broadcastStatus({
        status: 'active',
        timestamp: Date.now(),
        action: newState ? 'event_tracker_opened' : 'event_tracker_closed'
      });
    }
  }, [showPianoOverlay, isConnected, broadcastStatus]);

  const toggleVoiceChat = useCallback(() => {
    const newState = !showVoiceChat;
    setShowVoiceChat(newState);
    
    // Broadcast voice chat toggle status
    if (isConnected) {
      broadcastStatus({
        status: 'active',
        timestamp: Date.now(),
        action: newState ? 'voice_chat_opened' : 'voice_chat_closed'
      });
    }
  }, [showVoiceChat, isConnected, broadcastStatus]);

  const toggleGamepadConfig = useCallback(() => {
    const newState = !showGamepadConfig;
    setShowGamepadConfig(newState);
    
    // Broadcast gamepad config toggle status
    if (isConnected) {
      broadcastStatus({
        status: 'active',
        timestamp: Date.now(),
        action: newState ? 'gamepad_config_opened' : 'gamepad_config_closed'
      });
    }
  }, [showGamepadConfig, isConnected, broadcastStatus]);

  const handleGamepadConfigChange = useCallback((mapping: { [buttonIndex: number]: string }) => {
    setGamepadButtonMapping(mapping);
    // console.log('Gamepad button mapping updated:', mapping);
  }, []);

  const renderEventTracker = () => {
    if (!showPianoOverlay || !assignedPlayer || assignedEventTypes.length === 0) return null;

    const overlay = (
      <div className="absolute top-4 right-4 w-80 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden"
           style={{ zIndex: isFullscreen ? 2147483647 : 50 }}>
        <div className="p-3 border-b border-white/10 bg-black/30 flex justify-between items-center">
          <h3 className="font-medium text-white text-sm">Event Tracker</h3>
          <button
            onClick={togglePianoOverlay}
            className="text-white/70 hover:text-white text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
          >
            ×
          </button>
        </div>
        <div className="p-3">
          <DedicatedTrackerUI
            assignedPlayerForMatch={assignedPlayer}
            recordEvent={(eventType, playerId, teamId) => {
              handleRecordEvent(eventType);
            }}
            assignedEventTypes={assignedEventTypes}
            matchId={matchId}
          />
        </div>
      </div>
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

  const renderGamepadConfig = () => {
    if (!showGamepadConfig) return null;

    const gamepadConfigOverlay = (
      <div className="absolute top-16 left-4 w-96 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden"
           style={{ zIndex: isFullscreen ? 2147483647 : 50 }}>
        <div className="p-3 border-b border-white/10 bg-black/30 flex justify-between items-center">
          <h3 className="font-medium text-white text-sm">Gamepad Configuration</h3>
          <button
            onClick={toggleGamepadConfig}
            className="text-white/70 hover:text-white text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
          >
            ×
          </button>
        </div>
        <div className="p-3">
          <GamepadConfig
            isConnected={gamepadConnected}
            onConfigChange={handleGamepadConfigChange}
            availableEvents={availableEvents}
          />
        </div>
      </div>
    );

    // Render in portal when in fullscreen to ensure it appears above the video
    if (isFullscreen) {
      return createPortal(gamepadConfigOverlay, document.body);
    }

    return gamepadConfigOverlay;
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-screen overflow-hidden">
      {/* Connection Status Indicator */}
      <div className="fixed top-2 right-2 z-50 bg-black/70 text-white px-2 py-1 rounded text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Tracker: {isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
        {/* Gamepad Status */}
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${gamepadConnected ? 'bg-blue-500' : 'bg-gray-500'}`} />
          <span>Gamepad: {gamepadConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

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
              
              {/* Control Buttons */}
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

                {/* Gamepad Config Toggle Button */}
                <button
                  onClick={toggleGamepadConfig}
                  className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                    showGamepadConfig 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm border border-white/20'
                  }`}
                  style={{ 
                    zIndex: isFullscreen ? 2147483646 : 40 
                  }}
                >
                  <span className="text-lg">🎮</span>
                  {showGamepadConfig ? 'Close Gamepad' : 'Gamepad Config'}
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

      {/* Gamepad Configuration Overlay */}
      {renderGamepadConfig()}
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