import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AssignmentLog {
  id: string;
  match_id: string | null;
  tracker_user_id: string;
  assignment_action: string;
  assignment_type?: string;
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
    tracker_type?: string;
    line_players_count?: number;
  };
}

export const useAssignmentLogs = (matchId?: string) => {
  const [logs, setLogs] = useState<AssignmentLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const allLogs: any[] = [];

      // Fetch from match_tracker_assignments (individual player assignments)
      let individualQuery = supabase
        .from('match_tracker_assignments')
        .select(`
          *,
          profiles:tracker_user_id(full_name),
          matches:match_id(id, name, home_team_name, away_team_name, home_team_players, away_team_players)
        `)
        .order('created_at', { ascending: false });

      if (matchId) {
        individualQuery = individualQuery.eq('match_id', matchId);
      }

      const { data: individualAssignments, error: individualError } = await individualQuery;

      if (individualError) {
        console.error('Error fetching individual assignments:', individualError);
      } else if (individualAssignments) {
        const processedIndividual = individualAssignments.map((assignment: any) => {
          const match = assignment.matches;
          let playerName = 'Unknown Player';
          let teamName = '';

          if (match && assignment.assigned_player_id) {
            // Get player name from match data
            const players = [
              ...((match.home_team_players || []) as any[]).map((p: any) => ({...p, team: 'home', teamName: match.home_team_name})),
              ...((match.away_team_players || []) as any[]).map((p: any) => ({...p, team: 'away', teamName: match.away_team_name}))
            ];
            
            const player = players.find(p => p.number === assignment.assigned_player_id || p.id === assignment.assigned_player_id);
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
            assignment_type: 'individual',
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
        allLogs.push(...processedIndividual);
      }

      // Fetch from tracker_line_assignments (line-based assignments)
      let lineQuery = supabase
        .from('tracker_line_assignments')
        .select(`
          *,
          profiles:tracker_user_id(full_name),
          matches:match_id(id, name, home_team_name, away_team_name, home_team_players, away_team_players)
        `)
        .order('created_at', { ascending: false });

      if (matchId) {
        lineQuery = lineQuery.eq('match_id', matchId);
      }

      const { data: lineAssignments, error: lineError } = await lineQuery;

      if (lineError) {
        console.error('Error fetching line assignments:', lineError);
      } else if (lineAssignments) {
        const processedLine = lineAssignments.map((assignment: any) => {
          const match = assignment.matches;
          let playerNames: string[] = [];
          let teamName = '';

          if (assignment.line_players && Array.isArray(assignment.line_players)) {
            // Extract player names from line_players array
            playerNames = assignment.line_players.map((player: any) => 
              player.player_name || player.name || 'Unknown Player'
            );
            
            // Get team info from the first player
            if (assignment.line_players.length > 0) {
              const firstPlayer = assignment.line_players[0];
              if (firstPlayer.team === 'home') {
                teamName = match?.home_team_name || 'Home Team';
              } else if (firstPlayer.team === 'away') {
                teamName = match?.away_team_name || 'Away Team';
              }
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
            assignment_type: 'line',
            tracker_assignment: {
              assigned_event_types: assignment.assigned_event_types,
              player_name: playerNames.length > 0 ? playerNames.join(', ') : 'No players assigned',
              team_name: teamName,
              tracker_type: assignment.tracker_type,
              line_players_count: assignment.line_players?.length || 0
            }
          };
        });
        allLogs.push(...processedLine);
      }

      // Sort all logs by created_at desc
      allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLogs(allLogs);
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