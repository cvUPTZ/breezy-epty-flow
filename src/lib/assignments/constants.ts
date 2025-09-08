import { TrackerSpecialty, LineType, AssignmentType } from './types';

// Event types organized by categories
export const EVENT_CATEGORIES = {
  offensive: {
    label: 'Offensive Actions',
    events: ['pass', 'shot', 'goal', 'cross', 'header', 'dribble', 'through_ball', 'assist'],
    color: 'text-green-600',
    icon: '⚡'
  },
  defensive: {
    label: 'Defensive Actions', 
    events: ['tackle', 'interception', 'clearance', 'block', 'steal', 'defensive_header'],
    color: 'text-blue-600',
    icon: '🛡️'
  },
  disciplinary: {
    label: 'Disciplinary Events',
    events: ['foul', 'card', 'yellow_card', 'red_card', 'penalty'],
    color: 'text-red-600',
    icon: '⚠️'
  },
  setpieces: {
    label: 'Set Pieces',
    events: ['corner', 'throw_in', 'free_kick', 'penalty_kick', 'offside'],
    color: 'text-purple-600',
    icon: '🎯'
  },
  transitions: {
    label: 'Game Transitions',
    events: ['substitution', 'injury', 'timeout', 'formation_change'],
    color: 'text-orange-600',
    icon: '🔄'
  },
  goalkeeper: {
    label: 'Goalkeeper Actions',
    events: ['save', 'catch', 'punch', 'distribution', 'goal_kick'],
    color: 'text-yellow-600',
    icon: '🥅'
  }
} as const;

// All event types flattened
export const ALL_EVENT_TYPES = Object.values(EVENT_CATEGORIES)
  .flatMap(category => category.events);

// Tracker specialty configurations
export const TRACKER_SPECIALTIES: Record<TrackerSpecialty, {
  label: string;
  description: string;
  preferredEvents: string[];
  color: string;
  icon: string;
  maxConcurrentAssignments: number;
}> = {
  defense: {
    label: 'Defense Specialist',
    description: 'Focused on defensive actions and formations',
    preferredEvents: [...EVENT_CATEGORIES.defensive.events],
    color: 'text-blue-600',
    icon: '🛡️',
    maxConcurrentAssignments: 6
  },
  midfield: {
    label: 'Midfield Specialist', 
    description: 'Tracking midfield play and transitions',
    preferredEvents: [...EVENT_CATEGORIES.offensive.events, ...EVENT_CATEGORIES.transitions.events],
    color: 'text-green-600',
    icon: '⚡',
    maxConcurrentAssignments: 8
  },
  attack: {
    label: 'Attack Specialist',
    description: 'Focused on offensive actions and scoring',
    preferredEvents: [...EVENT_CATEGORIES.offensive.events],
    color: 'text-red-600',
    icon: '🎯',
    maxConcurrentAssignments: 5
  },
  goalkeeper: {
    label: 'Goalkeeper Specialist',
    description: 'Specialized in goalkeeper actions and play',
    preferredEvents: EVENT_CATEGORIES.goalkeeper.events,
    color: 'text-yellow-600',
    icon: '🥅',
    maxConcurrentAssignments: 2
  },
  specialized: {
    label: 'Set Piece Specialist',
    description: 'Expert in set pieces and disciplinary events',
    preferredEvents: [...EVENT_CATEGORIES.setpieces.events, ...EVENT_CATEGORIES.disciplinary.events],
    color: 'text-purple-600',
    icon: '⚠️',
    maxConcurrentAssignments: 4
  },
  generalist: {
    label: 'Generalist',
    description: 'Versatile tracker for all event types',
    preferredEvents: ALL_EVENT_TYPES,
    color: 'text-gray-600',
    icon: '🎖️',
    maxConcurrentAssignments: 10
  }
};

// Line type configurations
export const LINE_CONFIGURATIONS: Record<LineType, {
  label: string;
  description: string;
  positions: string[];
  minPlayers: number;
  maxPlayers: number;
  color: string;
  icon: string;
}> = {
  defense: {
    label: 'Defensive Line',
    description: 'Center backs, full backs, and defensive midfielders',
    positions: ['CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM'],
    minPlayers: 3,
    maxPlayers: 6,
    color: 'text-blue-600',
    icon: '🛡️'
  },
  midfield: {
    label: 'Midfield Line',
    description: 'Central midfielders and wide midfielders',
    positions: ['CM', 'CAM', 'CDM', 'LM', 'RM', 'LW', 'RW'],
    minPlayers: 2,
    maxPlayers: 5,
    color: 'text-green-600',
    icon: '⚡'
  },
  attack: {
    label: 'Attack Line',
    description: 'Forwards, wingers, and attacking midfielders',
    positions: ['ST', 'CF', 'LW', 'RW', 'CAM'],
    minPlayers: 1,
    maxPlayers: 4,
    color: 'text-red-600',
    icon: '🎯'
  },
  fullTeam: {
    label: 'Full Team',
    description: 'All outfield players',
    positions: ['CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'],
    minPlayers: 10,
    maxPlayers: 11,
    color: 'text-purple-600',
    icon: '👥'
  }
};

