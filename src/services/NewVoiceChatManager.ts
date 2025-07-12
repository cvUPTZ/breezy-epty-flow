
import { supabase } from '@/integrations/supabase/client';
import { Participant, ConnectionState } from 'livekit-client';

interface VoiceRoomDetails {
  id: string;
  name: string;
  max_participants?: number;
}

class NewVoiceChatManager {
  private static instance: NewVoiceChatManager;
  private localParticipant: Participant | null = null;
  private participants: Participant[] = [];
  private connectionState: ConnectionState = ConnectionState.Disconnected;
  private audioLevels: Map<string, number> = new Map();

  // Callback properties
  public onParticipantsChanged: ((participants: Participant[]) => void) | null = null;
  public onConnectionStateChanged: ((state: ConnectionState) => void) | null = null;
  public onError: ((error: Error) => void) | null = null;
  public onAudioLevelChanged: ((participantId: string, level: number) => void) | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): NewVoiceChatManager {
    if (!NewVoiceChatManager.instance) {
      NewVoiceChatManager.instance = new NewVoiceChatManager();
    }
    return NewVoiceChatManager.instance;
  }

  async getRoomsForMatch(matchId: string): Promise<VoiceRoomDetails[]> {
    try {
      const { data, error } = await supabase
        .from('voice_rooms')
        .select('id, name, max_participants')
        .eq('match_id', matchId)
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;

      return (data || []).map(room => ({
        id: room.id,
        name: room.name,
        max_participants: room.max_participants || undefined
      }));
    } catch (error) {
      console.error('Error fetching voice rooms:', error);
      return [];
    }
  }

  getLocalParticipant(): Participant | null {
    return this.localParticipant;
  }

  async joinRoom(roomId: string, userId: string, userRole: string, userName: string): Promise<void> {
    try {
      console.log('[NewVoiceChatManager] Joining room:', roomId);
      // Mock implementation - in a real implementation, this would connect to LiveKit
      this.connectionState = ConnectionState.Connecting;
      this.onConnectionStateChanged?.(this.connectionState);
      
      // Simulate connection success
      setTimeout(() => {
        this.connectionState = ConnectionState.Connected;
        this.onConnectionStateChanged?.(this.connectionState);
      }, 1000);
    } catch (error) {
      console.error('[NewVoiceChatManager] Error joining room:', error);
      this.onError?.(error as Error);
    }
  }

  async leaveRoom(): Promise<void> {
    console.log('[NewVoiceChatManager] Leaving room');
    this.connectionState = ConnectionState.Disconnected;
    this.participants = [];
    this.localParticipant = null;
    this.audioLevels.clear();
    this.onConnectionStateChanged?.(this.connectionState);
    this.onParticipantsChanged?.(this.participants);
  }

  async toggleMuteSelf(): Promise<boolean | undefined> {
    console.log('[NewVoiceChatManager] Toggling mute');
    // Mock implementation - return current mute state
    return false;
  }

  async moderateMuteParticipant(targetIdentity: string, mute: boolean): Promise<boolean> {
    console.log('[NewVoiceChatManager] Moderating participant:', targetIdentity, 'mute:', mute);
    // Mock implementation - return success
    return true;
  }

  getAudioLevel(participantId: string): number {
    return this.audioLevels.get(participantId) || 0;
  }

  dispose(): void {
    console.log('[NewVoiceChatManager] Disposing');
    this.leaveRoom();
    this.onParticipantsChanged = null;
    this.onConnectionStateChanged = null;
    this.onError = null;
    this.onAudioLevelChanged = null;
  }
}

export default NewVoiceChatManager;
