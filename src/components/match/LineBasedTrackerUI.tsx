import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventType } from '@/types';
import { Shield, Zap, Target, Globe } from 'lucide-react';

interface Player {
  id: string | number;
  name: string;
  jersey_number?: number;
  position?: string;
}

interface LineAssignment {
  line: 'defense' | 'midfield' | 'attack' | 'all_events';
  team: 'home' | 'away' | 'both';
  players: Player[];
  eventTypes: string[];
  teamName: string;
}

interface LineBasedTrackerUIProps {
  assignments: LineAssignment[];
  recordEvent: (eventType: EventType, playerId?: string | number, teamId?: 'home' | 'away') => void;
  matchId: string;
}

const LineBasedTrackerUI: React.FC<LineBasedTrackerUIProps> = ({
  assignments,
  recordEvent,
  matchId
}) => {
  const getLineIcon = (line: string) => {
    switch (line) {
      case 'defense': return <Shield className="h-4 w-4" />;
      case 'midfield': return <Zap className="h-4 w-4" />;
      case 'attack': return <Target className="h-4 w-4" />;
      case 'all_events': return <Globe className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getLineColor = (line: string) => {
    switch (line) {
      case 'defense': return 'border-blue-200 bg-blue-50';
      case 'midfield': return 'border-green-200 bg-green-50';
      case 'attack': return 'border-red-200 bg-red-50';
      case 'all_events': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const handleEventRecord = (eventType: string, playerId?: string | number, teamId?: 'home' | 'away') => {
    recordEvent(eventType as EventType, playerId, teamId);
  };

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No assignments found</p>
        </CardContent>
      </Card>
    );
  }

  // Get unique event types across all assignments
  const allEventTypes = Array.from(new Set(assignments.flatMap(a => a.eventTypes)));

  return (
    <div className="space-y-4">
      {/* Assignment Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Video Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">Match ID: {matchId}</p>
            <p className="text-sm">
              <span className="font-medium">Event Types:</span> {allEventTypes.join(', ')}
            </p>
            <p className="text-sm">
              <span className="font-medium">Assignments:</span> {assignments.length} line(s)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Line-based event tracking */}
      {assignments.map((assignment, index) => (
        <Card key={index} className={getLineColor(assignment.line)}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {getLineIcon(assignment.line)}
              {assignment.line === 'all_events' ? 'All Events' : `${assignment.line.charAt(0).toUpperCase() + assignment.line.slice(1)} Line`}
              <Badge variant="outline" className="text-xs">
                {assignment.teamName}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Show assigned players for specific lines */}
            {assignment.line !== 'all_events' && assignment.players.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Players ({assignment.players.length}):</h4>
                <div className="flex flex-wrap gap-1 mb-3">
                  {assignment.players.map((player) => (
                    <Badge key={player.id} variant="secondary" className="text-xs">
                      #{player.jersey_number || '?'} {player.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Event buttons organized in lines based on number of players */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Events:</h4>
              
              {assignment.line === 'all_events' ? (
                // Single row for all events
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {assignment.eventTypes.map((eventType) => (
                    <Button
                      key={eventType}
                      onClick={() => handleEventRecord(eventType, undefined, assignment.team !== 'both' ? assignment.team as 'home' | 'away' : 'home')}
                      variant="outline"
                      size="sm"
                      className="h-10"
                    >
                      {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                    </Button>
                  ))}
                </div>
              ) : (
                // Multiple rows based on number of players
                <div className="space-y-2">
                  {assignment.players.map((player, playerIndex) => (
                    <div key={player.id} className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">
                        Player {playerIndex + 1}: #{player.jersey_number || '?'} {player.name}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                        {assignment.eventTypes.map((eventType) => (
                          <Button
                            key={`${player.id}-${eventType}`}
                            onClick={() => handleEventRecord(eventType, player.id, assignment.team !== 'both' ? assignment.team as 'home' | 'away' : 'home')}
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LineBasedTrackerUI;