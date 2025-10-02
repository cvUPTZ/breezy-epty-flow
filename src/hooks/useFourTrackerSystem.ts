// Hook for the 4-tracker match event system
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventType } from '@/types';

export interface Player {
  id: number;
  jersey_number: number;
  player_name: string;
  team: 'home' | 'away';
  position?: string;
}

export interface TrackerAssignment {
  tracker_id: string;
  tracker_name: string;
  tracker_type: 'ball' | 'player';
  assigned_players: Player[];
}

export interface BallPossessionEvent {
  player_id: number;
  team: 'home' | 'away';
  timestamp: number;
  tracker_id: string;
}

interface UseFourTrackerSystemProps {
  matchId: string;
  trackerId: string;
  trackerType: 'ball' | 'player';
}

export const useFourTrackerSystem = ({
  matchId,
  trackerId,
  trackerType
}: UseFourTrackerSystemProps) => {
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<TrackerAssignment | null>(null);
  const [currentBallHolder, setCurrentBallHolder] = useState<Player | null>(null);
  const [isActiveTracker, setIsActiveTracker] = useState(false);
  const [lastPossession, setLastPossession] = useState<BallPossessionEvent | null>(null);
  const channelRef = useRef<any>(null);

  // Fetch tracker assignment
  useEffect(() => {
    const fetchAssignment = async () => {
      const { data: assignments, error: assignError } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', trackerId);

      if (assignError) {
        console.error('Error fetching assignment:', assignError);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', trackerId)
        .single();

      // Process assignment data
      setAssignment({
        tracker_id: trackerId,
        tracker_name: profile?.full_name || 'Unknown',
        tracker_type: trackerType,
        assigned_players: []
      });
    };

    fetchAssignment();
  }, [matchId, trackerId, trackerType]);

  // Subscribe to ball possession changes (for all trackers)
  useEffect(() => {
    const channel = supabase
      .channel(`ball-possession-${matchId}`)
      .on(
        'broadcast',
        { event: 'ball_possession_change' },
        (payload) => {
          const possession = payload.payload as BallPossessionEvent;
          setLastPossession(possession);
          
          // Determine if this tracker should be active
          if (trackerType === 'ball') {
            setIsActiveTracker(true);
          } else {
            // Player trackers are active only when their player has the ball
            const isMyPlayer = assignment?.assigned_players.some(
              p => p.id === possession.player_id
            );
            setIsActiveTracker(!!isMyPlayer);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, trackerType, assignment]);

  // Ball tracker: update ball possession
  const updateBallPossession = useCallback(async (player: Player) => {
    if (trackerType !== 'ball') return;

    const possessionEvent: BallPossessionEvent = {
      player_id: player.id,
      team: player.team,
      timestamp: Date.now(),
      tracker_id: trackerId
    };

    // Broadcast to all trackers
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'ball_possession_change',
      payload: possessionEvent
    });

    // Infer event based on last possession
    if (lastPossession) {
      await inferEvent(lastPossession, possessionEvent);
    }

    setLastPossession(possessionEvent);
    setCurrentBallHolder(player);
  }, [trackerType, trackerId, lastPossession]);

  // Event inference logic
  const inferEvent = useCallback(async (
    prev: BallPossessionEvent,
    current: BallPossessionEvent
  ) => {
    try {
      // Same player = dribble/keep
      if (prev.player_id === current.player_id) {
        await recordInferredEvent('dribble', current);
        return;
      }

      // Same team = pass
      if (prev.team === current.team) {
        await recordInferredEvent('pass', prev, current);
        return;
      }

      // Different team = interception/turnover
      await recordInferredEvent('interception', current, prev);
    } catch (error) {
      console.error('Error inferring event:', error);
    }
  }, []);

  // Record inferred event
  const recordInferredEvent = useCallback(async (
    eventType: string,
    current: BallPossessionEvent,
    previous?: BallPossessionEvent
  ) => {
    const eventData: any = {
      match_id: matchId,
      event_type: eventType,
      player_id: current.player_id,
      team: current.team,
      timestamp: Math.floor(current.timestamp / 1000),
      created_by: trackerId,
      event_data: {
        inferred: true,
        inference_type: eventType,
        from_player_id: previous?.player_id,
        recorded_at: new Date().toISOString()
      }
    };

    const { error } = await supabase
      .from('match_events')
      .insert([eventData]);

    if (error) {
      console.error('Error recording inferred event:', error);
    } else {
      toast({
        title: 'Event Recorded',
        description: `${eventType} detected automatically`,
        duration: 2000
      });
    }
  }, [matchId, trackerId, toast]);

  // Player tracker: record event
  const recordEvent = useCallback(async (
    eventType: EventType,
    details?: Record<string, any>
  ) => {
    if (!isActiveTracker || !currentBallHolder) {
      toast({
        title: 'Not Active',
        description: 'Wait for your player to get the ball',
        variant: 'destructive'
      });
      return;
    }

    const eventData = {
      match_id: matchId,
      event_type: eventType,
      player_id: currentBallHolder.id,
      team: currentBallHolder.team,
      timestamp: Math.floor(Date.now() / 1000),
      created_by: trackerId,
      event_data: {
        ...details,
        tracker_type: 'player',
        recorded_at: new Date().toISOString()
      }
    };

    const { error } = await supabase
      .from('match_events')
      .insert([eventData]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to record event',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Event Recorded',
        description: `${eventType} recorded successfully`,
        duration: 2000
      });
    }
  }, [isActiveTracker, currentBallHolder, matchId, trackerId, toast]);

  return {
    assignment,
    currentBallHolder,
    isActiveTracker,
    updateBallPossession,
    recordEvent,
    lastPossession
  };
};
