import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Simplified types for the MVP tracker
type MvpMatch = {
  id: string;
  home_team_name: string;
  away_team_name: string;
  status: string;
};

type MvpEvent = {
  id: string;
  created_at: string;
  event_type: string;
  details: {
    player_name?: string;
    team_name?: string;
  }
};

const MvpTracker = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const [match, setMatch] = useState<MvpMatch | null>(null);
  const [events, setEvents] = useState<MvpEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!matchId) {
        toast.error("No match ID provided.");
        navigate('/mvp/matches');
        return;
      }
      setLoading(true);
      try {
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('id, home_team_name, away_team_name, status')
          .eq('id', matchId)
          .eq('is_mvp_match', true)
          .single();

        if (matchError) throw matchError;
        setMatch(matchData);

        const { data: eventsData, error: eventsError } = await supabase
          .from('mvp_match_events')
          .select('*')
          .eq('match_id', matchId)
          .order('created_at', { ascending: false });

        if (eventsError) throw eventsError;
        setEvents(eventsData);

      } catch (error: any) {
        console.error("Error fetching MVP data:", error);
        toast.error("Failed to load MVP match data.", { description: error.message });
        navigate('/mvp/matches');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [matchId, navigate]);

  useEffect(() => {
    if (!matchId) return;
    const channel = supabase
      .channel(`mvp_match_events:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mvp_match_events', filter: `match_id=eq.${matchId}` },
        (payload) => {
          setEvents((prevEvents) => [payload.new as MvpEvent, ...prevEvents]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleAddEvent = async (eventType: string) => {
    if (!matchId || !user) return;
    try {
        const { error } = await supabase.from('mvp_match_events').insert({
            match_id: matchId,
            event_type: eventType,
            details: { info: `Event recorded at ${formatTime(timer)}` }
        });
        if (error) throw error;
        toast.success(`${eventType} event recorded`);
    } catch (error: any) {
        console.error("Error adding event:", error);
        toast.error("Failed to add event.", { description: error.message });
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  if (!match) return <div className="text-center py-10">MVP Match not found.</div>;

  const isTracker = userRole === 'admin' || userRole === 'tracker';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/mvp/matches')}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-2xl font-bold">{match.home_team_name} vs {match.away_team_name}</h1>
            <p className="text-muted-foreground">MVP Live Match Tracker</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Record Event</CardTitle>
                        <div className="flex items-center gap-4 bg-secondary text-secondary-foreground font-mono text-xl p-2 rounded-md">
                            <span>{formatTime(timer)}</span>
                            {isTracker && (
                                <>
                                    <Button size="sm" variant="ghost" onClick={() => setIsTimerRunning(!isTimerRunning)}>{isTimerRunning ? 'Pause' : 'Start'}</Button>
                                    <Button size="sm" variant="ghost" onClick={() => { setIsTimerRunning(false); setTimer(0); }}>Reset</Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                {isTracker ? (
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Button onClick={() => handleAddEvent('Pass')}>Pass</Button>
                        <Button onClick={() => handleAddEvent('Shot')}>Shot</Button>
                        <Button onClick={() => handleAddEvent('Goal')}>Goal</Button>
                        <Button onClick={() => handleAddEvent('Foul')}>Foul</Button>
                        <Button onClick={() => handleAddEvent('Card')}>Card</Button>
                        <Button onClick={() => handleAddEvent('Substitution')}>Substitution</Button>
                    </CardContent>
                ) : (
                    <CardContent><p className="text-center text-muted-foreground">You do not have permission to record events.</p></CardContent>
                )}
            </Card>
        </div>

        <div className="lg:col-span-1">
            <Card>
                <CardHeader><CardTitle>MVP Match Timeline</CardTitle></CardHeader>
                <CardContent>
                    {events.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No events recorded yet.</p>
                    ) : (
                        <ul className="space-y-3 h-[500px] overflow-y-auto">
                            {events.map(event => (
                                <li key={event.id} className="text-sm p-2 bg-secondary rounded-md">
                                    <span className="font-semibold">{event.event_type}</span>
                                    <span className="text-xs text-muted-foreground ml-2">{new Date(event.created_at).toLocaleTimeString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default MvpTracker;
