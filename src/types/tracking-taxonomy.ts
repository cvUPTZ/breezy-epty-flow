/**
 * @file This file contains the foundational data structures that define the "language"
 * of the entire tracking system, as specified in the new system architecture.
 * These will be used across the database, backend functions, and frontend components.
 */

/**
 * Part 1.1: Player Positions (La Taxonomie des Postes)
 * Standard positions to be assigned to players.
 */
export enum PlayerPosition {
    // Goalkeeper
    GK = "Gardien (GK)",

    // Defence
    CB = "Défenseur Central (CB)",
    RB = "Arrière Droit (RB)",
    LB = "Arrière Gauche (LB)",
    RWB = "Latéral Droit (RWB)",
    LWB = "Latéral Gauche (LWB)",
    SW = "Libéro (SW)",

    // Midfield
    CDM = "Milieu Défensif (CDM)",
    CM = "Milieu Central (CM)",
    CAM = "Milieu Offensif (CAM)",
    RM = "Milieu Droit (RM)",
    LM = "Milieu Gauche (LM)",

    // Attack
    ST = "Avant-Centre (ST)",
    CF = "Avant-Centre (CF)",
    RW = "Ailier Droit (RW)",
    LW = "Ailier Gauche (LW)",
    SS = "Attaquant de Soutien (SS)",
}

/**
 * Part 1.2: Tracker Types / Specialties (Les Spécialités des Trackers)
 * Roles assigned to trackers to determine their responsibilities.
 */
export enum TrackerSpecialty {
    DEFENCE = "Defence Specialist",
    MIDFIELD = "Midfield Specialist",
    ATTACK = "Attack Specialist",
    GOALKEEPER = "Goalkeeper Specialist",
    SPECIALIZED = "Specialized Tracker",
    GENERALIST = "Generalist / Full Match Tracker",
}


/**
 * Part 1.3: Exhaustive Football Event Taxonomy (La Taxonomie Complète des Actions)
 * The master list of all trackable actions in the system.
 * The enum keys (e.g., GK_SAVE_REFLEX) are the canonical identifiers used in the code.
 * The enum values (e.g., "Arrêt réflexe") are for display purposes.
 */
export enum FootballAction {
    // Goalkeeper Actions
    GK_SAVE_REFLEX = "Arrêt réflexe",
    GK_SAVE_DIVE = "Arrêt plongé",
    GK_SAVE_FOOT = "Arrêt au pied",
    GK_SAVE_HAND_HIGH = "Arrêt de la main (centre/coup franc)",
    GK_SAVE_PARRY_CORNER = "Arrêt parade en corner",
    GK_SAVE_PARRY_POST = "Arrêt détourné en poteaux",
    GK_EXIT_FOOT_SUCCESS = "Sortie au pied réussie",
    GK_EXIT_FOOT_FAIL = "Sortie au pied ratée",
    GK_EXIT_PUNCH = "Sortie aux poings",
    GK_EXIT_CATCH = "Sortie captée",
    GK_EXIT_FAIL_GOAL = "Sortie manquée (but encaissé)",
    GK_PASS_SHORT = "Passe courte au pied (Gardien)",
    GK_PASS_LONG = "Passe longue au pied (Gardien)",
    GK_THROW_SHORT = "Dégagement main (rapide)",
    GK_THROW_LONG = "Dégagement main long",
    GK_CLEARANCE_PRESSURE = "Dégagement au pied sous pression",

