
export interface TrackerAssignment {
  tracker_user_id: string;
  assigned_event_types: string[];
  player_ids: (number | string)[];
}
