// src/components/admin/VoiceCollaborationManager.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceRoom, VoiceRoomService } from '@/services/voiceRoomService';
import { toast } from 'sonner';

export const VoiceCollaborationManager: React.FC = () => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [voiceRooms, setVoiceRooms] = useState<VoiceRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRoomsForMatch = async () => {
      if (selectedMatchId) {
        setLoading(true);
        try {
          const rooms = await VoiceRoomService.getVoiceRoomsForMatch(selectedMatchId);
          setVoiceRooms(rooms);
        } catch (error) {
          console.error('Error loading voice rooms:', error);
          toast.error('Failed to load voice rooms');
        } finally {
          setLoading(false);
        }
      }
    };

    loadRoomsForMatch();
  }, [selectedMatchId]);

  const handleMatchIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMatchId(e.target.value);
  };

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRoomName(e.target.value);
  };

  const handleCreateRoom = async (room: Omit<VoiceRoom, 'id'>) => {
    if (!selectedMatchId) return;

    try {
      const newRoom = await VoiceRoomService.createVoiceRoom({
        ...room,
        match_id: selectedMatchId
      });
      setVoiceRooms(prev => [...prev, newRoom]);
      toast.success('Voice room created successfully');
    } catch (error) {
      console.error('Error creating voice room:', error);
      toast.error('Failed to create voice room');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await VoiceRoomService.deleteVoiceRoom(roomId);
      setVoiceRooms(prev => prev.filter((p: VoiceRoom) => p.id !== roomId));
      toast.success('Voice room deleted successfully');
    } catch (error) {
      console.error('Error deleting voice room:', error);
      toast.error('Failed to delete voice room');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Collaboration Manager</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="matchId">Match ID</Label>
          <Input id="matchId" placeholder="Enter Match ID" value={selectedMatchId || ''} onChange={handleMatchIdChange} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="newRoomName">New Room Name</Label>
          <Input
            type="text"
            id="newRoomName"
            placeholder="Enter room name"
            value={newRoomName}
            onChange={handleRoomNameChange}
          />
          <Button
            onClick={() => handleCreateRoom({ name: newRoomName })}
            disabled={!selectedMatchId || !newRoomName}
          >
            Create Room
          </Button>
        </div>

        <div>
          {loading ? (
            <div>Loading voice rooms...</div>
          ) : (
            <ul>
              {voiceRooms.map((room) => (
                <li key={room.id} className="flex items-center justify-between py-2">
                  {room.name}
                  <Button variant="outline" size="sm" onClick={() => handleDeleteRoom(room.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
