import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Target, AlertTriangle, Video, X, Maximize2, Minimize2, Wifi, WifiOff, Layers } from 'lucide-react';
import { YouTubePlayer } from '@/components/video/YouTubePlayer';

// Player type definition
interface Player {
  id: number;
  player_name: string;
  jersey_number: number;
  position?: string;
  team: 'home' | 'away';
}

// Horizontal position mapping for professional layout
const getHorizontalPosition = (position: string, index: number, totalPlayers: number, isHome: boolean) => {
  const baseX = isHome ? 10 : 90;
  const direction = isHome ? 1 : -1;
  
  const pos = position?.toUpperCase().trim() || '';
  
  // Goalkeeper
  if (pos.includes('GK') || pos.includes('GOALKEEPER')) {
    return { left: baseX, top: 50 };
  }
  
  // Defenders (4-3-3 formation)
  if (pos.includes('CB') || pos.includes('LB') || pos.includes('RB') || pos.includes('DEF')) {
    const defPositions = [20, 40, 60, 80];
    return { 
      left: baseX + (direction * 15), 
      top: defPositions[index % 4] 
    };
  }
  
  // Midfielders
  if (pos.includes('CM') || pos.includes('DM') || pos.includes('AM') || pos.includes('MID')) {
    const midPositions = [25, 50, 75];
    const depthVariation = pos.includes('DM') ? -8 : pos.includes('AM') ? 8 : 0;
    return { 
      left: baseX + (direction * (35 + depthVariation)), 
      top: midPositions[index % 3]
    };
  }
  
  // Forwards
  if (pos.includes('ST') || pos.includes('CF') || pos.includes('FW') || pos.includes('WING')) {
    const fwdPositions = [30, 50, 70];
    return { 
      left: baseX + (direction * 50), 
      top: fwdPositions[index % 3]
    };
  }
  
  // Default positioning
  const gridY = [20, 35, 50, 65, 80];
  return { 
    left: baseX + (direction * 25), 
    top: gridY[index % 5]
  };
};

interface BallTrackerInterfaceProps {
  homeTeamPlayers?: Player[];
  awayTeamPlayers?: Player[];
  homeTeamName?: string;
  awayTeamName?: string;
  currentBallHolder?: Player | null;
  isOnline?: boolean;
  onSelectPlayer?: (player: Player) => void;
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
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'tracking' | 'analysis'>('tracking');
  const [videoPosition, setVideoPosition] = useState({ x: 20, y: 100 });
  const [videoSize, setVideoSize] = useState({ width: 480, height: 270 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const [isTiming, setIsTiming] = useState(false);
  
  // NEW: Overlay mode state
  const [isOverlayMode, setIsOverlayMode] = useState(false);

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

  const handleSelectPlayer = (player: Player) => {
    if (!isOnline) return;
    
    // Use composite key to avoid conflicts between teams
    const playerKey = `${player.team}-${player.id}`;
    setSelectedPlayerId(playerKey);
    onSelectPlayer(player);
    
    setTimeout(() => setSelectedPlayerId(null), 300);
  };

  const handleToggleTimer = () => {
    if (isTiming) {
      // Stop the timer
      if (timerStartTime) {
        setElapsedTime(Date.now() - timerStartTime);
      }
      setIsTiming(false);
      setTimerStartTime(null);
    } else {
      // Start the timer
      setIsTiming(true);
      setTimerStartTime(Date.now());
      setElapsedTime(null);
    }
  };

  // Video dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.video-drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - videoPosition.x,
        y: e.clientY - videoPosition.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setVideoPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isResizing) {
      const newWidth = Math.max(320, e.clientX - videoPosition.x);
      const newHeight = Math.max(180, newWidth * (9/16));
      setVideoSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, videoPosition]);

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

  // NEW: Toggle overlay mode
  const handleToggleOverlayMode = () => {
    if (!isOverlayMode) {
      // Entering overlay mode
      setIsOverlayMode(true);
      setShowVideo(false); // Hide floating video
    } else {
      // Exiting overlay mode
      setIsOverlayMode(false);
    }
  };

