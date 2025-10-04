import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import EventTypeSvg from '@/components/match/EventTypeSvg';
import CancelActionIndicator from '@/components/match/CancelActionIndicator';

// Consistent player interface
export interface Player {
  id: number;
  player_name: string;
  position?: string;
  jersey_number: number;
  team: 'home' | 'away';
}

interface TrackerPianoInputProps {
  matchId: string;
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  onRecordEvent: (
    eventTypeKey: string,
    playerId?: number,
    teamContext?: 'home' | 'away',
    details?: Record<string, any>
  ) => Promise<any | null>;
}

interface TrackerAssignment {
  tracker_type: 'ball' | 'player';
  assigned_player_ids: number[] | null;
  assigned_event_types: string[] | null;
  player_team_id: 'home' | 'away';
}

interface RecentEvent {
  id: string;
  eventType: { key: string; label: string };
  player: Player | null;
  timestamp: number;
}

const MAX_RECENT_EVENTS = 5;

const TrackerPianoInput: React.FC<TrackerPianoInputProps> = ({
  matchId,
  homeTeamPlayers,
  awayTeamPlayers,
  onRecordEvent
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [trackerType, setTrackerType] = useState<'ball' | 'player' | null>(null);
  const [assignedPlayers, setAssignedPlayers] = useState<Player[]>([]);
  const [assignedEventTypes, setAssignedEventTypes] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingEventType, setRecordingEventType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
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
        setRecentEvents(prev => 
          prev.filter(event => Date.now() - event.timestamp < 10000)
        );
      }
    }, 2000);

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  // Fetch tracker assignment
  const fetchAssignment = useCallback(async () => {
    if (!matchId || !user?.id) {
      setError("Match ID or User information is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: assignments, error: assignmentError } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', user.id);

      if (!mountedRef.current) return;

      if (assignmentError) {
        throw new Error('Failed to fetch tracker assignment');
      }

      if (!assignments || assignments.length === 0) {
        throw new Error('No assignment found. Please contact an admin.');
      }

      const assignment: TrackerAssignment = assignments[0];
      setTrackerType(assignment.tracker_type);

      // For ball tracker, assign all players
      if (assignment.tracker_type === 'ball') {
        setAssignedPlayers(allPlayers);
        setAssignedEventTypes(assignment.assigned_event_types || []);
        setLoading(false);
        return;
      }

      // For player tracker, filter assigned players
      if (assignment.tracker_type === 'player') {
        const playerIds = assignment.assigned_player_ids || [];
        const teamId = assignment.player_team_id;
        
        const filteredPlayers = allPlayers.filter(player => 
          player.team === teamId && playerIds.includes(player.id)
        );

        setAssignedPlayers(filteredPlayers);
        setAssignedEventTypes(assignment.assigned_event_types || []);

        // Auto-select if only one player
        if (filteredPlayers.length === 1) {
          setSelectedPlayer(filteredPlayers[0]);
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching assignment:', err);
      if (mountedRef.current) {
        setError(err.message);
        setLoading(false);
      }
    }
  }, [matchId, user?.id, allPlayers]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  // Handle event recording
  const handleRecordEvent = useCallback(async (eventTypeKey: string, player?: Player) => {
    if (isRecording || !mountedRef.current) return;

    const targetPlayer = player || selectedPlayer;

    // Validation: player tracker needs a selected player
    if (trackerType === 'player' && !targetPlayer) {
      toast({
        title: "No Player Selected",
        description: "Please select a player before recording an event.",
        variant: "destructive"
      });
      return;
    }

    setIsRecording(true);
    setRecordingEventType(eventTypeKey);

    try {
      const newEvent = await onRecordEvent(
        eventTypeKey,
        targetPlayer?.id,
        targetPlayer?.team,
        { recorded_via: 'piano', tracker_type: trackerType }
      );

      if (newEvent && mountedRef.current) {
        const eventInfo: RecentEvent = {
          id: newEvent.id,
          eventType: { key: eventTypeKey, label: eventTypeKey },
          player: targetPlayer || null,
          timestamp: Date.now()
        };
        setRecentEvents(prev => [eventInfo, ...prev.slice(0, MAX_RECENT_EVENTS - 1)]);
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
        setIsRecording(false);
        setRecordingEventType(null);
      }
    }
  }, [isRecording, selectedPlayer, trackerType, onRecordEvent, toast]);

  // Handle event cancellation
  const handleCancelEvent = useCallback(async (eventId: string, eventTypeKey: string) => {
    if (!mountedRef.current) return;

    try {
      const { error } = await supabase
        .from('match_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setRecentEvents(prev => prev.filter(event => event.id !== eventId));

      toast({
        title: "Event Cancelled",
        description: `${eventTypeKey} event has been cancelled.`,
      });
    } catch (error: any) {
      console.error('Error cancelling event:', error);
      toast({
        title: "Error",
        description: "Failed to cancel event",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <div className="text-lg font-semibold mb-1">Loading Tracker...</div>
          <div className="text-sm text-gray-600">Fetching your assignment</div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-600 bg-red-50 rounded-lg">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Error Loading Tracker</p>
        <p className="text-center text-sm">{error}</p>
        <Button onClick={fetchAssignment} variant="outline" size="sm" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // No assignments
  if (!trackerType || assignedEventTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-600 bg-gray-50 rounded-lg">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">No Assignments</p>
        <p className="text-center text-sm">You have no event types assigned for this match.</p>
        <Button onClick={fetchAssignment} variant="outline" size="sm" className="mt-4">
          Refresh
        </Button>
      </div>
    );
  }

  const showPlayerSelection = trackerType === 'player' && assignedPlayers.length > 1;
  const isEliteView = trackerType === 'player' && assignedPlayers.length > 1;

  return (
    <div className="space-y-4 p-2">
      {/* Tracker Type Badge */}
      <div className="flex justify-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
          trackerType === 'ball' 
            ? 'bg-orange-100 text-orange-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {trackerType === 'ball' ? '⚽ Ball Tracker' : '👤 Player Tracker'}
        </div>
      </div>

      {/* Recent Events */}
      <AnimatePresence>
        {recentEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/60 backdrop-blur-xl border-slate-200/80 shadow-lg">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base">Recent Events (Click to Cancel)</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-2">
                  {recentEvents.map((event) => (
                    <CancelActionIndicator
                      key={event.id}
                      eventType={event.eventType.key as any}
                      onCancel={() => handleCancelEvent(event.id, event.eventType.key)}
                      onExpire={() => setRecentEvents(prev => prev.filter(e => e.id !== event.id))}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Selection (for player trackers with multiple players) */}
      {showPlayerSelection && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Select Player</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {assignedPlayers.map(player => (
                <Button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  variant={selectedPlayer?.id === player.id ? "default" : "outline"}
                  size="sm"
                  className="justify-start"
                >
                  #{player.jersey_number} {player.player_name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Recording Interface */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-lg border border-purple-200">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Record Events
          </h2>
          <p className="text-sm text-purple-600 mt-1">
            {trackerType === 'ball' 
              ? 'Select player and event type' 
              : selectedPlayer 
                ? `Recording for ${selectedPlayer.player_name}` 
                : 'Select a player first'
            }
          </p>
        </div>

        {/* Standard View (Ball Tracker or Single Player) */}
        {!isEliteView && (
          <div className="flex justify-center">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-3 gap-y-6">
              {assignedEventTypes.map(eventType => {
                const isRecordingThis = isRecording && recordingEventType === eventType;

                return (
                  <div key={eventType} className="flex flex-col items-center justify-start gap-2">
                    <button
                      onClick={() => handleRecordEvent(eventType)}
                      disabled={isRecording || (trackerType === 'player' && !selectedPlayer)}
                      aria-label={`Record ${eventType} event`}
                      aria-pressed={isRecordingThis}
                      className="relative flex items-center justify-center rounded-full border bg-gradient-to-br from-white/70 to-slate-100/70 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-16 h-16 sm:w-20 sm:h-20"
                    >
                      <EventTypeSvg eventType={eventType} size="sm" />
                      {isRecordingThis && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-green-500 pointer-events-none"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                    </button>
                    <span className="font-semibold text-slate-700 text-center leading-tight text-xs sm:text-sm max-w-[80px] break-words">
                      {eventType}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Elite View (Multiple Players) */}
        {isEliteView && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedPlayers.map(player => {
              const isSelected = selectedPlayer?.id === player.id;

              return (
                <div
                  key={player.id}
                  className={`border rounded-lg p-3 transition-all ${
                    isSelected
                      ? 'bg-green-50 border-green-400 ring-1 ring-green-500'
                      : 'bg-white hover:shadow'
                  }`}
                >
                  <CardTitle
                    className={`mb-3 cursor-pointer flex items-center justify-between px-2 py-1 rounded text-sm ${
                      isSelected ? 'text-green-600 bg-green-100' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <div>
                      <span className="font-semibold">#{player.jersey_number} </span>
                      <span>{player.player_name}</span>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-green-500 text-white rounded-full">
                        SEL
                      </span>
                    )}
                  </CardTitle>

                  <div className="flex justify-center">
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-2 gap-y-4">
                      {assignedEventTypes.map(eventType => {
                        const isRecordingThis = isRecording && 
                          recordingEventType === eventType && 
                          selectedPlayer?.id === player.id;

                        return (
                          <div key={`${player.id}-${eventType}`} className="flex flex-col items-center justify-start gap-2">
                            <button
                              onClick={() => {
                                setSelectedPlayer(player);
                                handleRecordEvent(eventType, player);
                              }}
                              disabled={isRecording}
                              aria-label={`Record ${eventType} event for ${player.player_name}`}
                              aria-pressed={isRecordingThis}
                              className="relative flex items-center justify-center rounded-full border bg-gradient-to-br from-white/70 to-slate-100/70 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-14 h-14 sm:w-16 sm:h-16"
                            >
                              <EventTypeSvg eventType={eventType} size="xs" />
                              {isRecordingThis && (
                                <motion.div
                                  className="absolute inset-0 rounded-full border-2 border-green-500 pointer-events-none"
                                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                                  transition={{ duration: 0.8, repeat: Infinity }}
                                />
                              )}
                            </button>
                            <span className="font-semibold text-slate-700 text-center leading-tight text-xs max-w-[64px] break-words">
                              {eventType}
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
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow">
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
    </div>
  );
};

export default TrackerPianoInput;
