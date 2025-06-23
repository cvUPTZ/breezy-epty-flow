import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { YouTubeService } from '@/services/youtubeService';
import { useAuth } from '@/context/AuthContext';
import MatchHeader from '@/components/match/MatchHeader';
import MatchBasicInfo from '@/components/match/form/MatchBasicInfo';
import TeamSetupSection from '@/components/match/form/TeamSetupSection';
import TrackerAssignmentSection from '@/components/match/form/TrackerAssignmentSection';
import VideoSetupSection from '@/components/match/form/VideoSetupSection';

interface CreateMatchFormProps {
  matchId?: string;
  onMatchSubmit: (match: any) => void;
}

interface TrackerUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user' | 'tracker' | 'teacher';
}

interface TrackerAssignment {
  tracker_user_id: string;
  assigned_event_types: string[];
  player_ids: number[];
}

interface Player {
  id: number;
  name: string;
  number: number | null;
  position: string;
  isSubstitute: boolean;
}

type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2' | '3-4-3';
type MatchStatus = 'draft' | 'scheduled' | 'live' | 'completed';

const TOTAL_PLAYERS = 23;
const STARTERS_COUNT = 11;

const initializeBlankPlayers = (teamIdentifier: string): Player[] => {
  const players: Player[] = [];
  const timestamp = Date.now();
  for (let i = 0; i < TOTAL_PLAYERS; i++) {
    players.push({
      id: timestamp + i + (teamIdentifier === 'home' ? 1000 : 2000), 
      name: '',
      number: null,
      position: '',
      isSubstitute: i >= STARTERS_COUNT,
    });
  }
  return players;
};

const parseAndPadPlayers = (playersData: any[] | string | null, teamIdentifier: string): Player[] => {
  let parsedPlayers: any[] = [];
  
  if (typeof playersData === 'string') {
    try {
      parsedPlayers = JSON.parse(playersData);
    } catch (error) {
      console.error('Failed to parse players data:', error);
      parsedPlayers = [];
    }
  } else if (Array.isArray(playersData)) {
    parsedPlayers = playersData;
  }

  const players: Player[] = parsedPlayers.map((p, index) => ({
    id: p.id || Date.now() + index + (teamIdentifier === 'home' ? 1000 : 2000),
    name: p.name || p.player_name || '',
    number: p.number !== undefined ? p.number : (p.jersey_number !== undefined ? p.jersey_number : null),
    position: p.position || '',
    isSubstitute: p.is_substitute !== undefined ? p.is_substitute : index >= STARTERS_COUNT,
  }));

  while (players.length < TOTAL_PLAYERS) {
    const index = players.length;
    players.push({
      id: Date.now() + index + (teamIdentifier === 'home' ? 1000 : 2000),
      name: '',
      number: null,
      position: '',
      isSubstitute: index >= STARTERS_COUNT,
    });
  }

  return players.slice(0, TOTAL_PLAYERS);
};

