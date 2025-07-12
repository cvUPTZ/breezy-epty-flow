import { supabase } from '@/integrations/supabase/client';

interface VoiceRoomDetails {
  id: string;
  name: string;
  max_participants?: number;
}

class NewVoiceChatManager {
  private static instance: NewVoiceChatManager;

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
}

export default NewVoiceChatManager;
