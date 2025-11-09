/**
 * TRACKER COMMUNICATION NOMENCLATURE SYSTEM
 * ==========================================
 * 
 * Standard protocol for communication between Ball Tracker, Player Trackers, and Voice-Over Commentator
 * This nomenclature ensures consistent event recording and real-time coordination
 */

export interface TrackerNomenclature {
  // Player identification codes
  playerCodes: {
    format: string; // "P{jersey_number}" or "P{jersey_number}-{team}"
    examples: string[];
  };
  
  // Event type codes
  eventCodes: Record<string, EventCode>;
  
  // Voice command patterns
  voicePatterns: VoicePattern[];
}

export interface EventCode {
  code: string;
  fullName: string;
  description: string;
  voiceKeywords: string[]; // Arabic keywords for voice recognition
  priority: 'immediate' | 'normal' | 'deferred';
}

export interface VoicePattern {
  pattern: string; // Regex or template
  eventType: string;
  examples: string[];
  arabicExamples: string[];
}

// Standard nomenclature definition
export const TRACKER_NOMENCLATURE: TrackerNomenclature = {
  playerCodes: {
    format: "P{jersey_number}-{team}",
    examples: [
      "P10-HOME", // Player 10 from home team
      "P7-AWAY",  // Player 7 from away team
      "P23-HOME"  // Player 23 from home team
    ]
  },
  
  eventCodes: {
    PASS: {
      code: "PASS",
      fullName: "Pass",
      description: "Player passes the ball to teammate",
      voiceKeywords: ["تمريرة", "باس", "مرر", "تمرير"],
      priority: "immediate"
    },
    SHOT: {
      code: "SHOT",
      fullName: "Shot",
      description: "Player shoots at goal",
      voiceKeywords: ["تسديدة", "شوط", "سدد", "تسديد"],
      priority: "immediate"
    },
    GOAL: {
      code: "GOAL",
      fullName: "Goal",
      description: "Player scores a goal",
      voiceKeywords: ["هدف", "جول", "غوال"],
      priority: "immediate"
    },
    FOUL: {
      code: "FOUL",
      fullName: "Foul",
      description: "Player commits a foul",
      voiceKeywords: ["خطأ", "فاول", "مخالفة"],
      priority: "immediate"
    },
    YELLOW_CARD: {
      code: "YC",
      fullName: "Yellow Card",
      description: "Player receives yellow card",
      voiceKeywords: ["بطاقة صفراء", "كارت أصفر", "إنذار"],
      priority: "immediate"
    },
    RED_CARD: {
      code: "RC",
      fullName: "Red Card",
      description: "Player receives red card",
      voiceKeywords: ["بطاقة حمراء", "كارت أحمر", "طرد"],
      priority: "immediate"
    },
    CORNER: {
      code: "CORNER",
      fullName: "Corner Kick",
      description: "Corner kick awarded",
      voiceKeywords: ["ركنية", "كورنر", "ضربة ركنية"],
      priority: "normal"
    },
    FREEKICK: {
      code: "FK",
      fullName: "Free Kick",
      description: "Free kick awarded",
      voiceKeywords: ["ضربة حرة", "فري كيك"],
      priority: "normal"
    },
    OFFSIDE: {
      code: "OFF",
      fullName: "Offside",
      description: "Offside called",
      voiceKeywords: ["تسلل", "أوفسايد"],
      priority: "normal"
    },
    SAVE: {
      code: "SAVE",
      fullName: "Goalkeeper Save",
      description: "Goalkeeper makes a save",
      voiceKeywords: ["صد", "تصدي", "إنقاذ"],
      priority: "immediate"
    },
    TACKLE: {
      code: "TACKLE",
      fullName: "Tackle",
      description: "Player makes a tackle",
      voiceKeywords: ["مقاص", "انتزاع", "استخلاص"],
      priority: "normal"
    },
    INTERCEPTION: {
      code: "INT",
      fullName: "Interception",
      description: "Player intercepts the ball",
      voiceKeywords: ["قطع", "اعتراض"],
      priority: "normal"
    },
    DRIBBLE: {
      code: "DRIB",
      fullName: "Dribble",
      description: "Player dribbles past opponent",
      voiceKeywords: ["مراوغة", "مراوغ", "تخطي"],
      priority: "normal"
    },
    CROSS: {
      code: "CROSS",
      fullName: "Cross",
      description: "Player crosses the ball",
      voiceKeywords: ["عرضية", "كروس"],
      priority: "normal"
    },
    HEADER: {
      code: "HEAD",
      fullName: "Header",
      description: "Player heads the ball",
      voiceKeywords: ["رأسية", "ضربة رأس"],
      priority: "normal"
    }
  },
  
  voicePatterns: [
    {
      pattern: "{player} {event}",
      eventType: "simple_action",
      examples: [
        "P10 PASS",
        "P7 SHOT",
        "P23 GOAL"
      ],
      arabicExamples: [
        "لاعب ١٠ تمريرة",
        "لاعب ٧ تسديدة",
        "لاعب ٢٣ هدف"
      ]
    },
    {
      pattern: "{player} {event} to {player}",
      eventType: "pass_action",
      examples: [
        "P10 PASS to P7",
        "P23 CROSS to P9"
      ],
      arabicExamples: [
        "لاعب ١٠ تمرير إلى لاعب ٧",
        "لاعب ٢٣ عرضية إلى لاعب ٩"
      ]
    },
    {
      pattern: "{event} by {player}",
      eventType: "event_by_player",
      examples: [
        "GOAL by P10",
        "SAVE by P1"
      ],
      arabicExamples: [
        "هدف من لاعب ١٠",
        "تصدي من حارس المرمى"
      ]
    }
  ]
};

