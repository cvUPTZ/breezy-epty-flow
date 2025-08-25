// src/pages/TrackerManagementPageWrapper.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useMatchData } from '@/hooks/useMatchData';
import TrackerManagementPage from '@/pages/TrackerManagementPage';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Loader } from 'lucide-react';

const TrackerManagementPageWrapper: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { match, homeTeamPlayers, awayTeamPlayers, trackerUsers, assignments, loading, error } = useMatchData(matchId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading match data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-medium text-destructive mb-2">
              Error loading match data
            </h3>
            <p className="text-muted-foreground">
              There was a problem fetching the data for this match. Please try again later.
            </p>
            <pre className="mt-4 text-xs text-left bg-muted p-2 rounded-md">{error.message}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium">Match not found</h3>
            <p className="text-muted-foreground">
              The requested match could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TrackerManagementPage
      match={match}
      homeTeamPlayers={homeTeamPlayers}
      awayTeamPlayers={awayTeamPlayers}
      trackerUsers={trackerUsers}
      initialAssignments={assignments}
    />
  );
};

export default TrackerManagementPageWrapper;
