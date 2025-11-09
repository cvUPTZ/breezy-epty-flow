# Voice-Over Commentator Nomenclature System

## Overview
This document defines the standard nomenclature and communication protocol for the Voice-Over Commentator tracker in coordination with Ball Tracker and Player Trackers.

## Role Definition

### Voice-Over Commentator (التعليق الصوتي)
**Purpose:** Track players and actions through live voice commentary using standardized codes.

**Key Responsibilities:**
- Monitor all field events through live observation
- Use standardized nomenclature to record events
- Provide redundancy for missed events by other trackers
- Annotate events with contextual information

**Advantages:**
- Holistic view of the match
- Can catch events missed by specialized trackers
- Adds narrative context to events
- Serves as quality control layer

## Communication Protocol

### Player Identification Codes

**Format:** `P{jersey_number}-{team}`

**Examples:**
- `P10-HOME` - Player 10 from home team
- `P7-AWAY` - Player 7 from away team
- `P1-HOME` - Goalkeeper from home team

**Simplified Format (when team is clear from context):**
- `P10` - Player 10
- `P7` - Player 7

### Event Type Codes

| Code | Full Name | Arabic Keywords | Priority |
|------|-----------|-----------------|----------|
| `PASS` | Pass | تمريرة، باس، مرر | Immediate |
| `SHOT` | Shot | تسديدة، شوط، سدد | Immediate |
| `GOAL` | Goal | هدف، جول، غوال | Immediate |
| `FOUL` | Foul | خطأ، فاول، مخالفة | Immediate |
| `YC` | Yellow Card | بطاقة صفراء، إنذار | Immediate |
| `RC` | Red Card | بطاقة حمراء، طرد | Immediate |
| `CORNER` | Corner Kick | ركنية، كورنر | Normal |
| `FK` | Free Kick | ضربة حرة، فري كيك | Normal |
| `OFF` | Offside | تسلل، أوفسايد | Normal |
| `SAVE` | Goalkeeper Save | صد، تصدي، إنقاذ | Immediate |
| `TACKLE` | Tackle | مقاص، انتزاع | Normal |
| `INT` | Interception | قطع، اعتراض | Normal |
| `DRIB` | Dribble | مراوغة، تخطي | Normal |
| `CROSS` | Cross | عرضية، كروس | Normal |
| `HEAD` | Header | رأسية، ضربة رأس | Normal |

### Command Patterns

#### Pattern 1: Simple Action
**Format:** `{player} {event}`

**Examples:**
- `P10 PASS` - Player 10 makes a pass
- `P7 SHOT` - Player 7 takes a shot
- `P23 GOAL` - Player 23 scores a goal

**Arabic Examples:**
- `لاعب ١٠ تمريرة`
- `لاعب ٧ تسديدة`
- `لاعب ٢٣ هدف`

#### Pattern 2: Pass/Cross Action
**Format:** `{player} {event} to {player}`

**Examples:**
- `P10 PASS to P7` - Player 10 passes to Player 7
- `P23 CROSS to P9` - Player 23 crosses to Player 9

**Arabic Examples:**
- `لاعب ١٠ تمرير إلى لاعب ٧`
- `لاعب ٢٣ عرضية إلى لاعب ٩`

#### Pattern 3: Event by Player
**Format:** `{event} by {player}`

**Examples:**
- `GOAL by P10` - Goal scored by Player 10
- `SAVE by P1` - Save made by Player 1

**Arabic Examples:**
- `هدف من لاعب ١٠`
- `تصدي من حارس المرمى`

## Integration with Other Trackers

### Ball Tracker ↔ Voice-Over
- **Ball Tracker** broadcasts ball possession changes
- **Voice-Over** uses these updates to contextualize commentary
- **Voice-Over** can record events that Ball Tracker might miss

### Player Trackers ↔ Voice-Over
- **Player Trackers** focus on assigned players
- **Voice-Over** has full field visibility
- **Voice-Over** provides backup for untracked events
- Acts as quality assurance layer

### Event Priority System

**Immediate Priority:**
- GOAL, SHOT, PASS, FOUL, CARDS, SAVE
- Must be recorded within 3 seconds
- Triggers notifications to other trackers

