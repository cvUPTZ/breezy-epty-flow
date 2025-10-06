// types/eventTypes.ts
export type EventType = 
  | 'pass' | 'shot' | 'tackle' | 'foul' | 'corner' | 'offside' | 'goal'
  | 'assist' | 'yellowCard' | 'redCard' | 'substitution' | 'penalty'
  | 'freeKick' | 'goalKick' | 'throwIn' | 'interception' | 'possession'
  | 'ballLost' | 'ballRecovered' | 'dribble' | 'cross' | 'clearance'
  | 'block' | 'save' | 'ownGoal' | 'aerialDuel' | 'groundDuel'
  | 'pressure' | 'dribbleAttempt' | 'ballRecovery' | 'supportPass'
  | 'offensivePass' | 'contact' | 'sixMeterViolation' | 'postHit'
  | 'aerialDuelWon' | 'aerialDuelLost' | 'decisivePass' | 'successfulCross'
  | 'successfulDribble' | 'longPass' | 'forwardPass' | 'backwardPass'
  | 'lateralPass'
  // New goalkeeper events
  | 'punch' | 'claim' | 'sweeperAction'
  // New shot variations
  | 'shotOnTarget' | 'shotOffTarget' | 'shotBlocked' | 'header'
  // New defensive actions
  | 'slidingTackle' | 'standingTackle'
  // New game flow events
  | 'kickOff' | 'halfTime' | 'fullTime' | 'extraTimeStart' | 'extraTimeEnd'
  | 'penaltyShootout' | 'penaltyShootoutGoal' | 'penaltyShootoutMiss'
  // New modern football events
  | 'varReview' | 'varDecision' | 'injuryStoppage' | 'timeWasting'
  | 'encroachment' | 'handball'
  // New advanced metrics
  | 'progressivePass' | 'progressiveCarry' | 'passIntoFinalThird'
  | 'passIntoPenaltyArea' | 'shotCreatingAction' | 'goalKickShort'
  | 'goalKickLong' | 'offsideTrap';

export interface EventTypeDefinition {
  key: EventType;
  label: string;
  color: string;
  description: string;
  icon: string;
  keyboardShortcut?: string;
}

export interface EventCategory {
  key: string;
  label: string;
  color: string;
  description: string;
  events: EventTypeDefinition[];
}

