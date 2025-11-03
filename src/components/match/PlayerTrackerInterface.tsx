import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Clock, AlertTriangle, Trash2, CheckCircle, Loader2, Keyboard, Video, X, Layers, Upload } from 'lucide-react';
import { Player, PendingEvent } from '@/hooks/useFourTrackerSystem';
import { YouTubePlayer } from '@/components/video/YouTubePlayer';
import keyboardManager from './KeyboardManager';

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

// Composant Principal
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
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [videoPosition, setVideoPosition] = useState({ x: 20, y: 100 });
  const [videoSize, setVideoSize] = useState({ width: 480, height: 270 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const shortcutKeys = useMemo(() => [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M'
  ], []);

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
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
  }, [isDragging, isResizing, dragStart, videoPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleToggleOverlayMode = () => {
    if (!isOverlayMode) {
      setIsOverlayMode(true);
      setShowVideo(false);
    } else {
      setIsOverlayMode(false);
    }
  };

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
    <div className="relative space-y-6">
      {/* Video Player Overlay - Draggable & Resizable */}
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

      {/* Video Overlay Mode - Fixed Background */}
      {videoUrl && videoId && isOverlayMode && (
        <div className="fixed inset-0 z-40 bg-black">
          <div className="absolute inset-0">
            <YouTubePlayer
              videoId={videoId}
              matchId=""
              isAdmin={false}
            />
          </div>
          
          {/* Overlay Mode Info Banner */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-purple-900/90 backdrop-blur-sm px-6 py-3 border-b border-purple-700">
            <div className="flex items-center justify-between text-sm text-white">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5" />
                <span className="font-semibold">Video Overlay Mode Active</span>
                <span className="text-purple-200">- Events displayed over match video</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleOverlayMode}
                className="text-white hover:text-purple-100 hover:bg-purple-800"
              >
                <X className="h-4 w-4 mr-1" />
                Exit Overlay Mode
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bannière Hors Ligne */}
      {!isOnline && (
        <Card className="bg-red-50 border-red-300">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Mode Hors Ligne</p>
              <p className="text-sm text-red-700">Impossible d'enregistrer des événements tant que la connexion n'est pas rétablie</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carte d'état de l'en-tête */}
      <Card className={`bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 ${isOverlayMode ? 'fixed top-20 left-0 right-0 z-50 mx-4' : ''}`}>
        <CardHeader className="pb-4 pt-6">
          <CardTitle className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <span>Interface de Suivi des Joueurs</span>
              {/* Keyboard Icon Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                <Keyboard className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">
                  Raccourcis Actifs
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {videoUrl && videoId && (
                <>
                  <Button
                    variant={isOverlayMode ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleOverlayMode}
                    className="flex items-center gap-2"
                  >
                    <Layers className="h-4 w-4" />
                    {isOverlayMode ? 'Quitter' : 'Mode'} Overlay
                  </Button>
                  {!isOverlayMode && (
                    <Button
                      variant={showVideo ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowVideo(!showVideo)}
                      className="flex items-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      {showVideo ? 'Masquer' : 'Afficher'} Vidéo
                    </Button>
                  )}
                </>
              )}
              <Badge variant="outline" className="text-lg px-4 py-1">
                <Upload className="h-4 w-4 mr-1 inline" />
                {pendingEvents.length} en attente
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Joueurs assignés */}
          <div>
            <span className="text-sm font-medium mb-3 block">Vos joueurs assignés :</span>
            <div className="flex flex-wrap gap-2.5">
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

          {/* Résumé de la file d'attente */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                {pendingEvents.length === 0 ? "Aucun événement en attente" : 
                 pendingEvents.length === 1 ? "1 événement en attente" : 
                 `${pendingEvents.length} événements en attente`}
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
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Marquer tout comme Passe
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
                  Tout effacer
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File d'attente des événements */}
      <Card className={isOverlayMode ? 'fixed top-80 left-4 right-4 z-50 max-h-[calc(100vh-22rem)] overflow-y-auto' : ''}>
        <CardHeader className="pb-4 pt-6">
          <CardTitle className="text-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            File d'attente (Cliquez pour enregistrer)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pendingEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <p className="font-medium text-lg mb-2">Tout est en ordre !</p>
              <p className="text-sm">Aucun événement en attente. Attendez que vos joueurs aient le ballon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((event: PendingEvent) => {
                const isProcessing = isEventProcessing(event.id);
                
                return (
                  <div
                    key={event.id}
                    className={`border-2 rounded-xl p-5 transition-all shadow-md ${getPriorityColor(event.priority)} ${
                      isProcessing ? 'opacity-50' : ''
                    }`}
                  >
                    {/* En-tête de l'événement */}
                    <div className="flex items-center justify-between mb-4">
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
                              il y a {event.age_seconds}s
                            </span>
                            {isProcessing && (
                              <Badge className="bg-blue-600 animate-pulse">
                                Traitement...
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
                        aria-label={`Effacer l'événement pour ${event.player.player_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Disposition clavier - 3 rangées */}
                    <div className="space-y-3">
                      {/* Rangée 1: Q W E R T Y U I O P */}
                      <div className="flex gap-2.5">
                        {assignedEventTypes.slice(0, 10).map((eventType: string, index: number) => {
                          const shortcutKey = shortcutKeys[index];
                          const iconUrl = keyboardManager.getIconForEvent(eventType);
                          return (
                            <Button
                              key={eventType}
                              onClick={() => handleRecordEvent(event.id, eventType)}
                              disabled={!isOnline || isProcessing}
                              className={`flex-1 h-24 text-xs font-semibold transition-all relative overflow-hidden rounded-xl border-4 shadow-lg hover:shadow-xl hover:scale-105 ${
                                isProcessing
                                  ? 'bg-gray-400 cursor-not-allowed border-gray-500'
                                  : event.priority === 'urgent' 
                                    ? 'bg-red-600 hover:bg-red-700 border-red-800 active:border-red-900' 
                                    : event.priority === 'normal'
                                      ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-800 active:border-yellow-900'
                                      : 'bg-gray-600 hover:bg-gray-700 border-gray-800 active:border-gray-900'
                              }`}
                              aria-label={`Enregistrer ${eventType} pour ${event.player.player_name}`}
                            >
                              {iconUrl ? (
                                <>
                                  <div className="absolute inset-1 bg-white rounded-lg overflow-hidden">
                                    <img src={iconUrl} alt={eventTypeDisplay(eventType)} className="w-full h-full object-contain p-1" />
                                  </div>
                                  <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                                    <Badge 
                                      variant="secondary" 
                                      className="px-2 py-1 text-xs font-mono font-bold bg-black/90 text-white shadow-lg border-2 border-white"
                                    >
                                      {shortcutKey}
                                    </Badge>
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-1 relative z-10">
                                  <Badge 
                                    variant="secondary" 
                                    className="px-2 py-1 text-xs font-mono font-bold bg-black/90 text-white shadow-lg border-2 border-white mb-1"
                                  >
                                    {shortcutKey}
                                  </Badge>
                                  <span className="text-center leading-tight text-white font-bold text-sm">{eventTypeDisplay(eventType)}</span>
                                </div>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                      
                      {/* Rangée 2: A S D F G H J K L */}
                      {assignedEventTypes.length > 10 && (
                        <div className="flex gap-2.5">
                          {assignedEventTypes.slice(10, 19).map((eventType: string, index: number) => {
                            const shortcutKey = shortcutKeys[index + 10];
                            const iconUrl = keyboardManager.getIconForEvent(eventType);
                            return (
                              <Button
                                key={eventType}
                                onClick={() => handleRecordEvent(event.id, eventType)}
                                disabled={!isOnline || isProcessing}
                                className={`flex-1 h-24 text-xs font-semibold transition-all relative overflow-hidden rounded-xl border-4 shadow-lg hover:shadow-xl hover:scale-105 ${
                                  isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed border-gray-500'
                                    : event.priority === 'urgent' 
                                      ? 'bg-red-600 hover:bg-red-700 border-red-800 active:border-red-900' 
                                      : event.priority === 'normal'
                                        ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-800 active:border-yellow-900'
                                        : 'bg-gray-600 hover:bg-gray-700 border-gray-800 active:border-gray-900'
                                }`}
                                aria-label={`Enregistrer ${eventType} pour ${event.player.player_name}`}
                              >
                                {iconUrl ? (
                                  <>
                                    <div className="absolute inset-1 bg-white rounded-lg overflow-hidden">
                                      <img src={iconUrl} alt={eventTypeDisplay(eventType)} className="w-full h-full object-contain p-1" />
                                    </div>
                                    <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                                      <Badge 
                                        variant="secondary" 
                                        className="px-2 py-1 text-xs font-mono font-bold bg-black/90 text-white shadow-lg border-2 border-white"
                                      >
                                        {shortcutKey}
                                      </Badge>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center gap-1 relative z-10">
                                    <Badge 
                                      variant="secondary" 
                                      className="px-2 py-1 text-xs font-mono font-bold bg-black/90 text-white shadow-lg border-2 border-white mb-1"
                                    >
                                      {shortcutKey}
                                    </Badge>
                                    <span className="text-center leading-tight text-white font-bold text-sm">{eventTypeDisplay(eventType)}</span>
                                  </div>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Rangée 3: Z X C V B N M */}
                      {assignedEventTypes.length > 19 && (
                        <div className="flex gap-2.5">
                          {assignedEventTypes.slice(19, 26).map((eventType: string, index: number) => {
                            const shortcutKey = shortcutKeys[index + 19];
                            const iconUrl = keyboardManager.getIconForEvent(eventType);
                            return (
                              <Button
                                key={eventType}
                                onClick={() => handleRecordEvent(event.id, eventType)}
                                disabled={!isOnline || isProcessing}
                                className={`flex-1 h-24 text-xs font-semibold transition-all relative overflow-hidden rounded-xl border-4 shadow-lg hover:shadow-xl hover:scale-105 ${
                                  isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed border-gray-500'
                                    : event.priority === 'urgent' 
                                      ? 'bg-red-600 hover:bg-red-700 border-red-800 active:border-red-900' 
                                      : event.priority === 'normal'
                                        ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-800 active:border-yellow-900'
                                        : 'bg-gray-600 hover:bg-gray-700 border-gray-800 active:border-gray-900'
                                }`}
                                aria-label={`Enregistrer ${eventType} pour ${event.player.player_name}`}
                              >
                                {iconUrl ? (
                                  <>
                                    <div className="absolute inset-1 bg-white rounded-lg overflow-hidden">
                                      <img src={iconUrl} alt={eventTypeDisplay(eventType)} className="w-full h-full object-contain p-1" />
                                    </div>
                                    <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                                      <Badge 
                                        variant="secondary" 
                                        className="px-2 py-1 text-xs font-mono font-bold bg-black/90 text-white shadow-lg border-2 border-white"
                                      >
                                        {shortcutKey}
                                      </Badge>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center gap-1 relative z-10">
                                    <Badge 
                                      variant="secondary" 
                                      className="px-2 py-1 text-xs font-mono font-bold bg-black/90 text-white shadow-lg border-2 border-white mb-1"
                                    >
                                      {shortcutKey}
                                    </Badge>
                                    <span className="text-center leading-tight text-white font-bold text-sm">{eventTypeDisplay(eventType)}</span>
                                  </div>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Info Timestamp */}
                    <div className="mt-4 pt-3 border-t border-gray-300 text-xs text-gray-600 text-right font-medium">
                      Possession à : {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions - Hidden in overlay mode */}
      {!isOverlayMode && (
        <>
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <h4 className="font-medium mb-4 text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Fonctionnement de la file d'attente :
              </h4>
              <ul className="text-sm space-y-2.5 text-muted-foreground leading-relaxed">
                <li>🔴 <strong>ROUGE (Urgent):</strong> Événements de moins de 5s - à enregistrer immédiatement !</li>
                <li>🟡 <strong>JAUNE (Normal):</strong> Événements de 5-15s - à enregistrer dès que possible.</li>
                <li>⚪ <strong>GRIS (Ancien):</strong> Événements de plus de 15s - peuvent s'effacer automatiquement après 30s.</li>
                <li>• Les événements conservent leur horodatage original pour des analyses précises.</li>
                <li>• Vous pouvez enregistrer les événements dans n'importe quel ordre.</li>
                <li>• Plusieurs événements peuvent s'empiler ; traitez-les systématiquement.</li>
                <li>• Utilisez "Effacer" pour ignorer les événements que vous n'avez pas pu observer correctement.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h4 className="font-medium mb-3 text-base flex items-center gap-2 text-blue-900">
                <Keyboard className="h-5 w-5" />
                Raccourcis Clavier Activés
              </h4>
              <p className="text-sm text-blue-800">
                Utilisez votre clavier pour enregistrer des événements pour le joueur en haut de la file.
                Les lettres sur les boutons correspondent aux touches du clavier (QWERTY - 26 touches disponibles).
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PlayerTrackerInterface;
