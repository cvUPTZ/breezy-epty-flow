
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TrackerUser, Assignment } from '../types/TrackerAssignmentTypes';
import { assignmentService } from '@/services/assignments/assignmentService';

export const useSpecializedAssignments = (matchId: string) => {
  const [trackerUsers, setTrackerUsers] = useState<TrackerUser[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrackerUsers = async () => {
    try {
      const trackers = await assignmentService.getAvailableTrackers();
      const typedUsers: TrackerUser[] = trackers.map(tracker => ({
        id: tracker.id,
        email: tracker.email,
        full_name: tracker.full_name,
      }));

      setTrackerUsers(typedUsers);
    } catch (error: any) {
      console.error('Error fetching tracker users:', error);
      toast.error('Failed to fetch tracker users');
    }
  };

  const fetchAssignments = async () => {
    try {
      const assignmentData = await assignmentService.getMatchAssignments(matchId);
      
      // Transform to match the expected format
      const transformedAssignments: Assignment[] = assignmentData
        .filter(a => a.assignment_type === 'individual')
        .map(assignment => ({
          id: assignment.id,
          tracker_user_id: assignment.tracker_user_id,
          player_id: (assignment as any).player_id,
          player_team_id: (assignment as any).player_team_id,
          assigned_event_types: assignment.assigned_event_types,
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
    console.log('createAssignment called with:', { trackerId, playerId, teamId, eventTypes, videoUrl });
    setLoading(true);
    try {
      const result = await assignmentService.createIndividualAssignment(
        matchId,
        trackerId,
        playerId,
        teamId,
        eventTypes
      );

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Failed to create assignment');
      }

      // Send notification
      const notificationType = videoUrl ? 'video_assignment' : 'match_assignment';
      const notificationTitle = videoUrl ? 'New Video Tracking Assignment' : 'New Match Assignment';
      const notificationMessage = videoUrl 
        ? `You have been assigned to track video analysis. Events: ${eventTypes.join(', ')}`
        : `You have been assigned to track match events. Events: ${eventTypes.join(', ')}`;

      console.log('Sending notification:', { notificationType, notificationTitle, videoUrl: !!videoUrl });

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
      const result = await assignmentService.deleteAssignment(assignmentId);
      
      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Failed to delete assignment');
      }

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