    // Defensive Actions
    DEF_TACKLE_SLIDE_SUCCESS = "Tacle glissé réussi",
    DEF_TACKLE_SLIDE_FAIL = "Tacle glissé raté",
    DEF_TACKLE_STAND_SUCCESS = "Tacle debout réussi",
    DEF_TACKLE_STAND_FAIL = "Tacle debout raté",
    DEF_INTERCEPTION_SHORT = "Interception passe courte",
    DEF_INTERCEPTION_LONG = "Interception passe longue",
    DEF_CLEARANCE_HEAD = "Dégagement tête",
    DEF_CLEARANCE_FOOT_URGENT = "Dégagement pied urgence",
    DEF_CLEARANCE_FOOT_CONTROLLED = "Dégagement pied contrôlé",
    DEF_COUNTER_1V1 = "Contre réussi (duel 1v1)",
    DEF_DUEL_AERIAL_WON = "Duel aérien gagné",
    DEF_DUEL_AERIAL_LOST = "Duel aérien perdu",
    DEF_DUEL_GROUND_WON = "Duel au sol gagné",
    DEF_DUEL_GROUND_LOST = "Duel au sol perdu",
    DEF_CHARGE_LEGAL = "Charge légale réussie",
    DEF_CHARGE_FOUL = "Charge irrégulière (faute)",
    DEF_PASS_SHORT_SUCCESS = "Passe défense courte réussie",
    DEF_PASS_LONG_SUCCESS = "Passe défense longue réussie",
    DEF_PASS_TO_MIDFIELD_SUCCESS = "Passe vers milieu réussie",
    DEF_PASS_FAIL = "Passe défense ratée",
    DEF_DRIBBLE_SUCCESS = "Dribble défensif réussi",
    DEF_DRIBBLE_FAIL = "Dribble défensif raté",
    DEF_CLEARANCE_CROSS = "Centre défensif dégagement",
    DEF_RECOVERY_BALL = "Récupération ballon libre",

    // Midfield Actions
    MID_PASS_SHORT_SUCCESS = "Passe courte réussie (0-15m)",
    MID_PASS_MEDIUM_SUCCESS = "Passe moyenne réussie (15-25m)",
    MID_PASS_LONG_SUCCESS = "Passe longue réussie (25m+)",
    MID_PASS_THROUGH_SUCCESS = "Passe en profondeur réussie",
    MID_PASS_LATERAL_SUCCESS = "Passe latérale réussie",
    MID_PASS_BACK_SUCCESS = "Passe arrière réussie",
    MID_PASS_TO_ATTACK_SUCCESS = "Passe vers attaque réussie",
    MID_PASS_FAIL = "Passe milieu ratée",
    MID_CROSS_GROUND_SUCCESS = "Centre ras de terre réussi",
    MID_CROSS_AERIAL_SUCCESS = "Centre aérien réussi",
    MID_CROSS_FREEKICK_SUCCESS = "Centre coup franc réussi",
    MID_CROSS_CORNER_SUCCESS = "Centre corner réussi",
    MID_CROSS_FAIL = "Centre raté",
    MID_RECOVERY_PRESSING_HIGH = "Récupération pressing haut",
    MID_RECOVERY_MIDFIELD = "Récupération milieu terrain",
    MID_RECOVERY_DEFENSIVE = "Récupération repli défensif",
    MID_INTERCEPTION = "Interception milieu",
    MID_BALL_STEAL = "Vol de ballon (dribble adversaire)",
    MID_CONTROL_ORIENTED_SUCCESS = "Contrôle orienté réussi",
    MID_CONTROL_SIMPLE_SUCCESS = "Contrôle simple réussi",
    MID_CONTROL_FAIL = "Contrôle raté",
    MID_FIRST_TOUCH_SUCCESS = "Première touche réussie",
    MID_FIRST_TOUCH_FAIL = "Première touche ratée",
    MID_DRIBBLE_SHORT_SUCCESS = "Dribble court réussi",
    MID_DRIBBLE_LONG_SUCCESS = "Dribble long réussi",
    MID_DRIBBLE_FAIL = "Dribble milieu raté",
    MID_LAYOFF_SUCCESS = "Remise partenaire (déviation)",

