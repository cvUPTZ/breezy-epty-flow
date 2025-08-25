// utils/trackerTransformers.ts

import { TrackerAssignment, Player } from '@/types/trackerAssignment';

// Standardized Player interface
export interface StandardPlayer {
  id: number;
  player_name: string;
  jersey_number: number;
  position?: string;
  team: 'home' | 'away';
}

// LineBasedTrackerUI Player interface
export interface LineBasedPlayer {
  id: number;
  name: string;
  jersey_number?: number;
  position?: string;
}

// LineAssignment interface
export interface LineAssignment {
  line: 'defense' | 'midfield' | 'attack' | 'all_events';
  team: 'home' | 'away' | 'both';
  players: LineBasedPlayer[];
  eventTypes: string[];
  teamName: string;
}

// Line position definitions
const LINE_DEFINITIONS: Record<string, string[]> = {
  Defense: ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'SW', 'DC', 'DR', 'DL'],
  Midfield: ['DM', 'CM', 'AM', 'LM', 'RM', 'CDM', 'CAM', 'DMC', 'MC', 'AMC', 'ML', 'MR'],
  Attack: ['CF', 'ST', 'LW', 'RW', 'LF', 'RF', 'SS', 'FW'],
};

// Helper function to determine line from player positions
export const determineLineFromPositions = (players: StandardPlayer[]): 'defense' | 'midfield' | 'attack' | 'all_events' => {
  const positions = players
    .map(p => p.position?.toUpperCase().trim())
    .filter(Boolean) as string[];
  
  if (positions.length === 0) return 'all_events';
  
  const defensePositions = LINE_DEFINITIONS.Defense;
  const midfieldPositions = LINE_DEFINITIONS.Midfield;
  const attackPositions = LINE_DEFINITIONS.Attack;
  
  const defenseCount = positions.filter(p => defensePositions.includes(p)).length;
  const midfieldCount = positions.filter(p => midfieldPositions.includes(p)).length;
  const attackCount = positions.filter(p => attackPositions.includes(p)).length;
  
  // Return the line with the most players, or 'all_events' if mixed or unclear
  if (defenseCount > midfieldCount && defenseCount > attackCount) return 'defense';
  if (midfieldCount > defenseCount && midfieldCount > attackCount) return 'midfield';
  if (attackCount > defenseCount && attackCount > midfieldCount) return 'attack';
  
  return 'all_events'; // Mixed positions or equal counts
};

// Helper function to determine team assignment
export const determineTeamFromPlayers = (players: StandardPlayer[]): 'home' | 'away' | 'both' => {
  const teams = new Set(players.map(p => p.team));
  
  if (teams.size === 1) {
    return [...teams][0] as 'home' | 'away';
  }
  
  return 'both';
};

// Helper function to get team name
export const getTeamName = (team: 'home' | 'away' | 'both', homeTeamName?: string, awayTeamName?: string): string => {
  switch (team) {
    case 'home':
      return homeTeamName || 'Home Team';
    case 'away':
      return awayTeamName || 'Away Team';
    case 'both':
      return 'Both Teams';
    default:
      return 'Unknown Team';
  }
};

// Main transformer function
export const transformAssignmentsToLineAssignments = (
  assignments: TrackerAssignment[],
  homeTeamPlayers: StandardPlayer[],
  awayTeamPlayers: StandardPlayer[],
  homeTeamName?: string,
  awayTeamName?: string
): LineAssignment[] => {
  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
  
  return assignments
    .map(assignment => {
      // Find assigned players with validation
      const assignedPlayers = assignment.player_ids
        .map(playerId => allPlayers.find(p => p.id === playerId))
        .filter((player): player is StandardPlayer => player !== undefined);

      // Skip assignments with no valid players
      if (assignedPlayers.length === 0) {
        console.warn(`Assignment ${assignment.id} has no valid players. Skipping.`);
        return null;
      }

      // Determine team and line
      const team = determineTeamFromPlayers(assignedPlayers);
      const line = determineLineFromPositions(assignedPlayers);
      const teamName = getTeamName(team, homeTeamName, awayTeamName);

      // Transform players to LineBasedPlayer format
      const transformedPlayers: LineBasedPlayer[] = assignedPlayers.map(p => ({
        id: p.id,
        name: p.player_name, // Map player_name to name
        jersey_number: p.jersey_number,
        position: p.position
      }));

      return {
        line,
        team,
        players: transformedPlayers,
        eventTypes: assignment.assigned_event_types,
        teamName
      };
    })
    .filter((assignment): assignment is LineAssignment => assignment !== null);
};

// Validation function to check data consistency
export const validatePlayerData = (
  homeTeamPlayers: StandardPlayer[],
  awayTeamPlayers: StandardPlayer[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
  
  // Check for duplicate IDs
  const playerIds = allPlayers.map(p => p.id);
  const uniqueIds = new Set(playerIds);
  if (playerIds.length !== uniqueIds.size) {
    errors.push('Duplicate player IDs found');
  }
  
  // Check for missing required fields
  allPlayers.forEach((player, index) => {
    if (!player.id) errors.push(`Player at index ${index} missing ID`);
    if (!player.player_name) errors.push(`Player at index ${index} missing name`);
    if (!player.jersey_number) errors.push(`Player at index ${index} missing jersey number`);
    if (!player.team || !['home', 'away'].includes(player.team)) {
      errors.push(`Player at index ${index} has invalid team: ${player.team}`);
    }
  });
  
  // Check team distribution
  const homeCount = homeTeamPlayers.length;
  const awayCount = awayTeamPlayers.length;
  
  if (homeCount === 0) errors.push('No home team players found');
  if (awayCount === 0) errors.push('No away team players found');
  if (homeCount > 25 || awayCount > 25) errors.push('Unusually large team size detected');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Debug function to log transformation details
export const debugTransformation = (
  originalAssignments: TrackerAssignment[],
  transformedAssignments: LineAssignment[]
): void => {
  console.group('Assignment Transformation Debug');
  
  console.log('Original assignments:', originalAssignments.length);
  console.log('Transformed assignments:', transformedAssignments.length);
  
  originalAssignments.forEach((original, index) => {
    const transformed = transformedAssignments[index];
    
    console.group(`Assignment ${index + 1}`);
    console.log('Original player IDs:', original.player_ids);
    console.log('Original event types:', original.assigned_event_types);
    
    if (transformed) {
      console.log('Transformed line:', transformed.line);
      console.log('Transformed team:', transformed.team);
      console.log('Transformed players:', transformed.players.map(p => `${p.name} (${p.id})`));
      console.log('Event types:', transformed.eventTypes);
    } else {
      console.log('❌ Transformation failed - no valid players found');
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
};