// Assignment type configurations
export const ASSIGNMENT_TYPE_CONFIG: Record<AssignmentType, {
  label: string;
  description: string;
  icon: string;
  color: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in minutes
}> = {
  individual: {
    label: 'Individual Player',
    description: 'Track a specific player throughout the match',
    icon: '👤',
    color: 'text-blue-600',
    complexity: 'low',
    estimatedDuration: 90
  },
  line: {
    label: 'Line Assignment',
    description: 'Track a group of players in a tactical line',
    icon: '👥',
    color: 'text-green-600',
    complexity: 'medium',
    estimatedDuration: 90
  },
  video: {
    label: 'Video Analysis',
    description: 'Analyze pre-recorded video footage',
    icon: '🎥',
    color: 'text-purple-600',
    complexity: 'high',
    estimatedDuration: 120
  },
  formation: {
    label: 'Formation Focus',
    description: 'Track formation changes and tactical setups',
    icon: '📐',
    color: 'text-orange-600',
    complexity: 'high',
    estimatedDuration: 90
  },
  zone: {
    label: 'Zone Coverage',
    description: 'Monitor activity in specific pitch zones',
    icon: '🗺️',
    color: 'text-teal-600',
    complexity: 'medium',
    estimatedDuration: 90
  }
};

// Priority configurations
export const PRIORITY_CONFIG = {
  low: {
    label: 'Low Priority',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: '📝'
  },
  medium: {
    label: 'Medium Priority',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '📋'
  },
  high: {
    label: 'High Priority',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '⚠️'
  },
  critical: {
    label: 'Critical Priority',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '🚨'
  }
} as const;

// Status configurations
export const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: '✅'
  },
  pending: {
    label: 'Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: '⏳'
  },
  paused: {
    label: 'Paused',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '⏸️'
  },
  completed: {
    label: 'Completed',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '✔️'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '❌'
  }
} as const;

// Formation templates
export const FORMATION_TEMPLATES = {
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { position: 'GK', x: 5, y: 50 },
      { position: 'RB', x: 20, y: 80 }, { position: 'CB', x: 20, y: 60 }, 
      { position: 'CB', x: 20, y: 40 }, { position: 'LB', x: 20, y: 20 },
      { position: 'RM', x: 50, y: 80 }, { position: 'CM', x: 50, y: 60 },
      { position: 'CM', x: 50, y: 40 }, { position: 'LM', x: 50, y: 20 },
      { position: 'ST', x: 80, y: 60 }, { position: 'ST', x: 80, y: 40 }
    ]
  },
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { position: 'GK', x: 5, y: 50 },
      { position: 'RB', x: 20, y: 80 }, { position: 'CB', x: 20, y: 60 },
      { position: 'CB', x: 20, y: 40 }, { position: 'LB', x: 20, y: 20 },
      { position: 'CDM', x: 40, y: 50 }, { position: 'CM', x: 55, y: 65 }, { position: 'CM', x: 55, y: 35 },
      { position: 'RW', x: 80, y: 80 }, { position: 'ST', x: 80, y: 50 }, { position: 'LW', x: 80, y: 20 }
    ]
  }
} as const;

// Default assignment templates
export const DEFAULT_ASSIGNMENT_TEMPLATES = [
  {
    id: 'defensive-specialist',
    name: 'Defensive Actions Focus',
    description: 'Track all defensive actions for selected players',
    assignment_type: 'individual' as AssignmentType,
    default_event_types: EVENT_CATEGORIES.defensive.events,
    default_priority: 'medium' as const,
    configuration: { specialty: 'defense' }
  },
  {
    id: 'attacking-line',
    name: 'Attack Line Monitoring',
    description: 'Monitor the attacking line and offensive plays',
    assignment_type: 'line' as AssignmentType,
    default_event_types: EVENT_CATEGORIES.offensive.events,
    default_priority: 'high' as const,
    configuration: { line_type: 'attack' }
  },
  {
    id: 'set-piece-specialist',
    name: 'Set Pieces & Discipline',
    description: 'Track set pieces and disciplinary events',
    assignment_type: 'individual' as AssignmentType,
    default_event_types: [...EVENT_CATEGORIES.setpieces.events, ...EVENT_CATEGORIES.disciplinary.events],
    default_priority: 'high' as const,
    configuration: { specialty: 'specialized' }
  }
];

// Validation rules
export const VALIDATION_RULES = {
  maxAssignmentsPerTracker: 10,
  maxEventTypesPerAssignment: 8,
  minPlayersPerLineAssignment: 2,
  maxPlayersPerLineAssignment: 6,
  maxConcurrentVideoAssignments: 2,
  assignmentOverlapToleranceHours: 2
} as const;