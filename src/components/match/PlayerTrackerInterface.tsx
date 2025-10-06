import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Clock, AlertTriangle, Trash2, CheckCircle, Loader2, Keyboard, Video, X, Maximize2, Minimize2 } from 'lucide-react';
import { Player, PendingEvent } from '@/hooks/useFourTrackerSystem';
import { YouTubePlayer } from '@/components/video/YouTubePlayer';

// Hook useKeyboardShortcuts
const useKeyboardShortcuts = (shortcutMap: Record<string, () => void>, isActive = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive) return;
      const callback = shortcutMap[event.code];
      if (callback) {
        event.preventDefault();
        callback();
      }
    },
    [shortcutMap, isActive]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

interface PlayerTrackerInterfaceProps {
  assignedPlayers: Player[];
  pendingEvents: PendingEvent[];
  assignedEventTypes: string[];
  isOnline?: boolean;
  onRecordEvent: (pendingEventId: string, eventType: string) => void;
  onClearEvent: (eventId: string) => void;
  onClearAll: () => void;
  onMarkAllAsPass: () => Promise<void>;
  videoUrl?: string;
}

const PlayerTrackerInterface: React.FC<PlayerTrackerInterfaceProps> = ({
  assignedPlayers,
  pendingEvents,
  assignedEventTypes,
  isOnline = true,
  onRecordEvent,
  onClearEvent,
  onClearAll,
  onMarkAllAsPass,
  videoUrl
}) => {
  const [processingEvents, setProcessingEvents] = useState(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  const shortcutKeys = useMemo(() => [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M'
  ], []);

  const handleRecordEvent = useCallback((pendingEventId: string, eventType: string) => {
    setProcessingEvents(prev => new Set(prev).add(pendingEventId));
    onRecordEvent(pendingEventId, eventType);
  }, [onRecordEvent]);

  const shortcutMap = useMemo(() => {
    if (pendingEvents.length === 0 || !isOnline) {
      return {};
    }
    const firstEvent = pendingEvents[0];
    const map: Record<string, () => void> = {};
    
    assignedEventTypes.slice(0, shortcutKeys.length).forEach((eventType: string, index: number) => {
      const key = shortcutKeys[index];
      map[`Key${key}`] = () => handleRecordEvent(firstEvent.id, eventType);
    });

    return map;
  }, [pendingEvents, assignedEventTypes, isOnline, handleRecordEvent, shortcutKeys]);

  useKeyboardShortcuts(shortcutMap, isOnline && pendingEvents.length > 0);

  const eventTypeDisplay = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'normal': return 'border-yellow-500 bg-yellow-50';
      case 'old': return 'border-gray-400 bg-gray-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge className="bg-red-600">URGENT</Badge>;
      case 'normal': return <Badge className="bg-yellow-600">NORMAL</Badge>;
      case 'old': return <Badge className="bg-gray-600">OLD</Badge>;
      default: return null;
    }
  };

  const handleMarkAllAsPass = async () => {
    setBatchProcessing(true);
    await onMarkAllAsPass();
    setBatchProcessing(false);
  };

  const isEventProcessing = (eventId: string) => processingEvents.has(eventId);

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

      {!isOnline && (
        <Card className="bg-red-50 border-red-300">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Offline Mode</p>
              <p className="text-sm text-red-700">Cannot record events until connection is restored</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Player Tracker Interface
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
              <Badge variant="outline" className="text-lg px-4 py-1">
                {pendingEvents.length} pending
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm font-medium">Your Assigned Players:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {assignedPlayers.map((player: Player) => {
                const hasPending = pendingEvents.some((e: PendingEvent) => e.player.id === player.id);
                return (
                  <Badge 
                    key={player.id}
                    variant={hasPending ? 'default' : 'outline'}
                    className={hasPending ? 'bg-blue-600 animate-pulse' : ''}
                  >
                    #{player.jersey_number} {player.player_name}
                    {hasPending && <span className="ml-1">●</span>}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                {pendingEvents.length === 0 ? "No pending events" :
                 pendingEvents.length === 1 ? "1 event pending" :
                 `${pendingEvents.length} events pending`}
              </span>
            </div>
            {pendingEvents.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsPass}
                  disabled={!isOnline || batchProcessing}
                  className="text-blue-600 hover:text-blue-700 border-blue-300"
                >
                  {batchProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark all as Pass
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearAll}
                  disabled={batchProcessing}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Event Queue (Click to record)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">No pending events. Waiting for your players to get the ball.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvents.map((event: PendingEvent) => {
                const isProcessing = isEventProcessing(event.id);
                
                return (
                  <div
                    key={event.id}
                    className={`border-2 rounded-lg p-4 transition-all ${getPriorityColor(event.priority)} ${
                      isProcessing ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-gray-700">
                          #{event.player.jersey_number}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {event.player.player_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getPriorityBadge(event.priority)}
                            <span className="text-sm text-gray-600">
                              {event.age_seconds}s ago
                            </span>
                            {isProcessing && (
                              <Badge className="bg-blue-600 animate-pulse">
                                Processing...
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onClearEvent(event.id)}
                        disabled={isProcessing}
                        className="text-gray-500 hover:text-red-600"
                        aria-label={`Clear event for ${event.player.player_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {assignedEventTypes.slice(0, 10).length > 0 && <div className="flex gap-2">
                        {assignedEventTypes.slice(0, 10).map((eventType: string, index: number) => {
                          const shortcutKey = shortcutKeys[index];
                          return (
                            <Button
                              key={eventType}
                              onClick={() => handleRecordEvent(event.id, eventType)}
                              disabled={!isOnline || isProcessing}
                              className={`flex-1 h-20 text-xs font-semibold transition-all relative ${
                                isProcessing
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : event.priority === 'urgent' 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : event.priority === 'normal'
                                      ? 'bg-yellow-600 hover:bg-yellow-700'
                                      : 'bg-gray-600 hover:bg-gray-700'
                              }`}
                              aria-label={`Record ${eventType} for ${event.player.player_name}`}
                            >
                              <div className="flex flex-col items-center justify-center">
                                <Badge 
                                  variant="secondary" 
                                  className="mb-1 px-2 py-0.5 text-xs font-mono bg-white/90 text-gray-900"
                                >
                                  {shortcutKey}
                                </Badge>
                                <span className="text-center leading-tight">{eventTypeDisplay(eventType)}</span>
                              </div>
                            </Button>
                          );
                        })}
                      </div>}
                      
                      {assignedEventTypes.slice(10, 19).length > 0 && <div className="flex gap-2">
                          {assignedEventTypes.slice(10, 19).map((eventType: string, index: number) => {
                            const shortcutKey = shortcutKeys[index + 10];
                            return (
                              <Button
                                key={eventType}
                                onClick={() => handleRecordEvent(event.id, eventType)}
                                disabled={!isOnline || isProcessing}
                                className={`flex-1 h-20 text-xs font-semibold transition-all relative ${
                                  isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : event.priority === 'urgent' 
                                      ? 'bg-red-600 hover:bg-red-700' 
                                      : event.priority === 'normal'
                                        ? 'bg-yellow-600 hover:bg-yellow-700'
                                        : 'bg-gray-600 hover:bg-gray-700'
                                }`}
                                aria-label={`Record ${eventType} for ${event.player.player_name}`}
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <Badge 
                                    variant="secondary" 
                                    className="mb-1 px-2 py-0.5 text-xs font-mono bg-white/90 text-gray-900"
                                  >
                                    {shortcutKey}
                                  </Badge>
                                  <span className="text-center leading-tight">{eventTypeDisplay(eventType)}</span>
                                </div>
                              </Button>
                            );
                          })}
                        </div>}
                      
                      {assignedEventTypes.slice(19, 26).length > 0 && <div className="flex gap-2">
                          {assignedEventTypes.slice(19, 26).map((eventType: string, index: number) => {
                            const shortcutKey = shortcutKeys[index + 19];
                            return (
                              <Button
                                key={eventType}
                                onClick={() => handleRecordEvent(event.id, eventType)}
                                disabled={!isOnline || isProcessing}
                                className={`flex-1 h-20 text-xs font-semibold transition-all relative ${
                                  isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : event.priority === 'urgent' 
                                      ? 'bg-red-600 hover:bg-red-700' 
                                      : event.priority === 'normal'
                                        ? 'bg-yellow-600 hover:bg-yellow-700'
                                        : 'bg-gray-600 hover:bg-gray-700'
                                }`}
                                aria-label={`Record ${eventType} for ${event.player.player_name}`}
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <Badge 
                                    variant="secondary" 
                                    className="mb-1 px-2 py-0.5 text-xs font-mono bg-white/90 text-gray-900"
                                  >
                                    {shortcutKey}
                                  </Badge>
                                  <span className="text-center leading-tight">{eventTypeDisplay(eventType)}</span>
                                </div>
                              </Button>
                            );
                          })}
                        </div>}
                    </div>

                    <div className="mt-2 text-xs text-gray-500 text-right">
                      Possession at: {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            How the Queue Works:
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>🔴 <strong>RED (Urgent):</strong> Events < 5s old - record immediately!</li>
            <li>🟡 <strong>YELLOW (Normal):</strong> Events 5-15s old - record as soon as possible.</li>
            <li>⚪ <strong>GRAY (Old):</strong> Events > 15s old - may auto-clear after 30s.</li>
            <li>• Events retain their original timestamp for accurate analysis.</li>
            <li>• You can record events in any order.</li>
            <li>• Multiple events may stack; process them systematically.</li>
            <li>• Use "Clear" to ignore events you couldn't observe correctly.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
           <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-900">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts Enabled
          </h4>
          <p className="text-sm text-blue-800">
            Use your keyboard to record events for the player at the top of the queue.
            The letters on the buttons correspond to the keyboard keys (QWERTY - 26 keys available).
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerTrackerInterface;