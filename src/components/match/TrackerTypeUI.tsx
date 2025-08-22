import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventType } from '@/types';
import { Shield, Zap, Target, Users } from 'lucide-react';
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
  const { toast } = useToast();

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
      const { data, error } = await supabase
        .from('tracker_line_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setAssignment(data ? {
        ...data,
        line_players: Array.isArray(data.line_players) ? data.line_players : []
      } : null);
    } catch (error: any) {
      console.error('Error fetching user assignment:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your assignment",
        variant: "destructive"
      });
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
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading your tracker assignment...</p>
        </CardContent>
      </Card>
    );
  }

  if (!assignment) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No tracker assignment found for this match</p>
        </CardContent>
      </Card>
    );
  }

  const config = trackerTypeConfig[assignment.tracker_type];
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      {/* Assignment Info */}
      <Card className={config.color}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5" />
            {config.label}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Match ID: {matchId}</p>
            </div>
            
            {assignment.tracker_type !== 'specialized' && assignment.line_players.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Assigned Players ({assignment.line_players.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {assignment.line_players.map((player: any, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{player.jersey_number} {player.player_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Your Event Types ({assignment.assigned_event_types.length}):</p>
              <div className="flex flex-wrap gap-1">
                {assignment.assigned_event_types.map((eventType) => (
                  <Badge key={eventType} variant="secondary" className="text-xs">
                    {eventType}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Record Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assignment.tracker_type === 'specialized' ? (
            // Specialized tracker - simple event buttons
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {assignment.assigned_event_types.map((eventType) => (
                <Button
                  key={eventType}
                  onClick={() => handleEventRecord(eventType)}
                  variant="outline"
                  size="sm"
                  className="h-10"
                >
                  {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                </Button>
              ))}
            </div>
          ) : (
            // Line-based tracker - events organized by player
            <div className="space-y-3">
              {assignment.line_players.map((player: any, playerIndex: number) => (
                <div key={player.id || playerIndex} className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    #{player.jersey_number} {player.player_name}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                    {assignment.assigned_event_types.map((eventType) => (
                      <Button
                        key={`${player.id}-${eventType}`}
                        onClick={() => handleEventRecord(eventType, player.id)}
                        variant="outline"
                        size="sm" 
                        className="h-8 text-xs"
                      >
                        {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* General events not tied to specific players */}
              <div className="pt-2 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  General Events
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {assignment.assigned_event_types.map((eventType) => (
                    <Button
                      key={`general-${eventType}`}
                      onClick={() => handleEventRecord(eventType)}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackerTypeUI;