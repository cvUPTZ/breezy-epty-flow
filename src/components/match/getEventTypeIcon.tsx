
import React from 'react';
import { 
  ArrowRight, 
  Target, 
  AlertTriangle, 
  Trophy, 
  Shield, 
  Flag, 
  CornerDownRight,
  ArrowUpDown,
  Clock,
  Square,
  Circle,
  Zap,
  Users,
  UserMinus,
  UserPlus,
  Heart,
  Ban,
  MapPin,
  Timer,
  Activity,
  XCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Play,
  Pause,
  StopCircle,
  type LucideIcon
} from 'lucide-react';
import { EventType as GlobalEventType } from 'src/types/index';

/**
 * @interface IconProps
 * @description Defines the customization props for an event icon.
 * @property {number} [size=24] - The size of the icon in pixels.
 * @property {string} [className] - Additional CSS class names to apply to the icon.
 * @property {string} [color] - A specific color to apply to the icon.
 * @property {number} [strokeWidth=2] - The stroke width for outline icons.
 * @property {'default' | 'filled' | 'outline'} [variant='default'] - The visual variant of the icon.
 */
export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
  variant?: 'default' | 'filled' | 'outline';
}

/**
 * @enum {string} EventCategory
 * @description Defines the categories for different types of match events for better organization.
 */
export enum EventCategory {
  BALL_ACTION = 'ball_action',
  PLAYER_ACTION = 'player_action',
  DISCIPLINARY = 'disciplinary',
  MATCH_STATE = 'match_state',
  TACTICAL = 'tactical'
}

/**
 * @interface EventMetadata
 * @description Provides additional context and metadata for a specific event type.
 * @property {EventCategory} category - The category the event belongs to.
 * @property {'low' | 'medium' | 'high' | 'critical'} [severity] - The severity or importance of the event.
 * @property {string} description - A human-readable description of the event.
 * @property {string[]} aliases - An array of alternative names or keys for the event.
 */
export interface EventMetadata {
  category: EventCategory;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  aliases: string[];
}

/**
 * @constant EVENT_MAP
 * @description A comprehensive mapping of event types to their corresponding icons and metadata.
 * This serves as the central registry for all event-related information in the application.
 * The keys of this object define the local `EventType` for this utility file.
 */
