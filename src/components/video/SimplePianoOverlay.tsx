
import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { EnhancedEventTypeIcon } from '../match/EnhancedEventTypeIcon';
import CancelActionIndicator from '../match/CancelActionIndicator';
import { EventType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecordedEvent {
  id: string;
  eventType: EventType;
  timestamp: number;
}

interface SimplePianoOverlayProps {
  onRecordEvent: (eventType: string) => Promise<any | null>;
  onClose: () => void;
  isRecording: boolean;
}

const SimplePianoOverlay: React.FC<SimplePianoOverlayProps> = ({
  onRecordEvent,
  onClose,
  isRecording,
}) => {
  const [recentEvents, setRecentEvents] = useState<RecordedEvent[]>([]);
  const [recordingState, setRecordingState] = useState(false);

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

  const handleEventRecord = useCallback(async (eventType: EventType) => {
    if (recordingState || isRecording) {
      console.log('Event recording already in progress, skipping...');
      return;
    }

    setRecordingState(true);
    const tempId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Create a temporary event for immediate UI feedback
      const tempEvent: RecordedEvent = {
        id: tempId,
        eventType,
        timestamp: Date.now()
      };
      
      setRecentEvents(prev => [tempEvent, ...prev.slice(0, 4)]); // Keep only 5 recent events
      
      toast.success(`Recording ${eventType} event...`);

      // Call the parent's event record function
      const newEvent = await onRecordEvent(eventType);
      
      if (newEvent) {
        // Update the temporary event with the real ID from the database
        setRecentEvents(prev => prev.map(e => e.id === tempId ? { ...e, id: newEvent.id } : e));
        
        toast.success(`${eventType} event recorded! You have 10 seconds to cancel.`);
      } else {
        // Remove the temporary event if recording failed
        setRecentEvents(prev => prev.filter(event => event.id !== tempId));
        throw new Error("Failed to get new event from server");
      }
      
    } catch (error) {
      console.error('Error recording event:', error);
      
      // Ensure temporary event is removed on error
      setRecentEvents(prev => prev.filter(event => event.id !== tempId));
      
      toast.error("Failed to record event. Please try again.");
    } finally {
      setRecordingState(false);
    }
  }, [onRecordEvent, recordingState, isRecording]);

  const handleCancelEvent = useCallback(async (eventId: string, eventType: EventType) => {
    try {
      setRecentEvents(prev => prev.filter(event => event.id !== eventId));
      
      // Use the specific event ID to delete
      const { error } = await supabase
        .from('match_events')
        .delete()
        .eq('id', eventId);
      
      if (error) {
        console.error('Error cancelling event in database:', error);
        // Don't show error to user as the UI update already happened
      }
      
      toast.success(`${eventType} event has been cancelled.`);
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast.error("Failed to cancel event");
    }
  }, []);

  const handleEventExpire = useCallback((eventId: string) => {
    setRecentEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  const renderEventButton = (eventType: EventType, isPrimary: boolean) => {
    const buttonSizeClasses = isPrimary
      ? "w-[80px] h-[80px] md:w-[90px] md:h-[90px]"
      : "w-[65px] h-[65px] md:w-[70px] md:h-[70px]";
    
    const iconSize = isPrimary ? "lg" : "md";
    const label = eventLabels[eventType] || eventType;

    return (
      <div key={eventType} className="flex flex-col items-center justify-start gap-2">
        <button
          onClick={() => handleEventRecord(eventType)}
          disabled={recordingState || isRecording}
          aria-label={`Record ${eventType} event`}
          className={`flex items-center justify-center rounded-full border bg-gradient-to-br from-white/70 to-slate-100/70 backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 ${buttonSizeClasses} ${isPrimary ? 'border-blue-200/80 hover:border-blue-400' : 'border-slate-200/80 hover:border-slate-400'} ${recordingState || isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        {/* Recent Events with Cancel Indicators */}
        {recentEvents.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Recent Events</h4>
            <div className="flex flex-wrap gap-3 justify-center">
              {recentEvents.map((event) => (
                <CancelActionIndicator
                  key={event.id}
                  eventType={event.eventType}
                  onCancel={() => handleCancelEvent(event.id, event.eventType)}
                  onExpire={() => handleEventExpire(event.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePianoOverlay;
