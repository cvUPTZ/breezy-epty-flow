import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Clock, AlertTriangle, Trash2, CheckCircle, Loader2, Keyboard } from 'lucide-react';

// Hook useKeyboardShortcuts
const useKeyboardShortcuts = (shortcutMap, isActive = true) => {
  const handleKeyDown = useCallback(
    (event) => {
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

// Composant Principal
const PlayerTrackerInterface = ({
  assignedPlayers,
  pendingEvents,
  assignedEventTypes,
  isOnline = true,
  onRecordEvent,
  onClearEvent,
  onClearAll,
  onMarkAllAsPass
}) => {
  const [processingEvents, setProcessingEvents] = useState(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);

  const shortcutKeys = useMemo(() => [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M'
  ], []);

  const handleRecordEvent = useCallback((pendingEventId, eventType) => {
    setProcessingEvents(prev => new Set(prev).add(pendingEventId));
    onRecordEvent(pendingEventId, eventType);
  }, [onRecordEvent]);

  const shortcutMap = useMemo(() => {
    if (pendingEvents.length === 0 || !isOnline) {
      return {};
    }
    const firstEvent = pendingEvents[0];
    const map = {};
    
    assignedEventTypes.slice(0, shortcutKeys.length).forEach((eventType, index) => {
      const key = shortcutKeys[index];
      map[`Key${key}`] = () => handleRecordEvent(firstEvent.id, eventType);
    });

    return map;
  }, [pendingEvents, assignedEventTypes, isOnline, handleRecordEvent, shortcutKeys]);

  useKeyboardShortcuts(shortcutMap, isOnline && pendingEvents.length > 0);

  const eventTypeDisplay = (eventType) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'normal': return 'border-yellow-500 bg-yellow-50';
      case 'old': return 'border-gray-400 bg-gray-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getPriorityBadge = (priority) => {
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

  const isEventProcessing = (eventId) => processingEvents.has(eventId);

  return (
    <div className="space-y-4">
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
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Interface de Suivi des Joueurs
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {pendingEvents.length} en attente
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Joueurs assignés */}
          <div>
            <span className="text-sm font-medium">Vos joueurs assignés :</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {assignedPlayers.map(player => {
                const hasPending = pendingEvents.some(e => e.player.id === player.id);
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
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            File d'attente (Cliquez pour enregistrer)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">Tout est en ordre !</p>
              <p className="text-sm">Aucun événement en attente. Attendez que vos joueurs aient le ballon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvents.map((event) => {
                const isProcessing = isEventProcessing(event.id);
                
                return (
                  <div
                    key={event.id}
                    className={`border-2 rounded-lg p-4 transition-all ${getPriorityColor(event.priority)} ${
                      isProcessing ? 'opacity-50' : ''
                    }`}
                  >
                    {/* En-tête de l'événement */}
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
                    <div className="space-y-2">
                      {/* Rangée 1: Q W E R T Y U I O P */}
                      <div className="flex gap-2">
                        {assignedEventTypes.slice(0, 10).map((eventType, index) => {
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
                              aria-label={`Enregistrer ${eventType} pour ${event.player.player_name}`}
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
                      </div>
                      
                      {/* Rangée 2: A S D F G H J K L */}
                      {assignedEventTypes.length > 10 && (
                        <div className="flex gap-2">
                          {assignedEventTypes.slice(10, 19).map((eventType, index) => {
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
                                aria-label={`Enregistrer ${eventType} pour ${event.player.player_name}`}
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
                        </div>
                      )}
                      
                      {/* Rangée 3: Z X C V B N M */}
                      {assignedEventTypes.length > 19 && (
                        <div className="flex gap-2">
                          {assignedEventTypes.slice(19, 26).map((eventType, index) => {
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
                                aria-label={`Enregistrer ${eventType} pour ${event.player.player_name}`}
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
                        </div>
                      )}
                    </div>

                    {/* Info Timestamp */}
                    <div className="mt-2 text-xs text-gray-500 text-right">
                      Possession à : {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Fonctionnement de la file d'attente :
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
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

      {/* Aide sur les raccourcis clavier */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
           <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-900">
            <Keyboard className="h-5 w-5" />
            Raccourcis Clavier Activés
          </h4>
          <p className="text-sm text-blue-800">
            Utilisez votre clavier pour enregistrer des événements pour le joueur en haut de la file.
            Les lettres sur les boutons correspondent aux touches du clavier (QWERTY - 26 touches disponibles).
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerTrackerInterface;
