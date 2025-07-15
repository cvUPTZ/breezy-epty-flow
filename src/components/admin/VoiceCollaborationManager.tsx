import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Users, Settings, Phone, PhoneOff } from 'lucide-react';

interface VoiceRoom {
  id: string;
  name: string;
  description?: string;
  match_id?: string;
  is_active?: boolean;
  is_private?: boolean;
  max_participants?: number;
  permissions?: string[];
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

interface Participant {
  id: string;
  user_id: string;
  room_id?: string;
  user_role: string;
  is_muted?: boolean;
  is_speaking?: boolean;
  connection_quality?: string;
  joined_at?: string;
  last_activity?: string;
  user_name?: string;
  user_email?: string;
  profiles?: any;
}

interface Match {
  id: string;
  name?: string;
  home_team_name: string;
  away_team_name: string;
  status: string;
  match_date?: string;
}

const VoiceCollaborationManager: React.FC = () => {
  const [voiceRooms, setVoiceRooms] = useState<VoiceRoom[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVoiceRooms();
    fetchMatches();
  }, []);

  const fetchVoiceRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our VoiceRoom interface
      const transformedData: VoiceRoom[] = (data || []).map(room => ({
        id: room.id,
        name: room.name,
        description: room.description || undefined,
        match_id: room.match_id || undefined,
        is_active: room.is_active || undefined,
        is_private: room.is_private || undefined,
        max_participants: room.max_participants || undefined,
        permissions: room.permissions || undefined,
        priority: room.priority || undefined,
        created_at: room.created_at || undefined,
        updated_at: room.updated_at || undefined
      }));

      setVoiceRooms(transformedData);
    } catch (error: any) {
      console.error('Error fetching voice rooms:', error);
      toast({
        title: "Error",
        description: "Failed to fetch voice rooms",
        variant: "destructive"
      });
    }
  };

  const fetchParticipants = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('voice_room_participants')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('room_id', roomId);

      if (error) throw error;

      // Transform the data to match our Participant interface
      const transformedData: Participant[] = (data || []).map(participant => ({
        id: participant.id,
        user_id: participant.user_id || '',
        room_id: participant.room_id || undefined,
        user_role: participant.user_role,
        is_muted: participant.is_muted || undefined,
        is_speaking: participant.is_speaking || undefined,
        connection_quality: participant.connection_quality || undefined,
        joined_at: participant.joined_at || undefined,
        last_activity: participant.last_activity || undefined,
        user_name: participant.profiles?.full_name,
        user_email: participant.profiles?.email,
        profiles: participant.profiles
      }));

      setParticipants(transformedData);
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch participants",
        variant: "destructive"
      });
    }
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, name, home_team_name, away_team_name, status, match_date')
        .order('match_date', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Match interface
      const transformedData: Match[] = (data || []).map(match => ({
        id: match.id,
        name: match.name || undefined,
        home_team_name: match.home_team_name,
        away_team_name: match.away_team_name,
        status: match.status,
        match_date: match.match_date || undefined
      }));

      setMatches(transformedData);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive"
      });
    }
  };

  const createVoiceRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('voice_rooms')
        .insert({
          name: newRoomName,
          match_id: selectedMatch || null,
          is_active: true,
          is_private: false,
          max_participants: 25
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voice room created successfully"
      });

      setNewRoomName('');
      fetchVoiceRooms();
    } catch (error: any) {
      console.error('Error creating voice room:', error);
      toast({
        title: "Error",
        description: "Failed to create voice room",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteVoiceRoom = async (roomId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('voice_rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voice room deleted successfully"
      });

      fetchVoiceRooms();
    } catch (error: any) {
      console.error('Error deleting voice room:', error);
      toast({
        title: "Error",
        description: "Failed to delete voice room",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRoomStatus = async (roomId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('voice_rooms')
        .update({ is_active: !currentStatus })
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Voice room ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      fetchVoiceRooms();
    } catch (error: any) {
      console.error('Error updating voice room:', error);
      toast({
        title: "Error",
        description: "Failed to update voice room",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
            <TabsList>
              <TabsTrigger value="rooms">Voice Rooms</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="space-y-4">
              {/* Create New Room */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Voice Room</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Room name"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="flex-1"
                    />
                    <select
                      value={selectedMatch}
                      onChange={(e) => setSelectedMatch(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="">Select Match (Optional)</option>
                      {matches.map((match) => (
                        <option key={match.id} value={match.id}>
                          {match.name || `${match.home_team_name} vs ${match.away_team_name}`}
                        </option>
                      ))}
                    </select>
                    <Button onClick={createVoiceRoom} disabled={loading}>
                      Create Room
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Voice Rooms */}
              <div className="grid gap-4">
                {voiceRooms.map((room) => (
                  <Card key={room.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{room.name}</h3>
                            <Badge variant={room.is_active ? "default" : "secondary"}>
                              {room.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {room.match_id && (
                              <Badge variant="outline">
                                Match: {matches.find(m => m.id === room.match_id)?.name || 'Unknown'}
                              </Badge>
                            )}
                          </div>
                          {room.description && (
                            <p className="text-sm text-muted-foreground">{room.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Max: {room.max_participants || 25}
                            </span>
                            <span>Priority: {room.priority || 1}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchParticipants(room.id)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRoomStatus(room.id, room.is_active || false)}
                          >
                            {room.is_active ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteVoiceRoom(room.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  {participants.length === 0 ? (
                    <p className="text-muted-foreground">Select a room to view participants</p>
                  ) : (
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">{participant.user_name || participant.user_email}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{participant.user_role}</Badge>
                              <Badge variant={participant.connection_quality === 'good' ? 'default' : 'destructive'}>
                                {participant.connection_quality || 'unknown'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {participant.is_muted ? (
                              <MicOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Mic className="h-4 w-4 text-green-500" />
                            )}
                            {participant.is_speaking && (
                              <Badge className="bg-green-500">Speaking</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Voice Collaboration Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Room Settings</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Max Participants</label>
                          <Input type="number" defaultValue="25" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Default Priority</label>
                          <Input type="number" defaultValue="1" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Permissions</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Allow tracker mute/unmute</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Allow admin room control</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span className="text-sm">Recording enabled</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Auto-assign by match</span>
                        </label>
                      </div>
                    </div>
                  </div>
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