**Normal Priority:**
- CORNER, FREEKICK, TACKLE, INTERCEPTION
- Can be recorded within 10 seconds
- Added to event queue

**Deferred Priority:**
- Contextual annotations
- Post-event commentary
- Can be added later

## Usage Workflow

### Voice-Over Interface Features

1. **Command Input Field**
   - Type or speak standardized commands
   - Real-time parsing with confidence scores
   - Auto-completion based on nomenclature

2. **Quick Action Buttons**
   - One-click event recording for common actions
   - Organized by team and player
   - Most frequent events (PASS, SHOT)

3. **Nomenclature Reference**
   - Always-accessible guide
   - Searchable code library
   - Arabic and English keywords

4. **Recent Commands**
   - Command history
   - Quick re-use of previous patterns
   - Edit and resubmit

### Best Practices

1. **Use Consistent Codes**
   - Always use official nomenclature
   - Maintain player number accuracy
   - Use correct event codes

2. **Prioritize Immediate Events**
   - Record goals, fouls, cards first
   - Let routine passes queue normally
   - Focus on game-changing moments

3. **Add Context When Needed**
   - Use target player for passes
   - Note special circumstances
   - Coordinate with other trackers

4. **Quality Over Speed**
   - Accuracy is more important than speed
   - Verify player numbers before submitting
   - Use preview to check parsed commands

## Technical Implementation

### Command Parsing
```typescript
parseVoiceCommand(command: string) → {
  playerId: number | null,
  eventType: string | null,
  targetPlayerId: number | null,
  confidence: number
}
```

### Event Recording
```typescript
onRecordEvent(
  playerId: number,
  eventType: string,
  details: {
    voice_over_command: string,
    confidence: number,
    source: 'voice_commentator',
    target_player_number?: number
  }
)
```

### Real-time Coordination
- Voice-Over events include `source: 'voice_commentator'` tag
- All events timestamped with millisecond precision
- Duplicate detection across tracker types
- Event merging when multiple trackers record same action

## Examples in Practice

### Scenario 1: Goal Sequence
```
Voice-Over: "P10 PASS to P7"
System: Records pass from Player 10 to Player 7

Voice-Over: "P7 SHOT"
System: Records shot by Player 7

Voice-Over: "GOAL by P7"
System: Records goal by Player 7, links to previous shot
```

### Scenario 2: Defensive Action
```
Voice-Over: "P4 TACKLE"
System: Records tackle by Player 4

Voice-Over: "P4 PASS to P8"
System: Records pass from Player 4 to Player 8, infers possession gained
```

### Scenario 3: Foul and Card
```
Voice-Over: "FOUL by P15"
System: Records foul by Player 15

Voice-Over: "YC P15"
System: Records yellow card for Player 15, links to foul
```

## Arabic Voice Commands

For Arabic-speaking commentators, the system recognizes keywords:

- **تمريرة / باس** → PASS
- **تسديدة / شوط** → SHOT  
- **هدف / جول** → GOAL
- **خطأ / فاول** → FOUL
- **بطاقة صفراء** → YC
- **بطاقة حمراء** → RC
- **ركنية / كورنر** → CORNER
- **ضربة حرة** → FK
- **تسلل** → OFF
- **صد / تصدي** → SAVE

## System Architecture

```
┌─────────────────┐
│  Ball Tracker   │ ──► Broadcasts possession changes
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Voice-Over Commentator     │ ──► Records all events
│  - Full field visibility    │      Uses nomenclature
│  - Standardized codes       │      Provides backup
│  - Quality assurance        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│ Player Trackers │ ──► Focus on assigned players
│  - Tracker 1    │      Detailed event recording
│  - Tracker 2    │
│  - Tracker 3    │
└─────────────────┘
```

## Benefits of This System

1. **Consistency:** Standardized codes across all trackers
2. **Redundancy:** Multiple trackers can catch the same event
3. **Flexibility:** Voice-Over adds narrative context
4. **Quality:** Built-in verification through multiple sources
5. **Speed:** Quick codes enable fast event recording
6. **Clarity:** Clear communication between all trackers
7. **Bilingual:** Supports Arabic and English