const EVENT_MAP = {
  // Ball Actions
  pass: {
    icon: ArrowRight,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'low' as const,
      description: 'Player passes the ball',
      aliases: ['pass', 'passing']
    }
  },
  shot: {
    icon: Target,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'medium' as const,
      description: 'Player takes a shot',
      aliases: ['shot', 'shooting', 'attempt']
    }
  },
  goal: {
    icon: Trophy,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'critical' as const,
      description: 'Goal scored',
      aliases: ['goal', 'score']
    }
  },
  assist: {
    icon: TrendingUp,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'high' as const,
      description: 'Assist for goal',
      aliases: ['assist', 'setup']
    }
  },
  cross: {
    icon: CornerDownRight,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'medium' as const,
      description: 'Cross into the box',
      aliases: ['cross', 'crossing']
    }
  },
  header: {
    icon: Circle,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'medium' as const,
      description: 'Header',
      aliases: ['header', 'head']
    }
  },
  volley: {
    icon: Zap,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'medium' as const,
      description: 'Volley shot',
      aliases: ['volley']
    }
  },
  penalty: {
    icon: MapPin,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'critical' as const,
      description: 'Penalty kick',
      aliases: ['penalty', 'pk', 'penalty_kick']
    }
  },
  // Mapped from free_kick. GlobalEventType has 'freeKick' and 'free-kick'.
  freeKick: {
    icon: Play,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'medium' as const,
      description: 'Free kick',
      aliases: ['free_kick', 'freekick', 'fk', 'free-kick']
    }
  },
  corner: {
    icon: CornerDownRight,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'medium' as const,
      description: 'Corner kick',
      aliases: ['corner', 'corner_kick']
    }
  },
  // Mapped from throw_in. GlobalEventType has 'throwIn' and 'throw-in'.
  throwIn: {
    icon: RotateCcw,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'low' as const,
      description: 'Throw in',
      aliases: ['throw_in', 'throw', 'throwin', 'throw-in']
    }
  },
  kickOff: { // Restored and camelCased
    icon: Play,
    metadata: {
      category: EventCategory.MATCH_STATE,
      severity: 'medium' as const,
      description: 'Kick off',
      aliases: ['kick_off', 'kickoff', 'start']
    }
  },
  save: {
    icon: Shield,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'high' as const,
      description: 'Goalkeeper save',
      aliases: ['save', 'stop']
    }
  },
  block: {
    icon: Square,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'medium' as const,
      description: 'Shot blocked',
      aliases: ['block', 'blocked']
    }
  },
  clearance: {
    icon: TrendingDown,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'medium' as const,
      description: 'Ball cleared',
      aliases: ['clearance', 'clear']
    }
  },
  interception: {
    icon: CheckCircle,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'medium' as const,
      description: 'Ball intercepted',
      aliases: ['interception', 'intercept']
    }
  },
  tackle: {
    icon: Activity,
    metadata: {
      category: EventCategory.BALL_ACTION,
      severity: 'medium' as const,
      description: 'Tackle made',
      aliases: ['tackle', 'tackling']
    }
  },

  // Player Actions
  substitution: {
    icon: ArrowUpDown,
    metadata: {
      category: EventCategory.PLAYER_ACTION,
      severity: 'medium' as const,
      description: 'Player substitution',
      aliases: ['substitution', 'change'] // 'sub' key will map to 'sub' GlobalEventType
    }
  },
  sub: { // 'sub' is a GlobalEventType, maps to local 'sub'
    icon: ArrowUpDown,
    metadata: {
      category: EventCategory.PLAYER_ACTION,
      severity: 'medium' as const,
      description: 'Player substitution (short)',
      aliases: ['sub', 'substitution']
    }
  },
  injury: { // Restored
    icon: Heart,
    metadata: {
      category: EventCategory.PLAYER_ACTION,
      severity: 'high' as const,
      description: 'Player injury',
      aliases: ['injury', 'hurt', 'injured']
    }
  },
  treatment: { // Restored
    icon: UserMinus,
    metadata: {
      category: EventCategory.PLAYER_ACTION,
      severity: 'medium' as const,
      description: 'Medical treatment',
      aliases: ['treatment', 'medical']
    }
  },
  returnToField: { // Restored as returnToField (from 'return')
    icon: UserPlus,
    metadata: {
      category: EventCategory.PLAYER_ACTION,
      severity: 'low' as const,
      description: 'Player returns to field',
      aliases: ['return', 'back']
    }
  },

  // Disciplinary
  foul: {
    icon: AlertTriangle,
    metadata: {
      category: EventCategory.DISCIPLINARY,
      severity: 'medium' as const,
      description: 'Foul committed',
      aliases: ['foul', 'violation']
    }
  },
  // Mapped from yellow_card
  yellowCard: {
    icon: Square,
    metadata: {
      category: EventCategory.DISCIPLINARY,
      severity: 'high' as const,
      description: 'Yellow card shown',
      aliases: ['yellow_card', 'yellow', 'booking', 'caution']
    }
  },
  redCard: { // Was red_card
    icon: XCircle,
    metadata: {
      category: EventCategory.DISCIPLINARY,
      severity: 'critical' as const,
      description: 'Red card shown',
      aliases: ['red_card', 'red', 'ejection', 'dismissal']
    }
  },
  card: { // Generic card, maps to GlobalEventType 'card'
    icon: Square,
    metadata: {
      category: EventCategory.DISCIPLINARY,
      severity: 'high' as const,
      description: 'Card shown (generic)',
      aliases: ['card', 'booked'] // 'booking' alias handled by specific 'booking' type if needed
    }
  },
  booking: { // Restored
    icon: Square,
    metadata: {
      category: EventCategory.DISCIPLINARY,
      severity: 'high' as const,
      description: 'Player booked',
      aliases: ['booking'] // Could add 'yellow_card_booking' if specific
    }
  },
  warning: { // Restored
    icon: AlertTriangle,
    metadata: {
      category: EventCategory.DISCIPLINARY,
      severity: 'medium' as const,
      description: 'Warning given',
      aliases: ['warning', 'warn']
    }
  },
  offside: {
    icon: Flag,
    metadata: {
      category: EventCategory.DISCIPLINARY,
      severity: 'medium' as const,
      description: 'Offside violation',
      aliases: ['offside', 'offside_violation']
    }
  },
  handball: { // Restored
    icon: Ban,
    metadata: {
      category: EventCategory.DISCIPLINARY,
      severity: 'medium' as const,
      description: 'Handball violation',
      aliases: ['handball', 'hand_ball']
    }
  },
  unsportingBehavior: { // Restored and camelCased from unsporting_behavior
    icon: XCircle,
    metadata: {
      category: EventCategory.DISCIPLINARY,
      severity: 'high' as const,
      description: 'Unsporting behavior',
      aliases: ['unsporting_behavior', 'unsporting', 'misconduct']
    }
  },

  // Match State (Restored and camelCased where needed)
  halfTime: {
    icon: Pause,
    metadata: {
      category: EventCategory.MATCH_STATE,
      severity: 'medium' as const,
      description: 'Half time break',
      aliases: ['half_time', 'halftime', 'ht']
    }
  },
  fullTime: {
    icon: StopCircle,
    metadata: {
      category: EventCategory.MATCH_STATE,
      severity: 'high' as const,
      description: 'Full time whistle',
      aliases: ['full_time', 'fulltime', 'ft', 'end']
    }
  },
  extraTime: {
    icon: Timer,
    metadata: {
      category: EventCategory.MATCH_STATE,
      severity: 'high' as const,
      description: 'Extra time period',
      aliases: ['extra_time', 'overtime', 'et']
    }
  },
  penaltyShootout: {
    icon: Target,
    metadata: {
      category: EventCategory.MATCH_STATE,
      severity: 'critical' as const,
      description: 'Penalty shootout',
      aliases: ['penalty_shootout', 'penalties', 'pso']
    }
  },
  varCheck: {
    icon: Clock,
    metadata: {
      category: EventCategory.MATCH_STATE,
      severity: 'medium' as const,
      description: 'VAR check in progress',
      aliases: ['var_check', 'var', 'video_review']
    }
  },
  varDecision: {
    icon: CheckCircle,
    metadata: {
      category: EventCategory.MATCH_STATE,
      severity: 'high' as const,
      description: 'VAR decision made',
      aliases: ['var_decision', 'var_result']
    }
  },
  goalCancelled: {
    icon: XCircle,
    metadata: {
      category: EventCategory.MATCH_STATE,
      severity: 'critical' as const,
      description: 'Goal cancelled',
      aliases: ['goal_cancelled', 'goal_disallowed', 'no_goal']
    }
  },
  goalAwarded: {
    icon: Trophy,
    metadata: {
      category: EventCategory.MATCH_STATE,
      severity: 'critical' as const,
      description: 'Goal awarded',
      aliases: ['goal_awarded', 'goal_confirmed']
    }
  },

  // Tactical (Restored and camelCased where needed)
  formationChange: {
    icon: Users,
    metadata: {
      category: EventCategory.TACTICAL,
      severity: 'medium' as const,
      description: 'Formation change',
      aliases: ['formation_change', 'tactical_change']
    }
  },
  timeout: { // Already camelCase
    icon: Pause,
    metadata: {
      category: EventCategory.TACTICAL,
      severity: 'medium' as const,
      description: 'Timeout called',
      aliases: ['timeout', 'break']
    }
  },
  captainChange: {
    icon: ArrowUpDown,
    metadata: {
      category: EventCategory.TACTICAL,
      severity: 'medium' as const,
      description: 'Captain change',
      aliases: ['captain_change', 'new_captain']
    }
  }
};

