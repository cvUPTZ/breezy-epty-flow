import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Target, AlertTriangle, Users, Timer, TrendingUp, Video, X, Maximize2, Minimize2 } from 'lucide-react';
import { Player } from '@/hooks/useFourTrackerSystem';
import { YouTubePlayer } from '@/components/video/YouTubePlayer';

// Enhanced position mapping with tactical formations
const getPositionCoordinates = (position: string, index: number, totalPlayers: number, isHome: boolean) => {
  const baseY = isHome ? 15 : 85;
  const direction = isHome ? 1 : -1;

  const pos = position?.toUpperCase().trim() || '';

  // Goalkeeper
  if (pos.includes('GK') || pos.includes('GOALKEEPER') || pos.includes('GOAL')) {
    return { left: 50, top: baseY };
  }

  // Defenders (4 positions spread across width)
  if (pos.includes('CB') || pos.includes('LB') || pos.includes('RB') ||
      pos.includes('DC') || pos.includes('DL') || pos.includes('DR') ||
      pos.includes('DEF') || pos.includes('BACK')) {
    const defenderPositions = [20, 37, 63, 80];
    const defIndex = index % 4;
    return {
      left: defenderPositions[defIndex],
      top: baseY + (direction * 12)
    };
  }

  // Midfielders (spread across width with varied depth)
  if (pos.includes('CM') || pos.includes('DM') || pos.includes('AM') ||
      pos.includes('LM') || pos.includes('RM') || pos.includes('MID')) {
    const midPositions = [15, 32, 50, 68, 85];
    const midIndex = index % 5;
    const depthVariation = pos.includes('DM') ? -5 : pos.includes('AM') ? 5 : 0;
    return {
      left: midPositions[midIndex],
      top: baseY + (direction * (30 + depthVariation))
    };
  }

  // Forwards (3 attacking positions)
  if (pos.includes('ST') || pos.includes('CF') || pos.includes('LW') ||
      pos.includes('RW') || pos.includes('FW') || pos.includes('FORWARD') ||
      pos.includes('ATTACK') || pos.includes('STRIKER') || pos.includes('WING')) {
    const fwdPositions = [25, 50, 75];
    const fwdIndex = index % 3;
    return {
      left: fwdPositions[fwdIndex],
      top: baseY + (direction * 45)
    };
  }

  // Default grid positioning
  const gridPositions = [20, 35, 50, 65, 80];
  return {
    left: gridPositions[index % 5],
    top: baseY + (direction * 25)
  };
};

interface BallTrackerInterfaceProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  homeTeamName?: string;
  awayTeamName?: string;
  currentBallHolder: Player | null;
  isOnline?: boolean;
  onSelectPlayer: (player: Player) => void;
  videoUrl?: string;
}

