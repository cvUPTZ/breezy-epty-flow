
import React, { useEffect, useRef, useState } from 'react';
import { useVoiceCollaborationContext } from '@/context/VoiceCollaborationContext';
import { Participant, ConnectionState, LocalParticipant } from 'livekit-client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VolumeX, Volume2, Shield, Mic, PhoneOff, Wifi, WifiOff, Loader2, MicOff } from 'lucide-react';

interface CompactVoiceChatProps {
  matchId: string;
  userId: string;
  userRole: string;
  userName: string;
  voiceCollabCtx?: ReturnType<typeof useVoiceCollaborationContext>;
}

export const CompactVoiceChat: React.FC<CompactVoiceChatProps> = ({
  matchId, 
  userId, 
  userRole, 
  userName,
  voiceCollabCtx
}) => {
  const ctx = voiceCollabCtx || useVoiceCollaborationContext();

  const {
    availableRooms,
    currentRoomId,
    participants,
    localParticipant,
    connectionState,
    isConnecting,
    isConnected,
    isLoadingRooms,
    error,
    joinRoom,
    leaveRoom,
    toggleMuteSelf,
    fetchAvailableRooms,
    moderateMuteParticipant,
    getAudioLevel,
  } = ctx;

  const [allMuted, setAllMuted] = useState(false);
  const lastShownErrorRef = useRef<Error | null>(null);

  useEffect(() => {
    if (error && error !== lastShownErrorRef.current) {
      toast.error(error.message || 'An unknown error occurred.', {
        id: error.message,
      });
      lastShownErrorRef.current = error;
    }
    if (!error && lastShownErrorRef.current) {
        lastShownErrorRef.current = null;
    }
  }, [error]);

  useEffect(() => {
    if (matchId) {
      fetchAvailableRooms(matchId);
    }
  }, [fetchAvailableRooms, matchId]);

  function isTrackerParticipant(participant: Participant): boolean {
    const { metadata, name } = participant;
    if (!metadata) return false;
    if (metadata === 'tracker') return true;
    try {
      const parsed = JSON.parse(metadata as string);
      if (parsed && typeof parsed === 'object' && parsed.role === 'tracker') {
        return true;
      }
    } catch {}
    if (name && name.toLowerCase().includes('tracker')) return true;
    return false;
  }

  const handleJoinRoom = async (roomId: string) => {
    await joinRoom(roomId, userId, userRole, userName);
  };

  const isParticipantMuted = (participant: Participant | null): boolean => {
    if (!participant) {
      return true;
    }
    if (participant.isLocal) {
      return !(participant as LocalParticipant).isMicrophoneEnabled;
    }
    const audioTrackPublications = Array.from(participant.audioTrackPublications.values());
    return audioTrackPublications.length === 0 || audioTrackPublications.some(pub => pub.isMuted);
  };

  const isParticipantSpeaking = (participant: Participant): boolean => {
    const audioLevel = getAudioLevel(participant.identity);
    return audioLevel > 0.1 && !isParticipantMuted(participant);
  };

  const canModerate = userRole === 'admin' || userRole === 'coordinator';

  const trackerParticipants = participants.filter(
    (p: Participant) => !p.isLocal && isTrackerParticipant(p)
  );

  const handleToggleMuteSelf = async () => {
    const result = await toggleMuteSelf();
    if (typeof result === "undefined") {
      toast.error("Failed to toggle mute.");
    }
  };

  const handleMuteAll = async () => {
    if (!canModerate) return;
    const newMuteState = !allMuted;
    setAllMuted(newMuteState);

    let errors = 0;
    for (const participant of participants) {
      if (!participant.isLocal && isTrackerParticipant(participant)) {
        const ok = await moderateMuteParticipant(participant.identity, newMuteState);
        if (!ok) errors++;
      }
    }
    if (errors) {
      toast.error(`Some participants could not be ${newMuteState ? 'muted' : 'unmuted'}`);
    } else {
      toast.success(newMuteState ? 'All trackers muted' : 'All trackers unmuted');
    }
  };

  const renderConnectionStatus = () => {
    if (isConnecting) return <Badge variant="secondary" className="bg-amber-500/20 text-amber-200 border-amber-400/20 text-xs"><Loader2 className="mr-1 h-2 w-2 animate-spin" />Connecting</Badge>;
    if (isConnected) return <Badge variant="default" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/20 text-xs"><Wifi className="mr-1 h-2 w-2" />Connected</Badge>;
    if (connectionState === ConnectionState.Disconnected) return <Badge variant="destructive" className="bg-red-500/20 text-red-200 border-red-400/20 text-xs"><WifiOff className="mr-1 h-2 w-2" />Disconnected</Badge>;
    return <Badge variant="outline" className="text-xs"><Loader2 className="mr-1 h-2 w-2 animate-spin" />Initializing</Badge>;
  };

  if (!isConnected && !isConnecting) {
    return (
      <div className="space-y-3">
        {isLoadingRooms && (
          <div className="flex items-center justify-center p-4 text-white/70">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            <span className="text-xs">Loading rooms...</span>
          </div>
        )}
        {!isLoadingRooms && availableRooms.length === 0 && (
          <div className="text-center py-4">
              <MicOff className="h-6 w-6 mx-auto text-white/40 mb-2" />
              <p className="text-white/70 font-medium text-xs">No voice rooms available</p>
          </div>
        )}
        {!isLoadingRooms && availableRooms.length > 0 && (
          <div className="space-y-2">
            {availableRooms.map((room: any) => (
              <div key={room.id} className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <p className="font-medium text-white text-xs">{room.name}</p>
                  <p className="text-[10px] text-white/50">ID: {room.id}</p>
                </div>
                <Button
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={isConnecting}
                  size="sm"
                  className="bg-blue-600/80 hover:bg-blue-700/80 text-white text-xs h-6 px-2"
                >
                  <Mic className="mr-1 h-2 w-2" />
                  Join
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="text-white text-xs font-medium truncate">
          Room: {currentRoomId}
        </div>
        {renderConnectionStatus()}
      </div>

      {/* Control buttons */}
      <div className="flex gap-2">
        <Button
          onClick={leaveRoom}
          variant="destructive"
          size="sm"
          className="text-xs h-6 px-2"
        >
          <PhoneOff className="h-2 w-2 mr-1" />
          Leave
        </Button>
        <Button
          onClick={handleToggleMuteSelf}
          variant="outline"
          size="sm"
          disabled={!localParticipant}
          className="text-xs h-6 px-2 border-white/20 text-white hover:bg-white/10"
        >
          {isParticipantMuted(localParticipant) ? (
            <>
              <VolumeX className="h-2 w-2 mr-1 text-red-400" />
              Unmute
            </>
          ) : (
            <>
              <Volume2 className="h-2 w-2 mr-1 text-emerald-400" />
              Mute
            </>
          )}
        </Button>
        
        {canModerate && (
          <Button
            onClick={handleMuteAll}
            variant="outline"
            size="sm"
            className="text-xs h-6 px-2 text-orange-300 hover:text-orange-200 border-orange-400/20 hover:bg-orange-500/10"
          >
            <Shield className="h-2 w-2 mr-1" />
            {allMuted ? 'Unmute All' : 'Mute All'}
          </Button>
        )}
      </div>

      {/* Participants grid */}
      <div className="space-y-2">
        <h4 className="font-medium text-white text-xs">Participants ({participants.length})</h4>
        <div className="grid grid-cols-2 gap-2">
          {participants.map((participant: Participant) => {
            const isMuted = isParticipantMuted(participant);
            const isSpeaking = isParticipantSpeaking(participant);
            
            return (
              <div 
                key={participant.identity} 
                className={`
                  relative flex items-center p-2 rounded-lg text-center
                  bg-white/5 backdrop-blur-sm border border-white/10
                  transition-all duration-300
                  ${isSpeaking ? 'ring-1 ring-emerald-400/50 bg-emerald-500/10' : ''}
                `}
              >
                <div className="relative mr-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 flex items-center justify-center text-white font-bold text-xs border border-white/20">
                    {participant.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className={`absolute bottom-0 -right-1 w-3 h-3 rounded-full flex items-center justify-center border border-black/20 ${isMuted ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {isMuted ? (
                      <MicOff size={8} className="text-white" />
                    ) : (
                      <Mic size={8} className="text-white"/>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-white truncate block" title={participant.name || participant.identity}>
                    {participant.name || participant.identity}
                  </span>
                  {participant.isLocal && <Badge variant="secondary" className="mt-0.5 px-1 py-0 text-[10px] bg-white/10 text-white/70">You</Badge>}
                </div>
              
                {/* Moderation for non-local tracker participants only */}
                {canModerate && !participant.isLocal && isTrackerParticipant(participant) && (
                  <Button
                    onClick={() => moderateMuteParticipant(participant.identity, !isMuted)}
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-4 w-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 p-0"
                  >
                    {isMuted ? <Volume2 size={8}/> : <VolumeX size={8}/>}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