/**
 * Parse voice-over command to extract player and event
 */
export const parseVoiceCommand = (command: string): {
  playerId: number | null;
  eventType: string | null;
  targetPlayerId: number | null;
  confidence: number;
} => {
  const upperCommand = command.toUpperCase().trim();
  
  // Try to extract player number (P10, P7, etc.)
  const playerMatch = upperCommand.match(/P(\d+)/);
  const playerId = playerMatch ? parseInt(playerMatch[1]) : null;
  
  // Try to extract target player (for passes)
  const targetMatch = upperCommand.match(/TO\s+P(\d+)/);
  const targetPlayerId = targetMatch ? parseInt(targetMatch[1]) : null;
  
  // Try to match event type
  let eventType: string | null = null;
  let maxConfidence = 0;
  
  for (const [code, eventData] of Object.entries(TRACKER_NOMENCLATURE.eventCodes)) {
    // Check if code appears in command
    if (upperCommand.includes(code)) {
      eventType = code.toLowerCase();
      maxConfidence = 0.9;
      break;
    }
    
    // Check Arabic keywords
    for (const keyword of eventData.voiceKeywords) {
      if (command.includes(keyword)) {
        eventType = code.toLowerCase();
        maxConfidence = 0.85;
        break;
      }
    }
    
    if (eventType) break;
  }
  
  return {
    playerId,
    eventType,
    targetPlayerId,
    confidence: (playerId && eventType) ? maxConfidence : 0.3
  };
};

/**
 * Format event for voice-over announcement
 */
export const formatEventForVoiceOver = (
  playerNumber: number,
  team: 'home' | 'away',
  eventType: string,
  targetPlayerNumber?: number
): string => {
  const playerCode = `P${playerNumber}-${team.toUpperCase()}`;
  const eventCode = eventType.toUpperCase();
  
  if (targetPlayerNumber) {
    return `${playerCode} ${eventCode} to P${targetPlayerNumber}`;
  }
  
  return `${playerCode} ${eventCode}`;
};

/**
 * Get event priority for queue management
 */
export const getEventPriority = (eventType: string): 'immediate' | 'normal' | 'deferred' => {
  const eventCode = Object.entries(TRACKER_NOMENCLATURE.eventCodes)
    .find(([_, data]) => data.code === eventType.toUpperCase());
  
  return eventCode ? eventCode[1].priority : 'normal';
};
