
import { useState, useEffect } from 'react';
import { Participant, ConnectionState, LocalParticipant } from 'livekit-client';
import NewVoiceChatManager, { VoiceRoomDetails } from '@/services/NewVoiceChatManager';

export interface VoiceCollaborationState {
  // Room management
  rooms: VoiceRoomDetails[];
  availableRooms: VoiceRoomDetails[];
  currentRoomId: string | null;
  loading: boolean;
  isLoadingRooms: boolean;
  
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: ConnectionState;
  error: Error | null;
  
  // Participants
  participants: Participant[];
  localParticipant: LocalParticipant | null;
  audioLevels: Map<string, number>;
  
  // Actions
  joinRoom: (roomId: string, userId: string, userRole: string, userName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleMuteSelf: () => Promise<boolean | undefined>;
  fetchAvailableRooms: (matchId: string) => Promise<void>;
  moderateMuteParticipant: (participantId: string, mute: boolean) => Promise<boolean>;
  getAudioLevel: (participantId: string) => number;
}

export const useNewVoiceCollaboration = (): VoiceCollaborationState => {
  const [rooms, setRooms] = useState<VoiceRoomDetails[]>([]);
  const [availableRooms, setAvailableRooms] = useState<VoiceRoomDetails[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [error, setError] = useState<Error | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [audioLevels, setAudioLevels] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const manager = NewVoiceChatManager.getInstance();
        const roomData = await manager.getAllRooms();
        setRooms(roomData);
        setAvailableRooms(roomData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const joinRoom = async (roomId: string, userId: string, userRole: string, userName: string): Promise<void> => {
    setIsConnecting(true);
    setError(null);
    try {
      // TODO: Implement actual LiveKit room joining logic
      setCurrentRoomId(roomId);
      setIsConnected(true);
      setConnectionState(ConnectionState.Connected);
    } catch (err) {
      setError(err as Error);
      setIsConnected(false);
      setConnectionState(ConnectionState.Disconnected);
    } finally {
      setIsConnecting(false);
    }
  };

  const leaveRoom = async (): Promise<void> => {
    try {
      // TODO: Implement actual LiveKit room leaving logic
      setCurrentRoomId(null);
      setIsConnected(false);
      setConnectionState(ConnectionState.Disconnected);
      setParticipants([]);
      setLocalParticipant(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  const toggleMuteSelf = async (): Promise<boolean | undefined> => {
    try {
      if (localParticipant) {
        const currentMuted = !localParticipant.isMicrophoneEnabled;
        // TODO: Implement actual mute toggle logic
        return !currentMuted;
      }
      return undefined;
    } catch (err) {
      setError(err as Error);
      return undefined;
    }
  };

  const fetchAvailableRooms = async (matchId: string): Promise<void> => {
    setIsLoadingRooms(true);
    try {
      const manager = NewVoiceChatManager.getInstance();
      const roomData = await manager.getRoomsForMatch(matchId);
      setAvailableRooms(roomData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const moderateMuteParticipant = async (participantId: string, mute: boolean): Promise<boolean> => {
    try {
      // TODO: Implement actual moderation logic
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  const getAudioLevel = (participantId: string): number => {
    return audioLevels.get(participantId) || 0;
  };

  return {
    rooms,
    availableRooms,
    currentRoomId,
    loading,
    isLoadingRooms,
    isConnected,
    isConnecting,
    connectionState,
    error,
    participants,
    localParticipant,
    audioLevels,
    joinRoom,
    leaveRoom,
    toggleMuteSelf,
    fetchAvailableRooms,
    moderateMuteParticipant,
    getAudioLevel,
  };
};
