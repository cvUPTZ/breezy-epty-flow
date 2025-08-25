









// types/trackerAssignment.ts

// Standardized Player interface - use this consistently across all components
export interface Player {
  id: number; // Consistent number type
  player_name: string;
  jersey_number: number;
  position?: string;
  team: 'home' | 'away';
}

// Tracker Assignment interface
export interface TrackerAssignment {
  id: string;
  tracker_user_id: string;
  tracker_name: string;
  tracker_email: string;
  player_ids: number[]; // Consistent number array
  assigned_event_types: string[];
}


export interface TeamData {
  name: string;
  players: Player[];
  formation?: string;
}


// Event type category interface
export interface EventTypeCategory {
  key: string;
  label: string;
  color: string;
  events: EventType[];
}

// Individual event type interface
export interface EventType {
  key: string;
  label: string;
}

// Tracker user interface
export interface TrackerUser {
  id: string;
  email: string;
  full_name?: string;
}

// Match interface
export interface Match {
  id: string;
  home_team_name: string;
  away_team_name: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  start_time: string;
}

// Event record interface for tracking
export interface EventRecord {
  id: string;
  match_id: string;
  event_type: string;
  player_id?: number;
  team_id: 'home' | 'away';
  timestamp: number; // Unix timestamp
  metadata?: Record<string, any>;
}

// Line assignment interface (for LineBasedTrackerUI)
export interface LineAssignment {
  line: 'defense' | 'midfield' | 'attack' | 'all_events';
  team: 'home' | 'away' | 'both';
  players: LineBasedPlayer[];
  eventTypes: string[];
  teamName: string;
}

// Player interface specifically for LineBasedTrackerUI
export interface LineBasedPlayer {
  id: number;
  name: string; // Maps from Player.player_name
  jersey_number?: number;
  position?: string;
}

// Props interfaces
export interface TrackerAssignmentTabsProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  trackerUsers: TrackerUser[];
  assignments: TrackerAssignment[];
  onAssignmentsChange: (assignments: TrackerAssignment[]) => void;
}

export interface LineBasedTrackerUIProps {
  assignments: LineAssignment[];
  recordEvent: (eventType: string, playerId?: number, teamId?: 'home' | 'away') => void;
  matchId: string;
}

// State interfaces for tabs
export interface PlayerTabState {
  selectedTracker: string;
  selectedPlayers: number[];
  selectedEventTypes: string[];
}

export interface LineTabState {
  selectedTracker: string;
  selectedTeam: 'home' | 'away';
  selectedLine: string;
  selectedEventTypes: string[];
}

// API response interfaces
export interface PlayerAPIResponse {
  id: number;
  name: string; // This might need to be mapped to player_name
  jersey_number: number;
  position?: string;
  team_id: string;
}

export interface AssignmentAPIResponse {
  id: string;
  tracker_user_id: string;
  player_ids: number[];
  event_types: string[];
  created_at: string;
  updated_at: string;
}

// Utility type for creating assignments
export type CreateAssignmentPayload = Omit<TrackerAssignment, 'id' | 'tracker_name' | 'tracker_email'>;

// Error handling
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

// Position definitions
export const POSITION_LINES = {
  Defense: ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'SW', 'DC', 'DR', 'DL'],
  Midfield: ['DM', 'CM', 'AM', 'LM', 'RM', 'CDM', 'CAM', 'DMC', 'MC', 'AMC', 'ML', 'MR'],
  Attack: ['CF', 'ST', 'LW', 'RW', 'LF', 'RF', 'SS', 'FW'],
} as const;

export type LineType = keyof typeof POSITION_LINES;
export type Position = typeof POSITION_LINES[LineType][number];
