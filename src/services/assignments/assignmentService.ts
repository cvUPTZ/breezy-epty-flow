import { supabase } from '@/integrations/supabase/client';
import { Assignment, AssignmentLog, BatchAssignmentOperation, AssignmentMetrics } from '@/lib/assignments/types';
import { AssignmentValidator } from '@/lib/assignments/validation';
import { AssignmentEngine } from '@/lib/assignments/core';
import { toast } from 'sonner';

export class AssignmentService {
  /**
   * Creates a new assignment with validation and conflict detection
   */
  static async createAssignment(assignment: Partial<Assignment>): Promise<{ success: boolean; assignment?: Assignment; errors?: string[] }> {
    try {
      // Validate assignment data
      const validationErrors = AssignmentValidator.validateAssignment(assignment as Assignment);
      if (validationErrors.length > 0) {
        return { success: false, errors: validationErrors };
      }

      // Check for conflicts
      const existingAssignments = await this.getMatchAssignments(assignment.match_id!);
      const trackers = await this.getActiveTrackers();
      
      const conflicts = AssignmentValidator.detectConflicts(
        assignment as Assignment,
        existingAssignments,
        trackers
      );

      const criticalConflicts = conflicts.filter(c => c.severity === 'high');
      if (criticalConflicts.length > 0) {
        return { 
          success: false, 
          errors: criticalConflicts.map(c => c.description) 
        };
      }

      // Insert based on assignment type
      let result;
      switch (assignment.assignment_type) {
        case 'individual':
          result = await this.createIndividualAssignment(assignment);
          break;
        case 'line':
          result = await this.createLineAssignment(assignment);
          break;
        case 'video':
          result = await this.createVideoAssignment(assignment);
          break;
        default:
          return { success: false, errors: ['Unsupported assignment type'] };
      }

      if (result.error) {
        throw result.error;
      }

      // Log the assignment creation
      await this.logAssignmentAction(result.data.id, 'created', assignment);

      // Send notification to tracker
      await this.sendTrackerNotification(assignment.tracker_user_id!, assignment.match_id!, assignment);

      // Show warnings for medium severity conflicts
      const warnings = conflicts.filter(c => c.severity === 'medium');
      if (warnings.length > 0) {
        warnings.forEach(warning => toast.warning(warning.description));
      }

      return { success: true, assignment: result.data };
    } catch (error) {
      console.error('Error creating assignment:', error);
      return { success: false, errors: ['Failed to create assignment'] };
    }
  }

  /**
   * Updates an existing assignment
   */
  static async updateAssignment(assignmentId: string, updates: Partial<Assignment>): Promise<{ success: boolean; assignment?: Assignment; errors?: string[] }> {
    try {
      // Get current assignment
      const currentAssignment = await this.getAssignmentById(assignmentId);
      if (!currentAssignment) {
        return { success: false, errors: ['Assignment not found'] };
      }

      const updatedAssignment = { ...currentAssignment, ...updates };
      
      // Validate updated assignment
      const validationErrors = AssignmentValidator.validateAssignment(updatedAssignment);
      if (validationErrors.length > 0) {
        return { success: false, errors: validationErrors };
      }

      // Update based on assignment type
      let result;
      switch (updatedAssignment.assignment_type) {
        case 'individual':
          result = await supabase
            .from('match_tracker_assignments')
            .update({
              tracker_user_id: updatedAssignment.tracker_user_id,
              assigned_player_id: updatedAssignment.player_id,
              player_team_id: updatedAssignment.player_team_id,
              assigned_event_types: updatedAssignment.assigned_event_types,
              updated_at: new Date().toISOString()
            })
            .eq('id', assignmentId)
            .select()
            .single();
          break;
        case 'line':
          result = await supabase
            .from('tracker_line_assignments')
            .update({
              tracker_user_id: updatedAssignment.tracker_user_id,
              line_players: updatedAssignment.player_ids,
              tracker_type: updatedAssignment.line_type,
              assigned_event_types: updatedAssignment.assigned_event_types,
              updated_at: new Date().toISOString()
            })
            .eq('id', assignmentId)
            .select()
            .single();
          break;
        default:
          return { success: false, errors: ['Update not supported for this assignment type'] };
      }

      if (result.error) {
        throw result.error;
      }

      // Log the update
      await this.logAssignmentAction(assignmentId, 'updated', updatedAssignment, currentAssignment);

      return { success: true, assignment: result.data };
    } catch (error) {
      console.error('Error updating assignment:', error);
      return { success: false, errors: ['Failed to update assignment'] };
    }
  }

