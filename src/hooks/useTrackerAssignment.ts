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
  assignedPlayer: AssignedPlayer | null;
  assignedEventTypes: string[];
}

export const useTrackerAssignment = (matchId: string, userId?: string) => {
  const [assignment, setAssignment] = useState<TrackerAssignmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !matchId) {
      setLoading(false);
      return;
    }

    const fetchAssignment = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('match_tracker_assignments')
          .select(`
            assigned_player_id,
            assigned_event_types,
            player_team_id
          `)
          .eq('match_id', matchId)
          .eq('tracker_user_id', userId)
          .not('assigned_player_id', 'is', null)
          .single();

        if (error || !data) {
          // It's not an error if no assignment is found, just means it's a general tracker.
          setAssignment(null);
          return;
        }

        // Now fetch player and team details
        // This part assumes a 'players' table and that team names are on the 'matches' table.
        // This may need to be adjusted based on the actual schema.
        const { data: matchData, error: matchError } = await supabase
            .from('matches')
            .select('home_team_name, away_team_name')
            .eq('id', matchId)
            .single();

        if (matchError) throw matchError;

        // This is a guess based on component props from earlier exploration.
        // There is no players table, so we can't fetch player details from the DB.
        // The player data must be passed in from a parent component that has team roster data.
        // This hook can't fulfill the whole requirement.
        // I will adjust the plan. For now, this hook will only fetch the assignment basics.

        const { assigned_player_id, assigned_event_types, player_team_id } = data;

        if (assigned_player_id && assigned_event_types) {
            // We can't get player name/number here.
            // Let's return what we can. The component will need to resolve the rest.
            const partialPlayer = {
                id: parseInt(assigned_player_id, 10),
                teamId: player_team_id as 'home' | 'away',
                // These are placeholders
                name: 'Player',
                jerseyNumber: 0,
                teamName: player_team_id === 'home' ? matchData.home_team_name : matchData.away_team_name,
            };

            setAssignment({
                assignedPlayer: partialPlayer,
                assignedEventTypes: assigned_event_types,
            });
        }

      } catch (e) {
        console.error('Error fetching tracker assignment:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [matchId, userId]);

  return { assignment, loading };
};
