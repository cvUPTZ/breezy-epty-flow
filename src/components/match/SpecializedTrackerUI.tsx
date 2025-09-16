
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, User, Clock } from 'lucide-react';
import { EventType } from '@/types';

/**
 * @interface SpecializedTrackerUIProps
 * @description Props for the SpecializedTrackerUI component.
 * @property {object} assignedPlayer - The player this tracker is assigned to.
 * @property {number} assignedPlayer.id - The ID of the assigned player.
 * @property {string} assignedPlayer.name - The name of the assigned player.
 * @property {number} assignedPlayer.jerseyNumber - The jersey number of the assigned player.
 * @property {'home' | 'away'} assignedPlayer.teamId - The team ID of the assigned player.
 * @property {string} assignedPlayer.teamName - The name of the assigned player's team.
 * @property {string[]} assignedEventTypes - An array of event types this tracker is responsible for.
 * @property {(eventType: EventType, playerId: number, teamId: 'home' | 'away', coordinates?: { x: number; y: number }) => void} recordEvent - Callback to record a match event.
 * @property {string} matchId - The ID of the current match.
 */
interface SpecializedTrackerUIProps {
  assignedPlayer: {
    id: number;
    name: string;
    jerseyNumber: number;
    teamId: 'home' | 'away';
    teamName: string;
  };
  assignedEventTypes: string[];
  recordEvent: (eventType: EventType, playerId: number, teamId: 'home' | 'away', coordinates?: { x: number; y: number }) => void;
  matchId: string;
}

/**
 * @component SpecializedTrackerUI
 * @description A user interface designed for a "specialized" tracker. This UI is highly focused, providing a clear
 * view of the single assigned player and the specific event types to track for that player.
 * It includes large, easy-to-use buttons for recording events and a clear set of instructions.
 * @param {SpecializedTrackerUIProps} props The props for the component.
 * @returns {JSX.Element} The rendered SpecializedTrackerUI component.
 */
const SpecializedTrackerUI: React.FC<SpecializedTrackerUIProps> = ({
  assignedPlayer,
  assignedEventTypes,
  recordEvent,
  matchId
}) => {
  const handleEventRecord = (eventType: EventType) => {
    recordEvent(
      eventType,
      assignedPlayer.id,
      assignedPlayer.teamId
    );
  };

  const eventTypeDisplay = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <div className="space-y-4">
      {/* Assignment Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-blue-600" />
            Specialized Tracking Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-600" />
            <div>
              <span className="font-medium">#{assignedPlayer.jerseyNumber} {assignedPlayer.name}</span>
              <Badge
                variant={assignedPlayer.teamId === 'home' ? 'default' : 'secondary'}
                className="ml-2"
              >
                {assignedPlayer.teamName}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Target className="h-4 w-4 text-gray-600 mt-1" />
            <div>
              <span className="font-medium">Assigned Events</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {assignedEventTypes.map(eventType => (
                  <Badge key={eventType} variant="outline" className="bg-white">
                    {eventTypeDisplay(eventType)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Record Events</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {assignedEventTypes.map(eventType => (
            <Button
              key={eventType}
              onClick={() => handleEventRecord(eventType as EventType)}
              size="lg"
              className="w-full h-20 text-lg font-semibold"
              variant="outline"
            >
              {eventTypeDisplay(eventType)}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Tracking Instructions:</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Focus only on player <strong>#{assignedPlayer.jerseyNumber} {assignedPlayer.name}</strong></li>
            <li>• Record only the events listed above.</li>
            <li>• Tap the button immediately when the event occurs.</li>
            <li>• Ignore all other events and players.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecializedTrackerUI;
