import React, { useEffect, useRef, useState } from 'react';
import { useNewVoiceCollaboration } from '@/hooks/useNewVoiceCollaboration';
import { Participant, ConnectionState, LocalParticipant } from 'livekit-client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  VolumeX,
  Volume2,
  Mic,
  MicOff,
  PhoneOff,
  Wifi,
  WifiOff,
  Loader2,
  Users,
  Shield,
  Settings2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EnhancedVoiceChatProps {
  matchId: string;
  userId: string;
  userRole: string;
  userName: string;
}

export const EnhancedVoiceChat: React.FC<EnhancedVoiceChatProps> = ({
  matchId,
  userId,
  userRole,
  userName,
}) => {
  const {
    availableRooms,
    currentRoom,
    participants,
    localParticipant,
    connectionState,
    isConnecting,
    error,
    actions,
  } = useNewVoiceCollaboration({
    userId,
    userName,
    userRole,
    matchId,
  });

  const lastShownErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage !== lastShownErrorRef.current) {
        toast({
          title: 'Voice Chat Error',
          description: errorMessage,
          variant: 'destructive',
        });
        lastShownErrorRef.current = errorMessage;
      }
    }
  }, [error]);

  const handleJoinRoom = async (roomId: string) => {
    try {
      await actions.joinRoom(roomId);
      toast({
        title: 'Connecting...',
        description: `Joining room ${roomId}.`,
      });
    } catch (e) {
      // Error is already handled by the hook's useEffect
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await actions.leaveRoom();
      toast({
        title: 'Left Room',
        description: 'You have successfully left the voice chat.',
      });
    } catch (e) {
      // Error is already handled by the hook's useEffect
    }
  };

  const handleToggleMute = () => {
    actions.toggleMute();
  };

  const canModerate = userRole === 'admin' || userRole === 'coordinator';

  const renderConnectionStatus = () => {
    switch (connectionState) {
      case ConnectionState.Connecting:
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting
          </Badge>
        );
      case ConnectionState.Connected:
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            <Wifi className="mr-2 h-4 w-4" />
            Connected
          </Badge>
        );
      case ConnectionState.Disconnected:
        return (
          <Badge variant="destructive">
            <WifiOff className="mr-2 h-4 w-4" />
            Disconnected
          </Badge>
        );
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  if (!currentRoom) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Available Voice Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {isConnecting && !availableRooms.length ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : null}
          {availableRooms.length === 0 && !isConnecting ? (
            <p className="text-center text-slate-500">No voice rooms found for this match.</p>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{room.name}</p>
                      <p className="text-sm text-slate-500">ID: {room.id}</p>
                    </div>
                    <Button onClick={() => handleJoinRoom(room.id)} disabled={isConnecting}>
                      <Mic className="mr-2 h-4 w-4" />
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Room: {currentRoom.name}</CardTitle>
          <p className="text-sm text-slate-500">
            {participants.length} participant{participants.length === 1 ? '' : 's'}
          </p>
        </div>
        {renderConnectionStatus()}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-4">
            {participants.map((p) => (
              <ParticipantRow key={p.identity} participant={p} canModerate={canModerate} actions={actions} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-slate-50 p-4 border-t">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-slate-500" />
          <span className="font-semibold">{localParticipant?.name || 'You'}</span>
          {localParticipant?.isLocal && <Badge variant="secondary">You</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleToggleMute} variant={localParticipant?.isMuted ? 'secondary' : 'default'} size="lg">
            {localParticipant?.isMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          <Button onClick={handleLeaveRoom} variant="destructive" size="lg">
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const ParticipantRow: React.FC<{
  participant: Participant;
  canModerate: boolean;
  actions: any; // Simplified for brevity
}> = ({ participant, canModerate, actions }) => {
  const isMuted = participant.isMicrophoneMuted;
  const isSpeaking = participant.isSpeaking;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
        isSpeaking ? 'bg-green-100' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
            participant.isLocal ? 'bg-blue-500' : 'bg-slate-400'
          }`}
        >
          {participant.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div>
          <p className="font-semibold">{participant.name}</p>
          <p className="text-sm text-slate-500">{participant.identity}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-red-500" />
        ) : (
          <Volume2 className={`h-5 w-5 ${isSpeaking ? 'text-green-500' : 'text-slate-400'}`} />
        )}
        {canModerate && !participant.isLocal && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => actions.moderateMute(participant.identity, !isMuted)}>
                {isMuted ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
                {isMuted ? 'Unmute' : 'Mute'} Participant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default EnhancedVoiceChat;