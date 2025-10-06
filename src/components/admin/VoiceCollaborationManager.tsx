import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Users, Settings, Phone, PhoneOff, Loader2, AlertTriangle } from 'lucide-react';

interface VoiceRoom {
  id: string;
  name: string;
  description?: string;
  match_id?: string;
  is_active: boolean;
  is_private: boolean;
  max_participants: number;
  permissions?: string[];
  priority: number;
  created_at?: string;
  updated_at?: string;
}

interface Participant {
  id: string;
  user_id: string;
  room_id?: string;
  user_role: string;
  is_muted: boolean;
  is_speaking: boolean;
  connection_quality: string;
  joined_at?: string;
  last_activity?: string;
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

const VoiceCollaborationManager: React.FC = () => {
  const [voiceRooms, setVoiceRooms] = useState<VoiceRoom[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(true);
  const [fetchingParticipants, setFetchingParticipants] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVoiceRooms();
    fetchMatches();
  }, []);

  const fetchVoiceRooms = async () => {
    setFetchingRooms(true);
    try {
      const { data, error } = await supabase
        .from('voice_rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data) {
        setVoiceRooms([]);
        return;
      }

      const transformedData: VoiceRoom[] = data.map(room => ({
        id: room.id,
        name: room.name || 'Unnamed Room',
        description: room.description ?? undefined,
        match_id: room.match_id ?? undefined,
        is_active: room.is_active ?? true,
        is_private: room.is_private ?? false,
        max_participants: room.max_participants ?? 25,
        permissions: room.permissions ?? undefined,
        priority: room.priority ?? 1,
        created_at: room.created_at ?? undefined,
        updated_at: room.updated_at ?? undefined
      }));

      setVoiceRooms(transformedData);
    } catch (error: any) {
      console.error('Error fetching voice rooms:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch voice rooms",
        variant: "destructive"
      });
    } finally {
      setFetchingRooms(false);
    }
  };

  const fetchParticipants = async (roomId: string) => {
    setFetchingParticipants(true);
    setSelectedRoomId(roomId);

    try {
      // Fetch participants without nested join to avoid RLS recursion
      const { data: participantsData, error: participantsError } = await supabase
        .from('voice_room_participants')
        .select('id, user_id, room_id, user_role, is_muted, is_speaking, connection_quality, joined_at, last_activity')
        .eq('room_id', roomId);

      if (participantsError) throw participantsError;

      if (!participantsData || participantsData.length === 0) {
        setParticipants([]);
        toast({
          title: "Info",
          description: "No participants in this room",
        });
        return;
      }

      // Fetch profiles separately to avoid recursion issues
      const userIds = participantsData.map(p => p.user_id).filter((id): id is string => id !== null);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError);
      }

      // Create a map of profiles for easy lookup
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Transform the data
      const transformedData: Participant[] = participantsData
        .filter(participant => participant.user_id && participant.room_id) // Filter out nulls
        .map(participant => ({
          id: participant.id,
          user_id: participant.user_id!,
          room_id: participant.room_id!,
          user_role: participant.user_role || 'viewer',
          is_muted: participant.is_muted ?? false,
          is_speaking: participant.is_speaking ?? false,
          connection_quality: participant.connection_quality || 'unknown',
          joined_at: participant.joined_at ?? undefined,
          last_activity: participant.last_activity ?? undefined,
          user_name: profilesMap.get(participant.user_id!)?.full_name ?? undefined,
          user_email: profilesMap.get(participant.user_id!)?.email ?? undefined,
        }));

      setParticipants(transformedData);

      toast({
        title: "Success",
        description: `Loaded ${transformedData.length} participant(s)`,
      });
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch participants",
        variant: "destructive"
      });
    } finally {
      setFetchingParticipants(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, name, home_team_name, away_team_name, status, match_date')
        .order('match_date', { ascending: false });

      if (error) throw error;

      if (!data) {
        setMatches([]);
        return;
      }

      const transformedData: Match[] = data.map(match => ({
        id: match.id,
        name: match.name ?? undefined,
        home_team_name: match.home_team_name || 'Home Team',
        away_team_name: match.away_team_name || 'Away Team',
        status: match.status || 'scheduled',
        match_date: match.match_date ?? undefined
      }));

      setMatches(transformedData);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch matches",
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
      const roomData: any = {
        name: newRoomName.trim(),
        is_active: true,
        is_private: false,
        max_participants: 25
      };

      if (selectedMatch) {
        roomData.match_id = selectedMatch;
      }

      const { error } = await supabase
        .from('voice_rooms')
        .insert(roomData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voice room created successfully"
      });

      setNewRoomName('');
      setSelectedMatch('');
      fetchVoiceRooms();
    } catch (error: any) {
      console.error('Error creating voice room:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create voice room",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteVoiceRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this voice room? All participants will be removed.')) {
      return;
    }

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

      if (selectedRoomId === roomId) {
        setParticipants([]);
        setSelectedRoomId('');
      }

      fetchVoiceRooms();
    } catch (error: any) {
      console.error('Error deleting voice room:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete voice room",
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
        description: error.message || "Failed to update voice room",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMatchDisplay = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return 'Unknown';
    return match.name || `${match.home_team_name} vs ${match.away_team_name}`;
  };

  if (fetchingRooms) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading voice rooms...</span>
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
            <TabsList>
              <TabsTrigger value="rooms">Voice Rooms</TabsTrigger>
              <TabsTrigger value="participants">
                Participants
                {participants.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {participants.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="space-y-4">
              {/* Create New Room */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Voice Room</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input
                      placeholder="Room name"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="md:col-span-1"
                      disabled={loading}
                    />
                    <select
                      value={selectedMatch}
                      onChange={(e) => setSelectedMatch(e.target.value)}
                      className="px-3 py-2 border rounded-md md:col-span-1"
                      disabled={loading}
                    >
                      <option value="">Select Match (Optional)</option>
                      {matches.map((match) => (
                        <option key={match.id} value={match.id}>
                          {match.name || `${match.home_team_name} vs ${match.away_team_name}`}
                        </option>
                      ))}
                    </select>
                    <Button onClick={createVoiceRoom} disabled={loading} className="md:col-span-1">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Create Room'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Voice Rooms */}
              <div className="grid gap-4">
                {voiceRooms.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No voice rooms found. Create your first room above.
                    </CardContent>
                  </Card>
                ) : (
                  voiceRooms.map((room) => (
                    <Card key={room.id} className={selectedRoomId === room.id ? 'border-blue-500 border-2' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{room.name}</h3>
                              <Badge variant={room.is_active ? "default" : "secondary"}>
                                {room.is_active ? "Active" : "Inactive"}
                              </Badge>
                              {room.match_id && (
                                <Badge variant="outline">
                                  Match: {getMatchDisplay(room.match_id)}
                                </Badge>
                              )}
                              {selectedRoomId === room.id && (
                                <Badge variant="outline" className="bg-blue-50">
                                  Viewing Participants
                                </Badge>
                              )}
                            </div>
                            {room.description && (
                              <p className="text-sm text-muted-foreground">{room.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Max: {room.max_participants}
                              </span>
                              <span>Priority: {room.priority}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchParticipants(room.id)}
                              disabled={loading || fetchingParticipants}
                              title="View participants"
                            >
                              {fetchingParticipants && selectedRoomId === room.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Users className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleRoomStatus(room.id, room.is_active)}
                              disabled={loading}
                              title={room.is_active ? "Deactivate room" : "Activate room"}
                            >
                              {room.is_active ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteVoiceRoom(room.id)}
                              disabled={loading}
                              title="Delete room"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedRoomId ? (
                      <>
                        Participants in {voiceRooms.find(r => r.id === selectedRoomId)?.name || 'Room'}
                      </>
                    ) : (
                      'Active Participants'
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fetchingParticipants ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading participants...</span>
                    </div>
                  ) : participants.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        {selectedRoomId ? 'No participants in this room' : 'Select a room to view participants'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">{participant.user_name || participant.user_email || 'Unknown User'}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{participant.user_role}</Badge>
                              <Badge variant={participant.connection_quality === 'good' ? 'default' : 'destructive'}>
                                {participant.connection_quality}
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
