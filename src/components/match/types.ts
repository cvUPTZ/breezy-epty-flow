
/**
 * @interface EventType
 * @description A simple representation of an event type with a key and a display label.
 * @property {string} key - The unique identifier for the event type.
 * @property {string} label - The human-readable label for the event type.
 */
export interface EventType {
  key: string;
  label: string;
}

/**
 * @interface PlayerForPianoInput
 * @description Represents a player specifically for use in piano input components.
 * @property {string} id - The unique ID of the player.
 * @property {string} player_name - The name of the player.
 * @property {number} jersey_number - The jersey number of the player.
 * @property {string} team_context - The context of the team ('home' or 'away').
 * @property {string} [position] - The player's position on the field.
 */
export interface PlayerForPianoInput {
  id: string;
  player_name: string;
  jersey_number: number;
  team_context: string;
  position?: string;
}

/**
 * @interface AssignedPlayers
 * @description Represents the assigned players for both the home and away teams.
 * @property {PlayerForPianoInput[]} home - An array of players assigned for the home team.
 * @property {PlayerForPianoInput[]} away - An array of players assigned for the away team.
 */
export interface AssignedPlayers {
  home: PlayerForPianoInput[];
  away: PlayerForPianoInput[];
}

/**
 * @interface MatchRosterPlayer
 * @description Represents a player in the context of a match roster.
 * @property {string} id - The unique ID of the player in the roster.
 * @property {string} player_name - The name of the player.
 * @property {number} jersey_number - The jersey number of the player.
 * @property {string} team_context - The context of the team ('home' or 'away').
 */
export interface MatchRosterPlayer {
  id: string;
  player_name: string;
  jersey_number: number;
  team_context: string;
}

/**
 * @interface DisplayableMatchEvent
 * @description Represents a match event that is prepared for display in the UI.
 * @property {string} id - The unique ID of the event.
 * @property {string} event_type_key - The key of the event type.
 * @property {string} event_type_label - The display label of the event type.
 * @property {string | null} player_name - The name of the player associated with the event.
 * @property {number | null} player_jersey_number - The jersey number of the player.
 * @property {string | null} team_context - The team context of the event ('home' or 'away').
 * @property {string} created_at - The timestamp when the event was created.
 * @property {any} [event_data] - Any additional data associated with the event.
 * @property {string} [player_roster_id] - The roster ID of the player.
 * @property {boolean} is_new - A flag to indicate if the event is new (for UI highlighting).
 */
export interface DisplayableMatchEvent {
  id: string;
  event_type_key: string;
  event_type_label: string;
  player_name: string | null;
  player_jersey_number: number | null;
  team_context: string | null;
  created_at: string;
  event_data?: any;
  player_roster_id?: string;
  is_new: boolean;
}

/**
 * @interface MatchEventPayload
 * @description Represents the payload of a match event, typically used when receiving events from a real-time service.
 * @property {string} id - The unique ID of the event.
 * @property {string} event_type_key - The key of the event type.
 * @property {string} [player_roster_id] - The roster ID of the player associated with the event.
 * @property {string} [team_context] - The team context of the event.
 * @property {string} created_at - The timestamp when the event was created.
 * @property {any} [event_data] - Any additional data associated with the event.
 */
export interface MatchEventPayload {
  id: string;
  event_type_key: string;
  player_roster_id?: string;
  team_context?: string;
  created_at: string;
  event_data?: any;
}
