import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VoiceRoomDetails {
  id: string;
  name: string;
  max_participants?: number;
  is_active?: boolean;
  match_id?: string;
}

export class NewVoiceChatManager {
  private static instance: NewVoiceChatManager;
  private rooms: VoiceRoomDetails[] = [];

  private constructor() {}

  static getInstance(): NewVoiceChatManager {
    if (!NewVoiceChatManager.instance) {
      NewVoiceChatManager.instance = new NewVoiceChatManager();
    }
    return NewVoiceChatManager.instance;
  }

  async getAllRooms(): Promise<VoiceRoomDetails[]> {
    try {
      const { data, error } = await supabase
        .from('voice_rooms')
        .select('id, name, max_participants, is_active, match_id');

      if (error) throw error;

      this.rooms = data.map(room => ({
        id: room.id,
        name: room.name,
        max_participants: room.max_participants || undefined,
        is_active: room.is_active || undefined,
        match_id: room.match_id || undefined
      }));

      return this.rooms;
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch voice rooms');
      return [];
    }
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
}

export default NewVoiceChatManager;
