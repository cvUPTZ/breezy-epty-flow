import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Target, AlertTriangle } from 'lucide-react';
import { Player } from '@/hooks/useFourTrackerSystem';

interface BallTrackerInterfaceProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  homeTeamName: string;
  awayTeamName: string;
  currentBallHolder: Player | null;
  isOnline?: boolean;
  onSelectPlayer: (player: Player) => void;
}

// Enhanced position mapping with better defaults
const getPositionCoordinates = (position: string, index: number, totalPlayers: number, isHome: boolean) => {
  const baseY = isHome ? 20 : 80;
  const direction = isHome ? 1 : -1;
  
  // Normalize position string
  const pos = position?.toUpperCase().trim() || '';
  
  // Goalkeeper patterns
  if (pos.includes('GK') || pos.includes('GOALKEEPER') || pos.includes('GOAL')) {
    return { left: 50, top: baseY };
  }
  
  // Defender patterns (including variations)
  if (pos.includes('CB') || pos.includes('LB') || pos.includes('RB') || 
      pos.includes('DC') || pos.includes('DL') || pos.includes('DR') || 
      pos.includes('DEF') || pos.includes('BACK') ||
      pos.includes('CENTRE BACK') || pos.includes('CENTER BACK') ||
      pos.includes('FULL BACK') || pos.includes('FULLBACK')) {
    const defenderIndex = index % 4;
    return { 
      left: 25 + (defenderIndex * 17), 
      top: baseY + (direction * 15) 
    };
  }
  
  // Midfielder patterns
  if (pos.includes('CM') || pos.includes('DM') || pos.includes('AM') || 
      pos.includes('LM') || pos.includes('RM') || pos.includes('MID') ||
      pos.includes('CENTRAL MID') || pos.includes('ATTACKING MID') ||
      pos.includes('DEFENSIVE MID')) {
    const midIndex = index % 4;
    return { 
      left: 20 + (midIndex * 20), 
      top: baseY + (direction * 35) 
    };
  }
  
  // Forward patterns
  if (pos.includes('ST') || pos.includes('CF') || pos.includes('LW') || 
      pos.includes('RW') || pos.includes('FW') || pos.includes('FORWARD') || 
      pos.includes('ATTACK') || pos.includes('STRIKER') || pos.includes('WING')) {
    const fwdIndex = index % 3;
    return { 
      left: 30 + (fwdIndex * 20), 
      top: baseY + (direction * 55) 
    };
  }
  
  // Default positioning in a line
  return { 
    left: 15 + ((index % 5) * 18), 
    top: baseY + (direction * 20) 
  };
};