  if (!hasPlayers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-amber-200">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="bg-amber-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <p className="font-semibold text-lg mb-2">No Players Available</p>
            <p className="text-sm text-gray-600">
              Configure match teams with players to start tracking.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Video Player Overlay - Draggable & Resizable (Only in normal mode) */}
      {videoUrl && videoId && showVideo && !isOverlayMode && (
        <div 
          className="fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden"
          style={{ 
            left: `${videoPosition.x}px`,
            top: `${videoPosition.y}px`,
            width: `${videoSize.width}px`,
            height: `${videoSize.height}px`,
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Drag Handle */}
          <div className="video-drag-handle absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/80 to-transparent z-10 cursor-grab active:cursor-grabbing flex items-center justify-between px-3">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Video className="h-4 w-4" />
              <span>Match Video</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white h-7 w-7 p-0 border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideo(false);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Video Content */}
          <div className="relative w-full h-full">
            <YouTubePlayer
              videoId={videoId}
              matchId=""
              isAdmin={false}
            />
          </div>

          {/* Resize Handle */}
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize group"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsResizing(true);
            }}
          >
            <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-white/50 group-hover:border-white transition-colors"></div>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Ball Tracker Pro</h1>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('tracking')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'tracking'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tracking
              </button>
              <button
                onClick={() => setViewMode('analysis')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'analysis'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analysis
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="text-sm font-medium">{isOnline ? 'Live' : 'Offline'}</span>
            </div>

            {/* NEW: Overlay Mode Toggle */}
            {videoUrl && videoId && (
              <Button
                variant={isOverlayMode ? "default" : "outline"}
                size="sm"
                onClick={handleToggleOverlayMode}
                className="gap-2"
              >
                <Layers className="h-4 w-4" />
                {isOverlayMode ? 'Exit' : 'Video'} Overlay
              </Button>
            )}

            {/* Video Toggle (Only show in normal mode) */}
            {videoUrl && videoId && !isOverlayMode && (
              <Button
                variant={showVideo ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowVideo(!showVideo);
                  if (!showVideo) {
                    setShowVideo(true);
                  }
                }}
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                {showVideo ? 'Hide' : 'Show'} Video
              </Button>
            )}

            {/* Player Count */}
            <Badge variant="outline" className="text-sm px-3 py-1">
              {stats.totalPlayers} Players
            </Badge>