// Single source of truth for all event types
export const EVENT_TYPE_DEFINITIONS: Record<EventType, EventTypeDefinition> = {
  // Ball Actions
  pass: { key: 'pass', label: 'Pass', color: '#3B82F6', description: 'Pass between players', icon: '⚽', keyboardShortcut: 'p' },
  shot: { key: 'shot', label: 'Shot', color: '#EF4444', description: 'Shot on goal', icon: '🎯', keyboardShortcut: 's' },
  cross: { key: 'cross', label: 'Cross', color: '#3B82F6', description: 'Cross into box', icon: '↗️', keyboardShortcut: 'x' },
  dribble: { key: 'dribble', label: 'Dribble', color: '#8B5CF6', description: 'Dribbling move', icon: '🏃', keyboardShortcut: 'd' },
  tackle: { key: 'tackle', label: 'Tackle', color: '#F59E0B', description: 'Defensive tackle', icon: '⚔️', keyboardShortcut: 't' },
  interception: { key: 'interception', label: 'Interception', color: '#8B5CF6', description: 'Ball interception', icon: '✋', keyboardShortcut: 'i' },
  clearance: { key: 'clearance', label: 'Clearance', color: '#F59E0B', description: 'Defensive clearance', icon: '🦶' },
  save: { key: 'save', label: 'Save', color: '#10B981', description: 'Goalkeeper save', icon: '🥅', keyboardShortcut: 'v' },
  block: { key: 'block', label: 'Block', color: '#6B7280', description: 'Shot block', icon: '🛡️', keyboardShortcut: 'b' },

  // Set Pieces
  corner: { key: 'corner', label: 'Corner Kick', color: '#10B981', description: 'Corner kick', icon: '📐', keyboardShortcut: 'c' },
  freeKick: { key: 'freeKick', label: 'Free Kick', color: '#10B981', description: 'Free kick', icon: '⚽', keyboardShortcut: 'k' },
  throwIn: { key: 'throwIn', label: 'Throw In', color: '#6B7280', description: 'Throw in', icon: '🤾', keyboardShortcut: 'h' },
  goalKick: { key: 'goalKick', label: 'Goal Kick', color: '#3B82F6', description: 'Goal kick', icon: '👢', keyboardShortcut: 'l' },
  penalty: { key: 'penalty', label: 'Penalty', color: '#EF4444', description: 'Penalty kick', icon: '⚽', keyboardShortcut: 'n' },

  // Fouls & Cards
  foul: { key: 'foul', label: 'Foul', color: '#EF4444', description: 'Rule violation', icon: '⚠️', keyboardShortcut: 'f' },
  yellowCard: { key: 'yellowCard', label: 'Yellow Card', color: '#F59E0B', description: 'Yellow card', icon: '🟨', keyboardShortcut: 'y' },
  redCard: { key: 'redCard', label: 'Red Card', color: '#EF4444', description: 'Red card', icon: '🟥', keyboardShortcut: 'r' },
  offside: { key: 'offside', label: 'Offside', color: '#F59E0B', description: 'Offside violation', icon: '🚩', keyboardShortcut: 'o' },
  handball: { key: 'handball', label: 'Handball', color: '#DC2626', description: 'Handball violation', icon: '🖐️' },

  // Goals & Assists
  goal: { key: 'goal', label: 'Goal', color: '#10B981', description: 'Goal scored', icon: '⚽', keyboardShortcut: 'g' },
  assist: { key: 'assist', label: 'Assist', color: '#8B5CF6', description: 'Goal assist', icon: '🎯', keyboardShortcut: 'a' },
  ownGoal: { key: 'ownGoal', label: 'Own Goal', color: '#EF4444', description: 'Own goal', icon: '😬', keyboardShortcut: 'w' },

  // Possession
  ballLost: { key: 'ballLost', label: 'Ball Lost', color: '#EF4444', description: 'Ball lost', icon: '❌' },
  ballRecovered: { key: 'ballRecovered', label: 'Ball Recovered', color: '#10B981', description: 'Ball recovered', icon: '✅' },
  possession: { key: 'possession', label: 'Possession', color: '#3B82F6', description: 'Ball possession', icon: '⚽' },
  ballRecovery: { key: 'ballRecovery', label: 'Ball Recovery', color: '#A78BFA', description: 'Recovering a loose ball', icon: '🖐️' },

  // Match Events
  substitution: { key: 'substitution', label: 'Substitution', color: '#6B7280', description: 'Player substitution', icon: '🔄', keyboardShortcut: 'u' },

  // Duels
  aerialDuel: { key: 'aerialDuel', label: 'Aerial Duel', color: '#8B5CF6', description: 'Aerial duel', icon: '🦅', keyboardShortcut: 'e' },
  groundDuel: { key: 'groundDuel', label: 'Ground Duel', color: '#F59E0B', description: 'Ground duel', icon: '⚔️', keyboardShortcut: 'q' },
  aerialDuelWon: { key: 'aerialDuelWon', label: 'Aerial Duel Won', color: '#417505', description: 'Aerial duel won', icon: '🏆' },
  aerialDuelLost: { key: 'aerialDuelLost', label: 'Aerial Duel Lost', color: '#D0021B', description: 'Aerial duel lost', icon: '👎' },

  // Advanced Actions
  pressure: { key: 'pressure', label: 'Pressure Applied', color: '#4ADE80', description: 'Defensive pressure action', icon: '💨' },
  dribbleAttempt: { key: 'dribbleAttempt', label: 'Dribble Attempt', color: '#2DD4BF', description: 'Attempt to dribble past opponent', icon: '⚡' },
  successfulDribble: { key: 'successfulDribble', label: 'Successful Dribble', color: '#E350A9', description: 'Successful dribble', icon: '🏃‍♂️💨' },

  // Pass Types
  supportPass: { key: 'supportPass', label: 'Support Pass', color: '#4A90E2', description: 'Supportive pass', icon: '🤝' },
  offensivePass: { key: 'offensivePass', label: 'Offensive Pass', color: '#50E3C2', description: 'Offensive pass', icon: '🚀' },
  decisivePass: { key: 'decisivePass', label: 'Decisive Pass', color: '#F8E71C', description: 'Decisive pass (e.g., key pass)', icon: '🔑' },
  longPass: { key: 'longPass', label: 'Long Pass', color: '#0E8A9C', description: 'Long pass', icon: '📏➡️' },
  forwardPass: { key: 'forwardPass', label: 'Forward Pass', color: '#2CA02C', description: 'Forward pass', icon: '⬆️' },
  backwardPass: { key: 'backwardPass', label: 'Backward Pass', color: '#D32F2F', description: 'Backward pass', icon: '⬇️' },
  lateralPass: { key: 'lateralPass', label: 'Lateral Pass', color: '#FF9800', description: 'Lateral pass', icon: '↔️' },
  successfulCross: { key: 'successfulCross', label: 'Successful Cross', color: '#7ED321', description: 'Successful cross', icon: '✅' },

  // Special Events
  contact: { key: 'contact', label: 'Contact', color: '#F5A623', description: 'Player contact event', icon: '💥' },
  sixMeterViolation: { key: 'sixMeterViolation', label: '6 Meter Violation', color: '#BD10E0', description: '6 Meter Violation', icon: '📏' },
  postHit: { key: 'postHit', label: 'Post Hit', color: '#9013FE', description: 'Ball hit the post', icon: '🥅' },

  // NEW: Goalkeeper Specific
  punch: { key: 'punch', label: 'Punch', color: '#059669', description: 'Goalkeeper punches ball away', icon: '👊' },
  claim: { key: 'claim', label: 'Claim', color: '#10B981', description: 'Goalkeeper claims/catches ball', icon: '🧤' },
  sweeperAction: { key: 'sweeperAction', label: 'Sweeper Action', color: '#14B8A6', description: 'Goalkeeper sweeps outside box', icon: '🏃‍♂️' },

  // NEW: Shot Variations
  shotOnTarget: { key: 'shotOnTarget', label: 'Shot On Target', color: '#DC2626', description: 'Shot on target', icon: '🎯✅' },
  shotOffTarget: { key: 'shotOffTarget', label: 'Shot Off Target', color: '#F87171', description: 'Shot off target', icon: '🎯❌' },
  shotBlocked: { key: 'shotBlocked', label: 'Shot Blocked', color: '#FB923C', description: 'Shot blocked by defender', icon: '🛡️⚽' },
  header: { key: 'header', label: 'Header', color: '#C026D3', description: 'Header attempt', icon: '🗣️' },

  // NEW: Defensive Actions
  slidingTackle: { key: 'slidingTackle', label: 'Sliding Tackle', color: '#EA580C', description: 'Sliding tackle', icon: '🦵' },
  standingTackle: { key: 'standingTackle', label: 'Standing Tackle', color: '#F59E0B', description: 'Standing tackle', icon: '🧍⚔️' },

  // NEW: Game Flow
  kickOff: { key: 'kickOff', label: 'Kick Off', color: '#6366F1', description: 'Match kick off', icon: '🏁' },
  halfTime: { key: 'halfTime', label: 'Half Time', color: '#6B7280', description: 'Half time break', icon: '⏸️' },
  fullTime: { key: 'fullTime', label: 'Full Time', color: '#6B7280', description: 'Match end', icon: '🏁' },
  extraTimeStart: { key: 'extraTimeStart', label: 'Extra Time Start', color: '#8B5CF6', description: 'Extra time begins', icon: '⏱️' },
  extraTimeEnd: { key: 'extraTimeEnd', label: 'Extra Time End', color: '#8B5CF6', description: 'Extra time ends', icon: '⏹️' },
  penaltyShootout: { key: 'penaltyShootout', label: 'Penalty Shootout', color: '#DB2777', description: 'Penalty shootout begins', icon: '🎯🔫' },
  penaltyShootoutGoal: { key: 'penaltyShootoutGoal', label: 'Shootout Goal', color: '#10B981', description: 'Penalty shootout goal', icon: '✅⚽' },
  penaltyShootoutMiss: { key: 'penaltyShootoutMiss', label: 'Shootout Miss', color: '#EF4444', description: 'Penalty shootout miss', icon: '❌⚽' },

  // NEW: Modern Football
  varReview: { key: 'varReview', label: 'VAR Review', color: '#7C3AED', description: 'VAR review in progress', icon: '📹' },
  varDecision: { key: 'varDecision', label: 'VAR Decision', color: '#6D28D9', description: 'VAR decision made', icon: '✓📹' },
  injuryStoppage: { key: 'injuryStoppage', label: 'Injury Stoppage', color: '#DC2626', description: 'Injury stoppage', icon: '🚑' },
  timeWasting: { key: 'timeWasting', label: 'Time Wasting', color: '#F59E0B', description: 'Time wasting behavior', icon: '🐌' },
  encroachment: { key: 'encroachment', label: 'Encroachment', color: '#F97316', description: 'Player encroachment', icon: '🚫👟' },

  // NEW: Advanced Metrics
  progressivePass: { key: 'progressivePass', label: 'Progressive Pass', color: '#16A34A', description: 'Pass that advances ball significantly', icon: '⬆️⚡' },
  progressiveCarry: { key: 'progressiveCarry', label: 'Progressive Carry', color: '#15803D', description: 'Carrying ball forward significantly', icon: '🏃⬆️' },
  passIntoFinalThird: { key: 'passIntoFinalThird', label: 'Pass Into Final Third', color: '#65A30D', description: 'Pass into attacking third', icon: '🎯🔝' },
  passIntoPenaltyArea: { key: 'passIntoPenaltyArea', label: 'Pass Into Penalty Area', color: '#84CC16', description: 'Pass into penalty box', icon: '📦⚽' },
  shotCreatingAction: { key: 'shotCreatingAction', label: 'Shot Creating Action', color: '#EAB308', description: 'Action leading to shot', icon: '🔑🎯' },
  goalKickShort: { key: 'goalKickShort', label: 'Goal Kick Short', color: '#0EA5E9', description: 'Short goal kick', icon: '👢📏' },
  goalKickLong: { key: 'goalKickLong', label: 'Goal Kick Long', color: '#0284C7', description: 'Long goal kick', icon: '👢🚀' },
  offsideTrap: { key: 'offsideTrap', label: 'Offside Trap', color: '#F97316', description: 'Deliberate offside trap', icon: '🪤' },
};