const CreateMatchForm: React.FC<CreateMatchFormProps> = ({ matchId, onMatchSubmit }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!matchId);
  const [trackers, setTrackers] = useState<TrackerUser[]>([]);
  const [trackerAssignments, setTrackerAssignments] = useState<TrackerAssignment[]>([]);
  
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Player[]>(() => initializeBlankPlayers('home'));
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Player[]>(() => initializeBlankPlayers('away'));
  
  const [homeTeamFlagFile, setHomeTeamFlagFile] = useState<File | null>(null);
  const [awayTeamFlagFile, setAwayTeamFlagFile] = useState<File | null>(null);
  const [matchVideoUrl, setMatchVideoUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    homeTeamName: '',
    awayTeamName: '',
    homeTeamFormation: '4-4-2' as Formation,
    awayTeamFormation: '4-4-2' as Formation,
    homeTeamFlagUrl: '',
    awayTeamFlagUrl: '',
    matchDate: '',
    location: '',
    competition: '',
    matchType: 'regular',
    status: 'draft' as MatchStatus,
    notes: ''
  });

  useEffect(() => {
    fetchTrackers();
    if (matchId) {
      fetchMatchData(matchId);
    } else {
        applyPositionsToStarters('home', formData.homeTeamFormation);
        applyPositionsToStarters('away', formData.awayTeamFormation);
    }
  }, [matchId]);

  useEffect(() => {
    applyPositionsToStarters('home', formData.homeTeamFormation);
  }, [formData.homeTeamFormation]);

  useEffect(() => {
    applyPositionsToStarters('away', formData.awayTeamFormation);
  }, [formData.awayTeamFormation]);

  const applyPositionsToStarters = (team: 'home' | 'away', formation: Formation) => {
    const positionMap: Record<Formation, string[]> = {
      '4-4-2': ['Goalkeeper', 'Defender', 'Defender', 'Defender', 'Defender', 'Midfielder', 'Midfielder', 'Midfielder', 'Midfielder', 'Forward', 'Forward'],
      '4-3-3': ['Goalkeeper', 'Defender', 'Defender', 'Defender', 'Defender', 'Midfielder', 'Midfielder', 'Midfielder', 'Forward', 'Forward', 'Forward'],
      '3-5-2': ['Goalkeeper', 'Defender', 'Defender', 'Defender', 'Midfielder', 'Midfielder', 'Midfielder', 'Midfielder', 'Midfielder', 'Forward', 'Forward'],
      '4-2-3-1': ['Goalkeeper', 'Defender', 'Defender', 'Defender', 'Defender', 'Midfielder', 'Midfielder', 'Midfielder', 'Midfielder', 'Midfielder', 'Forward'],
      '5-3-2': ['Goalkeeper', 'Defender', 'Defender', 'Defender', 'Defender', 'Defender', 'Midfielder', 'Midfielder', 'Midfielder', 'Forward', 'Forward'],
      '3-4-3': ['Goalkeeper', 'Defender', 'Defender', 'Defender', 'Midfielder', 'Midfielder', 'Midfielder', 'Midfielder', 'Forward', 'Forward', 'Forward']
    };

    const positions = positionMap[formation];
    const updatePlayers = (prevPlayers: Player[]) => {
      const newPlayers = [...prevPlayers];
      for (let i = 0; i < STARTERS_COUNT; i++) {
        if (newPlayers[i] && !newPlayers[i].isSubstitute) {
          newPlayers[i].position = positions[i] || 'Starter';
        }
      }
      return newPlayers;
    };
    
    if (team === 'home') {
      setHomeTeamPlayers(updatePlayers);
    } else {
      setAwayTeamPlayers(updatePlayers);
    }
  };

  const fetchMatchData = async (id: string) => {
    setLoading(true);
    try {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`*, match_tracker_assignments (tracker_user_id, assigned_event_types, player_id)`)
        .eq('id', id)
        .single();

      if (matchError) throw matchError;
      if (!matchData) throw new Error("Match not found");

      // Try to fetch video URL for this match - using any() to bypass type checking
      try {
        const { data: videoSetting } = await (supabase as any)
          .from('match_video_settings')
          .select('video_url')
          .eq('match_id', id)
          .maybeSingle();

        if (videoSetting && videoSetting.video_url) {
          setMatchVideoUrl(videoSetting.video_url);
        }
      } catch (videoError) {
        console.warn(`Could not fetch video settings for match ${id}:`, videoError);
      }

      setFormData({
        name: matchData.name || '',
        description: matchData.description || '',
        homeTeamName: matchData.home_team_name || '',
        awayTeamName: matchData.away_team_name || '',
        homeTeamFormation: (matchData.home_team_formation as Formation) || '4-4-2',
        awayTeamFormation: (matchData.away_team_formation as Formation) || '4-4-2',
        homeTeamFlagUrl: matchData.home_team_flag_url || '',
        awayTeamFlagUrl: matchData.away_team_flag_url || '',
        matchDate: matchData.match_date ? new Date(matchData.match_date).toISOString().slice(0, 16) : '',
        location: matchData.location || '',
        competition: matchData.competition || '',
        matchType: matchData.match_type || 'regular',
        status: (matchData.status as MatchStatus) || 'draft',
        notes: matchData.notes || ''
      });

      setHomeTeamPlayers(parseAndPadPlayers(matchData.home_team_players as any[] | string | null, 'home'));
      setAwayTeamPlayers(parseAndPadPlayers(matchData.away_team_players as any[] | string | null, 'away'));

      const assignments: TrackerAssignment[] = [];
      if (Array.isArray(matchData.match_tracker_assignments)) {
        const assignmentsMap = new Map<string, TrackerAssignment>();
        matchData.match_tracker_assignments.forEach((assign: any) => {
          if (!assignmentsMap.has(assign.tracker_user_id)) {
            assignmentsMap.set(assign.tracker_user_id, { tracker_user_id: assign.tracker_user_id, assigned_event_types: [], player_ids: [] });
          }
          const currentAssignment = assignmentsMap.get(assign.tracker_user_id)!;
          currentAssignment.assigned_event_types = Array.from(new Set([...currentAssignment.assigned_event_types, ...assign.assigned_event_types]));
          if (assign.player_id) {
            currentAssignment.player_ids.push(assign.player_id);
          }
        });
        assignments.push(...Array.from(assignmentsMap.values()));
      }
      setTrackerAssignments(assignments);

    } catch (error: any) {
      console.error('Error fetching match data:', error);
      toast({ title: "Error", description: `Failed to load match data: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, email, full_name, role').eq('role', 'tracker').order('full_name');
      if (error) throw error;
      const validTrackers = (data || []).filter(tracker => tracker.id && tracker.email && tracker.full_name).map(tracker => ({ id: tracker.id!, email: tracker.email!, full_name: tracker.full_name!, role: tracker.role as 'admin' | 'user' | 'tracker' | 'teacher' }));
      setTrackers(validTrackers);
    } catch (error: any) {
      console.error('Error fetching trackers:', error);
      toast({ title: "Error", description: "Failed to load trackers", variant: "destructive" });
    }
  };

  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>, team: 'home' | 'away') => {
    const file = e.target.files?.[0];
    if (file) {
        const previewUrl = URL.createObjectURL(file);
        if (team === 'home') {
            setHomeTeamFlagFile(file);
            setFormData(prev => ({...prev, homeTeamFlagUrl: previewUrl}));
        } else {
            setAwayTeamFlagFile(file);
            setFormData(prev => ({...prev, awayTeamFlagUrl: previewUrl}));
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const toPlayerJson = (player: Player) => ({ 
        id: player.id, 
        name: player.name || '', 
        player_name: player.name || '', 
        number: player.number, 
        jersey_number: player.number, 
        position: player.position,
        is_substitute: player.isSubstitute
      });
      const homePlayersJson = homeTeamPlayers.map(toPlayerJson);
      const awayPlayersJson = awayTeamPlayers.map(toPlayerJson);

      const matchData = {
        name: formData.name || `${formData.homeTeamName} vs ${formData.awayTeamName}`,
        description: formData.description,
        home_team_name: formData.homeTeamName,
        away_team_name: formData.awayTeamName,
        home_team_players: homePlayersJson,
        away_team_players: awayPlayersJson,
        home_team_formation: formData.homeTeamFormation,
        away_team_formation: formData.awayTeamFormation,
        home_team_flag_url: homeTeamFlagFile ? '' : formData.homeTeamFlagUrl,
        away_team_flag_url: awayTeamFlagFile ? '' : formData.awayTeamFlagUrl,
        match_date: formData.matchDate,
        location: formData.location,
        competition: formData.competition,
        match_type: formData.matchType,
        status: formData.status,
        notes: formData.notes,
        ...(isEditMode && matchId ? { updated_at: new Date().toISOString() } : {})
      };

      let match: any, matchError: any;
      if (isEditMode && matchId) {
        const { data, error } = await supabase.from('matches').update(matchData).eq('id', matchId).select().single();
        match = data; matchError = error;
      } else {
        const { data, error } = await supabase.from('matches').insert(matchData).select().single();
        match = data; matchError = error;
      }
      if (matchError) throw matchError;
      if (!match) throw new Error(isEditMode ? "Failed to update match." : "Failed to create match.");
      
      let needsFlagUpdate = false;
      const flagUpdatePayload: { home_team_flag_url?: string; away_team_flag_url?: string } = {};

      if (homeTeamFlagFile) {
        const fileExt = homeTeamFlagFile.name.split('.').pop();
        const filePath = `${match.id}/home-flag.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('flag').upload(filePath, homeTeamFlagFile, { upsert: true });
        if (uploadError) throw new Error(`Home flag upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from('flag').getPublicUrl(filePath);
        flagUpdatePayload.home_team_flag_url = urlData.publicUrl;
        needsFlagUpdate = true;
      }

      if (awayTeamFlagFile) {
        const fileExt = awayTeamFlagFile.name.split('.').pop();
        const filePath = `${match.id}/away-flag.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('flag').upload(filePath, awayTeamFlagFile, { upsert: true });
        if (uploadError) throw new Error(`Away flag upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from('flag').getPublicUrl(filePath);
        flagUpdatePayload.away_team_flag_url = urlData.publicUrl;
        needsFlagUpdate = true;
      }
      
      let finalMatch = match;
      if (needsFlagUpdate) {
        const { data, error } = await supabase.from('matches').update(flagUpdatePayload).eq('id', match.id).select().single();
        if (error) throw error;
        finalMatch = data;
      }

      if (isEditMode && matchId) {
        await supabase.from('match_tracker_assignments').delete().eq('match_id', matchId);
      }
      
      if (trackerAssignments.length > 0) {
        const assignments = trackerAssignments.flatMap(assignment => assignment.player_ids.map(playerId => ({ match_id: finalMatch.id, tracker_user_id: assignment.tracker_user_id, player_id: playerId, player_team_id: homeTeamPlayers.some(p => p.id === playerId) ? 'home' : 'away', assigned_event_types: assignment.assigned_event_types }))).filter(a => a.tracker_user_id && a.player_id);
        if (assignments.length > 0) {
          const { error: assignmentError } = await supabase.from('match_tracker_assignments').insert(assignments);
          if (assignmentError) throw assignmentError;
        }
      }

      // Save the video URL if provided
      if (matchVideoUrl && finalMatch.id) {
        try {
          const videoSetting = await YouTubeService.addVideoToMatch(finalMatch.id, matchVideoUrl, user?.id);
          console.log('Video setting saved/updated:', videoSetting);

          // Notify assigned trackers about the video
          if (trackerAssignments.length > 0 && videoSetting) {
            const assignedTrackerIds = new Set(trackerAssignments.map(ta => ta.tracker_user_id).filter(id => !!id));

            const notifications = Array.from(assignedTrackerIds).map(trackerId => ({
              user_id: trackerId,
              match_id: finalMatch.id,
              type: 'video_assignment',
              title: `Video Added to Match: ${finalMatch.name || 'Unnamed Match'}`,
              message: `A video (${videoSetting.video_title || 'Video'}) has been added/updated for match "${finalMatch.name || 'Unnamed Match'}". You can now track events on this video.`,
              notification_data: {
                match_id: finalMatch.id,
                match_video_setting_id: videoSetting.id,
                video_url: videoSetting.video_url,
                video_title: videoSetting.video_title,
              },
              created_by: user?.id,
            }));

            if (notifications.length > 0) {
              const { error: notificationError } = await supabase.from('notifications').insert(notifications);
              if (notificationError) {
                console.error('Error creating video notifications:', notificationError);
                toast({ title: "Notification Error", description: "Match video saved, but failed to send notifications to some trackers.", variant: "destructive" });
              } else {
                console.log(`${notifications.length} video notifications sent.`);
              }
            }
          }
        } catch (videoError: any) {
          console.error('Error saving video URL:', videoError);
          toast({ title: "Video Save Error", description: `Match saved, but failed to save video URL: ${videoError.message}`, variant: "destructive" });
        }
      }

      toast({ title: "Success", description: `Match ${isEditMode ? 'updated' : 'created'} successfully!` });
      onMatchSubmit(finalMatch);
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} match:`, error);
      toast({ title: "Error", description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} match`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="teams">Teams & Players</TabsTrigger>
            <TabsTrigger value="trackers">Tracker Assignments</TabsTrigger>
            <TabsTrigger value="video">Video Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <MatchBasicInfo 
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />

            {/* Match Preview */}
            {(formData.homeTeamName || formData.awayTeamName) && (
              <Card>
                <CardContent className="p-6">
                  <MatchHeader
                    homeTeam={{
                      name: formData.homeTeamName || "Home Team",
                      formation: formData.homeTeamFormation,
                      flagUrl: formData.homeTeamFlagUrl || null
                    }}
                    awayTeam={{
                      name: formData.awayTeamName || "Away Team", 
                      formation: formData.awayTeamFormation,
                      flagUrl: formData.awayTeamFlagUrl || null
                    }}
                    name={formData.name || `${formData.homeTeamName || "Home"} vs ${formData.awayTeamName || "Away"}`}
                    status={formData.status}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <TeamSetupSection
              homeTeamPlayers={homeTeamPlayers}
              awayTeamPlayers={awayTeamPlayers}
              formData={{
                homeTeamFormation: formData.homeTeamFormation,
                awayTeamFormation: formData.awayTeamFormation,
                homeTeamFlagUrl: formData.homeTeamFlagUrl,
                awayTeamFlagUrl: formData.awayTeamFlagUrl,
              }}
              onFormDataChange={handleFormDataChange}
              onPlayersChange={(team, players) => {
                if (team === 'home') {
                  setHomeTeamPlayers(players);
                } else {
                  setAwayTeamPlayers(players);
                }
              }}
              onFlagChange={handleFlagChange}
            />
          </TabsContent>

          <TabsContent value="trackers" className="space-y-4">
            <TrackerAssignmentSection
              trackers={trackers}
              trackerAssignments={trackerAssignments}
              homeTeamPlayers={homeTeamPlayers}
              awayTeamPlayers={awayTeamPlayers}
              onTrackerAssignmentsChange={setTrackerAssignments}
            />
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <VideoSetupSection
              videoUrl={matchVideoUrl}
              onVideoUrlChange={setMatchVideoUrl}
            />
          </TabsContent>

          <div className="flex justify-end space-x-2 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Match' : 'Create Match')}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  );
};

export default CreateMatchForm;