            {elapsedTime && (
              <div className="text-sm font-semibold text-gray-700">
                Last: <span className="text-blue-600">{(elapsedTime / 1000).toFixed(2)}s</span>
              </div>
            )}
            <Button
              variant={isTiming ? "destructive" : "default"}
              size="sm"
              onClick={handleToggleTimer}
              className="gap-2"
            >
              {isTiming ? 'Stop Timer' : 'Start Timer'}
            </Button>
          </div>
        </div>

        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="bg-red-50 border-t border-red-200 px-6 py-2">
            <div className="flex items-center gap-2 text-sm text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>Tracking disabled - Connection required for ball possession updates</span>
            </div>
          </div>
        )}

        {/* Overlay Mode Info Banner */}
        {isOverlayMode && (
          <div className="bg-purple-50 border-t border-purple-200 px-6 py-2">
            <div className="flex items-center justify-between text-sm text-purple-800">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>Video Overlay Mode Active - Players positioned over match video</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleOverlayMode}
                className="text-purple-800 hover:text-purple-900 hover:bg-purple-100"
              >
                <X className="h-4 w-4 mr-1" />
                Exit Mode
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-6">
          {/* Left Sidebar - Team Stats (Hide in overlay mode) */}
          {!isOverlayMode && (
            <aside className="col-span-2 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Teams</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                      <span className="text-sm font-medium text-blue-900">{homeTeamName}</span>
                      <Badge variant="secondary" className="bg-blue-600 text-white">{stats.homePlayers}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                      <span className="text-sm font-medium text-red-900">{awayTeamName}</span>
                      <Badge variant="secondary" className="bg-red-600 text-white">{stats.awayPlayers}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Possession */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Possession</h3>
                  {currentBallHolder && isValidBallHolder ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                          {currentBallHolder.jersey_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {currentBallHolder.player_name}
                          </p>
                          <p className="text-xs text-gray-500">{currentBallHolder.position || 'N/A'}</p>
                        </div>
                      </div>
                      <Badge className={currentBallHolder.team === 'home' ? 'bg-blue-600 w-full justify-center' : 'bg-red-600 w-full justify-center'}>
                        {currentBallHolder.team === 'home' ? homeTeamName : awayTeamName}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Awaiting possession...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Guide */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold text-blue-900 uppercase mb-3">Quick Guide</h3>
                  <ul className="space-y-2 text-xs text-blue-800">
                    <li className="flex gap-2">
                      <span className="font-bold">→</span>
                      <span>Click player on possession</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">→</span>
                      <span>Hover for player info</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">→</span>
                      <span>Auto-tracks passes & tackles</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Center - Pitch (Full width in overlay mode) */}
          <div className={isOverlayMode ? "col-span-12" : "col-span-8"}>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="relative w-full aspect-[16/9] bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-lg overflow-hidden shadow-lg">
                  {/* NEW: Video Background in Overlay Mode */}
                  {isOverlayMode && videoUrl && videoId && (
                    <>
                      {/* Video as background - with pointer events enabled for controls */}
                      <div className="absolute inset-0 z-0">
                        <YouTubePlayer
                          videoId={videoId}
                          matchId=""
                          isAdmin={false}
                        />
                      </div>
                      
                      {/* Semi-transparent pitch overlay - blocks pointer events except for controls area */}
                      <div className="absolute inset-0 bg-green-600 opacity-30 z-10" style={{ pointerEvents: 'none' }} />
                    </>
                  )}

                  {/* Pitch markings */}
                  <div className={`absolute inset-0 ${isOverlayMode ? 'z-20 opacity-40' : ''}`} style={{ pointerEvents: 'none' }}>
                    {/* Subtle grass pattern (only in normal mode) */}
                    {!isOverlayMode && (
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(0,0,0,0.1) 30px, rgba(0,0,0,0.1) 60px)'
                        }}></div>
                      </div>
                    )}

                    {/* Border */}
                    <div className="absolute inset-3 border-2 border-white/40 rounded"></div>
                    
                    {/* Center line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40"></div>
                    
                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/40 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/60 rounded-full"></div>
                    
                    {/* Penalty areas - Home (left) */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-24 h-3/5 border-2 border-white/40 border-l-0 rounded-r"></div>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-16 h-2/5 border-2 border-white/40 border-l-0 rounded-r"></div>
                    <div className="absolute left-16 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                    
                    {/* Penalty areas - Away (right) */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-24 h-3/5 border-2 border-white/40 border-r-0 rounded-l"></div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-16 h-2/5 border-2 border-white/40 border-r-0 rounded-l"></div>
                    <div className="absolute right-16 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                    
                    {/* Goals */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-20 bg-white/70 rounded-r shadow-lg"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-20 bg-white/70 rounded-l shadow-lg"></div>
                  </div>

                  {/* Team labels */}
                  <div className={`absolute top-4 left-8 ${isOverlayMode ? 'z-40' : 'z-30'}`}>
                    <Badge className="bg-blue-600 text-white shadow-md">{homeTeamName}</Badge>
                  </div>
                  <div className={`absolute top-4 right-8 ${isOverlayMode ? 'z-40' : 'z-30'}`}>
                    <Badge className="bg-red-600 text-white shadow-md">{awayTeamName}</Badge>
                  </div>

                  {/* Players */}
                  <div className={`absolute inset-0 ${isOverlayMode ? 'z-30' : ''}`} style={{ pointerEvents: 'none' }}>
                    {allPlayers.map((player, index) => {
                      const isHome = player.team === 'home';
                      const teamPlayers = isHome ? homeTeamPlayers : awayTeamPlayers;
                      const teamIndex = teamPlayers.findIndex(p => p.id === player.id);
                      const pos = getHorizontalPosition(player.position || '', teamIndex, teamPlayers.length, isHome);
                      const playerKey = `${player.team}-${player.id}`;
                      const isActive = isValidBallHolder && currentBallHolder?.id === player.id;
                      const isSelected = selectedPlayerId === playerKey;
                      const isHovered = hoveredPlayerId === playerKey;
                      const teamColor = isHome ? 'blue' : 'red';
                      
                      return (
                        <button
                          key={`${player.team}-${player.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleSelectPlayer(player);
                          }}
                          onMouseEnter={() => setHoveredPlayerId(playerKey)}
                          onMouseLeave={() => setHoveredPlayerId(null)}
                          disabled={!isOnline}
                          style={{ 
                            left: `${pos.left}%`, 
                            top: `${pos.top}%`,
                            pointerEvents: 'auto'
                          }}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                            isOnline ? 'hover:scale-125 cursor-pointer' : 'cursor-not-allowed opacity-50'
                          } ${isActive ? 'scale-125 z-30' : 'z-20'} ${isSelected ? 'scale-110' : ''}`}
                        >
                          {/* Player circle */}
                          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all pointer-events-none ${
                            isActive 
                              ? 'bg-green-500 text-white ring-4 ring-green-300 animate-pulse' 
                              : isOnline
                                ? `bg-${teamColor}-600 text-white hover:bg-${teamColor}-500 ring-2 ring-white`
                                : `bg-${teamColor}-400 text-white ring-2 ring-white`
                          } ${isOverlayMode ? 'ring-4' : ''}`}>
                            {player.jersey_number}
                            {isActive && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full pointer-events-none">
                                <div className="w-full h-full bg-green-500 rounded-full animate-ping"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Tooltip on hover */}
                          {(isHovered || isActive) && (
                            <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white px-3 py-1.5 rounded shadow-lg text-xs font-medium pointer-events-none ${isOverlayMode ? 'z-50' : ''}`}>
                              <div className="text-center">
                                <div className="font-bold">#{player.jersey_number} {player.player_name}</div>
                                {player.position && <div className="text-gray-300 text-xs">{player.position}</div>}
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* NEW: Player Legend in Overlay Mode */}
                  {isOverlayMode && (
                    <div className="absolute bottom-4 left-4 z-40 bg-black bg-opacity-70 text-white p-3 rounded-lg">
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                          <span>{homeTeamName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                          <span>{awayTeamName}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Analytics (Hide in overlay mode) */}
          {!isOverlayMode && (
            <aside className="col-span-2 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Live Stats</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Possession</span>
                        <span className="text-xs font-semibold">50/50</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 w-1/2"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Passes</span>
                        <span className="text-xs font-semibold">0</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full"></div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Tackles</span>
                        <span className="text-xs font-semibold">0</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full"></div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Interceptions</span>
                        <span className="text-xs font-semibold">0</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold text-purple-900 uppercase mb-2">Pro Features</h3>
                  <ul className="space-y-1.5 text-xs text-purple-800">
                    <li>✓ Real-time tracking</li>
                    <li>✓ Auto event detection</li>
                    <li>✓ Formation analysis</li>
                    <li>✓ Heat maps (coming)</li>
                  </ul>
                </CardContent>
              </Card>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default BallTrackerInterface;
