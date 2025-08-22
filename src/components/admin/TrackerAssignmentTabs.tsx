
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import TrackerTypeAssignment from './TrackerTypeAssignment';

interface TrackerAssignmentTabsProps {
  matchId: string;
  homeTeamPlayers: any[];
  awayTeamPlayers: any[];
}

const TrackerAssignmentTabs: React.FC<TrackerAssignmentTabsProps> = ({
  matchId,
  homeTeamPlayers,
  awayTeamPlayers
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tracker Type Assignment System
          </CardTitle>
          <p className="text-sm text-gray-600">
            Assign trackers by type: Specialized, Defence, Midfield, or Attack trackers
          </p>
        </CardHeader>
        <CardContent>
          <TrackerTypeAssignment
            matchId={matchId}
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackerAssignmentTabs;
