import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Target } from 'lucide-react';
import { Player } from '@/hooks/useFourTrackerSystem';

interface BallTrackerInterfaceProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  homeTeamName: string;
  awayTeamName: string;
  currentBallHolder: Player | null;
  onSelectPlayer: (player: Player) => void;
}

const BallTrackerInterface: React.FC<BallTrackerInterfaceProps> = ({
  homeTeamPlayers,
  awayTeamPlayers,
  homeTeamName,
  awayTeamName,
  currentBallHolder,
  onSelectPlayer
}) => {
  const renderTeam = (players: Player[], teamName: string, team: 'home' | 'away') => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg">{teamName}</h3>
        <Badge variant={team === 'home' ? 'default' : 'secondary'}>
          {team === 'home' ? 'Home' : 'Away'}
        </Badge>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {players.map((player) => (
          <Button
            key={player.id}
            onClick={() => onSelectPlayer(player)}
            variant={currentBallHolder?.id === player.id ? 'default' : 'outline'}
            className={`h-16 flex flex-col items-center justify-center ${
              currentBallHolder?.id === player.id ? 'ring-2 ring-green-500 bg-green-600' : ''
            }`}
          >
            <span className="text-xs font-medium">{player.jersey_number}</span>
            <span className="text-xs truncate w-full text-center">
              {player.player_name.split(' ').pop()}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Ball Tracker Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Click the player who currently has the ball. This will activate the appropriate player tracker.
          </p>
          {currentBallHolder && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  Current: #{currentBallHolder.jersey_number} {currentBallHolder.player_name}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Grids */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {renderTeam(homeTeamPlayers, homeTeamName, 'home')}
          {renderTeam(awayTeamPlayers, awayTeamName, 'away')}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Ball Tracker Instructions:</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Click the player with the ball immediately when possession changes</li>
            <li>• The system will automatically infer passes, interceptions, and dribbles</li>
            <li>• The active player tracker will be notified to record specific events</li>
            <li>• Stay focused on ball movement only</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BallTrackerInterface;
