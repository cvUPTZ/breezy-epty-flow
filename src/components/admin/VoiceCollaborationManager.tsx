
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Activity } from 'lucide-react';
import NewVoiceChatManager, { VoiceRoomDetails } from '@/services/NewVoiceChatManager';

export const VoiceCollaborationManager: React.FC = () => {
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

  const handleRoomAction = (room: VoiceRoomDetails) => {
    console.log('Room action for:', room.name);
  };

  const getParticipantCount = (room: VoiceRoomDetails) => {
    return room.max_participants || 0;
  };

  if (loading) {
    return <div className="text-center">Loading voice rooms...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Voice Collaboration Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4" />
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-sm text-gray-500">
                      Participants: {getParticipantCount(room)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={room.is_active ? 'default' : 'secondary'}>
                    {room.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoomAction(room)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCollaborationManager;
