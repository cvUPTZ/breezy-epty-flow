// hooks/useTrackerAssignments.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { parsePlayerIds } from '@/utils/parsing';

export interface Player {
  id: number;
  jersey_number: number;
  player_name: string;
  team: 'home' | 'away';
  position?: string;
}

export interface TrackerUser {
  id: string;
  email: string | null;
  full_name?: string | null;
  role: 'admin' | 'user' | 'tracker' | 'teacher';
}

export interface Assignment {
  id: string;
  tracker_user_id: string;
  tracker_name: string;
  tracker_email: string;
  player_ids: number[];
  assigned_event_types: string[];
}

interface DatabaseAssignment {
  id: string;
  tracker_user_id: string;
  assigned_player_id?: number | null;
  assigned_player_ids?: unknown;
  assigned_event_types: string[] | null;
  profiles?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

interface UseTrackerAssignmentsProps {
  matchId?: string;
  homeTeamPlayers: Player[];
  onAssignmentsChange?: (assignments: Assignment[]) => void;
}

interface UseTrackerAssignmentsReturn {
  trackers: TrackerUser[];
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  refetchTrackers: () => Promise<void>;
  refetchAssignments: () => Promise<void>;
  createAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<Assignment | null>;
  deleteAssignment: (assignmentId: string) => Promise<boolean>;
}

const validateAssignmentData = (data: any[]): data is DatabaseAssignment[] => {
  return Array.isArray(data) && data.every(item =>
    typeof item === 'object' && item != null &&
    typeof item.id === 'string' &&
    typeof item.tracker_user_id === 'string'
  );
};

const processAssignments = (rawAssignments: DatabaseAssignment[]): Assignment[] => {
  try {
    const grouped = rawAssignments.reduce((acc, assignment) => {
      const key = assignment.tracker_user_id;

      if (!acc[key]) {
        acc[key] = {
          id: assignment.id,
          tracker_user_id: assignment.tracker_user_id,
          tracker_name: assignment.profiles?.full_name || 'Unknown',
          tracker_email: assignment.profiles?.email || 'Unknown',
          player_ids: [],
          assigned_event_types: [...(assignment.assigned_event_types || [])]
        };
      }

      const playerIds = new Set(acc[key].player_ids);

      // Handle single player ID for backwards compatibility
      if (assignment.assigned_player_id != null) {
        playerIds.add(assignment.assigned_player_id);
      }

      // Handle plural player IDs (string or array)
      if (assignment.assigned_player_ids) {
        parsePlayerIds(assignment.assigned_player_ids).forEach(id => playerIds.add(id));
      }

      acc[key].player_ids = Array.from(playerIds);

      return acc;
    }, {} as Record<string, Assignment>);

    return Object.values(grouped);
  } catch (error) {
    console.error('Error processing assignments:', error);
    return [];
  }
};

export const useTrackerAssignments = ({
  matchId,
  homeTeamPlayers,
  onAssignmentsChange
}: UseTrackerAssignmentsProps): UseTrackerAssignmentsReturn => {
  const { toast } = useToast();
  const [trackers, setTrackers] = useState<TrackerUser[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const safeAsync = useCallback(async <T,>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    try {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const result = await operation();
      return mountedRef.current ? result : null;
    } catch (error: any) {
      if (error.name !== 'AbortError' && mountedRef.current) {
        console.error('Async operation error:', error);
        setError(error.message || 'Operation failed');
      }
      return null;
    }
  }, []);

  const refetchTrackers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await safeAsync(async () => {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('get-tracker-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) throw error;
      return data || [];
    });

    if (result && mountedRef.current) {
      setTrackers(result);
    }
    setLoading(false);
  }, [safeAsync]);

