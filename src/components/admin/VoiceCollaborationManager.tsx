<<<<<<< HEAD
=======

>>>>>>> remotes/origin/feature/four-tracker-system
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
<<<<<<< HEAD
import { Mic, MicOff, Users, Settings, Phone, PhoneOff, Loader2, AlertTriangle } from 'lucide-react';
=======
import { Mic, MicOff, Users, Settings, Phone, PhoneOff } from 'lucide-react';
>>>>>>> remotes/origin/feature/four-tracker-system

interface VoiceRoom {
  id: string;
  name: string;
  description?: string;
  match_id?: string;
<<<<<<< HEAD
  is_active: boolean;
  is_private: boolean;
  max_participants: number;
  permissions?: string[];
  priority: number;
=======
  is_active?: boolean;
  is_private?: boolean;
  max_participants?: number;
  permissions?: string[];
  priority?: number;
>>>>>>> remotes/origin/feature/four-tracker-system
  created_at?: string;
  updated_at?: string;
}

interface Participant {
  id: string;
  user_id: string;
  room_id?: string;
  user_role: string;
<<<<<<< HEAD
  is_muted: boolean;
  is_speaking: boolean;
  connection_quality: string;
=======
  is_muted?: boolean;
  is_speaking?: boolean;
  connection_quality?: string;
>>>>>>> remotes/origin/feature/four-tracker-system
  joined_at?: string;
  last_activity?: string;
  user_name?: string;
  user_email?: string;
<<<<<<< HEAD
=======
  profiles?: any;
>>>>>>> remotes/origin/feature/four-tracker-system
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
<<<<<<< HEAD
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(true);
  const [fetchingParticipants, setFetchingParticipants] = useState(false);
=======
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
>>>>>>> remotes/origin/feature/four-tracker-system
  const { toast } = useToast();

  useEffect(() => {
    fetchVoiceRooms();
    fetchMatches();
  }, []);

  const fetchVoiceRooms = async () => {
<<<<<<< HEAD
    setFetchingRooms(true);
=======
>>>>>>> remotes/origin/feature/four-tracker-system
    try {
      const { data, error } = await supabase
        .from('voice_rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

<<<<<<< HEAD
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
=======
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
>>>>>>> remotes/origin/feature/four-tracker-system
      }));

      setVoiceRooms(transformedData);
    } catch (error: any) {
      console.error('Error fetching voice rooms:', error);
      toast({
        title: "Error",
<<<<<<< HEAD
        description: error.message || "Failed to fetch voice rooms",
        variant: "destructive"
      });
    } finally {
      setFetchingRooms(false);
=======
        description: "Failed to fetch voice rooms",
        variant: "destructive"
      });
>>>>>>> remotes/origin/feature/four-tracker-system
    }
  };

  const fetchParticipants = async (roomId: string) => {
<<<<<<< HEAD
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
=======
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

      // Transform the data to match our Participant interface, handling null values properly
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
        user_name: participant.profiles?.full_name || undefined,
        user_email: participant.profiles?.email || undefined,
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
>>>>>>> remotes/origin/feature/four-tracker-system
    }
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, name, home_team_name, away_team_name, status, match_date')
        .order('match_date', { ascending: false });

      if (error) throw error;

<<<<<<< HEAD
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
=======
      // Transform the data to match our Match interface
      const transformedData: Match[] = (data || []).map(match => ({
        id: match.id,
        name: match.name || undefined,
        home_team_name: match.home_team_name,
        away_team_name: match.away_team_name,
        status: match.status,
        match_date: match.match_date || undefined
>>>>>>> remotes/origin/feature/four-tracker-system
      }));

      setMatches(transformedData);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
<<<<<<< HEAD
        description: error.message || "Failed to fetch matches",
=======
        description: "Failed to fetch matches",
>>>>>>> remotes/origin/feature/four-tracker-system
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
<<<<<<< HEAD
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
=======
      const { error } = await supabase
        .from('voice_rooms')
        .insert({
          name: newRoomName,
          match_id: selectedMatch || null,
          is_active: true,
          is_private: false,
          max_participants: 25
        });
>>>>>>> remotes/origin/feature/four-tracker-system

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voice room created successfully"
      });

      setNewRoomName('');
<<<<<<< HEAD
      setSelectedMatch('');
