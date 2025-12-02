import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Square, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickPlayerStrip from '@/components/QuickPlayerStrip';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';
import { useFourTrackerSystem, Player } from '@/hooks/useFourTrackerSystem';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SpeedyGonzales: React.FC = () => {
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [playerTag, setPlayerTag] = useState<string | null>(null);
  const { matchId: routeMatchId } = useParams<{ matchId: string }>();
  const matchId = routeMatchId || '123e4567-e89b-12d3-a456-426614174000'; // Hardcoded for now
  const { user } = useAuth();
  const { toast } = useToast();

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    // Fetch all players for the match
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('home_team_players, away_team_players')
        .eq('id', matchId)
        .single();

      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      if (data) {
        const homePlayersData = Array.isArray(data.home_team_players) ? data.home_team_players : [];
        const awayPlayersData = Array.isArray(data.away_team_players) ? data.away_team_players : [];
        const homePlayers = homePlayersData.map((p: any) => ({ ...p, team: 'home' }));
        const awayPlayers = awayPlayersData.map((p: any) => ({ ...p, team: 'away' }));
        setAllPlayers([...homePlayers, ...awayPlayers]);
      }
    };

    fetchPlayers();
  }, [matchId]);

  const {
    recordEventForPending,
  } = useFourTrackerSystem({
    matchId: matchId,
    trackerId: user?.id!,
    trackerType: 'player',
    allPlayers,
    supabase: supabase,
    toast: toast,
  });

  useEffect(() => {
    if (transcript) {
      const spokenNumber = transcript.match(/\d+/);
      if (spokenNumber) {
        setPlayerTag(spokenNumber[0]);
        resetTranscript();
      }
    }
  }, [transcript, resetTranscript]);

  const handleRecordEvent = (eventType: string) => {
    setLastEvent(eventType);
    setPlayerTag(null);

    // Create a mock pending event to record against
    const mockPendingEvent = {
      id: `event-${user?.id}-${Date.now()}`,
      player: allPlayers[0], // Use the first player for now
      timestamp: Date.now(),
      age_seconds: 0,
      priority: 'urgent',
      tracker_id: user?.id!
    };

    recordEventForPending(mockPendingEvent.id, eventType);
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">Browser not supported</h1>
        <p>This browser does not support speech recognition.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-between p-4">
      <header className="w-full flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Speedy Gonzales</h1>
        <div className="flex items-center space-x-4">
          <AnimatePresence>
            {lastEvent && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                {lastEvent} recorded!
                {playerTag && ` for player #${playerTag}`}
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            onClick={toggleListening}
            variant={listening ? 'destructive' : 'secondary'}
            size="lg"
            className="rounded-full w-20 h-20"
          >
            {listening ? <MicOff size={40} /> : <Mic size={40} />}
          </Button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleRecordEvent('Pass')}
            className="w-48 h-48 bg-blue-500 hover:bg-blue-600 text-2xl font-bold"
          >
            Pass
          </Button>
          <Button
            onClick={() => handleRecordEvent('Shot')}
            className="w-48 h-48 bg-green-500 hover:bg-green-600 text-2xl font-bold"
          >
            Shot
          </Button>
          <Button
            onClick={() => handleRecordEvent('Lost Ball')}
            className="w-48 h-48 bg-yellow-500 hover:bg-yellow-600 text-2xl font-bold"
          >
            Lost Ball
          </Button>
          <Button
            onClick={() => handleRecordEvent('Foul')}
            className="w-48 h-48 bg-red-500 hover:bg-red-600 text-2xl font-bold"
          >
            Foul
          </Button>
        </div>
      </main>

      <footer className="w-full p-4">
        <QuickPlayerStrip />
      </footer>
    </div>
  );
};

export default SpeedyGonzales;
