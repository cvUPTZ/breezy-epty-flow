import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Target, AlertCircle } from 'lucide-react';
import { Player } from '@/hooks/useFourTrackerSystem';
import { EventType } from '@/types';

interface PlayerTrackerInterfaceProps {
  assignedPlayers: Player[];
  currentBallHolder: Player | null;
  isActive: boolean;
  assignedEventTypes: string[];
  onRecordEvent: (eventType: EventType, details?: Record<string, any>) => void;
}

const PlayerTrackerInterface: React.FC<PlayerTrackerInterfaceProps> = ({
  assignedPlayers,
  currentBallHolder,
  isActive,
  assignedEventTypes,
  onRecordEvent
}) => {
  const eventTypeDisplay = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className={`${
        isActive 
          ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-300' 
          : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
            Player Tracker Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Assigned Players */}
          <div>
            <span className="text-sm font-medium">Your Players:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {assignedPlayers.map(player => (
                <Badge 
                  key={player.id}
                  variant={player.id === currentBallHolder?.id ? 'default' : 'outline'}
                  className={player.id === currentBallHolder?.id ? 'bg-green-600' : ''}
                >
                  #{player.jersey_number} {player.player_name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Current Status */}
          <div className={`p-3 rounded-lg border ${
            isActive 
              ? 'bg-green-100 border-green-300' 
              : 'bg-gray-100 border-gray-300'
          }`}>
            <div className="flex items-center gap-2">
              {isActive ? (
                <>
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    ACTIVE: #{currentBallHolder?.jersey_number} {currentBallHolder?.player_name} has the ball
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    WAITING: None of your players have the ball
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Recording Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isActive ? 'Record Event Now' : 'Event Buttons (Inactive)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isActive && currentBallHolder ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                Recording for: #{currentBallHolder.jersey_number} {currentBallHolder.player_name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {assignedEventTypes.map(eventType => (
                  <Button
                    key={eventType}
                    onClick={() => onRecordEvent(eventType as EventType)}
                    size="lg"
                    className="w-full h-20 text-lg font-semibold"
                  >
                    {eventTypeDisplay(eventType)}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Event buttons will appear here when one of your players has the ball.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Player Tracker Instructions:</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Watch ONLY your assigned players</li>
            <li>• Your interface activates automatically when your player gets the ball</li>
            <li>• Record events immediately when they occur</li>
            <li>• Passes and interceptions are detected automatically</li>
            <li>• Focus on specific actions: shots, fouls, tackles, etc.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerTrackerInterface;
