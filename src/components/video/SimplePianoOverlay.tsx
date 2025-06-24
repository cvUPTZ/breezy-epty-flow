
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import EventTypeSvg from '@/components/match/EventTypeSvg';

interface SimplePianoOverlayProps {
  onRecordEvent: (eventType: string) => Promise<void>;
  onClose: () => void;
  isRecording: boolean;
}

const SimplePianoOverlay: React.FC<SimplePianoOverlayProps> = ({
  onRecordEvent,
  onClose,
  isRecording
}) => {
  const [recordingEventType, setRecordingEventType] = useState<string | null>(null);

  const primaryEvents = [
    { key: 'goal', label: 'Goal' },
    { key: 'shot', label: 'Shot' },
    { key: 'pass', label: 'Pass' },
    { key: 'tackle', label: 'Tackle' }
  ];

  const secondaryEvents = [
    { key: 'foul', label: 'Foul' },
    { key: 'corner', label: 'Corner' },
    { key: 'save', label: 'Save' },
    { key: 'assist', label: 'Assist' }
  ];

  const handleEventClick = async (eventType: string) => {
    if (isRecording) return;
    
    setRecordingEventType(eventType);
    try {
      await onRecordEvent(eventType);
    } finally {
      setRecordingEventType(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-lg p-4 max-w-md shadow-2xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Quick Event Tracker</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Primary Events */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Primary Events</h4>
          <div className="grid grid-cols-2 gap-2">
            {primaryEvents.map(event => {
              const isRecordingThis = recordingEventType === event.key;
              return (
                <button
                  key={event.key}
                  onClick={() => handleEventClick(event.key)}
                  disabled={isRecording}
                  className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 mb-1 relative">
                    <EventTypeSvg eventType={event.key} size="sm" />
                    {isRecordingThis && (
                      <motion.div
                        className="absolute inset-0 border-2 border-green-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium">{event.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Events */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Secondary Events</h4>
          <div className="grid grid-cols-4 gap-2">
            {secondaryEvents.map(event => {
              const isRecordingThis = recordingEventType === event.key;
              return (
                <button
                  key={event.key}
                  onClick={() => handleEventClick(event.key)}
                  disabled={isRecording}
                  className="flex flex-col items-center p-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-6 h-6 mb-1 relative">
                    <EventTypeSvg eventType={event.key} size="xs" />
                    {isRecordingThis && (
                      <motion.div
                        className="absolute inset-0 border-2 border-green-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <span className="text-xs">{event.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isRecording && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-green-600 font-medium">
              <motion.div
                className="w-2 h-2 bg-green-600 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              Recording...
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SimplePianoOverlay;
