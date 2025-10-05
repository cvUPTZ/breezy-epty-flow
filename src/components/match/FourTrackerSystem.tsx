// components/FourTrackerSystemEnhanced.tsx
import React, { useState, useEffect } from 'react';
import { useFourTrackerSystemEnhanced, Player } from '@/hooks/useFourTrackerSystemEnhanced';
import BallTrackerInterface from './BallTrackerInterface';
import PlayerTrackerInterfaceEnhanced from './PlayerTrackerInterfaceEnhanced';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';

interface FourTrackerSystemEnhancedProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  homeTeamName?: string;
  awayTeamName?: string;
}

const FourTrackerSystem: React.FC<FourTrackerSystemEnhancedProps> = ({
  homeTeamPlayers,
  awayTeamPlayers,
  homeTeamName = 'Home Team',
  awayTeamName = 'Away Team',
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
    pendingEvents,
    updateBallPossession,
    recordEventForPending,
    clearPendingEvent,
    clearAllPendingEvents,
    markAllAsPass
  } = useFourTrackerSystemEnhanced({
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
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          currentBallHolder={currentBallHolder}
          onSelectPlayer={updateBallPossession}
        />
      ) : (
        <PlayerTrackerInterfaceEnhanced
          assignedPlayers={assignment?.assigned_players || []}
          pendingEvents={pendingEvents}
          assignedEventTypes={assignment?.assigned_event_types || []}
          onRecordEvent={recordEventForPending}
          onClearEvent={clearPendingEvent}
          onClearAll={clearAllPendingEvents}
          onMarkAllAsPass={markAllAsPass}
        />
      )}
    </div>
  );
};

export default FourTrackerSystem;
