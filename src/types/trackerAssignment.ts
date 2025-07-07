
export interface TrackerAssignment {
  id?: string;
  tracker_user_id: string;
  player_ids: number[]; // Keep as number[] for consistency with existing code
  assigned_event_types: string[];
  tracker_name?: string;
  tracker_email?: string;
}

export interface Player {
  id: number;
  jersey_number: number;
  player_name: string;
  team?: 'home' | 'away';
}

export interface TeamData {
  name: string;
  players: Player[];
  formation?: string;
}
