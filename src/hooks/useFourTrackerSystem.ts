// Hook for the 4-tracker match event system
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventType } from '@/types';
import { parsePlayerIds } from '@/utils/parsing';

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
  allPlayers: Player[]; // All players from the match
}

export const useFourTrackerSystem = ({
  matchId,
  trackerId,
  trackerType,
  allPlayers
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

      if (assignError || !assignments || assignments.length === 0) {
        console.error('Error fetching assignment or assignment not found:', assignError);
        return;
      }

      const assignmentData: any = assignments[0];
      const assignedPlayerIds = parsePlayerIds(assignmentData.assigned_player_ids);

      // Map assigned player IDs to actual player objects from the match data
      const assignedPlayers: Player[] = assignedPlayerIds
        .map((playerId: number) => allPlayers.find((p: Player) => p.id === playerId))
        .filter((p: Player | undefined): p is Player => p !== undefined);

      setAssignment({
        tracker_id: trackerId,
        tracker_name: 'Unknown Tracker', // Profile fetch removed for simplicity for now
        tracker_type: (assignmentData.tracker_type || 'player') as 'ball' | 'player',
        assigned_players: assignedPlayers,
      });
    };

    if (trackerId && matchId && allPlayers.length > 0) {
      fetchAssignment();
    }
  }, [matchId, trackerId, trackerType, allPlayers]);

  // Subscribe to ball possession changes (for all trackers)
  useEffect(() => {
    const channel = supabase
      .channel(`ball-possession-${matchId}`)
      .on(
        'broadcast',
        { event: 'ball_possession_change' },
        (payload) => {
          const possession = payload.payload as BallPossessionEvent;
          
          // Find player from allPlayers
          const player = allPlayers.find(p => p.id === possession.player_id);
          
          if (player) {
            setCurrentBallHolder(player);
            setLastPossession(possession);

            if (trackerType === 'player') {
              const isMyPlayer = assignment?.assigned_players?.some(p => p.id === possession.player_id) || false;
              setIsActiveTracker(isMyPlayer);
            } else {
              setIsActiveTracker(true);
            }
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

    // 1. Record the raw possession change event
    await supabase.from('match_events').insert([{
      match_id: matchId,
      event_type: 'ball_possession_change',
      player_id: player.id,
      team: player.team,
      timestamp: Math.floor(possessionEvent.timestamp / 1000),
      created_by: trackerId,
      event_data: {
        inferred: false,
        tracker_id: trackerId,
      }
    }]);

    // 2. Broadcast to all trackers
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'ball_possession_change',
      payload: possessionEvent
    });

    // 3. Infer event based on last possession
    if (lastPossession) {
      await inferEvent(lastPossession, possessionEvent);
    }

    // 4. Update local state
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
