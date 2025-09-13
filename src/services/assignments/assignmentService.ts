import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  Assignment, 
  IndividualAssignment,
  AssignmentMetrics,
  AssignmentConflict,
  TrackerUser
} from '../../lib/assignments/types';
import { validateAssignment, detectConflicts } from '../../lib/assignments/validation';
import { dbToAssignment, assignmentToDb, type DatabaseAssignment } from '../../lib/assignments/databaseAdapters';

export class AssignmentService {
  // Create individual player assignment
  async createIndividualAssignment(
    matchId: string, 
    trackerId: string, 
    playerId: number, 
    teamId: 'home' | 'away', 
    eventTypes: string[]
  ): Promise<{ success: boolean; assignment?: Assignment; errors?: string[] }> {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, errors: ['Authentication required'] };
      }

      const assignment: IndividualAssignment = {
        id: crypto.randomUUID(),
        match_id: matchId,
        tracker_user_id: trackerId,
        assignment_type: 'individual',
        status: 'active',
        priority: 'medium',
        assigned_event_types: eventTypes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.id, // Use current authenticated user
        player_id: playerId,
        player_team_id: teamId,
        notes: undefined,
        metadata: {}
      };

      // Validate assignment
      const validation = validateAssignment(assignment);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      // Check for conflicts
      const conflicts = await this.detectAssignmentConflicts(assignment);
      const criticalConflicts = conflicts.filter(c => c.severity === 'high');
      if (criticalConflicts.length > 0) {
        return { 
          success: false, 
          errors: criticalConflicts.map(c => c.description) 
        };
      }

      // Insert into database using adapter
      const dbInsert = assignmentToDb(assignment);
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .insert(dbInsert)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Failed to create assignment');

      // Show warnings for non-critical conflicts
      const warnings = conflicts.filter(c => c.severity !== 'high');
      if (warnings.length > 0) {
        warnings.forEach(warning => toast.warning(warning.description));
      }

      return { success: true, assignment: dbToAssignment(data) };
    } catch (error) {
      console.error('Error creating assignment:', error);
      return { success: false, errors: ['Failed to create assignment'] };
    }
  }

  // Create line-based assignment (simplified for current DB schema)
  async createLineAssignment(
    matchId: string,
    trackerId: string,
    lineType: 'defense' | 'midfield' | 'attack' | 'fullTeam',
    teamId: 'home' | 'away',
    playerIds: number[],
    eventTypes: string[]
  ): Promise<{ success: boolean; assignment?: Assignment; errors?: string[] }> {
    try {
      // For now, create individual assignments for each player in the line
      const assignments: IndividualAssignment[] = [];
      const results = [];

      for (const playerId of playerIds) {
        const result = await this.createIndividualAssignment(
          matchId,
          trackerId,
          playerId,
          teamId,
          eventTypes
        );
        results.push(result);
        if (result.assignment) {
          assignments.push(result.assignment as IndividualAssignment);
        }
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (failed.length > 0) {
        return { 
          success: false, 
          errors: failed.flatMap(f => f.errors || [])
        };
      }

      return { 
        success: true, 
        assignment: assignments[0] // Return first assignment as representative
      };
    } catch (error) {
      console.error('Error creating line assignment:', error);
      return { success: false, errors: ['Failed to create line assignment'] };
    }
  }

  // Get assignments for a match
  async getMatchAssignments(matchId: string): Promise<Assignment[]> {
    try {
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId);

      if (error) throw error;

      return data ? data.map(dbToAssignment) : [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  // Get single assignment
  async getAssignment(assignmentId: string): Promise<IndividualAssignment | undefined> {
    try {
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('id', assignmentId)
        .maybeSingle();

      if (error) throw error;
      return data ? dbToAssignment(data) : undefined;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      return undefined;
    }
  }

  // Update assignment
  async updateAssignment(
    assignmentId: string, 
    updates: Partial<IndividualAssignment>
  ): Promise<{ success: boolean; assignment?: Assignment; errors?: string[] }> {
    try {
      // Get existing assignment
      const existing = await this.getAssignment(assignmentId);
      if (!existing) {
        return { success: false, errors: ['Assignment not found'] };
      }

      // Apply updates
      const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };

      // Validate updated assignment
      const validation = validateAssignment(updated);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      // Update in database
      const dbUpdate = assignmentToDb(updated);
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .update(dbUpdate)
        .eq('id', assignmentId)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) return { success: false, errors: ['Failed to update assignment'] };
      return { success: true, assignment: dbToAssignment(data) };
    } catch (error) {
      console.error('Error updating assignment:', error);
      return { success: false, errors: ['Failed to update assignment'] };
    }
  }

  // Delete assignment
  async deleteAssignment(assignmentId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const { error } = await supabase
        .from('match_tracker_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      
      // Get current user for logging
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await this.logAssignmentAction(assignmentId, 'delete', user.id);
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return { success: false, errors: ['Failed to delete assignment'] };
    }
  }

  // Get assignment metrics
  async getAssignmentMetrics(matchId: string): Promise<AssignmentMetrics> {
    try {
      const assignments = await this.getMatchAssignments(matchId);
      
      const metrics: AssignmentMetrics = {
        total_assignments: assignments.length,
        active_assignments: assignments.filter(a => a.status === 'active').length,
        completion_rate: 0,
        average_events_per_assignment: 0,
        tracker_utilization: 0,
        assignment_distribution: {
          individual: 0,
          line: 0,
          video: 0,
          formation: 0,
          zone: 0
        }
      };

      if (assignments.length > 0) {
        // Calculate assignment distribution
        assignments.forEach(assignment => {
          metrics.assignment_distribution[assignment.assignment_type]++;
        });

        // Calculate average events per assignment
        const totalEvents = assignments.reduce((sum, a) => sum + a.assigned_event_types.length, 0);
        metrics.average_events_per_assignment = totalEvents / assignments.length;

        // Calculate completion rate (for now, assume active assignments are "completed")
        metrics.completion_rate = (metrics.active_assignments / metrics.total_assignments) * 100;

        // Calculate tracker utilization
        const uniqueTrackers = new Set(assignments.map(a => a.tracker_user_id)).size;
        metrics.tracker_utilization = uniqueTrackers;
      }

      return metrics;
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return {
        total_assignments: 0,
        active_assignments: 0,
        completion_rate: 0,
        average_events_per_assignment: 0,
        tracker_utilization: 0,
        assignment_distribution: {
          individual: 0,
          line: 0,
          video: 0,
          formation: 0,
          zone: 0
        }
      };
    }
  }

  // Detect assignment conflicts
  async detectAssignmentConflicts(assignment: Assignment): Promise<AssignmentConflict[]> {
    try {
      const existingAssignments = await this.getMatchAssignments(assignment.match_id);
      return detectConflicts(assignment, existingAssignments);
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      return [];
    }
  }

  // Log assignment action
  private async logAssignmentAction(
    assignmentId: string,
    action: 'create' | 'update' | 'delete',
    performedBy: string,
    changes?: Record<string, { old: any; new: any }>
  ): Promise<void> {
    try {
      await supabase
        .from('assignment_logs')
        .insert({
          tracker_assignment_id: assignmentId,
          assignment_action: action,
          assigner_id: performedBy,
          assignee_id: performedBy, // Set assignee to same as assigner for now
          assignment_details: changes || {},
          assignment_type: 'individual'
        });
    } catch (error) {
      console.error('Error logging assignment action:', error);
      // Don't throw error for logging failures
    }
  }

  // Batch create assignments (simplified for current schema)
  async batchCreateAssignments(assignments: IndividualAssignment[]): Promise<{
    success: boolean;
    created: Assignment[];
    errors: string[];
  }> {
    const created: Assignment[] = [];
    const errors: string[] = [];

    try {
      // Convert to database format
      const dbInserts = assignments.map(assignmentToDb);

      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .insert(dbInserts)
        .select();

      if (error) {
        errors.push(`Batch create error: ${error.message}`);
      } else if (data) {
        created.push(...data.map(dbToAssignment));
      }

      return {
        success: errors.length === 0,
        created,
        errors
      };
    } catch (error) {
      console.error('Error in batch create:', error);
      return {
        success: false,
        created,
        errors: [`Batch operation failed: ${error}`]
      };
    }
  }

  // Get tracker assignments
  async getTrackerAssignments(trackerId: string, matchId?: string): Promise<Assignment[]> {
    try {
      let query = supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('tracker_user_id', trackerId);

      if (matchId) {
        query = query.eq('match_id', matchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data ? data.map(dbToAssignment) : [];
    } catch (error) {
      console.error('Error fetching tracker assignments:', error);
      return [];
    }
  }

  // Get available trackers
  async getAvailableTrackers(): Promise<TrackerUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('role', 'tracker');

      if (error) throw error;

      return data?.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        full_name: profile.full_name || '',
        specialty: 'generalist',
        is_active: true
      })) || [];
    } catch (error) {
      console.error('Error fetching trackers:', error);
      return [];
    }
  }
}

// Export singleton instance
export const assignmentService = new AssignmentService();