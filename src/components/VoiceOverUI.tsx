import React, { useState, useCallback } from 'react';
import { CommandInput } from './CommandInput';
import { Button } from './ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useWhisperJsSpeechRecognition } from '../hooks/useWhisperJsSpeechRecognition';

interface VoiceOverUIProps {
  onRecordEvent: (
    eventTypeKey: string,
    playerId?: number,
    teamId?: 'home' | 'away',
    details?: Record<string, any>
  ) => Promise<void>;
}

export function VoiceOverUI({ onRecordEvent }: VoiceOverUIProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleTranscriptCompleted = useCallback((newTranscript: string) => {
    setTranscript(newTranscript);
    setIsListening(false);
  }, []);

  const {
    isModelLoading,
    isProcessing,
    error,
    startListening,
    stopListening,
  } = useWhisperJsSpeechRecognition();

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setTranscript('');
      startListening(handleTranscriptCompleted);
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <CommandInput onRecordEvent={onRecordEvent} transcript={transcript} />
      <Button onClick={toggleListening} variant="outline" disabled={isModelLoading || isProcessing}>
        {isModelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </Button>
      {error && <p className="text-red-500">Error: {error}</p>}
    </div>
  );
}
