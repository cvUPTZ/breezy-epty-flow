import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AssignedPlayer {
  id: number;
  name: string;
  jerseyNumber: number;
  teamId: 'home' | 'away';
  teamName: string;
}

export interface TrackerAssignmentData {
  assignments: Array<{
    assignedPlayer: AssignedPlayer;
    assignedEventTypes: string[];
    assignmentId: string;
  }>;
}

export const useTrackerAssignment = (matchId: string, userId?: string) => {
  const [assignment, setAssignment] = useState<TrackerAssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId || !matchId) {
      setLoading(false);
      return;
    }

    const fetchAssignment = async () => {
      setLoading(true);
      try {
        console.log('useTrackerAssignment: Fetching tracker assignments for:', {
          matchId,
          userId
        });

        const { data, error } = await supabase
          .from('match_tracker_assignments')
          .select(`
            id,
            assigned_player_id,
            assigned_event_types,
            player_team_id
          `)
          .eq('match_id', matchId)
          .eq('tracker_user_id', userId)
          .not('assigned_player_id', 'is', null);

        console.log('useTrackerAssignment: Query result:', { data, error });

        if (error || !data || data.length === 0) {
          console.log('useTrackerAssignment: No assignments found or error:', { error, dataLength: data?.length });
          setAssignment(null);
          return;
        }

        // Fetch match data for team names
        const { data: matchData, error: matchError } = await supabase
            .from('matches')
            .select('home_team_name, away_team_name')
            .eq('id', matchId)
            .single();

        if (matchError) throw matchError;

        console.log('useTrackerAssignment: Match data fetched:', matchData);

        // Fetch match roster data to get player details
        const { data: matchRosterData, error: rosterError } = await supabase
          .from('matches')
          .select('home_team_players, away_team_players')
          .eq('id', matchId)
          .single();

        if (rosterError) throw rosterError;

        // Create player lookup map
        const homeTeamPlayers = Array.isArray(matchRosterData.home_team_players) 
          ? matchRosterData.home_team_players as any[]
          : [];
        const awayTeamPlayers = Array.isArray(matchRosterData.away_team_players) 
          ? matchRosterData.away_team_players as any[]
          : [];
        
        const allPlayers = [
          ...homeTeamPlayers.map((p: any) => ({ ...p, teamId: 'home' })),
          ...awayTeamPlayers.map((p: any) => ({ ...p, teamId: 'away' }))
        ];

        // Process all assignments
        const assignments = data.map((assignment: any) => {
          const playerId = typeof assignment.assigned_player_id === 'string' 
            ? parseInt(assignment.assigned_player_id, 10) 
            : assignment.assigned_player_id;
          
          // Find player in roster (using number field as ID since ID is 0 for all)
          const playerData = allPlayers.find((p: any) => p.number === playerId);
          
          return {
            assignmentId: assignment.id,
            assignedPlayer: {
              id: playerId,
              teamId: assignment.player_team_id as 'home' | 'away',
              name: playerData?.name || `Player ${playerId}`,
              jerseyNumber: playerData?.number || playerId,
              teamName: assignment.player_team_id === 'home' ? matchData.home_team_name : matchData.away_team_name,
            },
            assignedEventTypes: assignment.assigned_event_types,
          };
        });

        console.log('useTrackerAssignment: Processed assignments:', assignments);

        setAssignment({ assignments });

      } catch (e) {
        console.error('Error fetching tracker assignment:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();

    // Set up real-time subscription
    const channel = supabase
      .channel(`tracker_assignments_${matchId}_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_tracker_assignments',
          filter: `match_id=eq.${matchId},tracker_user_id=eq.${userId}`
        },
        () => {
          console.log('Real-time update received, refetching assignments');
          fetchAssignment();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('Real-time connection established for tracker assignments');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, userId]);

  return { assignment, loading, isConnected };
};