/**
 * @typedef {keyof typeof EVENT_MAP} EventType
 * @description Defines the local event type based on the keys of the `EVENT_MAP` object.
 * This provides a strongly-typed set of all supported event keys within this utility.
 */
export type EventType = keyof typeof EVENT_MAP;

/**
 * @function getEventTypeIcon
 * @description Retrieves the appropriate Lucide icon component for a given event type key.
 * It normalizes the input key and can find the correct event by its primary key or any of its aliases.
 * @param {string} eventKey - The key or alias for the event type.
 * @param {IconProps} [props={}] - Optional props to customize the icon's appearance (size, color, etc.).
 * @returns {JSX.Element} A React component instance of the corresponding Lucide icon.
 */
export function getEventTypeIcon(
  eventKey: string, 
  props: IconProps = {}
): JSX.Element {
  const { 
    size = 24, 
    className = '', 
    color,
    strokeWidth = 2,
    variant = 'default'
  } = props;
  
  // Normalize event key (lowercase, handle aliases)
  const normalizedKey = eventKey.toLowerCase().trim();
  
  // Find event by key or alias
  let eventConfig = EVENT_MAP[normalizedKey as EventType]; // Direct lookup with local EventType

  if (!eventConfig) {
    // Search in aliases if not found as a primary key
    for (const mapKey in EVENT_MAP) {
      const currentEvent = EVENT_MAP[mapKey as EventType];
      if (currentEvent.metadata.aliases.some(alias => alias.toLowerCase() === normalizedKey)) {
        eventConfig = currentEvent;
        break;
      }
    }
  }
  
  const IconComponent = eventConfig ? eventConfig.icon : ArrowRight; // Default icon
  
  // Build icon props based on variant and customization
  const iconProps = {
    size,
    className: `event-icon event-icon--${variant} ${className}`.trim(),
    strokeWidth,
    ...(color && { color }),
    'data-event-type': normalizedKey, // Keep original key for data attribute if needed
    'data-event-category': eventConfig?.metadata.category || 'unknown',
    'data-event-severity': eventConfig?.metadata.severity || 'low'
  };

  return <IconComponent {...iconProps} />;
}