export const EVENT_TYPE_CATEGORIES: EventCategory[] = [
  {
    key: 'ballActions',
    label: 'Ball Actions',
    color: '#3B82F6',
    description: 'Events related to ball movement and control',
    events: [
      EVENT_TYPE_DEFINITIONS.pass,
      EVENT_TYPE_DEFINITIONS.shot,
      EVENT_TYPE_DEFINITIONS.cross,
      EVENT_TYPE_DEFINITIONS.dribble,
      EVENT_TYPE_DEFINITIONS.tackle,
      EVENT_TYPE_DEFINITIONS.interception,
      EVENT_TYPE_DEFINITIONS.clearance,
      EVENT_TYPE_DEFINITIONS.save,
      EVENT_TYPE_DEFINITIONS.block,
    ]
  },
  {
    key: 'setPieces',
    label: 'Set Pieces',
    color: '#10B981',
    description: 'Fixed situations and restarts',
    events: [
      EVENT_TYPE_DEFINITIONS.corner,
      EVENT_TYPE_DEFINITIONS.freeKick,
      EVENT_TYPE_DEFINITIONS.throwIn,
      EVENT_TYPE_DEFINITIONS.goalKick,
      EVENT_TYPE_DEFINITIONS.penalty,
    ]
  },
  {
    key: 'foulsCards',
    label: 'Fouls & Cards',
    color: '#EF4444',
    description: 'Disciplinary actions and violations',
    events: [
      EVENT_TYPE_DEFINITIONS.foul,
      EVENT_TYPE_DEFINITIONS.yellowCard,
      EVENT_TYPE_DEFINITIONS.redCard,
      EVENT_TYPE_DEFINITIONS.offside,
      EVENT_TYPE_DEFINITIONS.handball,
    ]
  },
  {
    key: 'goalsAssists',
    label: 'Goals & Assists',
    color: '#F59E0B',
    description: 'Scoring and goal-related events',
    events: [
      EVENT_TYPE_DEFINITIONS.goal,
      EVENT_TYPE_DEFINITIONS.assist,
      EVENT_TYPE_DEFINITIONS.ownGoal,
    ]
  },
  {
    key: 'possession',
    label: 'Possession',
    color: '#8B5CF6',
    description: 'Ball control and possession changes',
    events: [
      EVENT_TYPE_DEFINITIONS.ballLost,
      EVENT_TYPE_DEFINITIONS.ballRecovered,
      EVENT_TYPE_DEFINITIONS.possession,
      EVENT_TYPE_DEFINITIONS.ballRecovery,
    ]
  },
  {
    key: 'matchEvents',
    label: 'Match Events',
    color: '#6B7280',
    description: 'General match occurrences',
    events: [
      EVENT_TYPE_DEFINITIONS.substitution,
    ]
  },
  {
    key: 'duels',
    label: 'Duels',
    color: '#A855F7',
    description: 'Player vs player contests',
    events: [
      EVENT_TYPE_DEFINITIONS.aerialDuel,
      EVENT_TYPE_DEFINITIONS.groundDuel,
      EVENT_TYPE_DEFINITIONS.aerialDuelWon,
      EVENT_TYPE_DEFINITIONS.aerialDuelLost,
    ]
  },
  {
    key: 'advancedActions',
    label: 'Advanced Actions',
    color: '#4ADE80',
    description: 'Complex tactical actions',
    events: [
      EVENT_TYPE_DEFINITIONS.pressure,
      EVENT_TYPE_DEFINITIONS.dribbleAttempt,
      EVENT_TYPE_DEFINITIONS.successfulDribble,
    ]
  },
  {
    key: 'passTypes',
    label: 'Pass Types',
    color: '#2DD4BF',
    description: 'Different types of passes',
    events: [
      EVENT_TYPE_DEFINITIONS.supportPass,
      EVENT_TYPE_DEFINITIONS.offensivePass,
      EVENT_TYPE_DEFINITIONS.decisivePass,
      EVENT_TYPE_DEFINITIONS.longPass,
      EVENT_TYPE_DEFINITIONS.forwardPass,
      EVENT_TYPE_DEFINITIONS.backwardPass,
      EVENT_TYPE_DEFINITIONS.lateralPass,
      EVENT_TYPE_DEFINITIONS.successfulCross,
    ]
  },
  {
    key: 'specialEvents',
    label: 'Special Events',
    color: '#F5A623',
    description: 'Special game situations',
    events: [
      EVENT_TYPE_DEFINITIONS.contact,
      EVENT_TYPE_DEFINITIONS.sixMeterViolation,
      EVENT_TYPE_DEFINITIONS.postHit,
    ]
  },
  {
    key: 'goalkeeperActions',
    label: 'Goalkeeper Actions',
    color: '#059669',
    description: 'Goalkeeper-specific events',
    events: [
      EVENT_TYPE_DEFINITIONS.punch,
      EVENT_TYPE_DEFINITIONS.claim,
      EVENT_TYPE_DEFINITIONS.sweeperAction,
    ]
  },
  {
    key: 'shotVariations',
    label: 'Shot Variations',
    color: '#DC2626',
    description: 'Different types of shots',
    events: [
      EVENT_TYPE_DEFINITIONS.shotOnTarget,
      EVENT_TYPE_DEFINITIONS.shotOffTarget,
      EVENT_TYPE_DEFINITIONS.shotBlocked,
      EVENT_TYPE_DEFINITIONS.header,
    ]
  },
  {
    key: 'defensiveActions',
    label: 'Defensive Actions',
    color: '#EA580C',
    description: 'Defensive tackle variations',
    events: [
      EVENT_TYPE_DEFINITIONS.slidingTackle,
      EVENT_TYPE_DEFINITIONS.standingTackle,
    ]
  },
  {
    key: 'gameFlow',
    label: 'Game Flow',
    color: '#6366F1',
    description: 'Match timeline events',
    events: [
      EVENT_TYPE_DEFINITIONS.kickOff,
      EVENT_TYPE_DEFINITIONS.halfTime,
      EVENT_TYPE_DEFINITIONS.fullTime,
      EVENT_TYPE_DEFINITIONS.extraTimeStart,
      EVENT_TYPE_DEFINITIONS.extraTimeEnd,
      EVENT_TYPE_DEFINITIONS.penaltyShootout,
      EVENT_TYPE_DEFINITIONS.penaltyShootoutGoal,
      EVENT_TYPE_DEFINITIONS.penaltyShootoutMiss,
    ]
  },
  {
    key: 'modernFootball',
    label: 'Modern Football',
    color: '#7C3AED',
    description: 'VAR and contemporary match events',
    events: [
      EVENT_TYPE_DEFINITIONS.varReview,
      EVENT_TYPE_DEFINITIONS.varDecision,
      EVENT_TYPE_DEFINITIONS.injuryStoppage,
      EVENT_TYPE_DEFINITIONS.timeWasting,
      EVENT_TYPE_DEFINITIONS.encroachment,
    ]
  },
  {
    key: 'advancedMetrics',
    label: 'Advanced Metrics',
    color: '#16A34A',
    description: 'Advanced statistical tracking',
    events: [
      EVENT_TYPE_DEFINITIONS.progressivePass,
      EVENT_TYPE_DEFINITIONS.progressiveCarry,
      EVENT_TYPE_DEFINITIONS.passIntoFinalThird,
      EVENT_TYPE_DEFINITIONS.passIntoPenaltyArea,
      EVENT_TYPE_DEFINITIONS.shotCreatingAction,
      EVENT_TYPE_DEFINITIONS.goalKickShort,
      EVENT_TYPE_DEFINITIONS.goalKickLong,
      EVENT_TYPE_DEFINITIONS.offsideTrap,
    ]
  },
];

