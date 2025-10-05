import { useState, useEffect, useCallback, useRef } from 'react';

// Enhanced hook with pending event queue
export interface Player {
  id: number;
  jersey_number: number;
  player_name: string;
  team: 'home' | 'away';
  position?: string;
}

export interface PendingEvent {
  id: string;
  player: Player;
  timestamp: number;
  age_seconds: number;
  priority: 'urgent' | 'normal' | 'old';
  tracker_id: string;
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

interface UseFourTrackerSystemEnhancedProps {
  matchId: string;
  trackerId: string;
  trackerType: 'ball' | 'player';
  allPlayers: Player[];
  supabase: any;
  toast: any;
}

export const useFourTrackerSystemEnhanced = ({
  matchId,
  trackerId,
  trackerType,
  allPlayers,
  supabase,
  toast
}: UseFourTrackerSystemEnhancedProps) => {
  const [assignment, setAssignment] = useState<TrackerAssignment | null>(null);
  const [currentBallHolder, setCurrentBallHolder] = useState<Player | null>(null);
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [lastPossession, setLastPossession] = useState<BallPossessionEvent | null>(null);
  const channelRef = useRef<any>(null);
  const processingRef = useRef(false);
  const eventIdCounter = useRef(0);

  // Update event ages every second
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingEvents(prev => 
        prev.map(event => {
          const age = Math.floor((Date.now() - event.timestamp) / 1000);
          let priority: 'urgent' | 'normal' | 'old' = 'normal';
          
          if (age < 5) priority = 'urgent';
          else if (age < 15) priority = 'normal';
          else priority = 'old';
          
          return { ...event, age_seconds: age, priority };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-clear old events (optional - can be disabled)
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingEvents(prev => {
        const cleared = prev.filter(e => e.age_seconds < 30);
        const removed = prev.length - cleared.length;
        
        if (removed > 0) {
          toast({
            title: 'Events Auto-Cleared',
            description: `${removed} old event(s) cleared (>30s old)`,
            duration: 2000,
          });
        }
        
        return cleared;
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [toast]);

  // Fetch tracker assignment (same as before)
  useEffect(() => {
    const fetchAssignment = async () => {
      const { data: assignments, error: assignError } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', trackerId);

      if (assignError || !assignments || assignments.length === 0) {
        console.error('Error fetching assignment:', assignError);
        return;
      }

      const assignmentData: any = assignments[0];
      const assignedPlayerIds = JSON.parse(assignmentData.assigned_player_ids || '[]');
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
  }, [matchId, trackerId, trackerType, allPlayers, supabase]);

  // Subscribe to ball possession changes
  useEffect(() => {
    const channel = supabase
      .channel(`ball-possession-${matchId}`)
      .on(
        'broadcast',
        { event: 'ball_possession_change' },
        (payload: any) => {
          const possession = payload.payload as BallPossessionEvent;
          const player = allPlayers.find(p => p.id === possession.player_id);
          
          if (!player) {
            console.warn('Received possession for unknown player:', possession.player_id);
            return;
          }
          
          setCurrentBallHolder(player);
          setLastPossession(possession);

          // For player trackers: Add to pending queue if it's one of assigned players
          if (trackerType === 'player') {
            const isMyPlayer = assignment?.assigned_players?.some(p => p.id === possession.player_id);
            
            if (isMyPlayer) {
              // Add to pending events queue
              const newEvent: PendingEvent = {
                id: `event-${eventIdCounter.current++}-${possession.player_id}-${possession.timestamp}`,
                player: player,
                timestamp: possession.timestamp,
                age_seconds: 0,
                priority: 'urgent',
                tracker_id: trackerId
              };
              
              setPendingEvents(prev => [...prev, newEvent]);
              
              // Audio cue (optional)
              // new Audio('/notification.mp3').play().catch(() => {});
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, trackerType, assignment, allPlayers, trackerId, supabase]);

  // Ball tracker: update ball possession
  const updateBallPossession = useCallback(async (player: Player) => {
    if (trackerType !== 'ball') return;
    if (processingRef.current) return;

    processingRef.current = true;

    try {
      const possessionEvent: BallPossessionEvent = {
        player_id: player.id,
        team: player.team,
        timestamp: Date.now(),
        tracker_id: trackerId
      };

      // Infer event based on last possession
      if (lastPossession) {
        await inferEvent(lastPossession, possessionEvent);
      }

      // Record possession change
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

      if (insertError) throw insertError;

      // Broadcast to all trackers
      if (channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'ball_possession_change',
          payload: possessionEvent
        });
      }

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
  }, [trackerType, trackerId, lastPossession, matchId, toast, supabase]);

  // Event inference logic
  const inferEvent = useCallback(async (
    prev: BallPossessionEvent,
    current: BallPossessionEvent
  ) => {
    try {
      if (prev.player_id === current.player_id) {
        const timeDiff = current.timestamp - prev.timestamp;
        if (timeDiff > 2000) {
          await recordInferredEvent('dribble', current);
        }
        return;
      }

      if (prev.team === current.team) {
        await recordInferredEvent('pass', prev, current);
        return;
      }

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

      const { error } = await supabase.from('match_events').insert([eventData]);
      if (error) throw error;

      toast({
        title: 'Event Recorded',
        description: `${eventType} detected automatically`,
        duration: 2000
      });
    } catch (error) {
      console.error('Error in recordInferredEvent:', error);
    }
  }, [matchId, trackerId, toast, supabase]);

  // Record event for a specific pending event
  const recordEventForPending = useCallback(async (
    pendingEventId: string,
    eventType: string,
    details?: Record<string, any>
  ) => {
    const pendingEvent = pendingEvents.find(e => e.id === pendingEventId);
    if (!pendingEvent) return;

    try {
      const eventData = {
        match_id: matchId,
        event_type: eventType,
        player_id: pendingEvent.player.id,
        team: pendingEvent.player.team,
        timestamp: Math.floor(pendingEvent.timestamp / 1000), // Use original timestamp!
        created_by: trackerId,
        event_data: {
          ...details,
          tracker_type: 'player',
          recorded_at: new Date().toISOString(),
          delay_seconds: Math.floor((Date.now() - pendingEvent.timestamp) / 1000)
        }
      };

      const { error } = await supabase.from('match_events').insert([eventData]);
      if (error) throw error;

      // Remove from pending queue
      setPendingEvents(prev => prev.filter(e => e.id !== pendingEventId));

      toast({
        title: 'Event Recorded',
        description: `${eventType} for #${pendingEvent.player.jersey_number} ${pendingEvent.player.player_name}`,
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
  }, [pendingEvents, matchId, trackerId, toast, supabase]);

  // Clear a pending event without recording
  const clearPendingEvent = useCallback((pendingEventId: string) => {
    setPendingEvents(prev => prev.filter(e => e.id !== pendingEventId));
  }, []);

  // Clear all pending events
  const clearAllPendingEvents = useCallback(() => {
    setPendingEvents([]);
    toast({
      title: 'Queue Cleared',
      description: 'All pending events cleared',
      duration: 2000
    });
  }, [toast]);

  return {
    assignment,
    currentBallHolder,
    pendingEvents,
    updateBallPossession,
    recordEventForPending,
    clearPendingEvent,
    clearAllPendingEvents,
    lastPossession
  };
};
