// Core assignment types for the unified assignment system
export type AssignmentType = 'individual' | 'line' | 'video' | 'formation' | 'zone';
export type AssignmentStatus = 'active' | 'pending' | 'paused' | 'completed' | 'cancelled';
export type TrackerSpecialty = 'defense' | 'midfield' | 'attack' | 'goalkeeper' | 'specialized' | 'generalist';
export type TeamType = 'home' | 'away' | 'both';
export type LineType = 'defense' | 'midfield' | 'attack' | 'fullTeam';

// Player interface
export interface Player {
  id: number;
  jersey_number: number;
  player_name: string;
  position?: string;
  team: TeamType;
}

// Enhanced tracker user interface
export interface TrackerUser {
  id: string;
  email: string;
  full_name: string;
  specialty?: TrackerSpecialty;
  is_active: boolean;
  performance_rating?: number;
  assignments_count?: number;
}

// Base assignment interface
export interface BaseAssignment {
  id: string;
  match_id: string;
  tracker_user_id: string;
  assignment_type: AssignmentType;
  status: AssignmentStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_event_types: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// Individual player assignment
export interface IndividualAssignment extends BaseAssignment {
  assignment_type: 'individual';
  player_id: number;
  player_team_id: TeamType;
  player_name?: string;
  player_position?: string;
}

// Line-based assignment
export interface LineAssignment extends BaseAssignment {
  assignment_type: 'line';
  line_type: LineType;
  team_id: TeamType;
  player_ids: number[];
  formation_context?: string;
  tactical_focus?: string[];
}

// Video analysis assignment
export interface VideoAssignment extends BaseAssignment {
  assignment_type: 'video';
  video_url: string;
  video_title?: string;
  analysis_segments?: Array<{
    start_time: number;
    end_time: number;
    focus_areas: string[];
  }>;
  expected_duration?: number;
}

// Formation-based assignment
export interface FormationAssignment extends BaseAssignment {
  assignment_type: 'formation';
  formation_name: string;
  team_id: TeamType;
  player_positions: Array<{
    player_id: number;
    position: string;
    role: string;
  }>;
}

// Zone-based assignment
export interface ZoneAssignment extends BaseAssignment {
  assignment_type: 'zone';
  zone_definition: {
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
  };
  zone_name: string;
  team_focus?: TeamType;
}

// Union type for all assignments
export type Assignment = 
  | IndividualAssignment 
  | LineAssignment 
  | VideoAssignment 
  | FormationAssignment 
  | ZoneAssignment;

// Assignment metrics and analytics
export interface AssignmentMetrics {
  total_assignments: number;
  active_assignments: number;
  completion_rate: number;
  average_events_per_assignment: number;
  tracker_utilization: number;
  assignment_distribution: Record<AssignmentType, number>;
}

// Assignment conflict detection
export interface AssignmentConflict {
  type: 'player_overlap' | 'event_overlap' | 'time_overlap' | 'tracker_overload';
  severity: 'low' | 'medium' | 'high';
  description: string;
  conflicting_assignments: string[];
  suggested_resolution?: string;
}

// Assignment history and logs
export interface AssignmentLog {
  id: string;
  assignment_id: string;
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'paused' | 'completed';
  performed_by: string;
  timestamp: string;
  changes?: Record<string, { old: any; new: any }>;
  reason?: string;
}

// Assignment template for quick creation
export interface AssignmentTemplate {
  id: string;
  name: string;
  description: string;
  assignment_type: AssignmentType;
  default_event_types: string[];
  default_priority: 'low' | 'medium' | 'high' | 'critical';
  configuration: Record<string, any>;
  is_active: boolean;
}

// Assignment batch operation
export interface BatchAssignmentOperation {
  operation: 'create' | 'update' | 'delete' | 'activate' | 'pause';
  assignments: Assignment[];
  reason?: string;
  scheduled_for?: string;
}

// Assignment recommendation
export interface AssignmentRecommendation {
  type: AssignmentType;
  confidence: number;
  recommended_tracker: TrackerUser;
  reasoning: string;
  estimated_workload: number;
  alternative_trackers?: TrackerUser[];
}