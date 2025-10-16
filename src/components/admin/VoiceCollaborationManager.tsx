import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Users, Settings, Phone, PhoneOff, Loader2, AlertTriangle, Volume2 } from 'lucide-react';
import { NewVoiceChatManager } from '@/lib/NewVoiceChatManager';
import { ConnectionState } from 'livekit-client';

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

interface LiveParticipant {
  identity: string;
  name: string;
  isMuted: boolean;
  isSpeaking: boolean;
  isLocal: boolean;
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
  const [liveParticipants, setLiveParticipants] = useState<LiveParticipant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [isLocalMuted, setIsLocalMuted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  
  const { toast } = useToast();
  const voiceChatManager = NewVoiceChatManager.getInstance();

  useEffect(() => {
    initializeUser();
    fetchVoiceRooms();
    fetchMatches();
    setupVoiceChatCallbacks();

    return () => {
      // Cleanup on unmount
      if (currentRoomId) {
        voiceChatManager.leaveRoom();
      }
    };
  }, []);

  const initializeUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
        setCurrentUser({ id: user.id, name: userName });
        voiceChatManager.initialize(user.id);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  const setupVoiceChatCallbacks = () => {
    voiceChatManager.onConnectionStateChanged = (state, error) => {
      setConnectionState(state);
      
      if (state === ConnectionState.Connected) {
        toast({
          title: "Connected",
          description: "Successfully joined the voice room",
        });
      } else if (state === ConnectionState.Disconnected && error) {
        toast({
          title: "Disconnected",
          description: error.message,
          variant: "destructive"
        });
        setCurrentRoomId('');
        setLiveParticipants([]);
      }
    };

    voiceChatManager.onPeerStatusChanged = (peerId, status) => {
      if (status === 'connected') {
        updateLiveParticipants();
      } else if (status === 'disconnected') {
        setLiveParticipants(prev => prev.filter(p => p.identity !== peerId));
      }
    };

    voiceChatManager.onTrackMuteChanged = (peerId, source, isMuted) => {
      setLiveParticipants(prev => 
        prev.map(p => p.identity === peerId ? { ...p, isMuted } : p)
      );
    };

    voiceChatManager.onIsSpeakingChanged = (peerId, isSpeaking) => {
      setLiveParticipants(prev => 
        prev.map(p => p.identity === peerId ? { ...p, isSpeaking } : p)
      );
    };
  };

  const updateLiveParticipants = () => {
    const room = voiceChatManager.getRoom();
    if (!room) return;

    const participants: LiveParticipant[] = [];

    // Add local participant
    if (room.localParticipant) {
      const audioTrack = Array.from(room.localParticipant.audioTrackPublications.values())[0];
      participants.push({
        identity: room.localParticipant.identity,
        name: room.localParticipant.name || 'You',
        isMuted: audioTrack?.isMuted ?? false,
        isSpeaking: room.localParticipant.isSpeaking,
        isLocal: true
      });
    }

    // Add remote participants
    room.remoteParticipants.forEach(participant => {
      const audioTrack = Array.from(participant.audioTrackPublications.values())[0];
      participants.push({
        identity: participant.identity,
        name: participant.name || participant.identity,
        isMuted: audioTrack?.isMuted ?? false,
        isSpeaking: participant.isSpeaking,
        isLocal: false
      });
    });

    setLiveParticipants(participants);
  };

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

  const joinVoiceRoom = async (roomId: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await voiceChatManager.joinRoom(
        roomId,
        currentUser.id,
        'tracker', // or get from user profile
        currentUser.name
      );
      setCurrentRoomId(roomId);
      updateLiveParticipants();
    } catch (error: any) {
      console.error('Error joining voice room:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join voice room",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const leaveVoiceRoom = async () => {
    setLoading(true);
    try {
      await voiceChatManager.leaveRoom();
      setCurrentRoomId('');
      setLiveParticipants([]);
      toast({
        title: "Success",
        description: "Left voice room",
      });
    } catch (error: any) {
      console.error('Error leaving voice room:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to leave voice room",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = async () => {
    try {
      await voiceChatManager.setTrackEnabled(0, isLocalMuted); // 0 is Track.Source.Microphone
      setIsLocalMuted(!isLocalMuted);
    } catch (error: any) {
      console.error('Error toggling mute:', error);
      toast({
        title: "Error",
        description: "Failed to toggle mute",
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

      if (currentRoomId === roomId) {
        await leaveVoiceRoom();
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

  const getConnectionBadge = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return <Badge className="bg-green-500">Connected</Badge>;
      case ConnectionState.Connecting:
        return <Badge className="bg-yellow-500">Connecting...</Badge>;
      case ConnectionState.Reconnecting:
        return <Badge className="bg-orange-500">Reconnecting...</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Collaboration Manager
            </CardTitle>
            {getConnectionBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rooms" className="w-full">
            <TabsList>
              <TabsTrigger value="rooms">Voice Rooms</TabsTrigger>
              <TabsTrigger value="participants">
                Live Participants
                {liveParticipants.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {liveParticipants.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="space-y-4">
              {/* Current Room Status */}
              {currentRoomId && (
                <Card className="border-blue-500 border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">Currently In Room</h3>
                        <p className="text-sm text-muted-foreground">
                          {voiceRooms.find(r => r.id === currentRoomId)?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleMute}
                          disabled={connectionState !== ConnectionState.Connected}
                        >
                          {isLocalMuted ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={leaveVoiceRoom}
                          disabled={loading}
                        >
                          <PhoneOff className="h-4 w-4 mr-2" />
                          Leave
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                    <Card key={room.id} className={currentRoomId === room.id ? 'border-blue-500 border-2' : ''}>
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
                              {currentRoomId === room.id && (
                                <Badge variant="outline" className="bg-blue-50">
                                  You're Here
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
                            {currentRoomId === room.id ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={leaveVoiceRoom}
                                disabled={loading}
                              >
                                <PhoneOff className="h-4 w-4 mr-2" />
                                Leave
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => joinVoiceRoom(room.id)}
                                disabled={loading || !room.is_active || !!currentRoomId}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Join
                              </Button>
                            )}
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
                    {currentRoomId ? (
                      <>
                        Live Participants in {voiceRooms.find(r => r.id === currentRoomId)?.name || 'Room'}
                      </>
                    ) : (
                      'Live Participants'
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!currentRoomId ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Join a room to see live participants
                      </p>
                    </div>
                  ) : liveParticipants.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        No other participants in this room yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {liveParticipants.map((participant) => (
                        <div 
                          key={participant.identity} 
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            participant.isLocal ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="space-y-1">
                            <p className="font-medium">
                              {participant.name}
                              {participant.isLocal && ' (You)'}
                            </p>
                            <div className="flex items-center gap-2">
                              {participant.isSpeaking && (
                                <Badge className="bg-green-500 animate-pulse">
                                  <Volume2 className="h-3 w-3 mr-1" />
                                  Speaking
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {participant.isMuted ? (
                              <MicOff className="h-5 w-5 text-red-500" />
                            ) : (
                              <Mic className="h-5 w-5 text-green-500" />
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
