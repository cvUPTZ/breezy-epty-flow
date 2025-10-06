import { useState, useEffect, useCallback } from 'react';
import NewVoiceChatManager from '@/services/NewVoiceChatManager';
import { Participant, ConnectionState } from 'livekit-client';

interface VoiceRoomDetails {
  id: string;
  name: string;
  max_participants?: number;
}

interface UseNewVoiceCollaborationReturn {
  availableRooms: VoiceRoomDetails[];
  currentRoomId: string | null;
  participants: Participant[];
  localParticipant: Participant | null;
  connectionState: ConnectionState | null;
  isConnecting: boolean;
  isConnected: boolean;
  isLoadingRooms: boolean;
  error: Error | null;
  audioLevels: Map<string, number>;
  joinRoom: (roomId: string, userId: string, userRole: string, userName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleMuteSelf: () => Promise<boolean | undefined>;
  fetchAvailableRooms: (matchId: string) => Promise<void>;
  moderateMuteParticipant: (targetIdentity: string, mute: boolean) => Promise<boolean>;
  getAudioLevel: (participantId: string) => number;
}

export const useNewVoiceCollaboration = (): UseNewVoiceCollaborationReturn => {
  const [manager] = useState(() => NewVoiceChatManager.getInstance());
  const [availableRooms, setAvailableRooms] = useState<VoiceRoomDetails[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [audioLevels, setAudioLevels] = useState<Map<string, number>>(new Map());

  // Calculate isConnected early, before any callbacks that use it
  const isConnected = connectionState === ConnectionState.Connected;

  useEffect(() => {
    manager.onParticipantsChanged = (newParticipants: Participant[]) => {
      console.log('[useNewVoiceCollaboration] Participants updated:', newParticipants.length);
      // Use the participants directly without cloning to maintain stable references
      // This prevents React reconciliation issues
      setParticipants(newParticipants);
      setLocalParticipant(manager.getLocalParticipant() || null);
    };

    manager.onConnectionStateChanged = (state: ConnectionState) => {
      console.log('[useNewVoiceCollaboration] Connection state changed:', state);
      setConnectionState(state);
      setIsConnecting(state === ConnectionState.Connecting);
      
      if (state === ConnectionState.Disconnected) {
        setCurrentRoomId(null);
        setParticipants([]);
        setLocalParticipant(null);
        setAudioLevels(new Map());
      }
    };

    manager.onError = (err: Error) => {
      console.error('[useNewVoiceCollaboration] Error:', err);
      setError(err);
      setIsConnecting(false);
    };

    manager.onAudioLevelChanged = (participantId: string, level: number) => {
      setAudioLevels(prev => {
        const newMap = new Map(prev);
        newMap.set(participantId, level);
        return newMap;
      });
    };

    return () => {
      manager.dispose();
    };
  }, [manager]);

  const fetchAvailableRooms = useCallback(async (matchId: string) => {
    setIsLoadingRooms(true);
    setError(null);
    try {
      console.log('[useNewVoiceCollaboration] Fetching rooms for match:', matchId);
      const rooms = await manager.getRoomsForMatch(matchId);
      console.log('[useNewVoiceCollaboration] Found rooms:', rooms.length);
      setAvailableRooms(rooms);
    } catch (err) {
      console.error('[useNewVoiceCollaboration] Error fetching rooms:', err);
      setError(err as Error);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [manager]);

  const joinRoom = useCallback(async (roomId: string, userId: string, userRole: string, userName: string) => {
    // Check connection state directly from state instead of derived variable
    const currentlyConnected = connectionState === ConnectionState.Connected;
    
    // Prevent joining if already connected or in the process of connecting
    if (isConnecting || currentlyConnected) {
      console.warn('[useNewVoiceCollaboration] Attempted to join room while already connecting or connected.');
      return;
    }

    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('[useNewVoiceCollaboration] Delegating join room call to manager for room:', roomId);
      await manager.joinRoom(roomId, userId, userRole, userName);
      // The manager will emit a ConnectionState.Connected event.
      // The onConnectionStateChanged listener will handle the rest of the state updates.
      // We can optimistically set the room ID here.
      setCurrentRoomId(roomId);
    } catch (err) {
      console.error('[useNewVoiceCollaboration] Error during join room attempt:', err);
      setError(err as Error);
      setIsConnecting(false); // Reset on failure
    }
  }, [manager, isConnecting, connectionState]);

  const leaveRoom = useCallback(async () => {
    console.log('[useNewVoiceCollaboration] Leaving room');
    await manager.leaveRoom();
    setCurrentRoomId(null);
    setParticipants([]);
    setLocalParticipant(null);
    setAudioLevels(new Map());
  }, [manager]);

  const toggleMuteSelf = useCallback(async () => {
    console.log('[useNewVoiceCollaboration] Toggling mute');
    return await manager.toggleMuteSelf();
  }, [manager]);

  const moderateMuteParticipant = useCallback(async (targetIdentity: string, mute: boolean) => {
    console.log('[useNewVoiceCollaboration] Moderating participant:', targetIdentity, 'mute:', mute);
    return await manager.moderateMuteParticipant(targetIdentity, mute);
  }, [manager]);

  const getAudioLevel = useCallback((participantId: string): number => {
    return manager.getAudioLevel(participantId);
  }, [manager]);

  return {
    availableRooms,
    currentRoomId,
    participants,
    localParticipant,
    connectionState,
    isConnecting,
    isConnected,
    isLoadingRooms,
    error,
    audioLevels,
    joinRoom,
    leaveRoom,
    toggleMuteSelf,
    fetchAvailableRooms,
    moderateMuteParticipant,
    getAudioLevel,
  };
};
