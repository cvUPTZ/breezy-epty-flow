
import { useState, useEffect } from 'react';
import NewVoiceChatManager, { VoiceRoomDetails } from '@/services/NewVoiceChatManager';

export const useNewVoiceCollaboration = () => {
  const [rooms, setRooms] = useState<VoiceRoomDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      const manager = NewVoiceChatManager.getInstance();
      const roomData = await manager.getAllRooms();
      setRooms(roomData);
      setLoading(false);
    };

    loadRooms();
  }, []);

  return { rooms, loading };
};
