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
    player_ids?: number[];
    assigned_player_ids?: number[];
    player_team_id?: string;
    assigned_event_types?: string[];
    player_names?: string[];
    team_name?: string;
    tracker_type?: string;
    line_players_count?: number;
    // Video tracking fields
    video_url?: string;
    video_title?: string;
    status?: string;
  };
}

export const useAssignmentLogs = (matchId?: string) => {
  const [logs, setLogs] = useState<AssignmentLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // @ts-ignore - RPC function type not in generated types yet
      const { data, error } = await supabase.rpc('get_all_assignment_logs', {
        p_match_id: matchId,
      });

      if (error) {
        console.error('Error fetching assignment logs:', error);
        throw error;
      }

      setLogs((data || []) as unknown as AssignmentLog[]);
    } catch (error) {
      console.error('Error in fetchLogs:', error);
      setLogs([]); // Clear logs on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [matchId]);

  return {
    logs,
    loading,
    refetch: fetchLogs,
  };
};