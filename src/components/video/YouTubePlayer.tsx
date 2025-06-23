
import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer as TYPlayer } from 'react-youtube';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface YouTubePlayerComponentProps {
  videoId: string;
  matchId: string;
  isAdmin: boolean;
  onPlayerReady?: (player: TYPlayer) => void;
  onStateChange?: (event: any) => void;
}

type PlayerState = -1 | 0 | 1 | 2 | 3 | 5;

interface PlayerControlEvent {
  type: 'PLAY' | 'PAUSE' | 'SEEK' | 'LOAD_VIDEO';
  videoId?: string;
  currentTime?: number;
  timestamp: number;
}

const YouTubePlayerComponent: React.FC<YouTubePlayerComponentProps> = ({
  videoId,
  matchId,
  isAdmin,
  onPlayerReady,
  onStateChange,
}) => {
  const playerRef = useRef<TYPlayer | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState(videoId);
  const lastEventTimestampRef = useRef<number>(0);

  const broadcastChannelId = `video-control-${matchId}`;

  useEffect(() => {
    setCurrentVideoId(videoId);
  }, [videoId]);

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

  const opts: YouTubeProps['opts'] = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
      controls: isAdmin ? 1 : 0,
      rel: 0,
      modestbranding: 1,
      disablekb: isAdmin ? 0 : 1,
    },
  };

  return (
    <YouTube
      key={currentVideoId}
      videoId={currentVideoId}
      opts={opts}
      onReady={handlePlayerReady}
      onStateChange={handlePlayerStateChange}
      onError={handleError}
      className={isAdmin ? "youtube-admin-player" : "youtube-tracker-player"}
    />
  );
};

export { YouTubePlayerComponent as YouTubePlayer, type TYPlayer as YouTubePlayerInstance, type PlayerControlEvent };
export default YouTubePlayerComponent;
