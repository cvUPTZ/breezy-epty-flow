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

// State management with reducer for better control
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
        recentEvents: [action.payload, ...state.recentEvents.slice(0, 4)],
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
}

// Data validation utilities
const validatePlayerData = (data: unknown): PlayerForPianoInput[] => {
  if (!data) return [];
  
  let parsed: any[];
  
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      return [];
    }
  } else if (Array.isArray(data)) {
    parsed = data;
  } else {
    return [];
  }
  
  return parsed.filter((item): item is PlayerForPianoInput => 
    item &&
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    item.name.trim().length > 0
  );
};

const validateAssignmentData = (data: unknown): boolean => {
  return Array.isArray(data) && data.every(item =>
    item &&
    typeof item === 'object' &&
    typeof item.tracker_user_id === 'string' &&
    (typeof item.assigned_player_id === 'number' || item.assigned_player_id === null) &&
    (Array.isArray(item.assigned_event_types) || item.assigned_event_types === null)
  );
};

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TrackerPianoInput Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2 text-red-600">Component Error</div>
            <div className="text-sm text-gray-600 mb-4">
              An unexpected error occurred. Please refresh the page.
            </div>
            <Button 
              onClick={() => this.setState({ hasError: false })}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const TrackerPianoInput: React.FC<TrackerPianoInputProps> = ({ matchId, onRecordEvent }) => {
  const [state, dispatch] = useReducer(trackerReducer, initialState);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Refs for cleanup and abort control
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef<Set<string>>(new Set());

  // Memoized values to prevent unnecessary re-renders
  const userIdForConnection = useMemo(() => user?.id || '', [user?.id]);
  const totalAssignedPlayers = useMemo(() => 
    (state.assignedPlayers?.home?.length || 0) + (state.assignedPlayers?.away?.length || 0),
    [state.assignedPlayers]
  );
  const isEliteView = totalAssignedPlayers > 1;
  const showPlayerSelection = !isEliteView && 
    state.fullMatchRoster && 
    ((state.fullMatchRoster.home?.length || 0) + (state.fullMatchRoster.away?.length || 0)) > 1;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
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

  // Safe async operation wrapper
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
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      
      const result = await operation();
      return mountedRef.current ? result : null;
    } catch (error: any) {
      if (error.name !== 'AbortError' && mountedRef.current) {
        console.error(`Error in ${operationKey}:`, error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Operation failed' });
      }
      return null;
    } finally {
      fetchingRef.current.delete(operationKey);
    }
  }, []);

  // Fetch match roster
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
        .single();
      
      if (matchError) throw matchError;
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

      if (error) throw error;
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

      // Process assigned players with better ID resolution
      const assignedPlayers: AssignedPlayers = { home: [], away: [] };
      
      data.forEach(assignment => {
        const team = assignment.player_team_id as 'home' | 'away';
        if (!team || !state.fullMatchRoster) return;

        const teamRoster = state.fullMatchRoster[team];
        if (!teamRoster?.length) return;

        // Extract player IDs with fallback logic
        let playerIds: number[] = [];
        if (Array.isArray(assignment.assigned_player_ids)) {
          playerIds = assignment.assigned_player_ids.filter((id: any) => 
            typeof id === 'number' && !isNaN(id)
          );
        } else if (typeof assignment.assigned_player_id === 'number') {
          playerIds = [assignment.assigned_player_id];
        }

        // Find and add players
        playerIds.forEach(playerId => {
          const player = teamRoster.find(p => p.id === playerId);
          if (player && !assignedPlayers[team].some(p => p.id === player.id)) {
            assignedPlayers[team].push(player);
          }
        });
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
    if (state.assignedPlayers && !state.selectedPlayer) {
      const allAssigned = [...state.assignedPlayers.home, ...state.assignedPlayers.away];
      if (allAssigned.length === 1) {
        const player = allAssigned[0];
        const team = state.assignedPlayers.home.includes(player) ? 'home' : 'away';
        dispatch({ 
          type: 'SET_SELECTED_PLAYER', 
          payload: { player, team } 
        });
      }
    }
  }, [state.assignedPlayers, state.selectedPlayer]);

  // Initialize data fetching
  useEffect(() => {
    fetchMatchDetails();
  }, [fetchMatchDetails]);

  useEffect(() => {
    if (state.fullMatchRoster) {
      fetchAssignments();
    }
  }, [fetchAssignments, state.fullMatchRoster]);

  // Real-time connection
  const { isConnected } = useRealtimeMatch({
    matchId,
    onEventReceived: (event) => {
      if (mountedRef.current && event.created_by === user?.id) {
        const eventInfo: RecentEvent = {
          id: event.id,
          eventType: { key: event.type, label: event.type },
          player: state.selectedPlayer,
          timestamp: Date.now()
        };
        dispatch({ type: 'ADD_RECENT_EVENT', payload: eventInfo });
      }
    }
  });
  
  const { broadcastStatus } = useUnifiedTrackerConnection(matchId, userIdForConnection);

  // Event handlers
  const handleCancelEvent = useCallback(async (eventId: string, eventTypeKey: string) => {
    return safeAsync(async () => {
      const { error } = await supabase
        .from('match_events')
        .delete()
        .eq('id', eventId)
        .abortSignal(abortControllerRef.current!.signal);
      
      if (error) throw error;

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
      console.error('Error in onRecordEvent:', error);
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

  // Render loading state
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

  // Render error state
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

  // Render no assignments state
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
    <ErrorBoundary onError={(error) => dispatch({ type: 'SET_ERROR', payload: `Component error: ${error.message}` })}>
      <div className="space-y-2 p-1 sm:p-2">
        {/* Connection Warning */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2"
          >
            <div className="text-sm text-yellow-800">
              <span className="font-medium">Connection Warning:</span> Real-time updates may be delayed.
            </div>
          </motion.div>
        )}

        {/* Recent Events */}
        <AnimatePresence>
          {state.recentEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="my-2 bg-white/60 backdrop-blur-xl border-slate-200/80 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-200/80 bg-slate-80/50">
                  <CardTitle className="text-base text-slate-800">
                    Recent Events (Click to Cancel)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-2 justify-start">
                    {state.recentEvents.map((event) => (
                      <CancelActionIndicator
                        key={event.id}
                        eventType={event.eventType.key as any}
                        onCancel={() => handleCancelEvent(event.id, event.eventType.key)}
                        onExpire={() => handleEventExpire(event.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player Selection */}
        {showPlayerSelection && state.assignedPlayers && (
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-semibold">
                Select Player from Your Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {(['home', 'away'] as const).map(team => {
                const players = state.assignedPlayers?.[team];
                if (!players?.length) return null;
                
                return (
                  <div key={team}>
                    <h4 className="text-sm font-semibold mb-1.5 capitalize">
                      {team} Team
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                      {players.map(player => (
                        <Button 
                          key={player.id} 
                          onClick={() => handlePlayerSelect(player, team)} 
                          variant={state.selectedPlayer?.id === player.id ? "default" : "outline"} 
                          size="sm" 
                          className="justify-start text-sm"
                          aria-pressed={state.selectedPlayer?.id === player.id}
                        >
                          {player.jersey_number && `#${player.jersey_number} `}
                          {player.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Event Type Selection */}
        {state.assignedEventTypes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.33, delay: 0.13 }}
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-xl p-3 sm:p-4 shadow-lg border border-purple-200">
              <div className="text-center mb-3">
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Record Events
                </h2>
                <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                  {!isEliteView 
                    ? (state.selectedPlayer 
                        ? `Recording for ${state.selectedPlayer.name}` 
                        : "Select a player, then tap event type"
                      )
                    : "Select a player and record an event"
                  }
                </p>
              </div>

              {!isEliteView && (
                <EventGrid 
                  eventTypes={state.assignedEventTypes}
                  selectedPlayer={state.selectedPlayer}
                  isRecording={state.isRecording}
                  recordingEventType={state.recordingEventType}
                  onEventClick={handleEventTypeClick}
                  onValidationError={() => {
                    toast({ 
                      title: "No Player Selected", 
                      description: "Please select a player before recording an event.", 
                      variant: "destructive"
                    });
                  }}
                />
              )}

              {isEliteView && state.assignedPlayers && (
                <EliteView 
                  assignedPlayers={state.assignedPlayers}
                  eventTypes={state.assignedEventTypes}
                  selectedPlayer={state.selectedPlayer}
                  isRecording={state.isRecording}
                  recordingEventType={state.recordingEventType}
                  onPlayerSelect={handlePlayerSelect}
                  onEventClick={handleEventTypeClick}
                />
              )}

              {state.isRecording && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.88 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="mt-3 text-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow">
                    <motion.div 
                      className="w-2.5 h-2.5 bg-white rounded-full" 
                      animate={{ scale: [1, 1.35, 1] }} 
                      transition={{ duration: 0.5, repeat: Infinity }} 
                    />
                    Recording Event...
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  );
};

// Event Grid Component (unchanged but with better props)
interface EventGridProps {
  eventTypes: EnhancedEventType[];
  selectedPlayer: PlayerForPianoInput | null;
  isRecording: boolean;
  recordingEventType: string | null;
  onEventClick: (eventType: EnhancedEventType) => void;
  onValidationError: () => void;
}

const EventGrid: React.FC<EventGridProps> = React.memo(({
  eventTypes,
  selectedPlayer,
  isRecording,
  recordingEventType,
  onEventClick,
  onValidationError
}) => (
  <div className="flex justify-center">
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-3 gap-y-6">
      {eventTypes.map(eventType => {
        const isRecordingThis = isRecording && recordingEventType === eventType.key;
        
        return (
          <div key={eventType.key} className="flex flex-col items-center justify-start gap-2">
            <button
              onClick={() => {
                if (!selectedPlayer) {
                  onValidationError();
                  return;
                }
                onEventClick(eventType);
              }}
              disabled={isRecording}
              aria-label={`Record ${eventType.label} event`}
              aria-pressed={isRecordingThis}
              className="relative flex items-center justify-center rounded-full border bg-gradient-to-br from-white/70 to-slate-100/70 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-16 h-16 sm:w-20 sm:h-20"
            >
              <EventTypeSvg eventType={eventType.key} size="sm" />
              {isRecordingThis && (
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-green-500 pointer-events-none" 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7]}} 
                  transition={{ duration: 0.8, repeat: Infinity }} 
                />
              )}
            </button>
            <span className="font-semibold text-slate-700 text-center leading-tight text-xs sm:text-sm max-w-[80px] break-words">
              {eventType.label}
            </span>
          </div>
        );
      })}
    </div>
  </div>
));

// Elite View Component with better performance
interface EliteViewProps {
  assignedPlayers: AssignedPlayers;
  eventTypes: EnhancedEventType[];
  selectedPlayer: PlayerForPianoInput | null;
  isRecording: boolean;
  recordingEventType: string | null;
  onPlayerSelect: (player: PlayerForPianoInput, team: 'home' | 'away') => void;
  onEventClick: (eventType: EnhancedEventType) => void;
}

const EliteView: React.FC<EliteViewProps> = React.memo(({
  assignedPlayers,
  eventTypes,
  selectedPlayer,
  isRecording,
  recordingEventType,
  onPlayerSelect,
  onEventClick
}) => {
  const allPlayersList = useMemo(
    () => [...assignedPlayers.home, ...assignedPlayers.away],
    [assignedPlayers.home, assignedPlayers.away]
  );
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {allPlayersList.map(player => {
        const isHome = assignedPlayers.home.includes(player);
        const team = isHome ? 'home' : 'away';
        const isSelected = selectedPlayer?.id === player.id;
        
        return (
          <div 
            key={player.id} 
            className={`border rounded-lg p-3 transition-all duration-300 ease-in-out ${
              isSelected 
                ? 'bg-green-50 dark:bg-green-900 border-green-400 dark:border-green-600 ring-1 ring-green-500 shadow-sm' 
                : 'bg-white dark:bg-slate-800 hover:shadow'
            }`}
          >
            <CardTitle 
              className={`mb-3 cursor-pointer flex items-center justify-between px-1.5 py-1 rounded text-sm ${
                isSelected 
                  ? 'text-green-600 dark:text-green-200 bg-green-100 dark:bg-green-800' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              onClick={() => onPlayerSelect(player, team)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPlayerSelect(player, team);
                }
              }}
            >
              <div className="truncate">
                {player.jersey_number && (
                  <span className="font-semibold">#{player.jersey_number} </span>
                )}
                <span className="font-medium">{player.name}</span>
                <span className={`text-xs ml-1 px-1 rounded-full ${
                  isHome 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-200' 
                    : 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-200'
                }`}>
                  {isHome ? 'H' : 'A'}
                </span>
              </div>
              {isSelected && (
                <span className="text-xs font-semibold px-1 py-0 bg-green-500 text-white rounded-full shadow-sm">
                  SEL
                </span>
              )}
            </CardTitle>
            
            <div className="flex justify-center">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-2 gap-y-4">
                {eventTypes.map(eventType => {
                  const isRecordingThis = isRecording && 
                    recordingEventType === eventType.key && 
                    selectedPlayer?.id === player.id;
                  
                  return (
                    <div key={`${player.id}-${eventType.key}`} className="flex flex-col items-center justify-start gap-2">
                      <button
                        onClick={() => {
                          onPlayerSelect(player, team);
                          onEventClick(eventType);
                        }}
                        disabled={isRecording}
                        aria-label={`Record ${eventType.label} event for ${player.name}`}
                        aria-pressed={isRecordingThis}
                        className="relative flex items-center justify-center rounded-full border bg-gradient-to-br from-white/70 to-slate-100/70 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-14 h-14 sm:w-16 sm:h-16"
                      >
                        <EventTypeSvg eventType={eventType.key} size="xs" />
                        {isRecordingThis && (
                          <motion.div 
                            className="absolute inset-0 rounded-full border-2 border-green-500 pointer-events-none" 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7]}} 
                            transition={{ duration: 0.8, repeat: Infinity }} 
                          />
                        )}
                      </button>
                      <span className="font-semibold text-slate-700 text-center leading-tight text-xs max-w-[64px] break-words">
                        {eventType.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default TrackerPianoInput;
