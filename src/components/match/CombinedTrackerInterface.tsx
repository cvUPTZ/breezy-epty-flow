import React from 'react';
import BallTrackerInterface from './BallTrackerInterface';
import PlayerTrackerInterface from './PlayerTrackerInterface';
import { Player, PendingEvent } from '@/hooks/useFourTrackerSystem';

interface CombinedTrackerInterfaceProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  homeTeamName?: string;
  awayTeamName?: string;
  currentBallHolder?: Player | null;
  isOnline?: boolean;
  onSelectPlayer: (player: Player) => void;
  videoUrl?: string;
  assignedPlayers: Player[];
  pendingEvents: PendingEvent[];
  assignedEventTypes: string[];
  onRecordEvent: (pendingEventId: string, eventType: string) => void;
  onClearEvent: (eventId: string) => void;
  onClearAll: () => void;
  onMarkAllAsPass: () => Promise<void>;
}

const CombinedTrackerInterface: React.FC<CombinedTrackerInterfaceProps> = (props) => {
  const defaultEventTypes = [
    'pass', 'shot', 'tackle', 'interception', 'dribble', 'foul', 'goal'
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <PlayerTrackerInterface
          assignedPlayers={props.assignedPlayers}
          pendingEvents={props.pendingEvents}
          assignedEventTypes={props.assignedEventTypes.length > 0 ? props.assignedEventTypes : defaultEventTypes}
          isOnline={props.isOnline}
          onRecordEvent={props.onRecordEvent}
          onClearEvent={props.onClearEvent}
          onClearAll={props.onClearAll}
          onMarkAllAsPass={props.onMarkAllAsPass}
          videoUrl={props.videoUrl}
        />
      </div>
      <div>
        <BallTrackerInterface
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          homeTeamName={props.homeTeamName}
          awayTeamName={props.awayTeamName}
          currentBallHolder={props.currentBallHolder}
          isOnline={props.isOnline}
          onSelectPlayer={props.onSelectPlayer}
          videoUrl={props.videoUrl}
        />
      </div>
    </div>
  );
};

export default CombinedTrackerInterface;