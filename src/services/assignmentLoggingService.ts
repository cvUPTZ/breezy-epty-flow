import { supabase } from '@/integrations/supabase/client';

export interface AssignmentLogData {
  matchId?: string | null;
  assigneeId?: string | null;
  assignmentType: string;
  assignmentAction: 'created' | 'updated' | 'deleted';
  assignmentDetails: Record<string, any>;
  previousAssignmentDetails?: Record<string, any> | null;
}

class AssignmentLoggingService {
  /**
   * Log an assignment action
   */
  async logAssignment({
    matchId = null,
    assigneeId = null,
    assignmentType,
    assignmentAction,
    assignmentDetails,
    previousAssignmentDetails = null
  }: AssignmentLogData): Promise<string | null> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.error('No authenticated user found for logging assignment');
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

      const { data, error } = await supabase.rpc('log_assignment', rpcParams) as { data: string | null; error: any };

      if (error) {
        console.error('Error logging assignment:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in logAssignment:', error);
      return null;
    }
  }

  /**
   * Log tracker assignment
   */
  async logTrackerAssignment(
    matchId: string,
    trackerId: string,
    assignmentDetails: {
      playerIds?: number[];
      eventTypes?: string[];
      assignmentType?: string;
      tracker_assignment_id?: string; // Add the actual assignment ID
      [key: string]: any;
    },
    action: 'created' | 'updated' | 'deleted' = 'created',
    previousDetails?: Record<string, any>
  ) {
    return this.logAssignment({
      matchId,
      assigneeId: trackerId,
      assignmentType: 'tracker_assignment',
      assignmentAction: action,
      assignmentDetails: {
        tracker_id: trackerId,
        ...assignmentDetails
      },
      previousAssignmentDetails: previousDetails
    });
  }

  /**
   * Log player assignment
   */
  async logPlayerAssignment(
    matchId: string,
    playerId: number,
    assignmentDetails: {
      teamId: string;
      position?: string;
      jerseyNumber?: number;
      trackerId?: string;
      tracker_assignment_id?: string; // Add the actual assignment ID
      [key: string]: any;
    },
    action: 'created' | 'updated' | 'deleted' = 'created',
    previousDetails?: Record<string, any>
  ) {
    return this.logAssignment({
      matchId,
      assignmentType: 'player_assignment',
      assignmentAction: action,
      assignmentDetails: {
        player_id: playerId,
        ...assignmentDetails
      },
      previousAssignmentDetails: previousDetails
    });
  }

  /**
   * Log event assignment
   */
  async logEventAssignment(
    matchId: string,
    trackerId: string,
    assignmentDetails: {
      eventTypes: string[];
      playerIds?: number[];
      tracker_assignment_id?: string; // Add the actual assignment ID
      [key: string]: any;
    },
    action: 'created' | 'updated' | 'deleted' = 'created',
    previousDetails?: Record<string, any>
  ) {
    return this.logAssignment({
      matchId,
      assigneeId: trackerId,
      assignmentType: 'event_assignment',
      assignmentAction: action,
      assignmentDetails: {
        tracker_id: trackerId,
        ...assignmentDetails
      },
      previousAssignmentDetails: previousDetails
    });
  }

  /**
   * Log video assignment
   */
  async logVideoAssignment(
    matchId: string,
    trackerId: string,
    assignmentDetails: {
      videoUrl: string;
      eventTypes?: string[];
      [key: string]: any;
    },
    action: 'created' | 'updated' | 'deleted' = 'created',
    previousDetails?: Record<string, any>
  ) {
    return this.logAssignment({
      matchId,
      assigneeId: trackerId,
      assignmentType: 'video_assignment',
      assignmentAction: action,
      assignmentDetails: {
        tracker_id: trackerId,
        ...assignmentDetails
      },
      previousAssignmentDetails: previousDetails
    });
  }

  /**
   * Log match assignment
   */
  async logMatchAssignment(
    matchId: string,
    assignmentDetails: {
      matchName?: string;
      homeTeam?: string;
      awayTeam?: string;
      trackerCount?: number;
      [key: string]: any;
    },
    action: 'created' | 'updated' | 'deleted' = 'created',
    previousDetails?: Record<string, any>
  ) {
    return this.logAssignment({
      matchId,
      assignmentType: 'match_assignment',
      assignmentAction: action,
      assignmentDetails,
      previousAssignmentDetails: previousDetails
    });
  }
}

export const assignmentLoggingService = new AssignmentLoggingService();