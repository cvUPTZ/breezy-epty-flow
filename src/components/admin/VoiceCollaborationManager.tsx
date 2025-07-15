
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, MicOff, Users, Settings, Volume2, VolumeX, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VoiceRoom {
  id: string;
  name: string;
  match_id?: string;
  is_active: boolean;
  is_private: boolean;
  max_participants: number;
  description?: string;
  priority: number;
  permissions: string[];
  created_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  room_id: string;
  user_role: string;
  is_muted: boolean;
  is_speaking: boolean;
  connection_quality: string;
  joined_at: string;
  last_activity: string;
  user_name?: string;
  user_email?: string;
}

interface Match {
  id: string;
  name?: string;
  home_team_name: string;
  away_team_name: string;
  status: string;
  match_date?: string;
}

export const VoiceCollaborationManager: React.FC = () => {
  const [voiceRooms, setVoiceRooms] = useState<VoiceRoom[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomMaxParticipants, setNewRoomMaxParticipants] = useState(25);
  const [selectedRoom, setSelectedRoom] = useState<string>('');

  useEffect(() => {
    fetchData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchVoiceRooms(),
        fetchParticipants(),
        fetchMatches()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load voice collaboration data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVoiceRooms = async () => {
    const { data, error } = await supabase
      .from('voice_rooms')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching voice rooms:', error);
      return;
    }

    setVoiceRooms(data || []);
  };

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from('voice_room_participants')
      .select(`
        *,
        profiles!voice_room_participants_user_id_fkey (
          full_name,
          email
        )
      `);

    if (error) {
      console.error('Error fetching participants:', error);
      return;
    }

    const processedParticipants = data?.map(p => ({
      ...p,
      user_name: (p.profiles as any)?.full_name || 'Unknown',
      user_email: (p.profiles as any)?.email || 'No email'
    })) || [];

    setParticipants(processedParticipants);
  };

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('id, name, home_team_name, away_team_name, status, match_date')
      .in('status', ['draft', 'published', 'live'])
      .order('match_date', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    setMatches(data || []);
  };

  const setupRealtimeSubscriptions = () => {
    const roomsChannel = supabase
      .channel('voice_rooms_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voice_rooms' }, () => {
        fetchVoiceRooms();
      })
      .subscribe();

    const participantsChannel = supabase
      .channel('participants_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voice_room_participants' }, () => {
        fetchParticipants();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(participantsChannel);
    };
  };

  const createVoiceRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error('Room name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('voice_rooms')
        .insert({
          name: newRoomName,
          description: newRoomDescription || null,
          match_id: selectedMatch || null,
          max_participants: newRoomMaxParticipants,
          is_active: true,
          is_private: false,
          priority: 1,
          permissions: ['speak', 'listen']
        });

      if (error) throw error;

      toast.success('Voice room created successfully');
      setNewRoomName('');
      setNewRoomDescription('');
      setSelectedMatch('');
      setNewRoomMaxParticipants(25);
      fetchVoiceRooms();
    } catch (error: any) {
      console.error('Error creating voice room:', error);
      toast.error('Failed to create voice room');
    }
  };

  const deleteVoiceRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this voice room?')) return;

    try {
      const { error } = await supabase
        .from('voice_rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      toast.success('Voice room deleted successfully');
      fetchVoiceRooms();
    } catch (error: any) {
      console.error('Error deleting voice room:', error);
      toast.error('Failed to delete voice room');
    }
  };

  const toggleRoomStatus = async (roomId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('voice_rooms')
        .update({ is_active: !currentStatus })
        .eq('id', roomId);

      if (error) throw error;

      toast.success(`Room ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchVoiceRooms();
    } catch (error: any) {
      console.error('Error toggling room status:', error);
      toast.error('Failed to toggle room status');
    }
  };

  const removeParticipant = async (participantId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return;

    try {
      const { error } = await supabase
        .from('voice_room_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      toast.success('Participant removed successfully');
      fetchParticipants();
    } catch (error: any) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
    }
  };

  const muteParticipant = async (participantId: string, currentMuteStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('voice_room_participants')
        .update({ is_muted: !currentMuteStatus })
        .eq('id', participantId);

      if (error) throw error;

      toast.success(`Participant ${!currentMuteStatus ? 'muted' : 'unmuted'} successfully`);
      fetchParticipants();
    } catch (error: any) {
      console.error('Error muting participant:', error);
      toast.error('Failed to mute participant');
    }
  };

  const getRoomParticipants = (roomId: string) => {
    return participants.filter(p => p.room_id === roomId);
  };

  const getMatchName = (matchId?: string) => {
    if (!matchId) return 'No match assigned';
    const match = matches.find(m => m.id === matchId);
    return match ? `${match.home_team_name} vs ${match.away_team_name}` : 'Unknown match';
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading voice collaboration data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Collaboration Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rooms" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rooms">Voice Rooms</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="create">Create Room</TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="space-y-4">
              <div className="grid gap-4">
                {voiceRooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No voice rooms found. Create one to get started.
                  </div>
                ) : (
                  voiceRooms.map((room) => (
                    <Card key={room.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{room.name}</h3>
                            <Badge variant={room.is_active ? "default" : "secondary"}>
                              {room.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {room.is_private && (
                              <Badge variant="outline">Private</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleRoomStatus(room.id, room.is_active)}
                            >
                              {room.is_active ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                              {room.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteVoiceRoom(room.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Match:</strong> {getMatchName(room.match_id)}</p>
                          <p><strong>Description:</strong> {room.description || 'No description'}</p>
                          <p><strong>Max Participants:</strong> {room.max_participants}</p>
                          <p><strong>Current Participants:</strong> {getRoomParticipants(room.id).length}</p>
                          <p><strong>Priority:</strong> {room.priority}</p>
                          <p><strong>Created:</strong> {new Date(room.created_at).toLocaleDateString()}</p>
                        </div>

                        {getRoomParticipants(room.id).length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Active Participants:</h4>
                            <div className="space-y-2">
                              {getRoomParticipants(room.id).map((participant) => (
                                <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${getConnectionQualityColor(participant.connection_quality)}`} />
                                    <div>
                                      <p className="font-medium">{participant.user_name}</p>
                                      <p className="text-xs text-gray-500">{participant.user_email}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {participant.user_role}
                                    </Badge>
                                    {participant.is_muted && <MicOff className="h-4 w-4 text-red-500" />}
                                    {participant.is_speaking && <Mic className="h-4 w-4 text-green-500" />}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => muteParticipant(participant.id, participant.is_muted)}
                                    >
                                      {participant.is_muted ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeParticipant(participant.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <div className="grid gap-4">
                {participants.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active participants in any voice rooms.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participants.map((participant) => {
                      const room = voiceRooms.find(r => r.id === participant.room_id);
                      return (
                        <Card key={participant.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${getConnectionQualityColor(participant.connection_quality)}`} />
                                <div>
                                  <p className="font-medium">{participant.user_name}</p>
                                  <p className="text-sm text-gray-500">{participant.user_email}</p>
                                  <p className="text-xs text-gray-400">
                                    Room: {room?.name || 'Unknown'} | 
                                    Role: {participant.user_role} | 
                                    Joined: {new Date(participant.joined_at).toLocaleString()}
                                  </p>
                                </div>
                                {participant.is_muted && <MicOff className="h-4 w-4 text-red-500" />}
                                {participant.is_speaking && <Mic className="h-4 w-4 text-green-500" />}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getConnectionQualityColor(participant.connection_quality)}>
                                  {participant.connection_quality}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => muteParticipant(participant.id, participant.is_muted)}
                                >
                                  {participant.is_muted ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeParticipant(participant.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Voice Room
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="room-name">Room Name *</Label>
                      <Input
                        id="room-name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="Enter room name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-participants">Max Participants</Label>
                      <Input
                        id="max-participants"
                        type="number"
                        value={newRoomMaxParticipants}
                        onChange={(e) => setNewRoomMaxParticipants(parseInt(e.target.value) || 25)}
                        min="2"
                        max="50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="room-description">Description</Label>
                    <Input
                      id="room-description"
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      placeholder="Optional room description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="match-select">Associated Match (Optional)</Label>
                    <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a match" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No match</SelectItem>
                        {matches.map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.home_team_name} vs {match.away_team_name} ({match.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={createVoiceRoom} className="w-full">
                    Create Voice Room
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCollaborationManager;
