// Database adapters for assignment system
import type { Database } from '../database.types';
import type { Assignment, IndividualAssignment, AssignmentStatus, TeamType } from './types';

export type DatabaseAssignment = Database['public']['Tables']['match_tracker_assignments']['Row'];
export type DatabaseAssignmentInsert = Database['public']['Tables']['match_tracker_assignments']['Insert'];

// Convert database row to Assignment object
export function dbToAssignment(dbRow: DatabaseAssignment): IndividualAssignment {
  return {
    id: dbRow.id,
    match_id: dbRow.match_id,
    tracker_user_id: dbRow.tracker_user_id,
    assignment_type: 'individual',
    status: 'active' as AssignmentStatus,
    priority: 'medium' as const,
    assigned_event_types: dbRow.assigned_event_types || [],
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at || dbRow.created_at,
    created_by: dbRow.tracker_user_id, // Fallback to tracker user
    player_id: dbRow.player_id || dbRow.assigned_player_id || 0,
    player_team_id: dbRow.player_team_id as TeamType,
    notes: undefined,
    metadata: {}
  };
}

// Convert Assignment to database insert format
export function assignmentToDb(assignment: IndividualAssignment): DatabaseAssignmentInsert {
  return {
    id: assignment.id,
    match_id: assignment.match_id,
    tracker_user_id: assignment.tracker_user_id,
    player_id: assignment.player_id,
    player_team_id: assignment.player_team_id,
    assigned_event_types: assignment.assigned_event_types,
    created_at: assignment.created_at,
    updated_at: assignment.updated_at,
    assigned_player_id: assignment.player_id
  };
}

// Map tracker specialties to simplified format for database
export function mapTrackerSpecialty(specialty: string): 'defense' | 'midfield' | 'attack' | 'goalkeeper' {
  switch (specialty) {
    case 'specialized':
      return 'midfield';
    case 'generalist':
      return 'midfield';
    default:
      return specialty as 'defense' | 'midfield' | 'attack' | 'goalkeeper';
  }
}