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
  assigned_event_types: string[];
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
  const processingRef = useRef(false); // Prevent race conditions

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
        tracker_name: 'Unknown Tracker',
        tracker_type: (assignmentData.tracker_type || 'player') as 'ball' | 'player',
        assigned_players: assignedPlayers,
        assigned_event_types: assignmentData.assigned_event_types || [],
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
          
          // Validate player exists in current teams
          const player = allPlayers.find(p => p.id === possession.player_id);
          
          if (!player) {
            console.warn('Received possession for unknown player:', possession.player_id);
            return;
          }
          
          setCurrentBallHolder(player);
          setLastPossession(possession);

          if (trackerType === 'player') {
            const isMyPlayer = assignment?.assigned_players?.some(p => p.id === possession.player_id) || false;
            setIsActiveTracker(isMyPlayer);
          } else {
            setIsActiveTracker(true);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, trackerType, assignment, allPlayers]);

  // Ball tracker: update ball possession
  const updateBallPossession = useCallback(async (player: Player) => {
    if (trackerType !== 'ball') return;
    if (processingRef.current) return; // Prevent duplicate processing

    processingRef.current = true;

    try {
      const possessionEvent: BallPossessionEvent = {
        player_id: player.id,
        team: player.team,
        timestamp: Date.now(),
        tracker_id: trackerId
      };

      // 1. Infer event FIRST based on last possession (before broadcasting)
      if (lastPossession) {
        await inferEvent(lastPossession, possessionEvent);
      }

      // 2. Record the raw possession change event
      const { error: insertError } = await supabase.from('match_events').insert([{
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

      if (insertError) {
        console.error('Error recording possession change:', insertError);
        throw insertError;
      }

      // 3. Broadcast to all trackers AFTER events are recorded
      if (channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'ball_possession_change',
          payload: possessionEvent
        });
      }

      // 4. Update local state
      setLastPossession(possessionEvent);
      setCurrentBallHolder(player);
    } catch (error) {
      console.error('Error in updateBallPossession:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ball possession',
        variant: 'destructive'
      });
    } finally {
      processingRef.current = false;
    }
  }, [trackerType, trackerId, lastPossession, matchId, toast]);

  // Event inference logic with expanded cases
  const inferEvent = useCallback(async (
    prev: BallPossessionEvent,
    current: BallPossessionEvent
  ) => {
    try {
      // Same player = dribble/keep (only if more than 2 seconds apart)
      if (prev.player_id === current.player_id) {
        const timeDiff = current.timestamp - prev.timestamp;
        if (timeDiff > 2000) { // Only record if > 2 seconds
          await recordInferredEvent('dribble', current);
        }
        return;
      }

      // Same team = pass (successful)
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
    try {
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
          to_player_id: eventType === 'pass' ? current.player_id : undefined,
          recorded_at: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('match_events')
        .insert([eventData]);

      if (error) {
        console.error('Error recording inferred event:', error);
        throw error;
      }

      toast({
        title: 'Event Recorded',
        description: `${eventType} detected automatically`,
        duration: 2000
      });
    } catch (error) {
      console.error('Error in recordInferredEvent:', error);
      // Don't throw - log but continue
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

    try {
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
        throw error;
      }

      toast({
        title: 'Event Recorded',
        description: `${eventType} recorded successfully`,
        duration: 2000
      });
    } catch (error) {
      console.error('Error recording event:', error);
      toast({
        title: 'Error',
        description: 'Failed to record event',
        variant: 'destructive'
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
