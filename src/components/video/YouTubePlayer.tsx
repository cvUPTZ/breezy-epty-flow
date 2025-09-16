
import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer as TYPlayer } from 'react-youtube';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Volume2, VolumeX, Maximize } from 'lucide-react';

/**
 * @interface YouTubePlayerComponentProps
 * @description Props for the YouTubePlayerComponent.
 * @property {string} videoId - The ID of the YouTube video to play.
 * @property {string} matchId - The ID of the match, used to create a unique real-time channel.
 * @property {boolean} isAdmin - If true, this instance can broadcast control events. If false, it will listen for them.
 * @property {(player: TYPlayer) => void} [onPlayerReady] - Callback function that fires when the player is ready.
 * @property {(event: any) => void} [onStateChange] - Callback function that fires when the player's state changes.
 */
interface YouTubePlayerComponentProps {
  videoId: string;
  matchId: string;
  isAdmin: boolean;
  onPlayerReady?: (player: TYPlayer) => void;
  onStateChange?: (event: any) => void;
}

/**
 * @typedef {-1 | 0 | 1 | 2 | 3 | 5} PlayerState
 * @description The possible states of the YouTube player: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued).
 */
type PlayerState = -1 | 0 | 1 | 2 | 3 | 5;

/**
 * @interface PlayerControlEvent
 * @description Defines the structure for a player control event, used for broadcasting actions.
 * @property {'PLAY' | 'PAUSE' | 'SEEK' | 'LOAD_VIDEO'} type - The type of control action.
 * @property {string} [videoId] - The new video ID for a 'LOAD_VIDEO' event.
 * @property {number} [currentTime] - The seek time for a 'SEEK' event.
 * @property {number} timestamp - The timestamp when the event was created to prevent processing stale events.
 */
interface PlayerControlEvent {
  type: 'PLAY' | 'PAUSE' | 'SEEK' | 'LOAD_VIDEO';
  videoId?: string;
  currentTime?: number;
  timestamp: number;
}

/**
 * @component YouTubePlayerComponent
 * @description A synchronized YouTube player component. It uses Supabase's real-time broadcast feature
 * to allow an admin instance of the component to control the playback of all other non-admin instances
 * connected to the same `matchId`. This is ideal for shared video analysis sessions.
 * @param {YouTubePlayerComponentProps} props The props for the component.
 * @returns {JSX.Element} The rendered YouTube player component.
 */
const YouTubePlayerComponent: React.FC<YouTubePlayerComponentProps> = ({
  videoId,
  matchId,
  isAdmin,
  onPlayerReady,
  onStateChange,
}) => {
  const playerRef = useRef<TYPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState(videoId);
  const lastEventTimestampRef = useRef<number>(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const broadcastChannelId = `video-control-${matchId}`;

  useEffect(() => {
    setCurrentVideoId(videoId);
  }, [videoId]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!matchId) return;

    const channel = supabase.channel(broadcastChannelId, {
      config: {
        broadcast: {
          ack: true,
        },
      },
    });

    channel.on('broadcast', { event: 'player-control' }, ({ payload }: { payload: PlayerControlEvent }) => {
      if (isAdmin) return;

      if (payload.timestamp <= lastEventTimestampRef.current) {
        console.log('Skipping stale event:', payload);
        return;
      }
      lastEventTimestampRef.current = payload.timestamp;

      const player = playerRef.current;
      if (!player) return;

      console.log('Received player control event:', payload);

      switch (payload.type) {
        case 'LOAD_VIDEO':
          if (payload.videoId && player.loadVideoById && payload.videoId !== currentVideoId) {
            console.log(`Tracker loading video: ${payload.videoId}`);
            setCurrentVideoId(payload.videoId);
          }
          break;
        case 'PLAY':
          if (typeof payload.currentTime === 'number') {
            player.seekTo(payload.currentTime, true);
          }
          player.playVideo();
          break;
        case 'PAUSE':
          player.pauseVideo();
          break;
        case 'SEEK':
          if (typeof payload.currentTime === 'number') {
            player.seekTo(payload.currentTime, true);
          }
          break;
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${broadcastChannelId}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Failed to subscribe to ${broadcastChannelId}: Channel error`);
      } else if (status === 'TIMED_OUT') {
        console.error(`Failed to subscribe to ${broadcastChannelId}: Timed out`);
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).then(() => {
          console.log(`Unsubscribed from ${broadcastChannelId}`);
        });
        channelRef.current = null;
      }
    };
  }, [matchId, isAdmin, currentVideoId]);

  const sendPlayerControlEvent = (event: Omit<PlayerControlEvent, 'timestamp'>) => {
    if (!isAdmin || !channelRef.current || channelRef.current.state !== 'joined') {
      return;
    }
    const fullEvent: PlayerControlEvent = { ...event, timestamp: Date.now() };
    console.log('Admin sending player control event:', fullEvent);
    channelRef.current.send({
      type: 'broadcast',
      event: 'player-control',
      payload: fullEvent,
    });
  };

  const handlePlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    setVolume(event.target.getVolume());
    setIsMuted(event.target.isMuted());
    if (onPlayerReady) {
      onPlayerReady(event.target);
    }
  };

  const handlePlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (onStateChange) {
      onStateChange(event);
    }

    if (!isAdmin || !playerRef.current) return;

    const playerState = event.data as PlayerState;
    
    // Handle state changes for admin control
    if (playerState === 1) { // PLAYING
      // Could send PLAY event if needed
    } else if (playerState === 2) { // PAUSED
      // Could send PAUSE event if needed
    }
  };

  useEffect(() => {
    if (isAdmin && videoId !== currentVideoId) {
      console.log(`Admin changed video to: ${videoId}. Broadcasting...`);
      setCurrentVideoId(videoId);
      sendPlayerControlEvent({ type: 'LOAD_VIDEO', videoId: videoId });
      if (playerRef.current) {
        // Let key prop handle re-render
      }
    }
  }, [videoId, isAdmin, currentVideoId]);

  const handleError = (error: any) => {
    console.error('YouTube Player Error:', error);
  };

  const handleVolumeToggle = () => {
    if (!playerRef.current) return;
    
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    
    const newVolume = parseInt(e.target.value);
    playerRef.current.setVolume(newVolume);
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1, // Always show YouTube controls
      rel: 0,
      modestbranding: 1,
      disablekb: 0, // Enable keyboard controls
    },
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <YouTube
        key={currentVideoId}
        videoId={currentVideoId}
        opts={opts}
        onReady={handlePlayerReady}
        onStateChange={handlePlayerStateChange}
        onError={handleError}
        className="w-full h-full"
      />
      
      {/* Custom Volume and Fullscreen Controls */}
      <div className={`absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 z-40 ${isFullscreen ? 'z-[10000]' : ''}`}>
        <button
          onClick={handleVolumeToggle}
          className="text-white hover:text-gray-300 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
          title="Volume"
        />
        
        <button
          onClick={handleFullscreen}
          className="text-white hover:text-gray-300 transition-colors ml-2"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          <Maximize size={20} />
        </button>
      </div>
    </div>
  );
};

/**
 * The following exports provide renamed, more intuitive access to the component and its related types.
 * - `YouTubePlayer`: The main component to be used in other parts of the application.
 * - `YouTubePlayerInstance`: The type definition for the player instance, useful for refs.
 * - `PlayerControlEvent`: The type definition for the control events used in real-time communication.
 */
export { YouTubePlayerComponent as YouTubePlayer, type TYPlayer as YouTubePlayerInstance, type PlayerControlEvent };
export default YouTubePlayerComponent;
