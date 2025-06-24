
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
      className="absolute bottom-4 left-4 right-4 max-w-4xl mx-auto z-[9999]"
    >
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            Event Tracker
          </h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl font-bold transition-colors p-1"
          >
            ×
          </button>
        </div>

        {/* Primary Events - Grid layout */}
        <div className="mb-4">
          <p className="text-sm text-white/70 mb-2 font-medium">Primary Events</p>
          <div className="grid grid-cols-4 gap-3">
            {primaryEvents.map(event => {
              const isRecordingThis = recordingEventType === event.key;
              return (
                <button
                  key={event.key}
                  onClick={() => handleEventClick(event.key)}
                  disabled={isRecording}
                  className="flex flex-col items-center p-3 bg-white/5 hover:bg-white/15 rounded-xl transition-all duration-200 disabled:opacity-50 relative border border-white/20 group"
                >
                  <div className="w-8 h-8 mb-2 relative">
                    <EventTypeSvg eventType={event.key} size="md" />
                    {isRecordingThis && (
                      <motion.div
                        className="absolute inset-0 border-2 border-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-green-300 transition-colors">
                    {event.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Events - Compact layout */}
        <div className="mb-4">
          <p className="text-sm text-white/70 mb-2 font-medium">Secondary Events</p>
          <div className="grid grid-cols-4 gap-2">
            {secondaryEvents.map(event => {
              const isRecordingThis = recordingEventType === event.key;
              return (
                <button
                  key={event.key}
                  onClick={() => handleEventClick(event.key)}
                  disabled={isRecording}
                  className="flex flex-col items-center p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-50 relative group"
                >
                  <div className="w-5 h-5 mb-1 relative">
                    <EventTypeSvg eventType={event.key} size="sm" />
                    {isRecordingThis && (
                      <motion.div
                        className="absolute inset-0 border border-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-white/80 group-hover:text-white transition-colors">
                    {event.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="text-center py-2 bg-green-500/20 rounded-lg border border-green-500/30">
            <div className="inline-flex items-center gap-2 text-green-300 font-semibold text-sm">
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              Recording event...
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SimplePianoOverlay;