const BallTrackerInterface: React.FC<BallTrackerInterfaceProps> = ({
  homeTeamPlayers,
  awayTeamPlayers,
  homeTeamName,
  awayTeamName,
  currentBallHolder,
  isOnline = true,
  onSelectPlayer
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  // Memoize computed values
  const allPlayers = useMemo(() => 
    [...(homeTeamPlayers || []), ...(awayTeamPlayers || [])],
    [homeTeamPlayers, awayTeamPlayers]
  );

  const hasPlayers = useMemo(() => 
    (homeTeamPlayers?.length > 0) || (awayTeamPlayers?.length > 0),
    [homeTeamPlayers, awayTeamPlayers]
  );

  const isValidBallHolder = useMemo(() => 
    currentBallHolder ? allPlayers.some(p => p.id === currentBallHolder.id) : false,
    [currentBallHolder, allPlayers]
  );

  const handleSelectPlayer = (player: Player) => {
    if (!isOnline) return;
    
    setSelectedPlayerId(player.id);
    onSelectPlayer(player);
    
    // Clear selection after animation
    setTimeout(() => setSelectedPlayerId(null), 300);
  };

  if (!hasPlayers) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <p className="font-medium text-lg mb-2">No Players Available</p>
          <p className="text-sm text-muted-foreground">
            Please ensure match teams are set up with players before using the ball tracker.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Offline Banner */}
      {!isOnline && (
        <Card className="bg-red-50 border-red-300">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Offline Mode</p>
              <p className="text-sm text-red-700">Cannot update ball possession until connection is restored</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Ball Tracker Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click the player who currently has the ball to activate the appropriate player tracker.
          </p>
          {currentBallHolder && isValidBallHolder && (
            <div className="mt-3 p-3 bg-background rounded-lg border border-green-500">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  Current: #{currentBallHolder.jersey_number} {currentBallHolder.player_name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {currentBallHolder.team === 'home' ? homeTeamName : awayTeamName}
                </Badge>
              </div>
            </div>
          )}
          {currentBallHolder && !isValidBallHolder && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-500">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  Warning: Current ball holder not found in teams
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Football Pitch with Players */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden shadow-inner">
            {/* Pitch markings */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/40 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/60 rounded-full"></div>
              
              {/* Center line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40"></div>
              
              {/* Penalty areas - Home (bottom) */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-20 border-2 border-white/40 border-b-0"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-12 border-2 border-white/40 border-b-0"></div>
              
              {/* Penalty areas - Away (top) */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2/3 h-20 border-2 border-white/40 border-t-0"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-12 border-2 border-white/40 border-t-0"></div>
              
              {/* Goals */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-white/60"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-white/60"></div>
            </div>

            {/* Home Team Players (bottom half) */}
            <div className="absolute inset-0">
              <Badge className="absolute top-2 left-2 bg-blue-600 text-white z-10">
                {homeTeamName}
              </Badge>
              {homeTeamPlayers.map((player, index) => {
                const pos = getPositionCoordinates(player.position || '', index, homeTeamPlayers.length, true);
                const isActive = isValidBallHolder && currentBallHolder?.id === player.id;
                const isSelected = selectedPlayerId === player.id;
                
                return (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player)}
                    disabled={!isOnline}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                      isOnline ? 'hover:scale-125 cursor-pointer' : 'cursor-not-allowed opacity-50'
                    } ${isActive ? 'scale-125 z-20' : 'z-10'} ${isSelected ? 'scale-110' : ''}`}
                    style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                    title={`#${player.jersey_number} ${player.player_name} (${player.position || 'N/A'})`}
                    aria-label={`Select player ${player.player_name}`}
                  >
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all ${
                      isActive 
                        ? 'bg-green-500 text-white ring-4 ring-green-300 animate-pulse' 
                        : isOnline
                          ? 'bg-blue-600 text-white hover:bg-blue-500 ring-2 ring-white'
                          : 'bg-blue-400 text-white ring-2 ring-white'
                    }`}>
                      {player.jersey_number}
                    </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-white bg-black/70 px-2 py-0.5 rounded pointer-events-none">
                      {player.player_name.split(' ').pop()}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Away Team Players (top half) */}
            <div className="absolute inset-0">
              <Badge className="absolute top-2 right-2 bg-red-600 text-white z-10">
                {awayTeamName}
              </Badge>
              {awayTeamPlayers.map((player, index) => {
                const pos = getPositionCoordinates(player.position || '', index, awayTeamPlayers.length, false);
                const isActive = isValidBallHolder && currentBallHolder?.id === player.id;
                const isSelected = selectedPlayerId === player.id;
                
                return (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player)}
                    disabled={!isOnline}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                      isOnline ? 'hover:scale-125 cursor-pointer' : 'cursor-not-allowed opacity-50'
                    } ${isActive ? 'scale-125 z-20' : 'z-10'} ${isSelected ? 'scale-110' : ''}`}
                    style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                    title={`#${player.jersey_number} ${player.player_name} (${player.position || 'N/A'})`}
                    aria-label={`Select player ${player.player_name}`}
                  >
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all ${
                      isActive 
                        ? 'bg-green-500 text-white ring-4 ring-green-300 animate-pulse' 
                        : isOnline
                          ? 'bg-red-600 text-white hover:bg-red-500 ring-2 ring-white'
                          : 'bg-red-400 text-white ring-2 ring-white'
                    }`}>
                      {player.jersey_number}
                    </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-white bg-black/70 px-2 py-0.5 rounded pointer-events-none">
                      {player.player_name.split(' ').pop()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Ball Tracker Instructions:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Click the player with the ball immediately when possession changes</li>
            <li>• The system will automatically infer passes, interceptions, and dribbles</li>
            <li>• The active player tracker will be notified to record specific events</li>
            <li>• Players are positioned according to their assigned positions</li>
            <li>• Dribbles are only recorded if possession lasts more than 2 seconds</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BallTrackerInterface;
