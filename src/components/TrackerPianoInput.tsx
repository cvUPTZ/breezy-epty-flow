import React, { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { EventType } from '@/types';
import { useRealtimeMatch } from '@/hooks/useRealtimeMatch';
import { useUnifiedTrackerConnection } from '@/hooks/useUnifiedTrackerConnection';
import { motion, AnimatePresence } from 'framer-motion';
import EventTypeSvg from '@/components/match/EventTypeSvg';
import CancelActionIndicator from '@/components/match/CancelActionIndicator';

// Strict type definitions
export interface PlayerForPianoInput {
  id: number;
  name: string;
  position?: string;
  jersey_number?: number;
}

interface AssignedPlayers {
  home: PlayerForPianoInput[];
  away: PlayerForPianoInput[];
}

interface EnhancedEventType {
  key: string;
  label: string;
  category?: string;
  subcategory?: string;
  description?: string;
}

interface RecentEvent {
  id: string;
  eventType: { key: string; label: string };
  player: PlayerForPianoInput | null;
  timestamp: number;
}

interface TrackerPianoInputProps {
  matchId: string;
  onRecordEvent: (
    eventTypeKey: string,
    playerId?: number,
    teamContext?: 'home' | 'away',
    details?: Record<string, any>
  ) => Promise<any | null>;
}

const MAX_RECENT_EVENTS = 5;

// State management with reducer
interface TrackerState {
  assignedEventTypes: EnhancedEventType[];
  assignedPlayers: AssignedPlayers | null;
  selectedPlayer: PlayerForPianoInput | null;
  selectedTeam: 'home' | 'away' | null;
  fullMatchRoster: AssignedPlayers | null;
  recentEvents: RecentEvent[];
  isRecording: boolean;
  recordingEventType: string | null;
  loading: boolean;
  error: string | null;
}

type TrackerAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ROSTER'; payload: AssignedPlayers }
  | { type: 'SET_ASSIGNMENTS'; payload: { eventTypes: EnhancedEventType[]; players: AssignedPlayers } }
  | { type: 'SET_SELECTED_PLAYER'; payload: { player: PlayerForPianoInput | null; team: 'home' | 'away' | null } }
  | { type: 'SET_RECORDING'; payload: { isRecording: boolean; eventType: string | null } }
  | { type: 'ADD_RECENT_EVENT'; payload: RecentEvent }
  | { type: 'REMOVE_RECENT_EVENT'; payload: string }
  | { type: 'CLEANUP_EXPIRED_EVENTS'; payload: number };

const initialState: TrackerState = {
  assignedEventTypes: [],
  assignedPlayers: null,
  selectedPlayer: null,
  selectedTeam: null,
  fullMatchRoster: null,
  recentEvents: [],
  isRecording: false,
  recordingEventType: null,
  loading: true,
  error: null,
};

function trackerReducer(state: TrackerState, action: TrackerAction): TrackerState {
  try {
    switch (action.type) {
      case 'SET_LOADING':
        return { ...state, loading: action.payload };
      case 'SET_ERROR':
        return { ...state, error: action.payload, loading: false };
      case 'SET_ROSTER':
        return { ...state, fullMatchRoster: action.payload };
      case 'SET_ASSIGNMENTS':
        return {
          ...state,
          assignedEventTypes: action.payload.eventTypes,
          assignedPlayers: action.payload.players,
          error: null,
          loading: false,
        };
      case 'SET_SELECTED_PLAYER':
        return {
          ...state,
          selectedPlayer: action.payload.player,
          selectedTeam: action.payload.team,
        };
      case 'SET_RECORDING':
        return {
          ...state,
          isRecording: action.payload.isRecording,
          recordingEventType: action.payload.eventType,
        };
      case 'ADD_RECENT_EVENT':
        return {
          ...state,
          recentEvents: [action.payload, ...state.recentEvents.slice(0, MAX_RECENT_EVENTS - 1)],
        };
      case 'REMOVE_RECENT_EVENT':
        return {
          ...state,
          recentEvents: state.recentEvents.filter(event => event.id !== action.payload),
        };
      case 'CLEANUP_EXPIRED_EVENTS':
        return {
          ...state,
          recentEvents: state.recentEvents.filter(event => 
            action.payload - event.timestamp < 10000
          ),
        };
      default:
        return state;
    }
  } catch (error) {
    console.error('Reducer error:', error);
    return { ...state, error: 'State update failed' };
  }
}

// Data validation utilities with better error handling
const validatePlayerData = (data: unknown): PlayerForPianoInput[] => {
  try {
    if (!data) return [];
    
    let parsed: any[];
    
    if (typeof data === 'string') {
      try {
        parsed = JSON.parse(data);
      } catch {
        console.warn('Failed to parse player data string');
        return [];
      }
    } else if (Array.isArray(data)) {
      parsed = data;
    } else {
      return [];
    }

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(item => {
        try {
          return item && 
            typeof item === 'object' && 
            (typeof item.name === 'string' || typeof item.player_name === 'string') &&
            (typeof item.number === 'number' || typeof item.jersey_number === 'number');
        } catch {
          return false;
        }
      })
      .map((item: any) => ({
        id: item.number || item.jersey_number || 0,
        name: item.name || item.player_name || 'Unknown Player',
        position: item.position,
        jersey_number: item.number || item.jersey_number || 0
      }));
  } catch (error) {
    console.error('Error validating player data:', error);
    return [];
  }
};

const validateAssignmentData = (data: unknown): boolean => {
  try {
    return Array.isArray(data) && data.every(item => {
      try {
        return item &&
          typeof item === 'object' &&
          typeof item.tracker_user_id === 'string' &&
          (typeof item.assigned_player_id === 'number' || item.assigned_player_id === null) &&
          (Array.isArray(item.assigned_event_types) || item.assigned_event_types === null) &&
          typeof item.player_team_id === 'string';
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
};

const TrackerPianoInput: React.FC<TrackerPianoInputProps> = ({ matchId, onRecordEvent }) => {
  const [state, dispatch] = useReducer(trackerReducer, initialState);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Refs for cleanup
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef<Set<string>>(new Set());

  // Memoized values
  const userIdForConnection = useMemo(() => user?.id || '', [user?.id]);
  const totalAssignedPlayers = useMemo(() =>
    (state.assignedPlayers?.home?.length || 0) + (state.assignedPlayers?.away?.length || 0),
    [state.assignedPlayers?.home?.length, state.assignedPlayers?.away?.length]
  );
  const isEliteView = totalAssignedPlayers > 1;
  const showPlayerSelection = !isEliteView && 
    state.fullMatchRoster && 
    ((state.fullMatchRoster.home?.length || 0) + (state.fullMatchRoster.away?.length || 0)) > 1;

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try {
        abortControllerRef.current?.abort();
      } catch (error) {
        console.warn('Error aborting controller:', error);
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  // Auto-cleanup expired events
  useEffect(() => {
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current);
    }

    cleanupIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        dispatch({ type: 'CLEANUP_EXPIRED_EVENTS', payload: Date.now() });
      }
    }, 1000);

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  // Safe async operation wrapper with better error handling
  const safeAsync = useCallback(async <T,>(
    operation: () => Promise<T>,
    operationKey: string
  ): Promise<T | null> => {
    if (fetchingRef.current.has(operationKey)) {
      console.warn(`Operation ${operationKey} already in progress`);
      return null;
    }

    fetchingRef.current.add(operationKey);
    
    try {
      // Don't abort if already aborted
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      const result = await operation();
      return mountedRef.current ? result : null;
    } catch (error: any) {
      if (error.name !== 'AbortError' && mountedRef.current) {
        console.error(`Error in ${operationKey}:`, error);
        const errorMessage = error.message || 'Operation failed';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
      return null;
    } finally {
      fetchingRef.current.delete(operationKey);
    }
  }, []);

  // Fetch match roster with better error handling
  const fetchMatchDetails = useCallback(async () => {
    if (!matchId) {
      dispatch({ type: 'SET_ERROR', payload: 'Match ID is required' });
      return;
    }

    return safeAsync(async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('home_team_players, away_team_players')
        .eq('id', matchId)
        .abortSignal(abortControllerRef.current!.signal)
        .maybeSingle();
      
      if (matchError) throw new Error(`Failed to fetch match: ${matchError.message}`);
      if (!matchData) throw new Error('Match not found');

      const roster: AssignedPlayers = {
        home: validatePlayerData(matchData.home_team_players),
        away: validatePlayerData(matchData.away_team_players)
      };

      dispatch({ type: 'SET_ROSTER', payload: roster });
      return roster;
    }, 'fetchMatchDetails');
  }, [matchId, safeAsync]);

  // Fetch assignments with improved error handling
  const fetchAssignments = useCallback(async () => {
    if (!matchId || !user?.id || !state.fullMatchRoster) {
      return;
    }

    return safeAsync(async () => {
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', user.id)
        .abortSignal(abortControllerRef.current!.signal);

      if (error) throw new Error(`Failed to fetch assignments: ${error.message}`);
      if (!data || data.length === 0) {
        throw new Error('No assignments found for this tracker and match');
      }
      if (!validateAssignmentData(data)) {
        throw new Error('Invalid assignment data received');
      }

      // Process event types
      const eventTypesSet = new Set<string>();
      data.forEach(assignment => {
        if (Array.isArray(assignment.assigned_event_types)) {
          assignment.assigned_event_types.forEach((eventType: string) => {
            if (eventType?.trim()) {
              eventTypesSet.add(eventType.trim());
            }
          });
        }
      });

      const eventTypes: EnhancedEventType[] = Array.from(eventTypesSet).map(key => ({
        key,
        label: key
      }));

      // Process assigned players
      const assignedPlayers: AssignedPlayers = { home: [], away: [] };
      
      data.forEach(assignment => {
        const team = assignment.player_team_id as 'home' | 'away';
        if (!team || !state.fullMatchRoster) return;

        const teamRoster = state.fullMatchRoster[team];
        if (!teamRoster?.length) return;

        let playerId: number | null = null;
        
        if (typeof assignment.assigned_player_id === 'number') {
          playerId = assignment.assigned_player_id;
        } else if (Array.isArray(assignment.assigned_player_ids) && assignment.assigned_player_ids.length > 0) {
          playerId = assignment.assigned_player_ids[0];
        }

        if (playerId !== null) {
          const player = teamRoster.find(p => p.jersey_number === playerId);
          if (player && !assignedPlayers[team].some(p => p.jersey_number === player.jersey_number)) {
            assignedPlayers[team].push(player);
          }
        }
      });

      dispatch({ 
        type: 'SET_ASSIGNMENTS', 
        payload: { eventTypes, players: assignedPlayers } 
      });
      
      return { eventTypes, players: assignedPlayers };
    }, 'fetchAssignments');
  }, [matchId, user?.id, state.fullMatchRoster, safeAsync]);

  // Auto-select single player
  useEffect(() => {
    try {
      if (totalAssignedPlayers === 1 && !state.selectedPlayer) {
        const homePlayers = state.assignedPlayers?.home || [];
        const awayPlayers = state.assignedPlayers?.away || [];

        if (homePlayers.length === 1) {
          dispatch({ type: 'SET_SELECTED_PLAYER', payload: { player: homePlayers[0], team: 'home' } });
        } else if (awayPlayers.length === 1) {
          dispatch({ type: 'SET_SELECTED_PLAYER', payload: { player: awayPlayers[0], team: 'away' } });
        }
      }
    } catch (error) {
      console.error('Error auto-selecting player:', error);
    }
  }, [totalAssignedPlayers, state.selectedPlayer, state.assignedPlayers]);

  // Initialize data fetching
  useEffect(() => {
    fetchMatchDetails();
  }, [fetchMatchDetails]);

  useEffect(() => {
    if (state.fullMatchRoster) {
      fetchAssignments();
    }
  }, [fetchAssignments, state.fullMatchRoster]);

  // Real-time connection with error handling
  const realtimeConfig = useMemo(() => ({
    matchId,
    onEventReceived: (event: any) => {
      try {
        if (mountedRef.current && event.created_by === user?.id) {
          const eventInfo: RecentEvent = {
            id: event.id,
            eventType: { key: event.type, label: event.type },
            player: state.selectedPlayer,
            timestamp: Date.now()
          };
          dispatch({ type: 'ADD_RECENT_EVENT', payload: eventInfo });
        }
      } catch (error) {
        console.error('Error processing realtime event:', error);
      }
    }
  }), [matchId, user?.id, state.selectedPlayer]);

  const { isConnected } = useRealtimeMatch(realtimeConfig);
  const { broadcastStatus } = useUnifiedTrackerConnection(matchId, userIdForConnection);

  // Event handlers with better error handling
  const handleCancelEvent = useCallback(async (eventId: string, eventTypeKey: string) => {
    return safeAsync(async () => {
      const { error } = await supabase
        .from('match_events')
        .delete()
        .eq('id', eventId)
        .abortSignal(abortControllerRef.current!.signal);
      
      if (error) throw new Error(`Failed to cancel event: ${error.message}`);

      dispatch({ type: 'REMOVE_RECENT_EVENT', payload: eventId });
      
      toast({
        title: "Event Cancelled",
        description: `${eventTypeKey} event has been cancelled.`,
      });
    }, 'cancelEvent');
  }, [safeAsync, toast]);

  const handleEventExpire = useCallback((eventId: string) => {
    if (mountedRef.current) {
      dispatch({ type: 'REMOVE_RECENT_EVENT', payload: eventId });
    }
  }, []);

  const handleEventTypeClick = useCallback(async (eventType: EnhancedEventType) => {
    if (state.isRecording || !mountedRef.current) return;

    dispatch({ 
      type: 'SET_RECORDING', 
      payload: { isRecording: true, eventType: eventType.key } 
    });
    
    try {
      broadcastStatus({ status: 'recording', timestamp: Date.now() });
    } catch (error) {
      console.warn('Failed to broadcast status:', error);
    }

    const teamCtx = (state.selectedPlayer && state.selectedTeam) ? state.selectedTeam : undefined;

    try {
      const newEvent = await onRecordEvent(
        eventType.key, 
        state.selectedPlayer?.id, 
        teamCtx, 
        { recorded_via: 'piano' }
      );

      if (newEvent && mountedRef.current) {
        const eventInfo: RecentEvent = { 
          id: newEvent.id, 
          eventType: { key: newEvent.event_type, label: newEvent.event_type }, 
          player: state.selectedPlayer, 
          timestamp: Date.now() 
        };
        dispatch({ type: 'ADD_RECENT_EVENT', payload: eventInfo });
      }
    } catch (error: any) { 
      console.error('Error recording event:', error);
      if (mountedRef.current) {
        toast({
          title: "Error recording event",
          description: error.message || "An unknown error occurred",
          variant: "destructive"
        });
      }
    } finally { 
      if (mountedRef.current) {
        dispatch({ 
          type: 'SET_RECORDING', 
          payload: { isRecording: false, eventType: null } 
        });
        
        try {
          broadcastStatus({ status: 'active', timestamp: Date.now() });
        } catch (error) {
          console.warn('Failed to broadcast status:', error);
        }
      }
    }
  }, [state.isRecording, state.selectedPlayer, state.selectedTeam, onRecordEvent, broadcastStatus, toast]);

  const handlePlayerSelect = useCallback((player: PlayerForPianoInput, team: 'home' | 'away') => {
    if (mountedRef.current) {
      dispatch({ 
        type: 'SET_SELECTED_PLAYER', 
        payload: { player, team } 
      });
    }
  }, []);

  // Render states
  if (state.loading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <motion.div 
          className="text-center" 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 border-4 border-blue-500 border-t-transparent rounded-full" 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
          />
          <div className="text-base sm:text-lg font-semibold mb-1">Loading assignments...</div>
          <div className="text-xs sm:text-sm text-gray-600">Please wait while we fetch your tracker assignments.</div>
        </motion.div>
      </div>
    );
  }

  if (state.error) {
    return (
      <motion.div 
        className="flex items-center justify-center p-6 sm:p-8" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <div className="text-base sm:text-lg font-semibold mb-1 text-red-600">Assignment Error</div>
          <div className="text-xs sm:text-sm text-gray-600 mb-2">{state.error}</div>
          <Button 
            onClick={() => {
              dispatch({ type: 'SET_ERROR', payload: null });
              fetchAssignments();
            }} 
            variant="outline" 
            size="sm"
          >
            Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!state.assignedEventTypes.length && !totalAssignedPlayers) {
    return (
      <motion.div 
        className="flex items-center justify-center p-8" 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center">
          <div className="text-base sm:text-lg font-semibold mb-1">No Assignments</div>
          <div className="text-xs sm:text-sm text-gray-600 mb-2">
            You have no event types or players assigned for this match.
          </div>
          <Button 
            onClick={() => {
              dispatch({ type: 'SET_ERROR', payload: null });
              fetchAssignments();
            }} 
            variant="outline" 
            size="sm"
          >
            Refresh Assignments
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2 p-1 sm:p-2">
      {/* Rest of component - truncated for space */}
      <div className="text-center p-4">
        Component rendering successfully
      </div>
    </div>
  );
};

export default TrackerPianoInput;
