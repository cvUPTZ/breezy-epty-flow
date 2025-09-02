import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AssignmentLog {
  id: string;
  match_id: string | null;
  assigner_id: string;
  assignee_id: string | null;
  assignment_type: string;
  assignment_action: string;
  assignment_details: any;
  previous_assignment_details: any | null;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  // Joined data
  assigner_name?: string;
  assignee_name?: string;
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
      // First get the raw assignment logs
      let query = supabase
        .from('assignment_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (matchId) {
        query = query.eq('match_id', matchId);
      }

      const { data: logsData, error: logsError } = await query;

      if (logsError) {
        console.error('Error fetching assignment logs:', logsError);
        return;
      }

      if (!logsData || logsData.length === 0) {
        setLogs([]);
        return;
      }

      // Get unique user IDs and match IDs for batch fetching
      const userIds = new Set<string>();
      const matchIds = new Set<string>();
      
      logsData.forEach((log: any) => {
        if (log.assigner_id) userIds.add(log.assigner_id);
        if (log.assignee_id) userIds.add(log.assignee_id);
        if (log.match_id) matchIds.add(log.match_id);
      });

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds));

      // Fetch matches with player data
      const { data: matches } = await supabase
        .from('matches')
        .select('id, name, home_team_name, away_team_name, home_team_players, away_team_players')
        .in('id', Array.from(matchIds));

      // Fetch tracker assignments for enhanced data
      const trackerAssignmentIds = logsData
        .filter(log => {
          return log.assignment_type === 'tracker_assignment' && 
                 log.assignment_details && 
                 typeof log.assignment_details === 'object' &&
                 log.assignment_details !== null &&
                 'tracker_assignment_id' in log.assignment_details;
        })
        .map(log => {
          const details = log.assignment_details as any;
          return details.tracker_assignment_id;
        })
        .filter(id => id !== null && id !== undefined);

      let trackerAssignments: any[] = [];
      if (trackerAssignmentIds.length > 0) {
        const { data: assignmentsData } = await supabase
          .from('match_tracker_assignments')
          .select('*')
          .in('id', trackerAssignmentIds);
        trackerAssignments = assignmentsData || [];
      }

      // Create lookup maps
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const matchMap = new Map(matches?.map(m => [m.id, m]) || []);
      const trackerAssignmentMap = new Map(trackerAssignments.map(ta => [ta.id, ta]));

      const processedLogs = logsData.map((log: any) => {
        const baseLog = {
          ...log,
          assigner_name: profileMap.get(log.assigner_id)?.full_name || 'Unknown',
          assignee_name: log.assignee_id ? (profileMap.get(log.assignee_id)?.full_name || 'Unknown User') : 'System',
          match_name: log.match_id ? (matchMap.get(log.match_id)?.name || 'Unknown Match') : 'No Match'
        };

        // Add enhanced tracker assignment data
        if (log.assignment_type === 'tracker_assignment') {
          const match = matchMap.get(log.match_id);
          const details = log.assignment_details as any;
          const trackerAssignment = details?.tracker_assignment_id 
            ? trackerAssignmentMap.get(details.tracker_assignment_id)
            : null;

          if (trackerAssignment && match) {
            // Get player name from match data
            const players = [
              ...((match.home_team_players || []) as any[]).map((p: any) => ({...p, team: 'home', teamName: match.home_team_name})),
              ...((match.away_team_players || []) as any[]).map((p: any) => ({...p, team: 'away', teamName: match.away_team_name}))
            ];
            
            const player = players.find(p => p.id === trackerAssignment.player_id || p.id === trackerAssignment.assigned_player_id);
            
            baseLog.tracker_assignment = {
              player_id: trackerAssignment.player_id,
              assigned_player_id: trackerAssignment.assigned_player_id,
              player_team_id: trackerAssignment.player_team_id,
              assigned_event_types: trackerAssignment.assigned_event_types,
              player_name: player?.player_name || player?.name || 'Unknown Player',
              team_name: trackerAssignment.player_team_id === 'home' ? match.home_team_name : match.away_team_name
            };
          }
        }

        return baseLog;
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

  const logAssignment = async (
    matchId: string | null,
    assigneeId: string | null,
    assignmentType: string,
    assignmentAction: string,
    assignmentDetails: any,
    previousAssignmentDetails?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.error('No authenticated user found');
        return null;
      }

      const rpcParams = {
        p_match_id: matchId || '00000000-0000-0000-0000-000000000000',
        p_assigner_id: user.id,
        p_assignee_id: assigneeId || '00000000-0000-0000-0000-000000000000',
        p_assignment_type: assignmentType,
        p_assignment_action: assignmentAction,
        p_assignment_details: assignmentDetails || {},
        p_previous_assignment_details: previousAssignmentDetails
      };

      const { data, error } = await supabase.rpc('log_assignment', rpcParams);

      if (error) {
        console.error('Error logging assignment:', error);
        return null;
      }

      // Refresh logs after creating new one
      fetchLogs();
      return data;
    } catch (error) {
      console.error('Error logging assignment:', error);
      return null;
    }
  };

  return {
    logs,
    loading,
    refetch: fetchLogs,
    logAssignment
  };
};