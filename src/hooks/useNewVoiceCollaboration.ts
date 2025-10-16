import { useState, useEffect, useCallback, useMemo } from 'react';
import { NewVoiceChatManager } from '@/services/NewVoiceChatManager';
import { Participant, ConnectionState, Track, Room } from 'livekit-client';

interface VoiceRoomDetails {
  id: string;
  name: string;
  max_participants?: number;
}

interface UseNewVoiceCollaborationProps {
  userId: string;
  userName: string;
  userRole: string;
  matchId: string;
}

interface UseNewVoiceCollaborationReturn {
  availableRooms: VoiceRoomDetails[];
  currentRoom: Room | null;
  participants: Participant[];
  localParticipant: Participant | null;
  connectionState: ConnectionState;
  isConnecting: boolean;
  error: Error | null;
  actions: {
    joinRoom: (roomId: string) => Promise<void>;
    leaveRoom: () => Promise<void>;
    toggleMute: () => void;
    moderateMute: (participantIdentity: string, mute: boolean) => void;
  };
}

export const useNewVoiceCollaboration = ({
  userId,
  userName,
  userRole,
  matchId,
}: UseNewVoiceCollaborationProps): UseNewVoiceCollaborationReturn => {
  const [manager] = useState(() => NewVoiceChatManager.getInstance());
  const [availableRooms, setAvailableRooms] = useState<VoiceRoomDetails[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    manager.initialize(userId);
  }, [manager, userId]);

  const handleRoomUpdate = useCallback(() => {
    const room = manager.getRoom();
    setCurrentRoom(room);
    if (room) {
      const remoteParticipants = Array.from(room.remoteParticipants.values());
      const allParticipants = [room.localParticipant, ...remoteParticipants];
      setParticipants(allParticipants.filter((p): p is Participant => !!p));
      setLocalParticipant(room.localParticipant);
    } else {
      setParticipants([]);
      setLocalParticipant(null);
    }
  }, [manager]);

  useEffect(() => {
    const onConnectionStateChanged = (state: ConnectionState, err?: Error) => {
      setConnectionState(state);
      setIsConnecting(state === ConnectionState.Connecting);
      if (state === ConnectionState.Connected) {
        handleRoomUpdate();
      } else if (state === ConnectionState.Disconnected) {
        handleRoomUpdate(); // This will clear the room state
        if (err) setError(err);
      }
    };

    const onPeerStatusChanged = () => {
      handleRoomUpdate();
    };

    manager.onConnectionStateChanged = onConnectionStateChanged;
    manager.onPeerStatusChanged = onPeerStatusChanged;

    // Cleanup
    return () => {
      manager.onConnectionStateChanged = () => {};
      manager.onPeerStatusChanged = () => {};
    };
  }, [manager, handleRoomUpdate]);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsConnecting(true);
      setError(null);
      try {
        const rooms = await manager.getRoomsForMatch(matchId);
        setAvailableRooms(rooms);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsConnecting(false);
      }
    };

    if (matchId) {
      fetchRooms();
    }
  }, [matchId, manager]);

  const joinRoom = useCallback(
    async (roomId: string) => {
      setError(null);
      setIsConnecting(true);
      try {
        await manager.joinRoom(roomId, userId, userRole, userName);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsConnecting(false);
      }
    },
    [manager, userId, userRole, userName]
  );

  const leaveRoom = useCallback(async () => {
    await manager.leaveRoom();
  }, [manager]);

  const toggleMute = useCallback(() => {
    if (localParticipant) {
      const isMuted = localParticipant.isMicrophoneMuted;
      manager.setTrackEnabled(Track.Source.Microphone, isMuted);
    }
  }, [manager, localParticipant]);

  const moderateMute = useCallback(
    (participantIdentity: string, mute: boolean) => {
      // Placeholder for moderation logic
      console.log(`Moderating ${participantIdentity}: set mute to ${mute}`);
    },
    []
  );

  const actions = useMemo(
    () => ({
      joinRoom,
      leaveRoom,
      toggleMute,
      moderateMute,
    }),
    [joinRoom, leaveRoom, toggleMute, moderateMute]
  );

  return {
    availableRooms,
    currentRoom,
    participants,
    localParticipant,
    connectionState,
    isConnecting,
    error,
    actions,
  };
};