    // Offensive Actions
    ATT_SHOT_STRONG_ON_TARGET = "Tir pied fort cadré",
    ATT_SHOT_WEAK_ON_TARGET = "Tir pied faible cadré",
    ATT_SHOT_LONG_ON_TARGET = "Tir de loin cadré",
    ATT_SHOT_ANGLE_ON_TARGET = "Tir en angle difficile cadré",
    ATT_SHOT_CLOSE_ON_TARGET = "Tir à bout portant cadré",
    ATT_SHOT_OFF_TARGET = "Tir non cadré",
    ATT_SHOT_BLOCKED = "Tir bloqué",
    ATT_SHOT_DEFLECTED_CORNER = "Tir dévié en corner",
    ATT_SHOT_POST = "Tir sur le poteau/barre",
    ATT_HEADER_DIVE_ON_TARGET = "Tête cadrée plongeante",
    ATT_HEADER_STAND_ON_TARGET = "Tête cadrée debout",
    ATT_HEADER_OFF_TARGET = "Tête non cadrée",
    ATT_HEADER_DEFLECTED = "Tête déviée",
    ATT_HEADER_PASS = "Tête passée/remise",
    ATT_DRIBBLE_BOX_SUCCESS = "Dribble réussi dans surface",
    ATT_DRIBBLE_WING_SUCCESS = "Dribble réussi couloir",
    ATT_DRIBBLE_FAIL = "Dribble offensif raté",
    ATT_CONTROL_BACK_TO_GOAL_SUCCESS = "Contrôle dos au but réussi",
    ATT_CONTROL_BACK_TO_GOAL_FAIL = "Contrôle dos au but raté",
    ATT_CALL_SPACE_SUCCESS = "Appel dans l'espace réussi",
    ATT_CALL_SPACE_FAIL = "Appel dans l'espace manqué",
    ATT_RUN_OFF_BALL = "Course d'appel (sans ballon)",
    ATT_LAYOFF_TO_MIDFIELD = "Remise attaquant vers milieu",
    ATT_DEFLECTION_GOAL_ASSIST = "Déviation but/passe décisive",
    ATT_PROVOKE_FOUL = "Provocation faute",
    ATT_SIMULATION = "Simulation (faute non accordée)",

    // Game Events
    EVENT_CORNER_INSWING_SUCCESS = "Corner rentrant réussi",
    EVENT_CORNER_OUTSWING_SUCCESS = "Corner sortant réussi",
    EVENT_CORNER_SHORT_SUCCESS = "Corner court réussi",
    EVENT_CORNER_FAIL = "Corner raté",
    EVENT_FREEKICK_DIRECT_ON_TARGET = "Coup franc direct cadré",
    EVENT_FREEKICK_DIRECT_OFF_TARGET = "Coup franc direct non cadré",
    EVENT_FREEKICK_INDIRECT_SUCCESS = "Coup franc indirect réussi",
    EVENT_FREEKICK_INDIRECT_FAIL = "Coup franc indirect raté",
    EVENT_PENALTY_SCORED = "Penalty transformé",
    EVENT_PENALTY_MISSED = "Penalty raté",
    EVENT_THROWIN_SHORT = "Remise en jeu courte",
    EVENT_THROWIN_LONG = "Remise en jeu longue",
    EVENT_GOAL_KICK = "Sortie de but",
    EVENT_FOUL_SIMPLE = "Faute simple",
    EVENT_FOUL_YELLOW_CARD = "Faute (carton jaune)",
    EVENT_FOUL_UNSPORTING_YELLOW = "Faute antisportive (jaune)",
    EVENT_FOUL_RED_CARD = "Faute dangereuse (rouge)",
    EVENT_FOUL_SECOND_YELLOW = "Second carton jaune",
    EVENT_FOUL_DIRECT_RED = "Carton rouge direct",
    EVENT_PROTEST_PLAYER_CARD = "Protestation joueur (carton)",
    EVENT_PROTEST_STAFF = "Protestation staff technique",
    EVENT_SIMULATION_CARD = "Simulation sanctionnée",
    EVENT_HANDBALL = "Main volontaire",
    EVENT_OFFSIDE_ACTIVE = "Hors-jeu actif",
    EVENT_OFFSIDE_PASSIVE = "Hors-jeu passif",
    EVENT_GOAL_VALID = "But valide",
    EVENT_GOAL_DISALLOWED = "But refusé",
    EVENT_OWN_GOAL = "But contre son camp",
    EVENT_INJURY_STOPPAGE = "Arrêt de jeu (Blessure)",
    EVENT_SUBSTITUTION = "Remplacement",
    EVENT_VAR_INTERVENTION = "Intervention VAR",
    EVENT_TRANSITION_COUNTER_FAST = "Contre-attaque rapide",
    EVENT_TRANSITION_COUNTER_SLOW = "Contre-attaque élaborée",
    EVENT_TRANSITION_BUILDUP_SLOW = "Construction lente",
    EVENT_PRESSING_HIGH_COLLECTIVE = "Pressing collectif haut",
    EVENT_PRESSING_INDIVIDUAL = "Pressing individuel",
    EVENT_DEFENSIVE_RECOVERY_ORGANIZED = "Repli défensif organisé",
    EVENT_DEFENSIVE_RECOVERY_URGENT = "Repli défensif en urgence",
}