import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EventType } from '@/types';
import { EVENT_TYPE_CATEGORIES } from '@/constants/eventTypes';
import { Shield, Zap, Target, Users, ChevronDown, User, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrackerTypeUIProps {
  matchId: string;
  userId: string;
  recordEvent: (eventType: EventType, playerId?: string | number, teamId?: 'home' | 'away') => void;
}

type TrackerType = 'specialized' | 'defence' | 'midfield' | 'attack';

interface UserAssignment {
  id: string;
  tracker_type: TrackerType;
  assigned_event_types: string[];
  line_players: any[];
}

const TrackerTypeUI: React.FC<TrackerTypeUIProps> = ({
  matchId,
  userId,
  recordEvent
}) => {
  const [assignment, setAssignment] = useState<UserAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const togglePlayerExpanded = (playerId: string) => {
    setExpandedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const trackerTypeConfig = {
    specialized: {
      icon: Users,
      label: 'Specialized Tracker',
      color: 'border-purple-200 bg-purple-50',
      description: 'Track specific events across all players'
    },
    defence: {
      icon: Shield,
      label: 'Defence Tracker',  
      color: 'border-blue-200 bg-blue-50',
      description: 'Track defensive players and events'
    },
    midfield: {
      icon: Zap,
      label: 'Midfield Tracker',
      color: 'border-green-200 bg-green-50', 
      description: 'Track midfield players and events'
    },
    attack: {
      icon: Target,
      label: 'Attack Tracker',
      color: 'border-red-200 bg-red-50',
      description: 'Track attacking players and events'
    }
  };

  useEffect(() => {
    fetchUserAssignment();
  }, [matchId, userId]);

  const fetchUserAssignment = async () => {
    try {
      console.log('Fetching assignment for match:', matchId, 'user:', userId);
      
      // First try to get line-based assignments (priority system)
      const { data: lineData } = await supabase
        .from('tracker_line_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', userId)
        .maybeSingle();

      if (lineData) {
        console.log('Found line-based assignment:', {
          ...lineData,
          line_players_count: Array.isArray(lineData.line_players) ? lineData.line_players.length : 0
        });
        setAssignment({
          ...lineData,
          line_players: Array.isArray(lineData.line_players) ? lineData.line_players : []
        });
        return;
      }

      // If no line assignments, check for individual player assignments
      const { data: individualAssignments } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', userId);

      if (individualAssignments && individualAssignments.length > 0) {
        console.log('Found individual player assignments:', individualAssignments);
        
        // Get match data to find the actual players
        const { data: matchData } = await supabase
          .from('matches')
          .select('home_team_players, away_team_players')
          .eq('id', matchId)
          .single();

        if (matchData) {
          const allPlayers = [
            ...((matchData.home_team_players as any[]) || []).map((p: any) => ({ ...p, team: 'home' })),
            ...((matchData.away_team_players as any[]) || []).map((p: any) => ({ ...p, team: 'away' }))
          ];

          // Map the assigned players with their details
          const assignedPlayers = individualAssignments.map(assignment => {
            // Try to find player by matching assignment player_id with array index or jersey number
            let player = allPlayers.find(p => p.id === assignment.player_id);
            
            // If not found by ID, try to find by index (player_id might be array index)
            if (!player) {
              const teamPlayers = assignment.player_team_id === 'home' 
                ? (matchData.home_team_players as any[]) || []
                : (matchData.away_team_players as any[]) || [];
              
              // Check if player_id corresponds to array index
              if (assignment.player_id !== null && assignment.player_id >= 0 && assignment.player_id < teamPlayers.length) {
                player = teamPlayers[assignment.player_id];
                if (player) {
                  player = { ...player, team: assignment.player_team_id };
                }
              }
            }

            return {
              ...assignment,
              player_details: player || {
                id: assignment.player_id,
                jersey_number: assignment.player_id,
                player_name: `Player ${assignment.player_id}`,
                position: 'Unknown',
                team: assignment.player_team_id
              }
            };
          });

          // Determine tracker type based on player positions
          const positions = assignedPlayers.map(ap => ap.player_details.position?.toLowerCase() || '');
          let trackerType: TrackerType = 'specialized';
          
          if (positions.some(pos => ['st', 'cf', 'lw', 'rw', 'cam'].includes(pos))) {
            trackerType = 'attack';
          } else if (positions.some(pos => ['cm', 'cdm', 'lm', 'rm'].includes(pos))) {
            trackerType = 'midfield';
          } else if (positions.some(pos => ['cb', 'lb', 'rb', 'cdm'].includes(pos))) {
            trackerType = 'defence';
          }

          const firstAssignment = individualAssignments[0];
          setAssignment({
            id: firstAssignment.id,
            tracker_type: trackerType,
            assigned_event_types: firstAssignment.assigned_event_types || [],
            line_players: assignedPlayers.map(ap => ({
              id: ap.player_details.id,
              jersey_number: ap.player_details.jersey_number,
              player_name: ap.player_details.player_name,
              position: ap.player_details.position,
              team: ap.player_details.team
            }))
          });
          return;
        }
      }

      // No assignments found
      console.log('No assignments found for user');
      setAssignment(null);
    } catch (error: any) {
      console.error('Error fetching user assignment:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your assignment", 
        variant: "destructive"
      });
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEventRecord = (eventType: string, playerId?: string | number) => {
    if (!assignment) return;

    // For specialized trackers, record events without specific player
    if (assignment.tracker_type === 'specialized') {
      recordEvent(eventType as EventType);
      return;
    }

    // For line-based trackers, record with player if provided
    if (playerId) {
      const player = assignment.line_players.find(p => p.id === playerId);
      const teamId = player?.team || 'home';
      recordEvent(eventType as EventType, playerId, teamId as 'home' | 'away');
    } else {
      recordEvent(eventType as EventType);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Loading Assignment</h3>
              <p className="text-sm text-muted-foreground">Fetching your tracker assignment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-muted/20 to-muted/10 border border-muted flex items-center justify-center">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">No Assignment Found</h3>
              <p className="text-sm text-muted-foreground">No tracker assignment found for this match</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = trackerTypeConfig[assignment.tracker_type];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{config.label}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            Match: {matchId.slice(0, 8)}...
          </Badge>
        </div>

        {/* Event Types Overview */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Event Types</h3>
            <Badge variant="secondary" className="text-xs">
              {assignment.assigned_event_types.length} types
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignment.assigned_event_types.map((eventType) => (
              <Badge 
                key={eventType} 
                variant="outline" 
                className="px-3 py-1 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:from-primary/10 hover:to-primary/15 transition-all duration-200"
              >
                {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Event Recording Interface */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Event Recording</h2>
          </div>
        </div>

        <div className="p-6">
          {assignment.tracker_type === 'specialized' ? (
            // Specialized Tracker Interface
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-6">
                Record events for any player across the field
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {assignment.assigned_event_types.map((eventType) => {
                  // Find the category and color for this event type
                  const eventCategory = EVENT_TYPE_CATEGORIES.find(cat => 
                    cat.events.some(e => e.key === eventType)
                  );
                  const eventColor = eventCategory?.color || '#6B7280';
                  
                  return (
                    <Button
                      key={eventType}
                      onClick={() => handleEventRecord(eventType)}
                      variant="outline"
                      className="h-12 font-medium transition-all duration-200 hover-scale border-2"
                      style={{
                        borderColor: eventColor + '40',
                        backgroundColor: eventColor + '10',
                        color: eventColor
                      }}
                    >
                      <span className="capitalize">{eventType}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Line-Based Tracker Interface
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Record events for your assigned players
              </p>

              {/* Player Sections */}
              <div className="space-y-4">
                {assignment.line_players.map((player: any, playerIndex: number) => {
                  const playerId = String(player.id || playerIndex);
                  const isExpanded = expandedPlayers.has(playerId);
                  
                  return (
                    <Collapsible
                      key={playerId}
                      open={isExpanded}
                      onOpenChange={() => togglePlayerExpanded(playerId)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="w-full p-4 rounded-lg border bg-gradient-to-r from-card to-muted/10 hover:from-muted/20 hover:to-muted/30 cursor-pointer transition-all duration-200 hover-scale">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                            <div>
                              <div className="font-semibold">#{player.jersey_number || 'N/A'} {player.player_name || 'Unknown Player'}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {player.position || 'Unknown Position'} • {assignment.assigned_event_types.length} event types available
                              </div>
                            </div>
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                                isExpanded ? 'transform rotate-180' : ''
                              }`} 
                            />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="animate-accordion-down">
                        <div className="mt-3 p-4 rounded-lg bg-muted/20 border border-dashed">
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                             {assignment.assigned_event_types.map((eventType) => {
                               // Find the category and color for this event type
                               const eventCategory = EVENT_TYPE_CATEGORIES.find(cat => 
                                 cat.events.some(e => e.key === eventType)
                               );
                               const eventColor = eventCategory?.color || '#6B7280';
                               
                               return (
                                 <Button
                                   key={`${playerId}-${eventType}`}
                                   onClick={() => handleEventRecord(eventType, player.id)}
                                   variant="outline"
                                   size="sm"
                                   className="h-10 font-medium transition-all duration-200 hover-scale border-2"
                                   style={{
                                     borderColor: eventColor + '40',
                                     backgroundColor: eventColor + '10',
                                     color: eventColor
                                   }}
                                 >
                                   <span className="capitalize text-xs">{eventType}</span>
                                 </Button>
                               );
                             })}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>

              {/* General Events Section */}
              <div className="mt-8 pt-6 border-t border-dashed">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    General Events
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Record events not tied to specific players
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                   {assignment.assigned_event_types.map((eventType) => {
                     // Find the category and color for this event type
                     const eventCategory = EVENT_TYPE_CATEGORIES.find(cat => 
                       cat.events.some(e => e.key === eventType)
                     );
                     const eventColor = eventCategory?.color || '#6B7280';
                     
                     return (
                       <Button
                         key={`general-${eventType}`}
                         onClick={() => handleEventRecord(eventType)}
                         variant="outline"
                         className="h-12 font-medium transition-all duration-200 hover-scale border-2"
                         style={{
                           borderColor: eventColor + '40',
                           backgroundColor: eventColor + '10',
                           color: eventColor
                         }}
                       >
                         <span className="capitalize">{eventType}</span>
                       </Button>
                     );
                   })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackerTypeUI;