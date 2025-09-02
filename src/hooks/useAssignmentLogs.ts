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

      // Fetch matches
      const { data: matches } = await supabase
        .from('matches')
        .select('id, name')
        .in('id', Array.from(matchIds));

      // Create lookup maps
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const matchMap = new Map(matches?.map(m => [m.id, m]) || []);

      const processedLogs = logsData.map((log: any) => ({
        ...log,
        assigner_name: profileMap.get(log.assigner_id)?.full_name || 'Unknown',
        assignee_name: log.assignee_id ? (profileMap.get(log.assignee_id)?.full_name || 'Unknown User') : 'System',
        match_name: log.match_id ? (matchMap.get(log.match_id)?.name || 'Unknown Match') : 'No Match'
      }));

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
        p_match_id: matchId || '',
        p_assigner_id: user.id,
        p_assignee_id: assigneeId || '',
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