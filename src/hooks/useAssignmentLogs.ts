import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AssignmentLog {
  id: string;
  match_id: string | null;
  tracker_user_id: string;
  assignment_action: string;
  created_at: string;
  // Joined data
  tracker_name?: string;
  match_name?: string;
  // Enhanced tracker assignment data
  tracker_assignment?: {
    player_id?: number;
    assigned_player_id?: number;
    player_team_id?: string;
    assigned_event_types?: string[];
    player_name?: string;
    team_name?: string;
  };
}

export const useAssignmentLogs = (matchId?: string) => {
  const [logs, setLogs] = useState<AssignmentLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Fetch directly from match_tracker_assignments with related data
      let query = supabase
        .from('match_tracker_assignments')
        .select(`
          *,
          profiles:tracker_user_id(full_name),
          matches:match_id(id, name, home_team_name, away_team_name, home_team_players, away_team_players)
        `)
        .order('created_at', { ascending: false });

      if (matchId) {
        query = query.eq('match_id', matchId);
      }

      const { data: assignmentsData, error: assignmentsError } = await query;

      if (assignmentsError) {
        console.error('Error fetching tracker assignments:', assignmentsError);
        return;
      }

      if (!assignmentsData || assignmentsData.length === 0) {
        setLogs([]);
        return;
      }

      const processedLogs = assignmentsData.map((assignment: any) => {
        const match = assignment.matches;
        let playerName = 'Unknown Player';
        let teamName = '';

        if (match && assignment.assigned_player_id) {
          // Get player name from match data
          const players = [
            ...((match.home_team_players || []) as any[]).map((p: any) => ({...p, team: 'home', teamName: match.home_team_name})),
            ...((match.away_team_players || []) as any[]).map((p: any) => ({...p, team: 'away', teamName: match.away_team_name}))
          ];
          
          const player = players.find(p => p.id === assignment.assigned_player_id);
          if (player) {
            playerName = player.player_name || player.name || 'Unknown Player';
            teamName = player.teamName;
          }
        }

        return {
          id: assignment.id,
          match_id: assignment.match_id,
          tracker_user_id: assignment.tracker_user_id,
          assignment_action: assignment.updated_at > assignment.created_at ? 'updated' : 'created',
          created_at: assignment.created_at,
          tracker_name: assignment.profiles?.full_name || 'Unknown Tracker',
          match_name: match?.name || 'Unknown Match',
          tracker_assignment: {
            player_id: assignment.player_id,
            assigned_player_id: assignment.assigned_player_id,
            player_team_id: assignment.player_team_id,
            assigned_event_types: assignment.assigned_event_types,
            player_name: playerName,
            team_name: teamName
          }
        };
      });

      setLogs(processedLogs);
    } catch (error) {
      console.error('Error fetching assignment logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [matchId]);

  // No longer needed - logs are derived from match_tracker_assignments table

  return {
    logs,
    loading,
    refetch: fetchLogs
  };
};