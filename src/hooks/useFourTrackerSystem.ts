import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

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

export const useFourTrackerSystem = ({
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const channelRef = useRef<any>(null);
  const processingRef = useRef(false);
  const eventIdCounter = useRef(0);
  const lastEventTimestampRef = useRef<number>(0);
  const pendingOperationsRef = useRef<Map<string, boolean>>(new Map());

  // Stable player IDs for dependency tracking
  const assignedPlayerIds = useMemo(() =>
    assignment?.assigned_players?.map(p => p.id).sort().join(',') || '',
    [assignment]
  );

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Back Online',
        description: 'Connection restored',
        duration: 2000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Offline',
        description: 'No internet connection. Events will not be saved.',
        variant: 'destructive',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Update event ages every second (optimized)
  useEffect(() => {
    if (pendingEvents.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setPendingEvents(prev =>
        prev.map(event => {
          const age = Math.floor((now - event.timestamp) / 1000);
          let priority: 'urgent' | 'normal' | 'old' = 'normal';

          if (age < 5) priority = 'urgent';
          else if (age < 15) priority = 'normal';
          else priority = 'old';

          return { ...event, age_seconds: age, priority };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingEvents.length > 0]);

  // Auto-clear old events
  useEffect(() => {
    if (pendingEvents.length === 0) return;

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
    }, 5000);

    return () => clearInterval(interval);
  }, [pendingEvents.length > 0, toast]);

  // Fetch tracker assignment
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
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

        // Database uses Postgres ARRAY type, not JSON
        // Supabase returns these as JavaScript arrays directly
        const assignedPlayerIds: number[] = assignmentData.assigned_player_ids || [];
        const assignedEventTypes: string[] = assignmentData.assigned_event_types || [];

        // Validate types
        if (!Array.isArray(assignedPlayerIds)) {
          console.error('assigned_player_ids is not an array:', assignedPlayerIds);
          toast({
            title: 'Data Error',
            description: 'Invalid player assignment data format',
            variant: 'destructive',
          });
          return;
        }

        if (!Array.isArray(assignedEventTypes)) {
          console.error('assigned_event_types is not an array:', assignedEventTypes);
          toast({
            title: 'Data Error',
            description: 'Invalid event types data format',
            variant: 'destructive',
          });
          return;
        }

        const assignedPlayers: Player[] = assignedPlayerIds
          .map((playerId: number) => allPlayers.find((p: Player) => p.id === playerId))
          .filter((p: Player | undefined): p is Player => p !== undefined);

        setAssignment({
          tracker_id: trackerId,
          tracker_name: 'Unknown Tracker',
          tracker_type: (assignmentData.tracker_type || 'player') as 'ball' | 'player',
          assigned_players: assignedPlayers,
          assigned_event_types: assignedEventTypes,
        });
      } catch (error) {
        console.error('Error in fetchAssignment:', error);
        toast({
          title: 'Assignment Error',
          description: 'Failed to load tracker assignment. Please check your assignment data.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    };

    if (trackerId && matchId && allPlayers.length > 0) {
      fetchAssignment();
    }
  }, [matchId, trackerId, allPlayers, supabase, toast]);

  // Subscribe to ball possession changes (fixed dependencies)
  useEffect(() => {
    if (!matchId || !trackerId) return;

    const channel = supabase
      .channel(`ball-possession-${matchId}`)
      .on(
        'broadcast',
        { event: 'ball_possession_change' },
        (payload: any) => {
          const possession = payload.payload as BallPossessionEvent;
          console.log('🔔 Received possession change:', possession);

          const player = allPlayers.find(p => p.id === possession.player_id);

          if (!player) {
            console.warn('❌ Received possession for unknown player:', possession.player_id);
            return;
          }

          console.log('✅ Player found:', player);
          setCurrentBallHolder(player);
          setLastPossession(possession);

          // For player trackers: Add to pending queue if it's one of assigned players
          if (trackerType === 'player') {
            console.log('👤 Processing for player tracker...');

            // Use callback form to get latest assignment state
            setAssignment(currentAssignment => {
              console.log('📋 Current assignment:', currentAssignment);

              if (!currentAssignment) {
                console.warn('⚠️ No assignment loaded yet');
                return currentAssignment;
              }

              const isMyPlayer = currentAssignment.assigned_players?.some(p => p.id === possession.player_id);
              console.log(`🎯 Is this my player (#${player.jersey_number})? ${isMyPlayer}`);

              if (isMyPlayer) {
                // Improved duplicate prevention
                const now = Date.now();
                const timeSinceLastEvent = now - lastEventTimestampRef.current;

                if (timeSinceLastEvent < 500) {
                  console.log('⏭️ Skipping - too soon since last event');
                  return currentAssignment;
                }

                lastEventTimestampRef.current = now;

                // Create unique event ID
                const newEvent: PendingEvent = {
                  id: `event-${trackerId}-${possession.player_id}-${possession.timestamp}`,
                  player: player,
                  timestamp: possession.timestamp,
                  age_seconds: 0,
                  priority: 'urgent',
                  tracker_id: trackerId
                };

                console.log('➕ Adding to pending queue:', newEvent);

                setPendingEvents(prev => {
                  // Prevent adding exact duplicate
                  if (prev.some(e => e.id === newEvent.id)) {
                    console.log('⚠️ Event already in queue');
                    return prev;
                  }
                  console.log('✅ Event added to queue');
                  return [...prev, newEvent];
                });
              }

              return currentAssignment;
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [matchId, trackerId, trackerType, assignedPlayerIds, supabase]); // Use stable IDs

  // Ball tracker: update ball possession
  const updateBallPossession = useCallback(async (player: Player) => {
    if (trackerType !== 'ball') return;
    if (processingRef.current) return;
    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Cannot update possession while offline',
        variant: 'destructive'
      });
      return;
    }

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

      // Record possession change with millisecond precision
      const { error: insertError } = await supabase.from('match_events').insert([{
        match_id: matchId,
        event_type: 'ball_possession_change',
        player_id: player.id,
        team: player.team,
        timestamp: possessionEvent.timestamp, // Keep milliseconds
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
  }, [trackerType, trackerId, lastPossession, matchId, isOnline, toast, supabase]);

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
        timestamp: current.timestamp, // Keep milliseconds
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

  // Record event for a specific pending event (with optimistic update)
  const recordEventForPending = useCallback(async (
    pendingEventId: string,
    eventType: string,
    details?: Record<string, any>
  ) => {
    const pendingEvent = pendingEvents.find(e => e.id === pendingEventId);
    if (!pendingEvent) return;

    // Prevent duplicate operations
    if (pendingOperationsRef.current.get(pendingEventId)) return;
    pendingOperationsRef.current.set(pendingEventId, true);

    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Cannot record events while offline',
        variant: 'destructive'
      });
      pendingOperationsRef.current.delete(pendingEventId);
      return;
    }

    // Optimistic update - remove immediately
    setPendingEvents(prev => prev.filter(e => e.id !== pendingEventId));

    try {
      const eventData = {
        match_id: matchId,
        event_type: eventType,
        player_id: pendingEvent.player.id,
        team: pendingEvent.player.team,
        timestamp: pendingEvent.timestamp, // Keep milliseconds
        created_by: trackerId,
        event_data: {
          ...details,
          tracker_type: 'player',
          pending_event_id: pendingEventId, // Add this!
          recorded_at: new Date().toISOString(),
          delay_seconds: Math.floor((Date.now() - pendingEvent.timestamp) / 1000)
        }
      };

      const { error } = await supabase.from('match_events').insert([eventData]);
      if (error) throw error;

      toast({
        title: 'Event Recorded',
        description: `${eventType} for #${pendingEvent.player.jersey_number} ${pendingEvent.player.player_name}`,
        duration: 2000
      });
    } catch (error) {
      console.error('Error recording event:', error);

      // Rollback optimistic update on failure
      setPendingEvents(prev => [...prev, pendingEvent].sort((a, b) => a.timestamp - b.timestamp));

      toast({
        title: 'Error',
        description: 'Failed to record event. Event restored to queue.',
        variant: 'destructive'
      });
    } finally {
      pendingOperationsRef.current.delete(pendingEventId);
    }
  }, [pendingEvents, matchId, trackerId, isOnline, toast, supabase]);

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

  // Mark all pending events as "pass" (atomic operation)
  const markAllAsPass = useCallback(async () => {
    const eventsToProcess = [...pendingEvents];
    if (eventsToProcess.length === 0) return;

    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Cannot record events while offline',
        variant: 'destructive'
      });
      return;
    }

    // Optimistic update
    const eventIds = eventsToProcess.map(e => e.id);
    setPendingEvents([]);

    try {
      const eventsData = eventsToProcess.map(pendingEvent => ({
        match_id: matchId,
        event_type: 'pass',
        player_id: pendingEvent.player.id,
        team: pendingEvent.player.team,
        timestamp: pendingEvent.timestamp, // Keep milliseconds
        created_by: trackerId,
        event_data: {
          tracker_type: 'player',
          pending_event_id: pendingEvent.id, // Add this!
          recorded_at: new Date().toISOString(),
          delay_seconds: Math.floor((Date.now() - pendingEvent.timestamp) / 1000),
          batch_operation: true
        }
      }));

      const { error, data } = await supabase.from('match_events').insert(eventsData).select();

      if (error) throw error;

      // Verify all events were inserted
      if (data && data.length !== eventsData.length) {
        throw new Error(`Only ${data.length} of ${eventsData.length} events were recorded`);
      }

      toast({
        title: 'Batch Operation Complete',
        description: `Marked all ${eventsToProcess.length} pending events as 'Pass'.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error in markAllAsPass:', error);

      // Rollback optimistic update on failure
      setPendingEvents(eventsToProcess);

      toast({
        title: 'Error',
        description: 'Failed to mark all events as pass. Events restored to queue.',
        variant: 'destructive',
        duration: 5000
      });
    }
  }, [pendingEvents, matchId, trackerId, isOnline, toast, supabase]);

  return {
    assignment,
    currentBallHolder,
    pendingEvents,
    updateBallPossession,
    recordEventForPending,
    clearPendingEvent,
    clearAllPendingEvents,
    markAllAsPass,
    lastPossession,
    isOnline
  };
};
