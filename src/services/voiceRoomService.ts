
import { supabase } from '@/integrations/supabase/client';

export interface VoiceRoom {
  id: string;
  name: string;
  description?: string;
  max_participants?: number;
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

    return (data || []).map(room => ({
      ...room,
      description: room.description || undefined,
      max_participants: room.max_participants || undefined,
      priority: room.priority || undefined,
      permissions: room.permissions || undefined,
      is_private: room.is_private || undefined,
      is_active: room.is_active || undefined,
      match_id: room.match_id || undefined,
      created_at: room.created_at || undefined,
      updated_at: room.updated_at || undefined,
    }));
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

    if (!data) return null;

    return {
      ...data,
      description: data.description || undefined,
      max_participants: data.max_participants || undefined,
      priority: data.priority || undefined,
      permissions: data.permissions || undefined,
      is_private: data.is_private || undefined,
      is_active: data.is_active || undefined,
      match_id: data.match_id || undefined,
      created_at: data.created_at || undefined,
      updated_at: data.updated_at || undefined,
    };
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

    return {
      ...data,
      description: data.description || undefined,
      max_participants: data.max_participants || undefined,
      priority: data.priority || undefined,
      permissions: data.permissions || undefined,
      is_private: data.is_private || undefined,
      is_active: data.is_active || undefined,
      match_id: data.match_id || undefined,
      created_at: data.created_at || undefined,
      updated_at: data.updated_at || undefined,
    };
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

    if (!data) return null;

    return {
      ...data,
      description: data.description || undefined,
      max_participants: data.max_participants || undefined,
      priority: data.priority || undefined,
      permissions: data.permissions || undefined,
      is_private: data.is_private || undefined,
      is_active: data.is_active || undefined,
      match_id: data.match_id || undefined,
      created_at: data.created_at || undefined,
      updated_at: data.updated_at || undefined,
    };
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
