
import React, { useState } from 'react';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-16 left-4 right-4 backdrop-blur-sm rounded-lg p-4 text-white z-30"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Event Tracker
        </h3>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-lg font-bold transition-colors"
        >
          ×
        </button>
      </div>

      {/* Primary Events - Larger buttons */}
      <div className="mb-3">
        <div className="grid grid-cols-4 gap-2">
          {primaryEvents.map(event => {
            const isRecordingThis = recordingEventType === event.key;
            return (
              <button
                key={event.key}
                onClick={() => handleEventClick(event.key)}
                disabled={isRecording}
                className="flex flex-col items-center p-2 bg-black/30 hover:bg-black/50 rounded-lg transition-all duration-200 disabled:opacity-50 relative border border-white/30"
              >
                <div className="w-6 h-6 mb-1 relative">
                  <EventTypeSvg eventType={event.key} size="sm" />
                  {isRecordingThis && (
                    <motion.div
                      className="absolute inset-0 border border-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className="text-xs font-medium text-white">{event.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Events - Smaller buttons */}
      <div className="grid grid-cols-8 gap-1">
        {secondaryEvents.map(event => {
          const isRecordingThis = recordingEventType === event.key;
          return (
            <button
              key={event.key}
              onClick={() => handleEventClick(event.key)}
              disabled={isRecording}
              className="flex flex-col items-center p-1.5 bg-black/20 hover:bg-black/40 rounded transition-all duration-200 disabled:opacity-50 relative"
            >
              <div className="w-4 h-4 mb-0.5 relative">
                <EventTypeSvg eventType={event.key} size="xs" />
                {isRecordingThis && (
                  <motion.div
                    className="absolute inset-0 border border-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </div>
              <span className="text-xs text-white/80">{event.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-green-400 font-medium text-sm">
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            Recording event...
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SimplePianoOverlay;