  const refetchAssignments = useCallback(async () => {
    if (!matchId) return;

    setLoading(true);
    setError(null);

    const result = await safeAsync(async () => {
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .abortSignal(abortControllerRef.current!.signal);

      if (assignmentsError) throw assignmentsError;
      if (!assignmentsData || assignmentsData.length === 0) {
        return [];
      }

      if (!validateAssignmentData(assignmentsData)) {
        throw new Error('Invalid assignment data structure received');
      }

      const trackerUserIds = [...new Set(assignmentsData.map(a => a.tracker_user_id))];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', trackerUserIds)
        .abortSignal(abortControllerRef.current!.signal);

      if (profilesError) {
        console.warn('Failed to fetch profiles:', profilesError);
      }

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const enrichedAssignments = assignmentsData.map(assignment => ({
        ...assignment,
        profiles: profilesMap.get(assignment.tracker_user_id) || null
      }));

      return processAssignments(enrichedAssignments);
    });

    if (result && mountedRef.current) {
      setAssignments(result);
      onAssignmentsChange?.(result);
    }
    setLoading(false);
  }, [matchId, safeAsync, onAssignmentsChange]);

  const sendNotificationToTracker = useCallback(async (trackerId: string, matchId: string, videoUrl?: string) => {
    try {
      const notificationType = videoUrl ? 'video_assignment' : 'match_assignment';
      const notificationTitle = videoUrl ? 'New Video Tracking Assignment' : 'New Match Assignment';
      const notificationMessage = videoUrl
        ? 'You have been assigned to track video analysis.'
        : 'You have been assigned to track a new match.';

      const { error } = await supabase.from('notifications').insert({
        user_id: trackerId,
        match_id: matchId,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        notification_data: {
          match_id: matchId,
          assignment_type: videoUrl ? 'video_tracking' : 'match_tracking',
          video_url: videoUrl || null
        },
        is_read: false,
      });

      if (error) {
        console.warn('Failed to send notification:', error);
      }
    } catch (error) {
      console.warn('Notification error:', error);
    }
  }, []);

  const createAssignment = useCallback(async (
    assignmentData: Omit<Assignment, 'id'> & { videoUrl?: string }
  ): Promise<Assignment | null> => {
    if (!matchId) return null;

    const result = await safeAsync(async () => {
      const dbRecords = assignmentData.player_ids.map(playerId => {
        const playerTeamId = homeTeamPlayers.some(p => p.id === playerId) ? 'home' : 'away';

        return {
          match_id: matchId,
          tracker_user_id: assignmentData.tracker_user_id,
          assigned_player_id: playerId,
          player_team_id: playerTeamId,
          assigned_event_types: assignmentData.assigned_event_types,
        };
      });

      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .insert(dbRecords)
        .select('id');

      if (error) throw error;

      const assignmentId = data?.[0]?.id || `temp-${Date.now()}`;

      // Send notification
      await sendNotificationToTracker(
        assignmentData.tracker_user_id,
        matchId,
        assignmentData.videoUrl
      );

      const newAssignment: Assignment = {
        ...assignmentData,
        id: assignmentId
      };

      return newAssignment;
    });

    if (result && mountedRef.current) {
      const updatedAssignments = [...assignments, result];
      setAssignments(updatedAssignments);
      onAssignmentsChange?.(updatedAssignments);

      toast({
        title: "Success",
        description: "Assignment created successfully"
      });
    }

    return result;
  }, [matchId, homeTeamPlayers, assignments, onAssignmentsChange, sendNotificationToTracker, safeAsync, toast]);

  const deleteAssignment = useCallback(async (assignmentId: string): Promise<boolean> => {
    const result = await safeAsync(async () => {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      if (matchId && !assignmentId.startsWith('temp-')) {
        const { error } = await supabase
          .from('match_tracker_assignments')
          .delete()
          .eq('id', assignmentId)
          .abortSignal(abortControllerRef.current!.signal);

        if (error) throw error;
      }

      return true;
    });

    if (result && mountedRef.current) {
      const updatedAssignments = assignments.filter(a => a.id !== assignmentId);
      setAssignments(updatedAssignments);
      onAssignmentsChange?.(updatedAssignments);

      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      });
    }

    return !!result;
  }, [assignments, matchId, onAssignmentsChange, safeAsync, toast]);

  // Initial data loading
  useEffect(() => {
    refetchTrackers();
  }, [refetchTrackers]);

  useEffect(() => {
    if (matchId) {
      refetchAssignments();
    }
  }, [matchId, refetchAssignments]);

  return {
    trackers,
    assignments,
    loading,
    error,
    refetchTrackers,
    refetchAssignments,
    createAssignment,
    deleteAssignment
  };
};

// Alias export for backwards compatibility
export { useTrackerAssignments as useTrackerAssignment };
