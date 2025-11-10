import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

interface CommandInputProps {
  onRecordEvent: (
    eventTypeKey: string,
    playerId?: number,
    teamId?: 'home' | 'away',
    details?: Record<string, any>
  ) => Promise<void>;
  transcript?: string;
}

type Feedback = { status: 'info' | 'success' | 'error'; message: string };

export function CommandInput({ onRecordEvent, transcript }: CommandInputProps) {
  const [commandText, setCommandText] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleParseAndRecord = useCallback(async (text: string) => {
    if (!text.trim()) {
      setFeedback({ status: 'info', message: 'Please enter a command.' });
      return;
    }

    setIsParsing(true);
    setFeedback({ status: 'info', message: `Parsing command: "${text}"...` });

    try {
      const { data: parsedCommand, error: functionError } = await supabase.functions.invoke(
        'V2_parse-voice-command',
        {
          body: {
            transcript: text,
          },
        }
      );

      if (functionError) {
        throw new Error(`Supabase function error: ${functionError.message}`);
      }

      if (!parsedCommand.event) {
        setFeedback({ status: 'error', message: 'Could not parse the event from the command.' });
        setIsParsing(false);
        return;
      }

      await onRecordEvent(
        parsedCommand.event,
        parsedCommand.player,
        parsedCommand.team,
        {
          recorded_via: 'command_input',
          transcript: text,
          parsed_data: parsedCommand,
        }
      );

      setFeedback({ status: 'success', message: `Successfully recorded: ${parsedCommand.event}` });
      setCommandText('');
    } catch (error: any) {
      setFeedback({ status: 'error', message: `Failed to process command: ${error.message}` });
    } finally {
      setIsParsing(false);
    }
  }, [onRecordEvent]);

  useEffect(() => {
    if (transcript) {
      setCommandText(transcript);
      handleParseAndRecord(transcript);
    }
  }, [transcript, handleParseAndRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleParseAndRecord(commandText);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Command Input</CardTitle>
        <CardDescription>Enter a command to record a match event.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            type="text"
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            placeholder="e.g., 'P10 PASS to P7'"
            disabled={isParsing}
          />
          <Button type="submit" disabled={isParsing}>
            {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record'}
          </Button>
        </form>
        {feedback && (
          <div className={`flex items-start space-x-3 p-3 rounded-lg border ${
            feedback.status === 'error' ? 'bg-red-50 text-red-900 border-red-200' :
            feedback.status === 'success' ? 'bg-green-50 text-green-900 border-green-200' :
            'bg-blue-50 text-blue-900 border-blue-200'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {feedback.status === 'error' && <AlertCircle className="w-5 h-5" />}
              {feedback.status === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {feedback.status === 'info' && <Info className="w-5 h-5" />}
            </div>
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