const BallTrackerInterface: React.FC<BallTrackerInterfaceProps> = ({
  homeTeamPlayers = [],
  awayTeamPlayers = [],
  homeTeamName = 'Home',
  awayTeamName = 'Away',
  currentBallHolder = null,
  isOnline = true,
  onSelectPlayer = () => {},
  videoUrl
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<number | null>(null);
  const [activeTeam, setActiveTeam] = useState('home'); // 'home' or 'away'
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  const allPlayers = useMemo(() =>
    [...homeTeamPlayers, ...awayTeamPlayers],
    [homeTeamPlayers, awayTeamPlayers]
  );

  const hasPlayers = useMemo(() =>
    homeTeamPlayers.length > 0 || awayTeamPlayers.length > 0,
    [homeTeamPlayers, awayTeamPlayers]
  );

  const isValidBallHolder = useMemo(() =>
    currentBallHolder ? allPlayers.some(p => p.id === currentBallHolder.id) : false,
    [currentBallHolder, allPlayers]
  );

  const stats = useMemo(() => ({
    totalPlayers: allPlayers.length,
    homePlayers: homeTeamPlayers.length,
    awayPlayers: awayTeamPlayers.length,
    possessionTeam: currentBallHolder?.team || 'none'
  }), [allPlayers, homeTeamPlayers, awayTeamPlayers, currentBallHolder]);

  const displayedPlayers = useMemo(() =>
    activeTeam === 'home' ? homeTeamPlayers : awayTeamPlayers,
    [activeTeam, homeTeamPlayers, awayTeamPlayers]
  );

  const displayedTeamName = activeTeam === 'home' ? homeTeamName : awayTeamName;

  const handleSelectPlayer = (player: Player) => {
    if (!isOnline) return;

    setSelectedPlayerId(player.id);
    onSelectPlayer(player);

    setTimeout(() => setSelectedPlayerId(null), 400);
  };

  if (!hasPlayers) {
    return (
      <Card className="border-amber-200">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="bg-amber-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
          </div>
          <p className="font-semibold text-xl mb-2">No Players Available</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Please ensure match teams are configured with players before using the ball tracker interface.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Extract video ID from URL
  const videoId = useMemo(() => {
    if (!videoUrl) return null;
    try {
      const url = new URL(videoUrl);
      if (url.hostname.includes('youtube.com')) {
        return url.searchParams.get('v');
      } else if (url.hostname.includes('youtu.be')) {
        return url.pathname.slice(1);
      }
    } catch {
      return null;
    }
    return null;
  }, [videoUrl]);

  return (
    <div className="relative space-y-4">
      {/* Video Player Overlay */}
      {videoUrl && videoId && showVideo && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isVideoExpanded
              ? 'inset-4'
              : 'bottom-4 right-4 w-96 h-64'
          }`}
          style={{
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <div className="relative w-full h-full bg-black">
            <YouTubePlayer
              videoId={videoId}
              matchId=""
              isAdmin={false}
            />

            {/* Video Controls Overlay */}
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-black/70 hover:bg-black/90 text-white"
                onClick={() => setIsVideoExpanded(!isVideoExpanded)}
              >
                {isVideoExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-black/70 hover:bg-black/90 text-white"
                onClick={() => setShowVideo(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900">Offline Mode Active</p>
                <p className="text-sm text-red-700">Ball possession tracking is disabled until connection is restored</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Header with Stats */}
      <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-orange-100 rounded-lg p-2">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <span>Ball Tracker Interface</span>
            </div>
            <div className="flex items-center gap-2">
              {videoUrl && videoId && (
                <Button
                  variant={showVideo ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowVideo(!showVideo)}
                  className="flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  {showVideo ? 'Hide' : 'Show'} Video
                </Button>
              )}
              <Badge variant="outline" className="text-base px-3 py-1">
                {stats.totalPlayers} Players
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Home</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.homePlayers}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-red-600" />
                <span className="text-xs text-muted-foreground">Away</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.awayPlayers}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Status</span>
              </div>
              <p className="text-sm font-bold text-green-600">
                {isOnline ? 'Live' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Team Switcher */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTeam('home')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                activeTeam === 'home'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            >
              {homeTeamName}
            </button>
            <button
              onClick={() => setActiveTeam('away')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                activeTeam === 'away'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            >
              {awayTeamName}
            </button>
          </div>

          {/* Current Ball Holder */}
          {currentBallHolder && isValidBallHolder ? (
            <div className="p-4 bg-white rounded-lg border-2 border-green-500 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Current Possession</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold">
                      #{currentBallHolder.jersey_number} {currentBallHolder.player_name}
                    </span>
                    <Badge className={currentBallHolder.team === 'home' ? 'bg-blue-600' : 'bg-red-600'}>
                      {currentBallHolder.team === 'home' ? homeTeamName : awayTeamName}
                    </Badge>
                    {currentBallHolder.position && (
                      <Badge variant="outline" className="text-xs">
                        {currentBallHolder.position}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : currentBallHolder && !isValidBallHolder ? (
            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-400">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  Warning: Current ball holder not found in team rosters
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-muted-foreground">
                  Waiting for ball possession...
                </span>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Click on any player to indicate they have gained possession of the ball. The system will automatically track passes, interceptions, and dribbles.
          </p>
        </CardContent>
      </Card>

      {/* Enhanced Football Pitch */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="relative w-full aspect-[2/3] bg-gradient-to-b from-green-500 via-green-600 to-green-500 rounded-xl overflow-hidden shadow-2xl">
            {/* Enhanced pitch markings */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Grass pattern effect */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)'
                }}></div>
              </div>

              {/* Touchlines */}
              <div className="absolute inset-2 border-2 border-white/50 rounded-lg"></div>

              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-3 border-white/50 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/70 rounded-full"></div>

              {/* Center line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/50"></div>

              {/* Penalty areas - Home (bottom) */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-24 border-3 border-white/50 border-b-0 rounded-t-lg"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2/5 h-14 border-3 border-white/50 border-b-0 rounded-t-lg"></div>
              <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/70 rounded-full"></div>

              {/* Penalty areas - Away (top) */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3/4 h-24 border-3 border-white/50 border-t-0 rounded-b-lg"></div>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2/5 h-14 border-3 border-white/50 border-t-0 rounded-b-lg"></div>
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/70 rounded-full"></div>

              {/* Goals */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-white/80 rounded-t-lg shadow-lg"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-white/80 rounded-b-lg shadow-lg"></div>

              {/* Corner arcs */}
              <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-white/50 rounded-bl-full"></div>
              <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-white/50 rounded-br-full"></div>
              <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-white/50 rounded-tl-full"></div>
              <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-white/50 rounded-tr-full"></div>
            </div>

            {/* Team Labels */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
              <Badge className={`${activeTeam === 'home' ? 'bg-blue-600' : 'bg-red-600'} text-white shadow-lg text-base px-4 py-1.5`}>
                {displayedTeamName}
              </Badge>
            </div>

            {/* Players */}
            <div className="absolute inset-0">
              {displayedPlayers.map((player, index) => {
                const pos = getPositionCoordinates(player.position || '', index, displayedPlayers.length, activeTeam === 'home');
                const isActive = isValidBallHolder && currentBallHolder?.id === player.id;
                const isSelected = selectedPlayerId === player.id;
                const isHovered = hoveredPlayerId === player.id;
                const teamColor = activeTeam === 'home' ? 'blue' : 'red';

                return (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player)}
                    onMouseEnter={() => setHoveredPlayerId(player.id)}
                    onMouseLeave={() => setHoveredPlayerId(null)}
                    disabled={!isOnline}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                      isOnline ? 'hover:scale-150 cursor-pointer' : 'cursor-not-allowed opacity-60'
                    } ${isActive ? 'scale-150 z-30' : 'z-20'} ${isSelected ? 'scale-140' : ''}`}
                    style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                    title={`#${player.jersey_number} ${player.player_name} (${player.position || 'N/A'})`}
                  >
                    {/* Player circle */}
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-xl transition-all ${
                      isActive
                        ? 'bg-green-500 text-white ring-4 ring-green-300 animate-pulse shadow-green-500/50'
                        : isOnline
                          ? `bg-${teamColor}-600 text-white hover:bg-${teamColor}-500 ring-3 ring-white shadow-${teamColor}-500/30`
                          : `bg-${teamColor}-400 text-white ring-3 ring-white`
                    }`}>
                      {player.jersey_number}
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        </div>
                      )}
                    </div>

                    {/* Player name label */}
                    <div className={`absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-bold px-2 py-1 rounded pointer-events-none transition-all ${
                      isHovered || isActive
                        ? 'bg-white text-gray-900 shadow-lg scale-110'
                        : 'bg-black/80 text-white'
                    }`}>
                      {player.player_name.split(' ').pop()}
                    </div>

                    {/* Position badge */}
                    {player.position && (isHovered || isActive) && (
                      <div className={`absolute -top-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-semibold bg-${teamColor}-600 text-white px-2 py-0.5 rounded pointer-events-none`}>
                        {player.position}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Instructions */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-900">
            <Activity className="h-5 w-5" />
            How Ball Tracking Works
          </h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <p><strong>Click immediately</strong> when a player receives the ball to update possession</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <p><strong>Automatic detection</strong> of passes, interceptions, and tackles between clicks</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <p><strong>Dribbles are recorded</strong> only if possession lasts more than 2 seconds</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</div>
              <p><strong>Hover over players</strong> to see their names and positions clearly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BallTrackerInterface;