=======
>>>>>>> remotes/origin/feature/four-tracker-system
      fetchVoiceRooms();
    } catch (error: any) {
      console.error('Error creating voice room:', error);
      toast({
        title: "Error",
<<<<<<< HEAD
        description: error.message || "Failed to create voice room",
=======
        description: "Failed to create voice room",
>>>>>>> remotes/origin/feature/four-tracker-system
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteVoiceRoom = async (roomId: string) => {
<<<<<<< HEAD
    if (!confirm('Are you sure you want to delete this voice room? All participants will be removed.')) {
      return;
    }

=======
>>>>>>> remotes/origin/feature/four-tracker-system
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

<<<<<<< HEAD
      if (selectedRoomId === roomId) {
        setParticipants([]);
        setSelectedRoomId('');
      }

=======
>>>>>>> remotes/origin/feature/four-tracker-system
      fetchVoiceRooms();
    } catch (error: any) {
      console.error('Error deleting voice room:', error);
      toast({
        title: "Error",
<<<<<<< HEAD
        description: error.message || "Failed to delete voice room",
=======
        description: "Failed to delete voice room",
>>>>>>> remotes/origin/feature/four-tracker-system
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
<<<<<<< HEAD
        description: error.message || "Failed to update voice room",
=======
        description: "Failed to update voice room",
>>>>>>> remotes/origin/feature/four-tracker-system
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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

=======
>>>>>>> remotes/origin/feature/four-tracker-system
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
<<<<<<< HEAD
              <TabsTrigger value="participants">
                Participants
                {participants.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {participants.length}
                  </Badge>
                )}
              </TabsTrigger>
=======
              <TabsTrigger value="participants">Participants</TabsTrigger>
>>>>>>> remotes/origin/feature/four-tracker-system
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="space-y-4">
              {/* Create New Room */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Voice Room</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
<<<<<<< HEAD
                  <div className="grid gap-4 md:grid-cols-3">
=======
                  <div className="flex gap-4">
>>>>>>> remotes/origin/feature/four-tracker-system
                    <Input
                      placeholder="Room name"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
<<<<<<< HEAD
                      className="md:col-span-1"
                      disabled={loading}
=======
                      className="flex-1"
>>>>>>> remotes/origin/feature/four-tracker-system
                    />
                    <select
                      value={selectedMatch}
                      onChange={(e) => setSelectedMatch(e.target.value)}
<<<<<<< HEAD
                      className="px-3 py-2 border rounded-md md:col-span-1"
                      disabled={loading}
=======
                      className="px-3 py-2 border rounded-md"
>>>>>>> remotes/origin/feature/four-tracker-system
                    >
                      <option value="">Select Match (Optional)</option>
                      {matches.map((match) => (
                        <option key={match.id} value={match.id}>
                          {match.name || `${match.home_team_name} vs ${match.away_team_name}`}
                        </option>
                      ))}
                    </select>
<<<<<<< HEAD
                    <Button onClick={createVoiceRoom} disabled={loading} className="md:col-span-1">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Create Room'
                      )}
=======
                    <Button onClick={createVoiceRoom} disabled={loading}>
                      Create Room
>>>>>>> remotes/origin/feature/four-tracker-system
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Voice Rooms */}
              <div className="grid gap-4">
<<<<<<< HEAD
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
=======
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
>>>>>>> remotes/origin/feature/four-tracker-system
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <Card>
                <CardHeader>
<<<<<<< HEAD
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
=======
                  <CardTitle>Active Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  {participants.length === 0 ? (
                    <p className="text-muted-foreground">Select a room to view participants</p>
>>>>>>> remotes/origin/feature/four-tracker-system
                  ) : (
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
<<<<<<< HEAD
                            <p className="font-medium">{participant.user_name || participant.user_email || 'Unknown User'}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{participant.user_role}</Badge>
                              <Badge variant={participant.connection_quality === 'good' ? 'default' : 'destructive'}>
                                {participant.connection_quality}
=======
                            <p className="font-medium">{participant.user_name || participant.user_email}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{participant.user_role}</Badge>
                              <Badge variant={participant.connection_quality === 'good' ? 'default' : 'destructive'}>
                                {participant.connection_quality || 'unknown'}
>>>>>>> remotes/origin/feature/four-tracker-system
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
