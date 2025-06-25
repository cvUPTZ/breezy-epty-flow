import React from 'react';
import { X } from 'lucide-react';
import { EnhancedEventTypeIcon } from '../match/EnhancedEventTypeIcon';
import { EventType } from '@/types';

interface SimplePianoOverlayProps {
  onRecordEvent: (eventType: string) => Promise<void>;
  onClose: () => void;
  isRecording: boolean;
}

const SimplePianoOverlay: React.FC<SimplePianoOverlayProps> = ({
  onRecordEvent,
  onClose,
  isRecording,
}) => {
  const primaryEvents: EventType[] = ['goal', 'shot', 'pass', 'tackle'];
  const secondaryEvents: EventType[] = ['foul', 'assist', 'save', 'corner', 'freeKick'];

  // Improved label mapping for better display
  const eventLabels: Record<EventType, string> = {
    goal: 'Goal',
    shot: 'Shot',
    pass: 'Pass',
    tackle: 'Tackle',
    foul: 'Foul',
    assist: 'Assist',
    save: 'Save',
    corner: 'Corner',
    freeKick: 'Free Kick',
    yellowCard: 'Yellow',
    redCard: 'Red',
    substitution: 'Sub',
    card: 'Card',
    penalty: 'Penalty',
    'free-kick': 'Free Kick',
    'goal-kick': 'Goal Kick',
    'throw-in': 'Throw',
    interception: 'Intercept',
    possession: 'Possess',
    ballLost: 'Ball Lost',
    ballRecovered: 'Recover',
    dribble: 'Dribble',
    cross: 'Cross',
    clearance: 'Clear',
    block: 'Block',
    ownGoal: 'Own Goal',
    throwIn: 'Throw',
    goalKick: 'Goal Kick',
    aerialDuel: 'Aerial',
    groundDuel: 'Ground',
    sub: 'Sub',
    pressure: 'Press',
    dribble_attempt: 'Dribble',
    ball_recovery: 'Recover',
    supportPass: 'Support',
    offensivePass: 'Attack',
    contact: 'Contact',
    '6MeterViolation': '6m Foul',
    postHit: 'Post',
    aerialDuelWon: 'Air Win',
    aerialDuelLost: 'Air Loss',
    decisivePass: 'Key Pass',
    successfulCross: 'Cross+',
    successfulDribble: 'Dribble+',
    longPass: 'Long',
    forwardPass: 'Forward',
    backwardPass: 'Back',
    lateralPass: 'Lateral',
    offside: 'Offside'
  };

  const renderEventButton = (eventType: EventType, isPrimary: boolean) => {
    const buttonSizeClasses = isPrimary
      ? "w-[80px] h-[80px] md:w-[90px] md:h-[90px]"
      : "w-[65px] h-[65px] md:w-[70px] md:h-[70px]";
    
    const iconSize = isPrimary ? "lg" : "md";
    const label = eventLabels[eventType] || eventType;

    return (
      <div key={eventType} className="flex flex-col items-center justify-start gap-2">
        <button
          onClick={() => onRecordEvent(eventType)}
          disabled={isRecording}
          aria-label={`Record ${eventType} event`}
          className={`flex items-center justify-center rounded-full border bg-gradient-to-br from-white/70 to-slate-100/70 backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 ${buttonSizeClasses} ${isPrimary ? 'border-blue-200/80 hover:border-blue-400' : 'border-slate-200/80 hover:border-slate-400'} ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <EnhancedEventTypeIcon
            eventType={eventType}
            size={iconSize}
          />
        </button>
        <span className="font-semibold text-slate-700 text-center leading-tight text-xs sm:text-sm max-w-[90px] break-words">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div 
      className="absolute top-16 left-4 w-96 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden"
      style={{ zIndex: 50 }}
    >
      <div className="p-3 border-b border-white/10 bg-black/30 flex justify-between items-center">
        <h3 className="font-medium text-white text-sm">Event Tracker</h3>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Primary Events</h4>
          <div className="grid grid-cols-2 gap-4 justify-items-center">
            {primaryEvents.map(et => renderEventButton(et, true))}
          </div>
        </div>
        
        <div className="text-center">
          <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Secondary Events</h4>
          <div className="grid grid-cols-3 gap-3 justify-items-center">
            {secondaryEvents.map(et => renderEventButton(et, false))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePianoOverlay;
