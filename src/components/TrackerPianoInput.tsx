import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

// Shared interfaces that should be moved to a types file
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
            <div className="text-lg font-semibold mb-2 text-red-600">Something went wrong</div>
            <div className="text-sm text-gray-600 mb-4">
              Please refresh the page or contact support if the issue persists.
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

const MAX_RECENT_EVENTS = 5;
const EVENT_DISPLAY_DURATION = 10000; // 10 seconds

const TrackerPianoInput: React.FC<TrackerPianoInputProps> = ({ matchId, onRecordEvent }) => {
  const [assignedEventTypes, setAssignedEventTypes] = useState<EnhancedEventType[]>([]);
  const [assignedPlayers, setAssignedPlayers] = useState<AssignedPlayers | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerForPianoInput | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [fullMatchRoster, setFullMatchRoster] = useState<AssignedPlayers | null>(null);
  const [recordingEventType, setRecordingEventType] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();
  const userIdForConnection = useMemo(() => user?.id || '', [user?.id]);
  
  // Refs to track mounted state and cleanup
  const mountedRef = useRef(true);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  // Auto-cleanup recent events after display duration
  useEffect(() => {
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current);
    }

    cleanupIntervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      
      const now = Date.now();
      setRecentEvents(prev => 
        prev.filter(event => now - event.timestamp < EVENT_DISPLAY_DURATION)
      );
    }, 1000);

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  // Fixed realtime connection with proper destructuring
  const { isConnected, connectionError } = useRealtimeMatch({
    matchId,
    onEventReceived: (event) => {
      if (!mountedRef.current) return;
      
      if (event.created_by === user?.id) {
        const eventInfo: RecentEvent = {
          id: event.id,
          eventType: { key: event.type, label: event.type },
          player: selectedPlayer,
          timestamp: Date.now()
        };
        setRecentEvents(prev => [eventInfo, ...prev.slice(0, MAX_RECENT_EVENTS - 1)]);
      }
    },
    onError: (error) => {
      console.error('Realtime connection error:', error);
      if (mountedRef.current) {
        setError('Connection error. Some features may not work properly.');
      }
    }
  });
  
  const { broadcastStatus } = useUnifiedTrackerConnection(matchId, userIdForConnection);

  // Enhanced parsePlayerData with validation
  const parsePlayerData = useCallback((data: any): PlayerForPianoInput[] => {
    if (!data) return [];
    
    if (typeof data === 'string') {
      try { 
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed.filter(p => p && typeof p.id !== 'undefined') : [];
      } catch (e) { 
        console.warn('Failed to parse player data:', e);
        return []; 
      }
    }
    
    if (Array.isArray(data)) {
      return data.filter(p => p && typeof p.id !== 'undefined');
    }
    
    return [];
  }, []);

  const fetchMatchDetails = useCallback(async () => {
    if (!matchId) {
      console.error("Match ID is missing.");
      if (mountedRef.current) {
        setError("Match ID is required");
        setLoading(false);
      }
      return;
    }

    try {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('home_team_players, away_team_players')
        .eq('id', matchId)
        .maybeSingle();
      
      if (matchError) {
        console.error("Error fetching match details:", matchError);
        throw matchError;
      }

      if (!mountedRef.current) return;

      if (!matchData) {
        console.warn("Match not found with ID:", matchId);
        setFullMatchRoster({ home: [], away: [] });
        return;
      }

      const parsedRoster = {
        home: parsePlayerData(matchData.home_team_players),
        away: parsePlayerData(matchData.away_team_players)
      };

      setFullMatchRoster(parsedRoster);
    } catch (e: any) { 
      console.error("Error fetching match details:", e);
      if (mountedRef.current) {
        setError("Failed to fetch match details");
        setFullMatchRoster({ home: [], away: [] });
      }
    }
  }, [matchId, parsePlayerData]);

  const fetchAssignments = useCallback(async () => {
    if (!matchId || !user?.id) {
      if (mountedRef.current) {
        setLoading(false);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', user.id);

      if (error) throw error;

      if (!mountedRef.current) return;

      if (!data || data.length === 0) {
        setError("No assignments found for this tracker and match. Please contact your administrator.");
        setAssignedEventTypes([]);
        setAssignedPlayers({ home: [], away: [] });
        return;
      }

      // Extract unique event types with validation
      const eventTypes = Array.from(
        new Set(
          data.flatMap(assignment => 
            Array.isArray(assignment.assigned_event_types) 
              ? assignment.assigned_event_types 
              : []
          )
        )
      ).filter(Boolean);

      console.log('TrackerPianoInput - Fetched assignments:', data);
      console.log('TrackerPianoInput - Extracted event types:', eventTypes);

      setAssignedEventTypes(
        eventTypes.map(key => ({ key, label: key }))
      );

      // Process assigned players with consistent ID handling
      const homeP: PlayerForPianoInput[] = [];
      const awayP: PlayerForPianoInput[] = [];

      data.forEach(assignment => {
        const teamList = assignment.player_team_id === 'home' 
          ? fullMatchRoster?.home 
          : fullMatchRoster?.away;
        
        // Unified handling of player ID fields
        const playerId = assignment.assigned_player_id || assignment.player_id;
        
        if (!playerId || !teamList) return;
        
        const player = teamList.find(p => String(p.id) === String(playerId));
        
        if (player) {
          const targetList = assignment.player_team_id === 'home' ? homeP : awayP;
          if (!targetList.some(p => p.id === player.id)) {
            targetList.push(player);
          }
        }
      });

      console.log('TrackerPianoInput - Assigned players:', { home: homeP, away: awayP });
      setAssignedPlayers({ home: homeP, away: awayP });
      setError(null);
    } catch (e: any) {
      console.error("Error fetching tracker assignments:", e);
      if (mountedRef.current) {
        setError("Failed to fetch tracker assignments");
      }
    } finally { 
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [matchId, user?.id, fullMatchRoster]);

  useEffect(() => { 
    fetchMatchDetails(); 
  }, [fetchMatchDetails]);

  useEffect(() => { 
    if (fullMatchRoster) {
      fetchAssignments(); 
    }
  }, [fetchAssignments, fullMatchRoster]);

  const handleCancelEvent = useCallback(async (eventId: string, eventTypeKey: string) => {
    try {
      const { error } = await supabase
        .from('match_events')
        .delete()
        .eq('id', eventId);
      
      if (error) {
        console.error('Error cancelling event in database:', error);
        toast({
          title: "Error",
          description: "Failed to cancel event in database",
          variant: "destructive"
        });
        return;
      }

      if (mountedRef.current) {
        // Remove from local state only after successful database deletion
        setRecentEvents(prev => prev.filter(event => event.id !== eventId));
        
        toast({
          title: "Event Cancelled",
          description: `${eventTypeKey} event has been cancelled.`,
        });
      }
    } catch (error) {
      console.error('Error cancelling event:', error);
      if (mountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to cancel event",
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  const handleEventExpire = useCallback((eventId: string) => {
    if (mountedRef.current) {
      setRecentEvents(prev => prev.filter(event => event.id !== eventId));
    }
  }, []);

  const handleEventTypeClick = useCallback(async (eventType: EnhancedEventType) => {
    if (isRecording || !mountedRef.current) return;

    setIsRecording(true);
    setRecordingEventType(eventType.key);
    
    try {
      broadcastStatus({ status: 'recording', timestamp: Date.now() });
    } catch (broadcastError) {
      console.warn('Failed to broadcast status:', broadcastError);
    }

    const teamCtx = (selectedPlayer && selectedTeam) ? selectedTeam : undefined;

    try {
      const newEvent = await onRecordEvent(
        eventType.key, 
        selectedPlayer?.id, 
        teamCtx, 
        { recorded_via: 'piano' }
      );

      if (newEvent && mountedRef.current) {
        const eventInfo: RecentEvent = { 
          id: newEvent.id, 
          eventType: { key: newEvent.event_type, label: newEvent.event_type }, 
          player: selectedPlayer, 
          timestamp: Date.now() 
        };
        setRecentEvents(prev => [eventInfo, ...prev.slice(0, MAX_RECENT_EVENTS - 1)]);
      }
    } catch (e: any) { 
      console.error('Error in onRecordEvent:', e);
      if (mountedRef.current) {
        toast({
          title: "Error recording event",
          description: e.message || "An unknown error occurred",
          variant: "destructive"
        });
      }
    } finally { 
      if (mountedRef.current) {
        setIsRecording(false); 
        setRecordingEventType(null); 
        
        try {
          broadcastStatus({ status: 'active', timestamp: Date.now() });
        } catch (broadcastError) {
          console.warn('Failed to broadcast status:', broadcastError);
        }
      }
    }
  }, [isRecording, selectedPlayer, selectedTeam, onRecordEvent, broadcastStatus, toast]);

  const handlePlayerSelect = useCallback((player: PlayerForPianoInput, team: 'home' | 'away') => {
    if (mountedRef.current) {
      setSelectedPlayer(player);
      setSelectedTeam(team);
    }
  }, []);

  // Auto-select player if only one is assigned
  useEffect(() => {
    if (assignedPlayers && !selectedPlayer && mountedRef.current) {
      const allAssigned = [...(assignedPlayers.home || []), ...(assignedPlayers.away || [])];
      if (allAssigned.length === 1) {
        const single = allAssigned[0];
        setSelectedPlayer(single);
        setSelectedTeam(assignedPlayers.home?.includes(single) ? 'home' : 'away');
      }
    }
  }, [assignedPlayers, selectedPlayer]);

  const totalAssignedPlayers = useMemo(() => 
    (assignedPlayers?.home?.length || 0) + (assignedPlayers?.away?.length || 0),
    [assignedPlayers]
  );

  const isEliteView = totalAssignedPlayers > 1;
  const showPlayerSelection = !isEliteView && 
    fullMatchRoster && 
    ((fullMatchRoster.home?.length || 0) + (fullMatchRoster.away?.length || 0)) > 1;

  // Show connection status if there are issues
  const showConnectionWarning = connectionError && !isConnected;

  if (loading) {
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

  if (error) {
    return (
      <motion.div 
        className="flex items-center justify-center p-6 sm:p-8" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <div className="text-base sm:text-lg font-semibold mb-1 text-red-600">Assignment Error</div>
          <div className="text-xs sm:text-sm text-gray-600 mb-2">{error}</div>
          <Button onClick={fetchAssignments} variant="outline" size="sm">Retry</Button>
        </div>
      </motion.div>
    );
  }

  if (!assignedEventTypes.length && !totalAssignedPlayers) {
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
          <Button onClick={fetchAssignments} variant="outline" size="sm">
            Refresh Assignments
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary onError={(error) => setError(`Component error: ${error.message}`)}>
      <div className="space-y-2 p-1 sm:p-2">
        {/* Connection Warning */}
        {showConnectionWarning && (
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
          {recentEvents.length > 0 && (
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
                    {recentEvents.map((event) => (
                      <CancelActionIndicator
                        key={event.id}
                        eventType={event.eventType.key}
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
        {showPlayerSelection && assignedPlayers && (
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-semibold">
                Select Player from Your Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {(['home', 'away'] as const).map(team => {
                const players = assignedPlayers[team];
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
                          variant={selectedPlayer?.id === player.id ? "default" : "outline"} 
                          size="sm" 
                          className="justify-start text-sm"
                          aria-pressed={selectedPlayer?.id === player.id}
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
        {assignedEventTypes.length > 0 && (
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
                    ? (selectedPlayer 
                        ? `Recording for ${selectedPlayer.name}` 
                        : "Select a player, then tap event type"
                      )
                    : "Select a player and record an event"
                  }
                </p>
              </div>

              {!isEliteView && (
                <EventGrid 
                  eventTypes={assignedEventTypes}
                  selectedPlayer={selectedPlayer}
                  isRecording={isRecording}
                  recordingEventType={recordingEventType}
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

              {isEliteView && assignedPlayers && (
                <EliteView 
                  assignedPlayers={assignedPlayers}
                  eventTypes={assignedEventTypes}
                  selectedPlayer={selectedPlayer}
                  isRecording={isRecording}
                  recordingEventType={recordingEventType}
                  onPlayerSelect={handlePlayerSelect}
                  onEventClick={handleEventTypeClick}
                />
              )}

              {isRecording && (
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

// Extracted components for better organization
interface EventGridProps {
  eventTypes: EnhancedEventType[];
  selectedPlayer: PlayerForPianoInput | null;
  isRecording: boolean;
  recordingEventType: string | null;
  onEventClick: (eventType: EnhancedEventType) => void;
  onValidationError: () => void;
}

const EventGrid: React.FC<EventGridProps> = ({
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
);

interface EliteViewProps {
  assignedPlayers: AssignedPlayers;
  eventTypes: EnhancedEventType[];
  selectedPlayer: PlayerForPianoInput | null;
  isRecording: boolean;
  recordingEventType: string | null;
  onPlayerSelect: (player: PlayerForPianoInput, team: 'home' | 'away') => void;
  onEventClick: (eventType: EnhancedEventType) => void;
}

const EliteView: React.FC<EliteViewProps> = ({
  assignedPlayers,
  eventTypes,
  selectedPlayer,
  isRecording,
  recordingEventType,
  onPlayerSelect,
  onEventClick
}) => {
  const allPlayersList = [...assignedPlayers.home, ...assignedPlayers.away];
  
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
};

export default TrackerPianoInput;
