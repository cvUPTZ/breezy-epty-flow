# 4-Tracker Match Event System

## Overview

The 4-Tracker system is designed to enable efficient, real-time event tracking for football matches using 4 specialized trackers:
- **Tracker 4**: Ball Tracker (traffic controller)
- **Trackers 1-3**: Player Trackers (event annotators)

## Architecture

### Core Principles

1. **Ball Tracker Controls Context**
   - Tracker 4 always clicks the player who has the ball
   - This activates the appropriate player tracker's UI automatically
   - Drives the entire system flow

2. **Automatic Event Inference**
   - Same player twice → dribble/keep
   - Teammate → pass
   - Opponent → interception/turnover
   - Out of play/keeper → shot, save, goal, corner (depending on outcome)

3. **Balanced Player Distribution**
   - Players distributed across positions (not by lines)
   - Prevents tracker overload in high-activity zones
   - Ensures natural breaks for all trackers
   - Maintains fast reaction times

## Components

### 1. Ball Tracker Interface (`BallTrackerInterface.tsx`)
- Shows all players from both teams in a grid
- Click functionality to select player with ball
- Visual indication of current ball holder
- Broadcasts possession changes to all trackers

### 2. Player Tracker Interface (`PlayerTrackerInterface.tsx`)
- Shows assigned players
- Activates only when assigned player has the ball
- Provides event recording buttons
- Visual status indicator (active/waiting)

### 3. Four Tracker System Hook (`useFourTrackerSystem.ts`)
- Manages tracker assignments
- Handles ball possession broadcasting
- Implements event inference logic
- Coordinates between ball and player trackers

## Usage

### Setting Up Assignments

1. **Assign 3 Player Trackers**:
   ```typescript
   // Distribute players across positions
   Tracker 1: [Defender #2, Midfielder #7, Forward #11]
   Tracker 2: [Defender #5, Midfielder #8, Forward #9]
   Tracker 3: [Goalkeeper #1, Midfielder #6, Forward #10]
   ```

2. **Assign 1 Ball Tracker**:
   - Tracker 4 monitors all players
   - Clicks player with ball possession

### Integration Example

```typescript
import { useFourTrackerSystem } from '@/hooks/useFourTrackerSystem';
import BallTrackerInterface from '@/components/match/BallTrackerInterface';
import PlayerTrackerInterface from '@/components/match/PlayerTrackerInterface';

// In your match component
const {
  assignment,
  currentBallHolder,
  isActiveTracker,
  updateBallPossession,
  recordEvent
} = useFourTrackerSystem({
  matchId,
  trackerId,
  trackerType: 'ball' // or 'player'
});

// For ball tracker
<BallTrackerInterface
  homeTeamPlayers={homeTeam}
  awayTeamPlayers={awayTeam}
  currentBallHolder={currentBallHolder}
  onSelectPlayer={updateBallPossession}
/>

// For player tracker
<PlayerTrackerInterface
  assignedPlayers={assignment?.assigned_players || []}
  currentBallHolder={currentBallHolder}
  isActive={isActiveTracker}
  assignedEventTypes={['shot', 'foul', 'tackle']}
  onRecordEvent={recordEvent}
/>
```

## Event Flow

1. **Ball at Player 2** → Tracker 1's UI activates
   - Tracker 1 logs "Dribble"

2. **Ball goes to Player 9** → Tracker 2's UI activates
   - System infers *Pass 2 → 9*
   - Tracker 2 logs "Shot"

3. **Ball goes to Player 5 (opponent)** → Tracker 3's UI activates
   - System infers *Interception 9 → 5*

## Advantages

✅ **Speed** - Ball tracker just clicks, player trackers only see active player
✅ **Balance** - Distributed players prevent overload
✅ **Accuracy** - Automatic inference reduces errors
✅ **Scalability** - Server handles canonical events and stats
✅ **Fair Workload** - All trackers get natural breaks

## Database Schema

Events are stored in `match_events` table with:
- `player_id`: Player performing the action
- `event_type`: Type of event
- `team`: Team identifier
- `event_data`: JSON with inference details
- `created_by`: Tracker who recorded it

Inferred events include:
```json
{
  "inferred": true,
  "inference_type": "pass",
  "from_player_id": 2,
  "to_player_id": 9
}
```

## Real-time Communication

Uses Supabase Realtime channels:
- Channel: `ball-possession-{matchId}`
- Event: `ball_possession_change`
- Payload: `{ player_id, team, timestamp, tracker_id }`

## Best Practices

### For Ball Trackers
- Focus only on ball movement
- Click immediately on possession change
- Don't worry about event types
- Stay alert throughout the match

### For Player Trackers
- Watch only assigned players
- Wait for UI activation
- Record specific events quickly
- Rest when players are off the ball

### For Match Coordinators
- Distribute players strategically
- Mix positions per tracker
- Ensure clear communication
- Monitor tracker activity levels

## Troubleshooting

### Ball Tracker Issues
- **Problem**: Wrong player selected
- **Solution**: Click correct player immediately; system will auto-correct

### Player Tracker Issues
- **Problem**: UI not activating
- **Solution**: Check ball tracker selection and player assignments

### Event Inference Issues
- **Problem**: Incorrect event type inferred
- **Solution**: Manual correction in match events table

## Future Enhancements

- [ ] Automatic player position detection
- [ ] Machine learning for better inference
- [ ] Tracker performance analytics
- [ ] Load balancing algorithms
- [ ] Video integration for verification
