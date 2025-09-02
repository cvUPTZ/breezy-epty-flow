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
      let query = supabase
        .from('assignment_logs')
        .select(`
          *,
          assigner:assigner_id(id, full_name),
          assignee:assignee_id(id, full_name),
          match:match_id(id, name)
        `)
        .order('created_at', { ascending: false });

      if (matchId) {
        query = query.eq('match_id', matchId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assignment logs:', error);
        return;
      }

      const processedLogs = data?.map((log: any) => ({
        ...log,
        assigner_name: log.assigner?.full_name || 'Unknown',
        assignee_name: log.assignee?.full_name || 'System',
        match_name: log.match?.name || 'Unknown Match'
      })) || [];

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