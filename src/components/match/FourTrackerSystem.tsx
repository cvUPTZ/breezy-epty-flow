import React, { useState, useEffect } from 'react';
import { useFourTrackerSystem, Player } from '@/hooks/useFourTrackerSystem';
import BallTrackerInterface from './BallTrackerInterface';
import PlayerTrackerInterface from './PlayerTrackerInterface';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';

const FourTrackerSystem: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const [trackerType, setTrackerType] = useState<'ball' | 'player' | null>(null);
  const [homeTeam, setHomeTeam] = useState<Player[]>([]);
  const [awayTeam, setAwayTeam] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  });

  useEffect(() => {
    if (!matchId || !user?.id) {
      setError("Match ID or User information is missing.");
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Determine tracker type based on assignment
        const { data: assignments, error: assignmentError } = await supabase
          .from('match_tracker_assignments')
          .select('tracker_type')
          .eq('match_id', matchId)
          .eq('tracker_user_id', user.id);

        if (assignmentError) throw new Error(`Failed to fetch your assignment. (Error: ${assignmentError.message})`);
        if (!assignments || assignments.length === 0) throw new Error('No assignment found for this user for this match.');

        // Use the first assignment found to be robust against duplicate entries
        setTrackerType(assignments[0].tracker_type);

        // 2. Fetch players for both teams from the 'match_players' table
        const { data: playersData, error: playersError } = await supabase
          .from('match_players')
          .select('team, players(id, player_name, jersey_number)')
          .eq('match_id', matchId);

        if (playersError) throw new Error(`Error fetching players: ${playersError.message}`);

        const formattedPlayers: Player[] = playersData.map((p: any) => ({
          id: p.players.id,
          jersey_number: p.players.jersey_number,
          player_name: p.players.player_name,
          team: p.team,
        }));

        setHomeTeam(formattedPlayers.filter(p => p.team === 'home'));
        setAwayTeam(formattedPlayers.filter(p => p.team === 'away'));
      } catch (e: any) {
        setError(e.message);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
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
          homeTeamPlayers={homeTeam}
          awayTeamPlayers={awayTeam}
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