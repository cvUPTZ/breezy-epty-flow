import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MatchHeader from '@/components/match/MatchHeader';
import UnifiedTrackerAssignment from '@/components/tracker/UnifiedTrackerAssignment';
import MainTabContentV2 from '@/components/match/MainTabContentV2';
import VoiceCollaborationWithTest from '@/components/match/VoiceCollaborationWithTest';
import MatchPlanningNetwork from '@/components/match/MatchPlanningNetwork';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import MatchAnalysisSidebar from '@/components/match/MatchAnalysisSidebar';
import FourTrackerSystem from '@/components/match/FourTrackerSystem';
import { TrackerVoiceInput } from '@/components/TrackerVoiceInput';
import { EventType as LocalEventType } from '@/types/matchForm';
import { PlayerForPianoInput, AssignedPlayers } from '@/components/match/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { safeParseJson } from '@/utils/parsing';
import { Activity, Piano, Users, Settings, Mic, Zap, LayoutDashboard, Video, Loader2 } from 'lucide-react';
import { VoiceCollaborationProvider } from '@/context/VoiceCollaborationContext';
import VoiceCollaborationOverlay from "@/components/match/VoiceCollaborationOverlay";
import VideoSetupSection from '@/components/match/form/VideoSetupSection';
import TrackerVideoInterface from '@/components/video/TrackerVideoInterface';
import { YouTubeService } from '@/services/youtubeService';

interface VoiceInputPlayer {
  id: number;
  name: string;
  jersey_number: number | null;
}

interface VoiceInputAssignedPlayers {
  home: VoiceInputPlayer[];
  away: VoiceInputPlayer[];
}

const viewDetails = {
  main: {
    title: 'Dashboard',
    subtitle: 'Overview and match controls',
    icon: LayoutDashboard,
    color: 'from-slate-500 to-slate-600',
  },
  piano: {
    title: 'Piano Input',
    subtitle: 'Quick event recording interface',
    icon: Piano,
    color: 'from-blue-500 to-blue-600',
  },
  'voice-collab': {
    title: 'Voice Collaboration',
    subtitle: 'Real-time voice communication',
    icon: Mic,
    color: 'from-emerald-500 to-emerald-600',
  },
  'voice-input': {
    title: 'Voice Input',
    subtitle: 'Voice-activated event recording',
    icon: Zap,
    color: 'from-purple-500 to-purple-600',
  },
  planning: {
    title: 'Planning Network',
    subtitle: 'Visualize tracker relationships and assignments',
    icon: Users,
    color: 'from-indigo-500 to-indigo-600',
  },
  tracker: {
    title: 'Tracker Assignment',
    subtitle: 'Manage and assign tracker responsibilities',
    icon: Settings,
    color: 'from-amber-500 to-amber-600',
  },
  video: {
    title: 'Video Tracking',
    subtitle: 'Video-based match tracking and analysis',
    icon: Video,
    color: 'from-red-500 to-red-600',
  },
};

