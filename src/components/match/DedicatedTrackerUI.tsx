
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventType } from '@/types';

/**
 * @interface DedicatedTrackerUIProps
 * @description Props for the DedicatedTrackerUI component.
 * @property {object} assignedPlayerForMatch - The player assigned to this tracker.
 * @property {string|number} assignedPlayerForMatch.id - The ID of the assigned player.
 * @property {string} assignedPlayerForMatch.name - The name of the assigned player.
 * @property {'home'|'away'} assignedPlayerForMatch.teamId - The team ID of the assigned player.
 * @property {string} assignedPlayerForMatch.teamName - The team name of the assigned player.
 * @property {(eventType: EventType, playerId: string | number, teamId: 'home' | 'away', coordinates?: { x: number; y: number }) => void} recordEvent - Function to record a match event.
 * @property {string[]} assignedEventTypes - The list of event types this tracker is responsible for.
 * @property {string} matchId - The ID of the current match.
 */
interface DedicatedTrackerUIProps {
  assignedPlayerForMatch: {
    id: string | number;
    name: string;
    teamId: 'home' | 'away';
    teamName: string;
  };
  recordEvent: (eventType: EventType, playerId: string | number, teamId: 'home' | 'away', coordinates?: { x: number; y: number }) => void;
  assignedEventTypes: string[];
  matchId: string;
}

/**
 * @component DedicatedTrackerUI
 * @description A user interface for a dedicated tracker. This UI is focused on a single player and allows the tracker
 * to record specific, pre-assigned event types for that player.
 * @param {DedicatedTrackerUIProps} props The props for the component.
 * @returns {JSX.Element} The rendered DedicatedTrackerUI component.
 */
const DedicatedTrackerUI: React.FC<DedicatedTrackerUIProps> = ({
  assignedPlayerForMatch,
  recordEvent,
  assignedEventTypes,
  matchId
}) => {
  const handleEventRecord = (eventType: string) => {
    recordEvent(
      eventType as EventType,
      assignedPlayerForMatch.id,
      assignedPlayerForMatch.teamId
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dedicated Tracker - {assignedPlayerForMatch.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Team: {assignedPlayerForMatch.teamName} | Match: {matchId}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {assignedEventTypes.map((eventType) => (
            <Button
              key={eventType}
              onClick={() => handleEventRecord(eventType)}
              variant="outline"
              className="h-12"
            >
              {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DedicatedTrackerUI;
