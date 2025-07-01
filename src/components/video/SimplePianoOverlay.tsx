import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EventTypeSvg from '@/components/match/EventTypeSvg';

interface SimplePianoOverlayProps {
  onRecordEvent: (eventType: string) => Promise<void>;
  onClose: () => void;
  isRecording: boolean;
  // New props
  gamepadConnected: boolean;
  lastTriggeredEvent: string | null;
}

const SimplePianoOverlay: React.FC<SimplePianoOverlayProps> = ({
  onRecordEvent,
  onClose,
  isRecording,
  gamepadConnected, // Receive the connected status
  lastTriggeredEvent // Receive the event triggered by the gamepad
}) => {
  const [recordingEventType, setRecordingEventType] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
    // If gamepad is connected and triggered an event, we don't want manual clicks to override
    if (isRecording || (gamepadConnected && lastTriggeredEvent === eventType)) return;
    
    setRecordingEventType(eventType);
    try {
      await onRecordEvent(eventType);
    } finally {
      setRecordingEventType(null);
    }
  };

  // Determine if a button should be highlighted based on manual click or gamepad trigger
  const getButtonHighlight = (eventType: string) => {
    return recordingEventType === eventType || (gamepadConnected && lastTriggeredEvent === eventType);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`${
        isFullscreen 
          ? 'fixed bottom-4 left-4 right-4' 
          : 'absolute bottom-4 left-4 right-4'
      } max-w-4xl mx-auto pointer-events-auto`}
      style={{ 
        zIndex: isFullscreen ? 2147483647 : 9999,
        position: isFullscreen ? 'fixed' : 'absolute'
      }}
    >
      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {/* Indicator for gamepad connection */}
            <div className={`w-3 h-3 rounded-full ${gamepadConnected ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
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
              const isHighlighted = getButtonHighlight(event.key);
              return (
                <button
                  key={event.key}
                  onClick={() => handleEventClick(event.key)}
                  // Disable manual click if gamepad is active for this event, or if recording is in progress
                  disabled={isRecording || (gamepadConnected && lastTriggeredEvent === event.key)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 relative border group ${
                    isHighlighted
                      ? 'bg-green-500/30 border-green-400'
                      : 'bg-white/5 hover:bg-white/15 border-white/20'
                  }`}
                >
                  <div className="w-8 h-8 mb-2 relative">
                    <EventTypeSvg eventType={event.key} size="md" />
                    {/* Visual feedback for manual recording */}
                    {recordingEventType === event.key && !gamepadConnected && (
                      <motion.div
                        className="absolute inset-0 border-2 border-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                    {/* Visual feedback for gamepad trigger */}
                    {gamepadConnected && lastTriggeredEvent === event.key && (
                       <motion.div
                         className="absolute inset-0 border-2 border-blue-400 rounded-full"
                         animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                         transition={{ duration: 0.8, repeat: Infinity }}
                       />
                    )}
                  </div>
                  <span className={`text-sm font-semibold transition-colors ${
                    isHighlighted ? 'text-green-300' : 'text-white group-hover:text-green-300'
                  }`}>
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
              const isHighlighted = getButtonHighlight(event.key);
              return (
                <button
                  key={event.key}
                  onClick={() => handleEventClick(event.key)}
                  disabled={isRecording || (gamepadConnected && lastTriggeredEvent === event.key)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 relative group ${
                    isHighlighted
                      ? 'bg-green-500/30 border border-green-400'
                      : 'bg-white/5 border border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="w-5 h-5 mb-1 relative">
                    <EventTypeSvg eventType={event.key} size="sm" />
                    {/* Visual feedback for manual recording */}
                    {recordingEventType === event.key && !gamepadConnected && (
                      <motion.div
                        className="absolute inset-0 border border-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                    {/* Visual feedback for gamepad trigger */}
                    {gamepadConnected && lastTriggeredEvent === event.key && (
                       <motion.div
                         className="absolute inset-0 border border-blue-400 rounded-full"
                         animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                         transition={{ duration: 0.8, repeat: Infinity }}
                       />
                    )}
                  </div>
                  <span className={`text-xs transition-colors ${
                    isHighlighted ? 'text-green-300' : 'text-white/80 group-hover:text-white'
                  }`}>
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