import { supabase } from '@/integrations/supabase/client';

export interface VoiceRoom {
  id: string;
  name: string;
  description?: string;
  max_participants?: number; // Changed from number to number | undefined
  priority?: number;
  permissions?: string[];
  is_private?: boolean;
  is_active?: boolean;
  match_id?: string;
  created_at?: string;
  updated_at?: string;
}

export class VoiceRoomService {
  static async getVoiceRoomsForMatch(matchId: string): Promise<VoiceRoom[]> {
    const { data, error } = await supabase
      .from('voice_rooms')
      .select('*')
      .eq('match_id', matchId)
      .order('priority', { ascending: true });

    if (error) {
      console.error("Error fetching voice rooms:", error);
      throw new Error(`Failed to fetch voice rooms: ${error.message}`);
    }

    return data || [];
  }

  static async getVoiceRoomById(roomId: string): Promise<VoiceRoom | null> {
    const { data, error } = await supabase
      .from('voice_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      console.error("Error fetching voice room by ID:", error);
      return null;
    }

    return data || null;
  }

  static async createVoiceRoom(roomData: Omit<VoiceRoom, 'id' | 'created_at' | 'updated_at'>): Promise<VoiceRoom> {
    const { data, error } = await supabase
      .from('voice_rooms')
      .insert([roomData])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating voice room:", error);
      throw new Error(`Failed to create voice room: ${error.message}`);
    }

    return data;
  }

  static async updateVoiceRoom(roomId: string, updates: Partial<VoiceRoom>): Promise<VoiceRoom | null> {
    const { data, error } = await supabase
      .from('voice_rooms')
      .update(updates)
      .eq('id', roomId)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating voice room:", error);
      return null;
    }

    return data || null;
  }

  static async deleteVoiceRoom(roomId: string): Promise<boolean> {
    const { error } = await supabase
      .from('voice_rooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      console.error("Error deleting voice room:", error);
      return false;
    }

    return true;
  }
}
