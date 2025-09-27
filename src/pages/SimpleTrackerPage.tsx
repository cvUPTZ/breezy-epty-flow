import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { newTrackerService, Game, Team, GameEvent, ActionType, Outcome } from '@/services/newTrackerService';

const SimpleTrackerPage: React.FC = () => {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const homeTeam: Team = { id: 'team-home', name: 'Home Team' };
      const awayTeam: Team = { id: 'team-away', name: 'Away Team' };
      const newGame = await newTrackerService.startGame(homeTeam, awayTeam);
      setGame(newGame);
      toast.success(`Game started with ID: ${newGame.id}`);
    } catch (error: any) {
      toast.error(`Failed to start game: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRecordEvent = useCallback(async () => {
    if (!game) return;

    setIsLoading(true);
    try {
      const event: GameEvent = {
        action_type: ActionType.PASS_SHORT,
        team: game.home_team,
        outcome: Outcome.SUCCESS,
      };
      await newTrackerService.recordEvent(game.id, event);

      // Refresh game state
      const updatedGame = await newTrackerService.getGame(game.id);
      setGame(updatedGame);
      toast.info('Pass event recorded successfully.');
    } catch (error: any) {
      toast.error(`Failed to record event: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [game]);

  const handleEndGame = useCallback(async () => {
    if (!game) return;

    setIsLoading(true);
    try {
      const endedGame = await newTrackerService.endGame(game.id);
      setGame(endedGame);
      toast.warning(`Game ended: ${endedGame.id}`);
    } catch (error: any) {
      toast.error(`Failed to end game: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [game]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Python Tracker</h1>

      {!game || !game.is_active ? (
        <Card>
          <CardHeader>
            <CardTitle>Start a New Game</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleStartGame} disabled={isLoading}>
              {isLoading ? 'Starting...' : 'Start Game'}
            </Button>
            {game && !game.is_active && (
                <p className="text-red-500 mt-4">Game has ended. Start a new one.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Game In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Game ID:</strong> {game.id}</p>
              <p><strong>Home:</strong> {game.home_team.name}</p>
              <p><strong>Away:</strong> {game.away_team.name}</p>
              <div className="flex space-x-2 mt-4">
                <Button onClick={handleRecordEvent} disabled={isLoading}>
                  {isLoading ? 'Recording...' : 'Record Short Pass'}
                </Button>
                <Button variant="destructive" onClick={handleEndGame} disabled={isLoading}>
                    {isLoading ? 'Ending...' : 'End Game'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recorded Events ({game.events.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {game.events.length === 0 ? (
                <p>No events recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {game.events.map((event, index) => (
                    <li key={index} className="p-2 border rounded">
                      <p><strong>Action:</strong> {event.action_type}</p>
                      <p><strong>Team:</strong> {event.team.name}</p>
                      <p><strong>Outcome:</strong> {event.outcome}</p>
                      <p><strong>Time:</strong> {new Date(event.timestamp!).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimpleTrackerPage;