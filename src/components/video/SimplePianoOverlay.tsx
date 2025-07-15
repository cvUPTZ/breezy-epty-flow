
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Gamepad2 } from 'lucide-react';
import EventTypeSvg from '@/components/match/EventTypeSvg';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface SimplePianoOverlayProps {
  onRecordEvent: (eventType: string) => Promise<void>;
  onClose: () => void;
  isRecording: boolean;
  gamepadConnected: boolean;
  lastTriggeredEvent: string | null;
}

interface PlayerAssignment {
  line: 'defense' | 'midfield' | 'attack' | 'all_events';
  team: 'home' | 'away';
  players: any[];
  tracker_id: string;
}

const SimplePianoOverlay: React.FC<SimplePianoOverlayProps> = ({
  onRecordEvent,
  onClose,
  isRecording,
  gamepadConnected,
  lastTriggeredEvent
}) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<PlayerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<any>(null);

  const primaryEvents = ['goal', 'shot', 'pass', 'tackle'];
  const secondaryEvents = ['foul', 'assist', 'save', 'corner', 'freeKick'];

  useEffect(() => {
    if (user?.id) {
      fetchTrackerAssignments();
    }
  }, [user?.id]);

  const fetchTrackerAssignments = async () => {
    try {
      setLoading(true);
      
      // Get current match from URL
      const matchId = window.location.pathname.split('/')[2];
      if (!matchId) return;

      // Fetch match data
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;
      setMatchData(match);

      // Fetch tracker assignments for this user and match
      const { data: trackerAssignments, error } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', user?.id);

      if (error) throw error;

      // Group assignments by line
      const lineAssignments: PlayerAssignment[] = [];
      const assignmentsByLine: Record<string, any[]> = {};

      trackerAssignments?.forEach(assignment => {
        if (!assignment.player_id) {
          // This is an "all events" assignment
          lineAssignments.push({
            line: 'all_events',
            team: assignment.player_team_id,
            players: [],
            tracker_id: assignment.tracker_user_id
          });
        } else {
          // Get player info and determine line based on position
          const teamPlayers = assignment.player_team_id === 'home' 
            ? match.home_team_players 
            : match.away_team_players;
          
          const player = teamPlayers?.find((p: any) => p.id === assignment.player_id);
          if (player) {
            const position = player.position?.toLowerCase() || '';
            let line: 'defense' | 'midfield' | 'attack' = 'midfield';
            
            if (position.includes('def') || position.includes('back') || position.includes('gk')) {
              line = 'defense';
            } else if (position.includes('for') || position.includes('att') || position.includes('wing')) {
              line = 'attack';
            }

            const key = `${line}_${assignment.player_team_id}`;
            if (!assignmentsByLine[key]) {
              assignmentsByLine[key] = [];
            }
            assignmentsByLine[key].push(player);
          }
        }
      });

      // Convert grouped assignments to line assignments
      Object.entries(assignmentsByLine).forEach(([key, players]) => {
        const [line, team] = key.split('_');
        lineAssignments.push({
          line: line as 'defense' | 'midfield' | 'attack',
          team: team as 'home' | 'away',
          players,
          tracker_id: user?.id || ''
        });
      });

      setAssignments(lineAssignments);
    } catch (error) {
      console.error('Error fetching tracker assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventRecord = useCallback(async (eventType: string, playerId?: number) => {
    try {
      await onRecordEvent(eventType);
    } catch (error) {
      console.error('Error recording event:', error);
    }
  }, [onRecordEvent]);

  const renderEventButton = (eventType: string, size: 'sm' | 'md' = 'md') => {
    const isRecordingThis = isRecording && lastTriggeredEvent === eventType;
    const sizeClasses = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
    
    return (
      <div key={eventType} className="flex flex-col items-center gap-2">
        <button
          onClick={() => handleEventRecord(eventType)}
          disabled={isRecording}
          className={`${sizeClasses} rounded-full border bg-gradient-to-br from-white/70 to-slate-100/70 backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed ${isRecordingThis ? 'ring-2 ring-green-500 animate-pulse' : ''}`}
        >
          <EventTypeSvg eventType={eventType} size={size === 'sm' ? 'xs' : 'sm'} />
        </button>
        <span className="text-xs font-medium text-white text-center leading-tight max-w-[80px] break-words">
          {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
        </span>
      </div>
    );
  };

  const getLineColor = (line: string) => {
    switch (line) {
      case 'defense': return 'border-blue-400 bg-blue-500/20';
      case 'midfield': return 'border-green-400 bg-green-500/20';
      case 'attack': return 'border-red-400 bg-red-500/20';
      case 'all_events': return 'border-purple-400 bg-purple-500/20';
      default: return 'border-gray-400 bg-gray-500/20';
    }
  };

  const getLineIcon = (line: string) => {
    switch (line) {
      case 'defense': return '🛡️';
      case 'midfield': return '⚽';
      case 'attack': return '⚡';
      case 'all_events': return '🌐';
      default: return '👥';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-96 bg-white/90 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading tracker assignments...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-xl border-slate-200/80 shadow-2xl">
        <CardHeader className="pb-4 border-b border-slate-200/80 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-bold text-slate-800">Line-Based Event Tracker</CardTitle>
              {gamepadConnected && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Gamepad2 className="h-3 w-3" />
                  Gamepad Connected
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-slate-600 mb-2">No Line Assignments Found</p>
              <p className="text-sm text-slate-500">You don't have any line-based assignments for this match.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment, index) => (
                <Card key={index} className={`${getLineColor(assignment.line)} border-2`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">{getLineIcon(assignment.line)}</span>
                      {assignment.line === 'all_events' ? 'All Events' : `${assignment.line.charAt(0).toUpperCase() + assignment.line.slice(1)} Line`}
                      <Badge variant="outline">
                        {matchData?.[`${assignment.team}_team_name`] || assignment.team}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {assignment.line !== 'all_events' && assignment.players.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Assigned Players:</h4>
                        <div className="flex flex-wrap gap-1">
                          {assignment.players.map((player) => (
                            <Badge key={player.id} variant="secondary" className="text-xs">
                              #{player.jersey_number} {player.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {assignment.line === 'all_events' && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-600">Track all events for the {assignment.team} team without specific player assignment.</p>
                      </div>
                    )}

                    {/* Event Buttons */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Primary Events</h4>
                        <div className="flex flex-wrap gap-4 justify-center">
                          {primaryEvents.map(eventType => renderEventButton(eventType))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Secondary Events</h4>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {secondaryEvents.map(eventType => renderEventButton(eventType, 'sm'))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {isRecording && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                Recording {lastTriggeredEvent}...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplePianoOverlay;