/**
 * @function getEventMetadata
 * @description Retrieves the metadata for a given event type key or alias.
 * @param {string} eventKey - The key or alias for the event type.
 * @returns {EventMetadata | null} The metadata object for the event, or null if not found.
 */
export function getEventMetadata(eventKey: string): EventMetadata | null {
  const normalizedKey = eventKey.toLowerCase().trim();
  let eventConfig = EVENT_MAP[normalizedKey as EventType];

  if (!eventConfig) {
    for (const mapKey in EVENT_MAP) {
      const currentEvent = EVENT_MAP[mapKey as EventType];
      if (currentEvent.metadata.aliases.some(alias => alias.toLowerCase() === normalizedKey)) {
        eventConfig = currentEvent;
        break;
      }
    }
  }
  return eventConfig ? eventConfig.metadata : null;
}

/**
 * @function getEventsByCategory
 * @description Gets all event types that belong to a specific category.
 * @param {EventCategory} category - The category to filter by.
 * @returns {EventType[]} An array of event type keys belonging to the category.
 */
export function getEventsByCategory(category: EventCategory): EventType[] {
  const events: EventType[] = [];
  for (const mapKey in EVENT_MAP) {
    const eventTypeKey = mapKey as EventType;
    const eventConfig = EVENT_MAP[eventTypeKey];
    if (eventConfig && eventConfig.metadata.category === category) {
      events.push(eventTypeKey);
    }
  }
  return events;
}

/**
 * @function getEventsBySeverity
 * @description Gets all event types that have a specific severity level.
 * @param {'low' | 'medium' | 'high' | 'critical'} severity - The severity level to filter by.
 * @returns {EventType[]} An array of event type keys with the specified severity.
 */
export function getEventsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): EventType[] {
  const events: EventType[] = [];
  for (const mapKey in EVENT_MAP) {
    const eventTypeKey = mapKey as EventType;
    const eventConfig = EVENT_MAP[eventTypeKey];
    if (eventConfig && eventConfig.metadata.severity === severity) {
      events.push(eventTypeKey);
    }
  }
  return events;
}

