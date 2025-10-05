import React, { useState, useEffect } from 'react';
import { useFourTrackerSystem, Player } from '@/hooks/useFourTrackerSystem';
import BallTrackerInterface from './BallTrackerInterface';
import PlayerTrackerInterface from './PlayerTrackerInterface';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FourTrackerSystemProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  homeTeamName?: string;
  awayTeamName?: string;
}

// Error Boundary Component
class TrackerErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Tracker Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <Card className="bg-red-50 border-red-300">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="font-semibold text-lg text-red-900 mb-2">
                Tracker Interface Error
              </h3>
              <p className="text-sm text-red-700 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

const FourTrackerSystem: React.FC<FourTrackerSystemProps> = ({
  homeTeamPlayers,
  awayTeamPlayers,
  homeTeamName = 'Home Team',
  awayTeamName = 'Away Team',
}) => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
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
    markAllAsPass,
    isOnline,
  } = useFourTrackerSystem({
    matchId: matchId!,
    trackerId: user?.id!,
    trackerType: trackerType || 'player',
    allPlayers,
    supabase: supabase,
    toast: toast,
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
        const assignedType = dbAssignment.tracker_type as 'ball' | 'player';
        
        // Validate tracker type
        if (assignedType !== 'ball' && assignedType !== 'player') {
          throw new Error(`Invalid tracker type: ${assignedType}`);
        }
        
        setTrackerType(assignedType);
      } catch (e: any) {
        setError(e.message);
        console.error('Assignment fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [matchId, user?.id]);

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600" />
            <span className="text-muted-foreground">Loading Tracker...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-300 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="h-12 w-12 mb-4 text-red-600" />
            <p className="font-semibold text-lg text-red-900 mb-2">Error Loading Tracker</p>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Auth check
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600" />
            <span className="text-muted-foreground">Authenticating...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Validation check
  if (!matchId || !trackerType) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="h-12 w-12 mb-4 text-gray-600" />
            <p className="font-semibold text-lg text-gray-900 mb-2">Could not load tracker</p>
            <p className="text-sm text-gray-700">No assignment was found for you for this match.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render appropriate tracker interface with error boundary
  return (
    <TrackerErrorBoundary>
      <div className="space-y-4">
        {trackerType === 'ball' ? (
          <BallTrackerInterface
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            currentBallHolder={currentBallHolder}
            isOnline={isOnline}
            onSelectPlayer={updateBallPossession}
          />
        ) : (
          <PlayerTrackerInterface
            assignedPlayers={assignment?.assigned_players || []}
            pendingEvents={pendingEvents}
            assignedEventTypes={assignment?.assigned_event_types || []}
            isOnline={isOnline}
            onRecordEvent={recordEventForPending}
            onClearEvent={clearPendingEvent}
            onClearAll={clearAllPendingEvents}
            onMarkAllAsPass={markAllAsPass}
          />
        )}
      </div>
    </TrackerErrorBoundary>
  );
};

export default FourTrackerSystem;