  /**
   * Deletes an assignment
   */
  static async deleteAssignment(assignmentId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Get assignment details for logging
      const assignment = await this.getAssignmentById(assignmentId);
      if (!assignment) {
        return { success: false, errors: ['Assignment not found'] };
      }

      // Delete from appropriate table
      let result;
      switch (assignment.assignment_type) {
        case 'individual':
          result = await supabase
            .from('match_tracker_assignments')
            .delete()
            .eq('id', assignmentId);
          break;
        case 'line':
          result = await supabase
            .from('tracker_line_assignments')
            .delete()
            .eq('id', assignmentId);
          break;
        default:
          return { success: false, errors: ['Delete not supported for this assignment type'] };
      }

      if (result.error) {
        throw result.error;
      }

      // Log the deletion
      await this.logAssignmentAction(assignmentId, 'deleted', assignment);

      return { success: true };
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return { success: false, errors: ['Failed to delete assignment'] };
    }
  }

  /**
   * Gets all assignments for a match
   */
  static async getMatchAssignments(matchId: string): Promise<Assignment[]> {
    try {
      const assignments: Assignment[] = [];

      // Get individual assignments
      const { data: individualAssignments, error: individualError } = await supabase
        .from('match_tracker_assignments')
        .select(`
          *,
          profiles!tracker_user_id (
            full_name,
            email
          )
        `)
        .eq('match_id', matchId);

      if (individualError) throw individualError;

      // Transform individual assignments
      if (individualAssignments) {
        assignments.push(...individualAssignments.map(a => ({
          id: a.id,
          match_id: a.match_id,
          tracker_user_id: a.tracker_user_id,
          assignment_type: 'individual' as const,
          status: 'active' as const,
          priority: 'medium' as const,
          assigned_event_types: a.assigned_event_types || [],
          created_at: a.created_at,
          updated_at: a.updated_at || a.created_at,
          created_by: a.tracker_user_id, // Fallback
          player_id: a.assigned_player_id,
          player_team_id: a.player_team_id,
          metadata: {
            tracker_name: (a.profiles as any)?.full_name,
            tracker_email: (a.profiles as any)?.email
          }
        })));
      }

      // Get line assignments
      const { data: lineAssignments, error: lineError } = await supabase
        .from('tracker_line_assignments')
        .select(`
          *,
          profiles!tracker_user_id (
            full_name,
            email
          )
        `)
        .eq('match_id', matchId);

      if (lineError) throw lineError;

      // Transform line assignments
      if (lineAssignments) {
        assignments.push(...lineAssignments.map(a => ({
          id: a.id,
          match_id: a.match_id,
          tracker_user_id: a.tracker_user_id,
          assignment_type: 'line' as const,
          status: 'active' as const,
          priority: 'medium' as const,
          assigned_event_types: a.assigned_event_types || [],
          created_at: a.created_at,
          updated_at: a.updated_at || a.created_at,
          created_by: a.tracker_user_id, // Fallback
          line_type: a.tracker_type,
          team_id: 'both' as const, // Default
          player_ids: Array.isArray(a.line_players) ? a.line_players : [],
          metadata: {
            tracker_name: (a.profiles as any)?.full_name,
            tracker_email: (a.profiles as any)?.email
          }
        })));
      }

      return assignments;
    } catch (error) {
      console.error('Error fetching match assignments:', error);
      return [];
    }
  }

  /**
   * Gets assignment metrics for analytics
   */
  static async getAssignmentMetrics(matchId?: string): Promise<AssignmentMetrics> {
    try {
      let assignments: Assignment[];
      
      if (matchId) {
        assignments = await this.getMatchAssignments(matchId);
      } else {
        // Get all assignments across all matches
        assignments = []; // Implementation would fetch all assignments
      }

      const trackers = await this.getActiveTrackers();
      return AssignmentEngine.calculateMetrics(assignments, trackers);
    } catch (error) {
      console.error('Error calculating assignment metrics:', error);
      return {
        total_assignments: 0,
        active_assignments: 0,
        completion_rate: 0,
        average_events_per_assignment: 0,
        tracker_utilization: 0,
        assignment_distribution: {}
      };
    }
  }

  /**
   * Batch assignment operations
   */
  static async executeBatchOperation(operation: BatchAssignmentOperation): Promise<{ success: boolean; results: any[]; errors?: string[] }> {
    try {
      const results = [];
      
      // Validate batch operation
      const trackers = await this.getActiveTrackers();
      const existingAssignments = operation.assignments.length > 0 ? 
        await this.getMatchAssignments(operation.assignments[0].match_id) : [];
      
      const validation = AssignmentValidator.validateBatchOperation(
        operation.assignments,
        operation.operation,
        existingAssignments,
        trackers
      );

      if (!validation.isValid) {
        return { success: false, results: [], errors: validation.errors };
      }

      // Execute operations
      for (const assignment of operation.assignments) {
        let result;
        
        switch (operation.operation) {
          case 'create':
            result = await this.createAssignment(assignment);
            break;
          case 'update':
            result = await this.updateAssignment(assignment.id, assignment);
            break;
          case 'delete':
            result = await this.deleteAssignment(assignment.id);
            break;
          default:
            result = { success: false, errors: ['Unsupported operation'] };
        }
        
        results.push(result);
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      if (failed > 0) {
        toast.warning(`Batch operation completed: ${successful} successful, ${failed} failed`);
      } else {
        toast.success(`Batch operation completed successfully: ${successful} assignments processed`);
      }

      return { success: failed === 0, results };
    } catch (error) {
      console.error('Error executing batch operation:', error);
      return { success: false, results: [], errors: ['Batch operation failed'] };
    }
  }

  /**
   * Private helper methods
   */
  private static async createIndividualAssignment(assignment: Partial<Assignment>) {
    return await supabase
      .from('match_tracker_assignments')
      .insert({
        match_id: assignment.match_id,
        tracker_user_id: assignment.tracker_user_id,
        assigned_player_id: assignment.player_id,
        player_team_id: assignment.player_team_id,
        assigned_event_types: assignment.assigned_event_types
      })
      .select()
      .single();
  }

  private static async createLineAssignment(assignment: Partial<Assignment>) {
    return await supabase
      .from('tracker_line_assignments')
      .insert({
        match_id: assignment.match_id,
        tracker_user_id: assignment.tracker_user_id,
        line_players: assignment.player_ids,
        tracker_type: assignment.line_type,
        assigned_event_types: assignment.assigned_event_types
      })
      .select()
      .single();
  }

  private static async createVideoAssignment(assignment: Partial<Assignment>) {
    // Video assignments would be handled differently
    // For now, create a specialized tracker assignment
    return await supabase
      .from('match_tracker_assignments')
      .insert({
        match_id: assignment.match_id,
        tracker_user_id: assignment.tracker_user_id,
        assigned_event_types: assignment.assigned_event_types,
        player_team_id: 'both' // Video assignments cover both teams
      })
      .select()
      .single();
  }

  private static async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    // Try individual assignments first
    const { data: individual } = await supabase
      .from('match_tracker_assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (individual) {
      return {
        id: individual.id,
        match_id: individual.match_id,
        tracker_user_id: individual.tracker_user_id,
        assignment_type: 'individual',
        status: 'active',
        priority: 'medium',
        assigned_event_types: individual.assigned_event_types || [],
        created_at: individual.created_at,
        updated_at: individual.updated_at || individual.created_at,
        created_by: individual.tracker_user_id,
        player_id: individual.assigned_player_id,
        player_team_id: individual.player_team_id
      };
    }

    // Try line assignments
    const { data: line } = await supabase
      .from('tracker_line_assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (line) {
      return {
        id: line.id,
        match_id: line.match_id,
        tracker_user_id: line.tracker_user_id,
        assignment_type: 'line',
        status: 'active',
        priority: 'medium',
        assigned_event_types: line.assigned_event_types || [],
        created_at: line.created_at,
        updated_at: line.updated_at || line.created_at,
        created_by: line.tracker_user_id,
        line_type: line.tracker_type,
        team_id: 'both',
        player_ids: Array.isArray(line.line_players) ? line.line_players : []
      };
    }

    return null;
  }

  private static async getActiveTrackers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('role', 'tracker');

    if (error) throw error;

    return (data || []).map(tracker => ({
      id: tracker.id,
      email: tracker.email || '',
      full_name: tracker.full_name || '',
      is_active: true,
      specialty: 'generalist' as const
    }));
  }

  private static async logAssignmentAction(
    assignmentId: string,
    action: 'created' | 'updated' | 'deleted',
    assignment: Partial<Assignment>,
    previousAssignment?: Assignment
  ) {
    try {
      await supabase.from('assignment_logs').insert({
        assignment_type: assignment.assignment_type || 'individual',
        assignment_action: action,
        assignment_details: assignment,
        previous_assignment_details: previousAssignment,
        match_id: assignment.match_id,
        assignee_id: assignment.tracker_user_id,
        tracker_assignment_id: assignmentId
      });
    } catch (error) {
      console.error('Error logging assignment action:', error);
    }
  }

  private static async sendTrackerNotification(
    trackerId: string,
    matchId: string,
    assignment: Partial<Assignment>
  ) {
    try {
      const notificationTitle = `New ${assignment.assignment_type} Assignment`;
      const notificationMessage = `You have been assigned to track ${assignment.assigned_event_types?.join(', ')} events`;

      await supabase.from('notifications').insert({
        user_id: trackerId,
        match_id: matchId,
        type: 'match_assignment',
        title: notificationTitle,
        message: notificationMessage,
        notification_data: {
          assignment_type: assignment.assignment_type,
          event_types: assignment.assigned_event_types
        }
      });
    } catch (error) {
      console.error('Error sending tracker notification:', error);
    }
  }
}