
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TrackerUser, Assignment } from '../types/TrackerAssignmentTypes';

export const useSpecializedAssignments = (matchId: string) => {
  const [trackerUsers, setTrackerUsers] = useState<TrackerUser[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrackerUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('role', 'tracker')
        .order('full_name');

      if (error) throw error;

      const typedUsers: TrackerUser[] = (data || [])
        .filter(user => user.id)
        .map(user => ({
          id: user.id!,
          email: user.email || 'No email',
          full_name: user.full_name || 'No name',
        }));

      setTrackerUsers(typedUsers);
    } catch (error: any) {
      console.error('Error fetching tracker users:', error);
      toast.error('Failed to fetch tracker users');
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select(`
          id,
          tracker_user_id,
          assigned_player_id,
          player_team_id,
          assigned_event_types,
          profiles!tracker_user_id (
            full_name,
            email
          )
        `)
        .eq('match_id', matchId)
        .not('assigned_player_id', 'is', null);

      if (error) throw error;

      const transformedAssignments: Assignment[] = (data || [])
        .filter(item => item.id && item.tracker_user_id && item.assigned_player_id)
        .map(item => ({
          id: item.id!,
          tracker_user_id: item.tracker_user_id!,
          player_id: typeof item.assigned_player_id === 'string' ? parseInt(item.assigned_player_id, 10) : item.assigned_player_id!,
          player_team_id: (item.player_team_id as 'home' | 'away') || 'home',
          assigned_event_types: item.assigned_event_types || [],
          tracker_name: (item.profiles as any)?.full_name || undefined,
          tracker_email: (item.profiles as any)?.email || undefined,
        }));

      setAssignments(transformedAssignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    }
  };

  const createAssignment = async (
    trackerId: string,
    playerId: number,
    teamId: 'home' | 'away',
    eventTypes: string[],
    videoUrl?: string
  ) => {
    setLoading(true);
    try {
      // First, remove any existing assignments for this player and these event types
      const { data: existingAssignments, error: fetchError } = await supabase
        .from('match_tracker_assignments')
        .select('id, assigned_event_types')
        .eq('assigned_player_id', playerId)
        .eq('player_team_id', teamId);

      if (fetchError) throw fetchError;

      const assignmentsToDelete = existingAssignments
        .filter(a => a.assigned_event_types?.some(et => eventTypes.includes(et)))
        .map(a => a.id);

      if (assignmentsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('match_tracker_assignments')
          .delete()
          .in('id', assignmentsToDelete);
        if (deleteError) throw deleteError;
      }

      // Now, insert the new assignment
      const { error } = await supabase
        .from('match_tracker_assignments')
        .insert({
          match_id: matchId,
          tracker_user_id: trackerId,
          assigned_player_id: playerId,
          player_team_id: teamId,
          assigned_event_types: eventTypes
        });

      if (error) throw error;

      // Send notification based on video URL presence
      const notificationType = videoUrl ? 'video_assignment' : 'match_assignment';
      const notificationTitle = videoUrl ? 'New Video Tracking Assignment' : 'New Match Assignment';
      const notificationMessage = videoUrl 
        ? `You have been assigned to track video analysis. Events: ${eventTypes.join(', ')}`
        : `You have been assigned to track match events. Events: ${eventTypes.join(', ')}`;

      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: trackerId,
        match_id: matchId,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        notification_data: {
          match_id: matchId,
          player_id: playerId,
          player_team_id: teamId,
          assigned_event_types: eventTypes,
          assignment_type: videoUrl ? 'video_tracking' : 'match_tracking',
          video_url: videoUrl || null
        }
      });

      if (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't throw error for notifications, just log it
      }

      toast.success('Specialized assignment created successfully');
      await fetchAssignments();
      return true;
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('match_tracker_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Assignment deleted successfully');
      await fetchAssignments();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  useEffect(() => {
    fetchTrackerUsers();
    fetchAssignments();
  }, [matchId]);

  return {
    trackerUsers,
    assignments,
    loading,
    createAssignment,
    deleteAssignment,
    refetch: fetchAssignments
  };
};