const MatchAnalysisV2: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const location = useLocation();
  const { userRole, user } = useAuth();
  const [mode, setMode] = useState<'piano' | 'tracking'>('piano');
  const [homeTeam, setHomeTeam] = useState({ name: 'Home Team', formation: '4-4-2' });
  const [awayTeam, setAwayTeam] = useState({ name: 'Away Team', formation: '4-3-3' });
  const [isTracking, setIsTracking] = useState(false);
  const [assignedEventTypes, setAssignedEventTypes] = useState<LocalEventType[] | null>(null);
  const [assignedPlayers, setAssignedPlayers] = useState<AssignedPlayers | null>(null);
  const [fullMatchRoster, setFullMatchRoster] = useState<AssignedPlayers | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const mountedRef = useRef(true);
  const hasLoadedInitialData = useRef(false);

  const isAdmin = userRole === 'admin';
  const [activeView, setActiveView] = useState(isAdmin ? 'main' : 'piano');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Utility function to parse player data consistently
  const parsePlayerData = useCallback((data: any, teamContext: 'home' | 'away'): PlayerForPianoInput[] => {
    if (!data) return [];

    let players: any[] = [];

    if (typeof data === 'string') {
      // Use the new safeParseJson utility
      players = safeParseJson(data);
    } else if (Array.isArray(data)) {
      players = data;
    } else {
      return [];
    }

    // Normalize and validate player objects
    return players
      .filter(player =>
        player &&
        typeof player === 'object' &&
        (player.player_name?.trim() || player.name?.trim())
      )
      .map((player, index) => ({
        id: String(player.id || index),
        player_name: (player.player_name || player.name || '').trim(),
        jersey_number: Number(player.jersey_number || player.number) || index + 1,
        position: player.position?.trim() || undefined,
        team_context: teamContext
      }));
  }, []);

  // Convert PlayerForPianoInput to VoiceInputPlayer format
  const convertPlayersForVoiceInput = useCallback((players: AssignedPlayers): VoiceInputAssignedPlayers => {
    return {
      home: players.home.map(player => ({
        id: Number(player.id),
        name: player.player_name,
        jersey_number: player.jersey_number
      })),
      away: players.away.map(player => ({
        id: Number(player.id),
        name: player.player_name,
        jersey_number: player.jersey_number
      }))
    };
  }, []);

  const fetchMatchDetails = useCallback(async () => {
    if (!matchId) {
      console.error("Match ID is missing.");
      setLoading(false);
      return;
    }

    if (!mountedRef.current) return;

    try {
      setLoading(true);

      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('home_team_name, away_team_name, home_team_formation, away_team_formation, home_team_players, away_team_players')
        .eq('id', matchId)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (matchError) {
        console.error("Error fetching match details:", matchError);
        toast({
          title: "Error",
          description: "Failed to fetch match details",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!matchData) {
        toast({
          title: "Match Not Found",
          description: "The requested match could not be found",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setHomeTeam({
        name: matchData.home_team_name || 'Home Team',
        formation: matchData.home_team_formation || '4-4-2'
      });

      setAwayTeam({
        name: matchData.away_team_name || 'Away Team',
        formation: matchData.away_team_formation || '4-3-3'
      });

      const homePlayers = parsePlayerData(matchData.home_team_players, 'home');
      const awayPlayers = parsePlayerData(matchData.away_team_players, 'away');

      console.log('Parsed match roster:', { home: homePlayers.length, away: awayPlayers.length });

      setFullMatchRoster({ home: homePlayers, away: awayPlayers });
      hasLoadedInitialData.current = true;

    } catch (error: any) {
      console.error("Error fetching match details:", error);
      if (mountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to fetch match details",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [matchId, toast, parsePlayerData]);

  const fetchTrackerAssignments = useCallback(async () => {
    if (!matchId || !user?.id || !fullMatchRoster) {
      console.log("Missing requirements for fetching tracker assignments:", {
        matchId: !!matchId,
        userId: !!user?.id,
        fullMatchRoster: !!fullMatchRoster
      });
      return;
    }

    if (!mountedRef.current) return;

    try {
      setAssignmentsLoading(true);
      console.log('Fetching tracker assignments for:', { matchId, userId: user.id });
      
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .eq('tracker_user_id', user.id);

      if (!mountedRef.current) return;

      if (error) {
        console.error("Error fetching tracker assignments:", error);
        toast({
          title: "Error",
          description: "Failed to fetch tracker assignments",
          variant: "destructive",
        });
        return;
      }

      console.log('Tracker assignments data:', data);

      if (!data || data.length === 0) {
        console.log("No tracker assignments found for this user and match.");
        setAssignedEventTypes([]);
        setAssignedPlayers({ home: [], away: [] });
        return;
      }

      // Aggregate assigned event types
      const eventTypes = Array.from(new Set(data.flatMap(assignment => assignment.assigned_event_types || [])));
      const assignedEventTypesData: LocalEventType[] = eventTypes
        .filter(key => key)
        .map(key => ({ key, label: key }));
      setAssignedEventTypes(assignedEventTypesData);
      console.log('Assigned event types:', assignedEventTypesData);

      // Aggregate assigned players - FIX: Use assigned_player_ids array
      const homePlayers: PlayerForPianoInput[] = [];
      const awayPlayers: PlayerForPianoInput[] = [];
      const processedPlayerIds = new Set<number>();

      data.forEach(assignment => {
        const playerIds = assignment.assigned_player_ids || [];
        const teamId = assignment.player_team_id;

        playerIds.forEach((playerId: number) => {
          if (processedPlayerIds.has(playerId)) return;

          if (teamId === 'home') {
            const player = fullMatchRoster.home.find(p => Number(p.id) === Number(playerId));
            if (player) {
              homePlayers.push(player);
              processedPlayerIds.add(playerId);
            }
          } else if (teamId === 'away') {
            const player = fullMatchRoster.away.find(p => Number(p.id) === Number(playerId));
            if (player) {
              awayPlayers.push(player);
              processedPlayerIds.add(playerId);
            }
          }
        });
      });

      setAssignedPlayers({ home: homePlayers, away: awayPlayers });
      console.log('Assigned players:', { home: homePlayers.length, away: awayPlayers.length });

    } catch (error: any) {
      console.error("Error fetching tracker assignments:", error);
      if (mountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to fetch tracker assignments",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setAssignmentsLoading(false);
      }
    }
  }, [matchId, user?.id, fullMatchRoster, toast]);

  // Initial data fetch
  useEffect(() => {
    fetchMatchDetails();
  }, [fetchMatchDetails]);

  // Handle video URL from query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const videoUrlParam = searchParams.get('videoUrl');
    const videoIdParam = searchParams.get('videoId');
    
    if (videoUrlParam) {
      try {
        const extractedId = YouTubeService.extractVideoId(videoUrlParam);
        if (extractedId && extractedId.length === 11) {
          setVideoId(extractedId);
          setVideoUrl(videoUrlParam);
          setActiveView('video');
        } else {
          toast({
            title: "Invalid Video URL",
            description: "Could not extract a valid YouTube video ID from the URL.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error extracting video ID:', error);
        toast({
          title: "Error",
          description: "Failed to process video URL.",
          variant: "destructive",
        });
      }
    } else if (videoIdParam) {
      if (videoIdParam.length === 11) {
        setVideoId(videoIdParam);
        setVideoUrl(`https://www.youtube.com/watch?v=${videoIdParam}`);
        setActiveView('video');
      } else {
        toast({
          title: "Invalid Video ID",
          description: "The provided video ID is not valid.",
          variant: "destructive",
        });
      }
    }
  }, [location.search, toast]);

  // Fetch assignments when roster is ready
  useEffect(() => {
    if (fullMatchRoster && hasLoadedInitialData.current) {
      fetchTrackerAssignments();
    }
  }, [fullMatchRoster, fetchTrackerAssignments]);

  const handleToggleTracking = useCallback(() => {
    setIsTracking(prev => !prev);
  }, []);

  const handleSave = useCallback(() => {
    toast({
      title: "Match Saved",
      description: "Your match progress has been saved.",
    });
  }, [toast]);

  const handleRecordEvent = useCallback(async (
    eventTypeKey: string,
    playerId?: number,
    teamContext?: 'home' | 'away',
    details?: Record<string, any>
  ): Promise<any | null> => {
    console.log("MatchAnalysisV2: handleRecordEvent called with:", { eventTypeKey, playerId, teamContext, details });

    if (!matchId) {
      console.error("Match ID is missing.");
      toast({
        title: 'Error',
        description: 'Match ID is missing',
        variant: 'destructive',
      });
      return null;
    }

    if (!user?.id) {
      console.error("User not authenticated");
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return null;
    }

    if (!eventTypeKey) {
      console.error("Event type is missing");
      toast({
        title: 'Error',
        description: 'Event type is missing',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const eventToInsert = {
        match_id: matchId,
        event_type: eventTypeKey,
        player_id: playerId || null,
        created_by: user.id,
        timestamp: Math.floor(Date.now() / 1000),
        team: teamContext || null,
        coordinates: details?.coordinates || null,
        event_data: { 
          ...details, 
          recorded_via_interface: true, 
          team_context_from_input: teamContext,
          recorded_at: new Date().toISOString()
        },
      };

      console.log("Inserting event via MatchAnalysisV2:", eventToInsert);

      const { data: newEvent, error: dbError } = await supabase
        .from('match_events')
        .insert([eventToInsert])
        .select()
        .single();

      if (dbError) {
        console.error('Error recording event in MatchAnalysisV2:', dbError);
        toast({
          title: 'Error Recording Event',
          description: dbError.message || 'Database error occurred. Please try again.',
          variant: 'destructive',
        });
        throw dbError;
      }

      toast({
        title: 'Event Recorded',
        description: `${eventTypeKey} event recorded successfully.`,
      });
      return newEvent;
    } catch (error: any) {
      console.error("Error in handleRecordEvent:", error);
      toast({
        title: 'Recording Failed',
        description: error.message || 'Please check your connection and try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [matchId, user?.id, toast]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Loading Match</p>
            <p className="text-sm text-gray-500">Please wait...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (!matchId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">Match Not Found</p>
            <p className="text-sm text-gray-500">The match ID is missing or invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canShowVoiceCollab = !!user?.id;
  const canShowVoiceInput = !!(assignedPlayers && assignedEventTypes && !assignmentsLoading);

  const menuItems = [
    ...(isAdmin ? [{
      value: 'main',
      label: 'Dashboard',
      icon: LayoutDashboard,
    }] : []),
    {
      value: 'piano',
      label: 'Piano Input',
      icon: Piano,
    },
    ...(canShowVoiceCollab ? [{
      value: 'voice-collab',
      label: 'Voice Collaboration',
      icon: Mic,
    }] : []),
    ...(canShowVoiceInput ? [{
      value: 'voice-input',
      label: 'Voice Input',
      icon: Zap,
    }] : []),
    ...(isAdmin ? [
      {
        value: 'planning',
        label: 'Planning Network',
        icon: Users,
      },
      {
        value: 'tracker',
        label: 'Assignment',
        icon: Settings,
      }
    ] : []),
    ...(videoId || isAdmin ? [{
      value: 'video',
      label: videoId ? 'Video Tracking' : 'Video Setup',
      icon: Video,
    }] : [])
  ];

  const currentViewDetails = viewDetails[activeView as keyof typeof viewDetails];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex w-full">
        <MatchAnalysisSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          menuItems={menuItems}
          groupLabel="Match Tools"
        />
        <SidebarInset>
          <VoiceCollaborationProvider>
            <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
              <div className="flex items-center gap-4 mb-8">
                <SidebarTrigger />
                <div className="flex-grow">
                  <MatchHeader
                    mode={mode}
                    setMode={setMode}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    handleToggleTracking={handleToggleTracking}
                    handleSave={handleSave}
                  />
                </div>
              </div>

              <div className="space-y-6 animate-fade-in">
                <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden min-h-[60vh]">
                  <CardContent className="p-6">
                    {currentViewDetails && (
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-10 h-10 bg-gradient-to-r ${currentViewDetails.color} rounded-xl flex items-center justify-center`}>
                          <currentViewDetails.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{currentViewDetails.title}</h3>
                          <p className="text-sm text-gray-500">{currentViewDetails.subtitle}</p>
                        </div>
                      </div>
                    )}

                    {activeView === 'main' && isAdmin && (
                      <MainTabContentV2
                        matchId={matchId}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        isTracking={isTracking}
                        onEventRecord={handleRecordEvent}
                      />
                    )}

                    {activeView === 'piano' && fullMatchRoster && (
                      <>
                        <FourTrackerSystem
                          homeTeamPlayers={fullMatchRoster.home.map(p => ({ ...p, id: Number(p.id), team: 'home' as const }))}
                          awayTeamPlayers={fullMatchRoster.away.map(p => ({ ...p, id: Number(p.id), team: 'away' as const }))}
                          homeTeamName={homeTeam.name}
                          awayTeamName={awayTeam.name}
                          videoUrl={videoUrl}
                        />
                        <VoiceCollaborationOverlay />
                      </>
                    )}

                    {activeView === 'voice-collab' && canShowVoiceCollab && (
                      <VoiceCollaborationWithTest
                        matchId={matchId}
                        userId={user.id!}
                      />
                    )}

                    {activeView === 'voice-input' && (
                      <>
                        {assignmentsLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                            <span className="text-gray-600">Loading assignments...</span>
                          </div>
                        ) : canShowVoiceInput && assignedPlayers && assignedEventTypes ? (
                          <TrackerVoiceInput
                            assignedPlayers={convertPlayersForVoiceInput(assignedPlayers)}
                            assignedEventTypes={assignedEventTypes}
                            onRecordEvent={handleRecordEvent}
                          />
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-gray-600">No tracker assignments found. Please contact an admin.</p>
                          </div>
                        )}
                      </>
                    )}

                    {activeView === 'planning' && isAdmin && (
                      <MatchPlanningNetwork
                        matchId={matchId}
                        width={isMobile ? 350 : 800}
                        height={isMobile ? 400 : 600}
                      />
                    )}

                    {activeView === 'tracker' && isAdmin && fullMatchRoster && (
                      <UnifiedTrackerAssignment
                        matchId={matchId}
                        videoUrl={videoUrl}
                        homeTeamPlayers={fullMatchRoster.home.map((player, index) => ({
                          id: Number(player.id) || index,
                          jersey_number: player.jersey_number,
                          player_name: player.player_name,
                          team: 'home' as const,
                          position: player.position
                        }))}
                        awayTeamPlayers={fullMatchRoster.away.map((player, index) => ({
                          id: Number(player.id) || (index + 1000),
                          jersey_number: player.jersey_number,
                          player_name: player.player_name,
                          team: 'away' as const,
                          position: player.position
                        }))}
                      />
                    )}

                    {activeView === 'video' && (
                      <>
                        {isAdmin && !videoId && (
                          <VideoSetupSection
                            videoUrl={videoUrl}
                            onVideoUrlChange={setVideoUrl}
                          />
                        )}
                        {videoId && matchId && (
                          <TrackerVideoInterface
                            initialVideoId={videoId}
                            matchId={matchId}
                          />
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </VoiceCollaborationProvider>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MatchAnalysisV2;