// Derived constants for backward compatibility and utility
export const EVENT_TYPES = Object.keys(EVENT_TYPE_DEFINITIONS) as EventType[];

export const EVENT_TYPE_LABELS: Record<EventType, string> = 
  Object.fromEntries(
    Object.entries(EVENT_TYPE_DEFINITIONS).map(([key, def]) => [key, def.label])
  ) as Record<EventType, string>;

export const EVENT_STYLES: Record<EventType, { color: string; description: string; icon: string }> = 
  Object.fromEntries(
    Object.entries(EVENT_TYPE_DEFINITIONS).map(([key, def]) => [
      key, 
      { color: def.color, description: def.description, icon: def.icon }
    ])
  ) as Record<EventType, { color: string; description: string; icon: string }>;

export const KEYBOARD_MAPPINGS: Record<string, EventType> = 
  Object.fromEntries(
    Object.entries(EVENT_TYPE_DEFINITIONS)
      .filter(([, def]) => def.keyboardShortcut)
      .map(([key, def]) => [def.keyboardShortcut!, key as EventType])
  ) as Record<string, EventType>;

// Utility functions
export const getEventDefinition = (eventType: EventType): EventTypeDefinition => {
  return EVENT_TYPE_DEFINITIONS[eventType];
};

export const getEventsByCategory = (categoryKey: string): EventTypeDefinition[] => {
  const category = EVENT_TYPE_CATEGORIES.find(cat => cat.key === categoryKey);
  return category?.events || [];
};

export const getAllEventTypes = (): EventType[] => EVENT_TYPES;

export const getEventTypesByShortcut = (): Record<string, EventType> => KEYBOARD_MAPPINGS;
