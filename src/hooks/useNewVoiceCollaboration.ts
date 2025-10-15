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
    const handleParticipantsChanged = () => {
        const room = manager.getRoom();
        if (room) {
            const remoteParticipants = Array.from(room.remoteParticipants.values());
            const allParticipants = [room.localParticipant, ...remoteParticipants];
            // Filter out any null/undefined participants, just in case
            const validParticipants = allParticipants.filter((p): p is Participant => !!p);
            console.log('[useNewVoiceCollaboration] Participants updated:', validParticipants.length);
            setParticipants(validParticipants);
            setLocalParticipant(room.localParticipant);
        }
    };

    manager.onPeerStatusChanged = (peerId, status, participant) => {
        console.log('[useNewVoiceCollaboration] Peer status changed:', peerId, status);
        handleParticipantsChanged();
    };

    manager.onConnectionStateChanged = (state: ConnectionState, error?: Error) => {
      console.log('[useNewVoiceCollaboration] Connection state changed:', state);
      setConnectionState(state);
      setIsConnecting(state === ConnectionState.Connecting);
      
      if (state === ConnectionState.Connected) {
        handleParticipantsChanged();
      } else if (state === ConnectionState.Disconnected) {
        setCurrentRoomId(null);
        setParticipants([]);
        setLocalParticipant(null);
        setAudioLevels(new Map());
        if (error) {
          setError(error);
        }
      }
    };

    manager.onIsSpeakingChanged = (peerId: string, isSpeaking: boolean) => {
        setAudioLevels(prev => {
            const newMap = new Map(prev);
            // LiveKit gives a boolean, we can represent speaking with a level of 1, not speaking 0.
            newMap.set(peerId, isSpeaking ? 1 : 0);
            return newMap;
        });
    };

    return () => {
      manager.leaveRoom();
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
    if (isConnecting || isConnected) {
      console.warn('[useNewVoiceCollaboration] Attempted to join room while already connecting or connected.');
      return;
    }

    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('[useNewVoiceCollaboration] Initializing manager and joining room:', roomId);
      manager.initialize(userId); // Initialize with user ID
      await manager.joinRoom(roomId, userId, userRole, userName);
      setCurrentRoomId(roomId);
    } catch (err) {
      console.error('[useNewVoiceCollaboration] Error during join room attempt:', err);
      setError(err as Error);
      setIsConnecting(false);
    }
  }, [manager, isConnecting, isConnected]);

  const leaveRoom = useCallback(async () => {
    console.log('[useNewVoiceCollaboration] Leaving room');
    await manager.leaveRoom();
  }, [manager]);

  const toggleMuteSelf = useCallback(async () => {
    if (localParticipant) {
      const isMuted = localParticipant.isMicrophoneMuted;
      await manager.setTrackEnabled(Track.Source.Microphone, isMuted);
      return !isMuted;
    }
    return undefined;
  }, [manager, localParticipant]);

  const moderateMuteParticipant = useCallback(async (targetIdentity: string, mute: boolean) => {
    // This is a placeholder. A real implementation would require a backend call
    // to a Supabase function that uses the LiveKit server SDK to moderate.
    console.warn(`[useNewVoiceCollaboration] Moderation not fully implemented. Attempting to mute ${targetIdentity}: ${mute}`);
    return false; // Indicate failure
  }, []);


  const getAudioLevel = useCallback((participantId: string): number => {
    return audioLevels.get(participantId) || 0;
  }, [audioLevels]);

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
