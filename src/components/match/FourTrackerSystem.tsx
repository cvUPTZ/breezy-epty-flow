import React, { useState, useEffect } from 'react';
import { useFourTrackerSystem, Player } from '@/hooks/useFourTrackerSystem';
import BallTrackerInterface from './BallTrackerInterface';
import PlayerTrackerInterface from './PlayerTrackerInterface';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';

interface FourTrackerSystemProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
}

const FourTrackerSystem: React.FC<FourTrackerSystemProps> = ({
  homeTeamPlayers,
  awayTeamPlayers,
}) => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const [trackerType, setTrackerType] = useState<'ball' | 'player' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Combine all players
  const allPlayers = [...(homeTeamPlayers || []), ...(awayTeamPlayers || [])];

  const {
    assignment,
    currentBallHolder,
    isActiveTracker,
    updateBallPossession,
    recordEvent
  } = useFourTrackerSystem({
    matchId: matchId!,
    trackerId: user?.id!,
    trackerType: trackerType || 'player',
    allPlayers
  });

  useEffect(() => {
    if (!matchId || !user?.id) {
      setError("Match ID or User information is missing.");
      setLoading(false);
      return;
    }

    const fetchAssignment = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch a list of assignments instead of a single one to be robust.
        const { data: assignments, error: assignmentError } = await supabase
          .from('match_tracker_assignments')
          .select('*')
          .eq('match_id', matchId)
          .eq('tracker_user_id', user.id);

        if (assignmentError) {
          throw new Error(`Failed to fetch your assignment from the database.`);
        }

        if (!assignments || assignments.length === 0) {
          throw new Error('No assignment was found for your user for this match. Please ask an admin to assign you.');
        }

        // Safely use the first assignment found to prevent crashes.
        const dbAssignment: any = assignments[0];
        setTrackerType(dbAssignment.tracker_type as 'ball' | 'player');
      } catch (e: any) {
        setError(e.message);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [matchId, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading Tracker...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-600 bg-red-50 rounded-lg">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Error Loading Tracker</p>
        <p className="text-center text-sm">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
         <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Authenticating...</span>
      </div>
    );
  }

  if (!matchId || !trackerType) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-gray-600 bg-gray-50 rounded-lg">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p className="font-semibold">Could not load tracker.</p>
            <p className="text-center text-sm">No assignment was found for you for this match.</p>
        </div>
    );
  }

  return (
    <div>
      {trackerType === 'ball' ? (
        <BallTrackerInterface
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          homeTeamName="Home Team"
          awayTeamName="Away Team"
          currentBallHolder={currentBallHolder}
          onSelectPlayer={updateBallPossession}
        />
      ) : (
        <PlayerTrackerInterface
          assignedPlayers={assignment?.assigned_players || []}
          currentBallHolder={currentBallHolder}
          isActive={isActiveTracker}
          assignedEventTypes={['shot', 'foul', 'tackle', 'dribble', 'clearance']}
          onRecordEvent={recordEvent}
        />
      )}
    </div>
  );
};

export default FourTrackerSystem;