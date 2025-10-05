import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Clock, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';

interface Player {
  id: number;
  jersey_number: number;
  player_name: string;
  team: 'home' | 'away';
  position?: string;
}

interface PendingEvent {
  id: string;
  player: Player;
  timestamp: number;
  age_seconds: number;
  priority: 'urgent' | 'normal' | 'old';
  tracker_id: string;
}

interface EnhancedPlayerTrackerInterfaceProps {
  assignedPlayers: Player[];
  pendingEvents: PendingEvent[];
  assignedEventTypes: string[];
  onRecordEvent: (pendingEventId: string, eventType: string, details?: Record<string, any>) => void;
  onClearEvent: (pendingEventId: string) => void;
  onClearAll: () => void;
}

const PlayerTrackerInterface: React.FC<EnhancedPlayerTrackerInterfaceProps> = ({
  assignedPlayers,
  pendingEvents,
  assignedEventTypes,
  onRecordEvent,
  onClearEvent,
  onClearAll
}) => {
  const eventTypeDisplay = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'normal': return 'border-yellow-500 bg-yellow-50';
      case 'old': return 'border-gray-400 bg-gray-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge className="bg-red-600">URGENT</Badge>;
      case 'normal': return <Badge className="bg-yellow-600">NORMAL</Badge>;
      case 'old': return <Badge className="bg-gray-600">OLD</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Status Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Player Tracker Interface
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {pendingEvents.length} Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Assigned Players */}
          <div>
            <span className="text-sm font-medium">Your Assigned Players:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {assignedPlayers.map(player => {
                const hasPending = pendingEvents.some(e => e.player.id === player.id);
                return (
                  <Badge 
                    key={player.id}
                    variant={hasPending ? 'default' : 'outline'}
                    className={hasPending ? 'bg-blue-600 animate-pulse' : ''}
                  >
                    #{player.jersey_number} {player.player_name}
                    {hasPending && <span className="ml-1">●</span>}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Queue Summary */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                {pendingEvents.length === 0 ? 'No pending events' : 
                 pendingEvents.length === 1 ? '1 event waiting' : 
                 `${pendingEvents.length} events waiting`}
              </span>
            </div>
            {pendingEvents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Events Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Event Queue (Click to Record)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">All Clear!</p>
              <p className="text-sm">No pending events. Wait for your players to get the ball.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`border-2 rounded-lg p-4 transition-all ${getPriorityColor(event.priority)}`}
                >
                  {/* Event Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-700">
                        #{event.player.jersey_number}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {event.player.player_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getPriorityBadge(event.priority)}
                          <span className="text-sm text-gray-600">
                            {event.age_seconds}s ago
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onClearEvent(event.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Event Action Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {assignedEventTypes.map(eventType => (
                      <Button
                        key={eventType}
                        onClick={() => onRecordEvent(event.id, eventType)}
                        size="lg"
                        className={`h-16 text-sm font-semibold ${
                          event.priority === 'urgent' 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : event.priority === 'normal'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        {eventTypeDisplay(eventType)}
                      </Button>
                    ))}
                  </div>

                  {/* Timestamp Info */}
                  <div className="mt-2 text-xs text-gray-500 text-right">
                    Possession at: {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            How the Queue System Works:
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>🔴 <strong>RED (Urgent):</strong> Events less than 5 seconds old - record immediately!</li>
            <li>🟡 <strong>YELLOW (Normal):</strong> Events 5-15 seconds old - record when you have time</li>
            <li>⚪ <strong>GRAY (Old):</strong> Events over 15 seconds old - may auto-clear at 30s</li>
            <li>• Events preserve their original timestamps for accurate analytics</li>
            <li>• You can record events in any order - the system tracks when they happened</li>
            <li>• Multiple events can stack up during fast play - work through them systematically</li>
            <li>• Use "Clear" button to skip events you couldn't observe properly</li>
          </ul>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Hint */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <p className="text-sm text-blue-900">
            <strong>💡 Pro Tip:</strong> During fast play, focus on the ball tracker. 
            You can catch up on event logging during dead balls, throw-ins, or slower possession sequences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerTrackerInterface;