/**
 * @function getAllSupportedEvents
 * @description Gets a list of all primary event type keys supported by this utility.
 * @returns {EventType[]} An array of all event type keys.
 */
export function getAllSupportedEvents(): EventType[] {
  return Object.keys(EVENT_MAP) as EventType[];
}

/**
 * @function isValidEventType
 * @description Checks if a given string is a valid event type key or alias.
 * @param {string} eventKey - The event key or alias to validate.
 * @returns {boolean} True if the event key is valid, false otherwise.
 */
export function isValidEventType(eventKey: string): boolean {
  const normalizedKey = eventKey.toLowerCase().trim();
  if (EVENT_MAP[normalizedKey as EventType]) { // Check primary keys
    return true;
  }
  // Check aliases
  for (const mapKey in EVENT_MAP) {
    const currentEvent = EVENT_MAP[mapKey as EventType];
    if (currentEvent.metadata.aliases.some(alias => alias.toLowerCase() === normalizedKey)) {
      return true;
    }
  }
  return false;
}

/**
 * @interface EventIconWithInfoProps
 * @description Props for the EventIconWithInfo component.
 * @extends IconProps
 * @property {string} eventType - The key or alias for the event type.
 * @property {boolean} [showTooltip=false] - If true, displays a tooltip with the event description.
 * @property {boolean} [showLabel=false] - If true, displays a text label with the event description next to the icon.
 */
export interface EventIconWithInfoProps extends IconProps {
  eventType: string;
  showTooltip?: boolean;
  showLabel?: boolean;
}

/**
 * @component EventIconWithInfo
 * @description A React component that displays an event icon along with optional labels or tooltips.
 * It serves as a convenient wrapper around `getEventTypeIcon` and `getEventMetadata`.
 * @param {EventIconWithInfoProps} props The props for the component.
 * @returns {JSX.Element} The rendered EventIconWithInfo component.
 */
export function EventIconWithInfo({ 
  eventType, 
  showTooltip = false, 
  showLabel = false,
  ...iconProps 
}: EventIconWithInfoProps): JSX.Element {
  const metadata = getEventMetadata(eventType);
  const icon = getEventTypeIcon(eventType, iconProps);
  
  if (!showTooltip && !showLabel) {
    return icon;
  }
  
  return (
    <div className="event-icon-with-info">
      {icon}
      {showLabel && metadata && (
        <span className="event-label">{metadata.description}</span>
      )}
      {showTooltip && metadata && (
        <div className="event-tooltip" title={metadata.description}>
          {metadata.description}
        </div>
      )}
    </div>
  );
}

/**
 * @constant eventIconStyles
 * @description A string containing CSS classes for styling the event icons and related components.
 * This can be imported and injected into a global stylesheet or used with a CSS-in-JS solution.
 * It includes styles for icon variants, severity levels, and categories.
 */
export const eventIconStyles = `
.event-icon {
  transition: all 0.2s ease;
}

.event-icon--filled {
  fill: currentColor;
}

.event-icon--outline {
  fill: none;
  stroke: currentColor;
}

.event-icon-with-info {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.event-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.event-tooltip {
  position: relative;
}

/* Severity-based styling */
.event-icon[data-event-severity="critical"] {
  color: #dc2626;
}

.event-icon[data-event-severity="high"] {
  color: #ea580c;
}

.event-icon[data-event-severity="medium"] {
  color: #ca8a04;
}

.event-icon[data-event-severity="low"] {
  color: #16a34a;
}

/* Category-based styling */
.event-icon[data-event-category="disciplinary"] {
  color: #dc2626;
}

.event-icon[data-event-category="ball_action"] {
  color: #2563eb;
}

.event-icon[data-event-category="match_state"] {
  color: #7c3aed;
}

.event-icon[data-event-category="tactical"] {
  color: #059669;
}

.event-icon[data-event-category="player_action"] {
  color: #dc2626;
}
`;

export default getEventTypeIcon;
