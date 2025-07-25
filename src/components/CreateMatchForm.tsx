
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { YouTubeService } from '@/services/youtubeService';
import MatchBasicInfo from './match/form/MatchBasicInfo';
import TeamSetupSection from './match/form/TeamSetupSection';
import TrackerAssignmentTabs from './match/form/TrackerAssignementTabs'; // Fixed import path
import VideoSetupSection from './match/form/VideoSetupSection'; // Fixed import path
import { Button } from './ui/button';
import { Player as TrackerPlayer } from '@/types/trackerAssignment';

type MatchStatus = 'draft' | 'scheduled' | 'live' | 'completed';
type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2' | '3-4-3';

interface MatchFormData {
  name: string;
  description: string;
  homeTeamName: string;
  awayTeamName: string;
  matchDate: string;
  location: string;
  competition: string;
  matchType: string;
  status: MatchStatus;
  notes: string;
  homeTeamFormation: Formation;
  awayTeamFormation: Formation;
  homeTeamFlagUrl: string;
  awayTeamFlagUrl: string;
}

interface Player {
  id: number;
  name: string;
  number: number | null;
  position: string;
  isSubstitute: boolean;
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

interface CreateMatchFormProps {
  matchId?: string;
  onMatchSubmit: (match: any) => void;
}

// Define the assignment data interface to match the database schema
interface AssignmentData {
  match_id: string;
  tracker_user_id: string;
  assigned_event_types: string[];
  player_id: number | null;
  player_team_id: string;
}

const CreateMatchForm: React.FC<CreateMatchFormProps> = ({ matchId, onMatchSubmit }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<MatchFormData>({
    name: '',
    description: '',
    homeTeamName: '',
    awayTeamName: '',
    matchDate: '',
    location: '',
    competition: '',
    matchType: 'regular',
    status: 'draft',
    notes: '',
    homeTeamFormation: '4-4-2',
    awayTeamFormation: '4-3-3',
    homeTeamFlagUrl: '',
    awayTeamFlagUrl: '',
  });
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Player[]>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Player[]>([]);
  const [trackers, setTrackers] = useState<TrackerUser[]>([]);
  const [trackerAssignments, setTrackerAssignments] = useState<TrackerAssignment[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMatchData = async () => {
      if (matchId) {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();

        if (error) {
          console.error('Error fetching match data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load match data.',
            variant: 'destructive',
          });
        }

        if (data) {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            homeTeamName: data.home_team_name || '',
            awayTeamName: data.away_team_name || '',
            matchDate: data.match_date ? new Date(data.match_date).toISOString().slice(0, 16) : '',
            location: data.location || '',
            competition: data.competition || '',
            matchType: data.match_type || 'regular',
            status: (data.status as MatchStatus) || 'draft',
            notes: data.notes || '',
            homeTeamFormation: (data.home_team_formation as Formation) || '4-4-2',
            awayTeamFormation: (data.away_team_formation as Formation) || '4-3-3',
            homeTeamFlagUrl: data.home_team_flag_url || '',
            awayTeamFlagUrl: data.away_team_flag_url || '',
          });
          
          const homeTeamPlayersData = Array.isArray(data.home_team_players) 
            ? (data.home_team_players as any[]).map((player: any) => ({
                id: player.id || 0,
                name: player.name || '',
                number: player.number || null,
                position: player.position || '',
                isSubstitute: player.isSubstitute || false
              }))
            : [];
          const awayTeamPlayersData = Array.isArray(data.away_team_players)
            ? (data.away_team_players as any[]).map((player: any) => ({
                id: player.id || 0,
                name: player.name || '',
                number: player.number || null,
                position: player.position || '',
                isSubstitute: player.isSubstitute || false
              }))
            : [];
            
          setHomeTeamPlayers(homeTeamPlayersData);
          setAwayTeamPlayers(awayTeamPlayersData);
        }
      }
    };

    const fetchTrackers = async () => {
      const { data: trackersData, error: trackersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'tracker');

      if (trackersError) {
        console.error('Error fetching trackers:', trackersError);
        toast({
          title: 'Error',
          description: 'Failed to load trackers.',
          variant: 'destructive',
        });
      }

      if (trackersData) {
        setTrackers(trackersData as TrackerUser[]);
      }
    };

    const fetchExistingAssignments = async () => {
      if (matchId) {
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('match_tracker_assignments')
          .select('*')
          .eq('match_id', matchId);

        if (assignmentsError) {
          console.error('Error fetching existing assignments:', assignmentsError);
          toast({
            title: 'Error',
            description: 'Failed to load existing tracker assignments.',
            variant: 'destructive',
          });
        }

        if (assignmentsData) {
          const groupedAssignments: { [key: string]: TrackerAssignment } = {};
          assignmentsData.forEach(assignment => {
            if (!groupedAssignments[assignment.tracker_user_id]) {
              groupedAssignments[assignment.tracker_user_id] = {
                tracker_user_id: assignment.tracker_user_id,
                assigned_event_types: assignment.assigned_event_types || [],
                player_ids: []
              };
            }
            if (assignment.player_id) {
              groupedAssignments[assignment.tracker_user_id].player_ids.push(assignment.player_id);
            }
          });
          setTrackerAssignments(Object.values(groupedAssignments));
        }
      }
    };

    fetchMatchData();
    fetchTrackers();
    fetchExistingAssignments();
  }, [matchId, toast]);


  const handleFormDataChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePlayersChange = (team: 'home' | 'away', players: Player[]) => {
    if (team === 'home') {
      setHomeTeamPlayers(players);
    } else {
      setAwayTeamPlayers(players);
    }
  };

  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>, team: 'home' | 'away') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      if (team === 'home') {
        setFormData({ ...formData, homeTeamFlagUrl: url });
      } else {
        setFormData({ ...formData, awayTeamFlagUrl: url });
      }
    }
  };

  const handleTrackerAssignmentsChange = (assignments: TrackerAssignment[]) => {
    setTrackerAssignments(assignments);
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
  };

  const convertToTrackerPlayers = (players: Player[], team: 'home' | 'away'): TrackerPlayer[] => {
    return players.map((player, index) => ({
      id: player.id || (team === 'home' ? 1000 + index : 2000 + index),
      jersey_number: player.number || 0,
      player_name: player.name || '',
      team: team,
      position: player.position || '', // Ensure position is passed
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a match.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Save/update match data
      const matchData = {
        name: formData.name || `${formData.homeTeamName} vs ${formData.awayTeamName}`,
        description: formData.description,
        home_team_name: formData.homeTeamName,
        away_team_name: formData.awayTeamName,
        match_date: formData.matchDate ? new Date(formData.matchDate).toISOString() : null,
        location: formData.location,
        competition: formData.competition,
        match_type: formData.matchType,
        status: formData.status,
        notes: formData.notes,
        home_team_formation: formData.homeTeamFormation,
        away_team_formation: formData.awayTeamFormation,
        home_team_flag_url: formData.homeTeamFlagUrl,
        away_team_flag_url: formData.awayTeamFlagUrl,
        home_team_players: homeTeamPlayers as any,
        away_team_players: awayTeamPlayers as any,
        updated_at: new Date().toISOString(),
      };

      let savedMatch;
      if (matchId) {
        const { data, error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', matchId)
          .select()
          .single();
        if (error) throw error;
        savedMatch = data;
      } else {
        const { data, error } = await supabase
          .from('matches')
          .insert({ 
            ...matchData, 
            created_by: user.id,
            created_at: new Date().toISOString() 
          })
          .select()
          .single();
        if (error) throw error;
        savedMatch = data;
      }

      console.log('Match saved:', savedMatch);

      // Step 2: Handle tracker assignments
      if (trackerAssignments.length > 0) {
        if (matchId) {
          await supabase.from('match_tracker_assignments').delete().eq('match_id', matchId);
        }

        const assignmentData: AssignmentData[] = [];
        for (const assignment of trackerAssignments) {
          if (assignment.player_ids.length > 0) {
            for (const playerId of assignment.player_ids) {
              const playerTeamId = homeTeamPlayers.some(p => p.id === playerId) ? 'home' : 'away';
              assignmentData.push({
                match_id: savedMatch.id,
                tracker_user_id: assignment.tracker_user_id,
                assigned_event_types: assignment.assigned_event_types,
                player_id: playerId,
                player_team_id: playerTeamId,
              });
            }
          } else {
            assignmentData.push({
              match_id: savedMatch.id,
              tracker_user_id: assignment.tracker_user_id,
              assigned_event_types: assignment.assigned_event_types,
              player_id: null,
              player_team_id: 'home', // Default
            });
          }
        }

        const { error: assignmentError } = await supabase.from('match_tracker_assignments').insert(assignmentData);
        if (assignmentError) throw assignmentError;

        // Send notifications
        for (const assignment of trackerAssignments) {
          try {
            await supabase.from('notifications').insert({
              user_id: assignment.tracker_user_id,
              match_id: savedMatch.id,
              title: 'New Match Assignment',
              message: `You have been assigned to track match: ${savedMatch.name}.`,
              type: 'match_assignment',
              notification_data: { match_id: savedMatch.id },
              is_read: false,
            });
          } catch (notificationErr) {
            console.error('Exception while sending tracker notification:', notificationErr);
          }
        }
      }

      // Step 3: Handle video setup
      if (videoUrl && videoUrl.trim()) {
        try {
          const videoAssignments = trackerAssignments.map(a => ({
            tracker_id: a.tracker_user_id,
            assigned_event_types: a.assigned_event_types,
          }));
          await YouTubeService.saveVideoMatchSetup(savedMatch.id, videoUrl, videoAssignments, user.id);
          toast({ title: 'Success', description: 'Match saved with video setup and notifications sent!' });
        } catch (videoError) {
          console.error('Error setting up video:', videoError);
          toast({ title: 'Partial Success', description: 'Match saved, but there was an issue with video setup.', variant: 'destructive' });
        }
      } else {
        toast({ title: 'Success', description: matchId ? 'Match updated successfully!' : 'Match created successfully!' });
      }

      if (onMatchSubmit) {
        onMatchSubmit(savedMatch);
      }
    } catch (error: any) {
      console.error('Error saving match:', error);
      toast({ title: 'Error', description: `Failed to save match: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <MatchBasicInfo formData={formData} onFormDataChange={handleFormDataChange} />
      <TeamSetupSection
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onPlayersChange={handlePlayersChange}
        onFlagChange={handleFlagChange}
      />
      {/* Use the new TrackerAssignmentTabs component */}
      <TrackerAssignmentTabs
        homeTeamPlayers={convertToTrackerPlayers(homeTeamPlayers.filter(p => !p.isSubstitute), 'home')}
        awayTeamPlayers={convertToTrackerPlayers(awayTeamPlayers.filter(p => !p.isSubstitute), 'away')}
        trackerUsers={trackers}
        assignments={trackerAssignments as any} // Cast as any to handle local `id` field
        onAssignmentsChange={handleTrackerAssignmentsChange as any}
      />
      <VideoSetupSection videoUrl={videoUrl} onVideoUrlChange={handleVideoUrlChange} />
      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Match'}
        </Button>
      </div>
    </form>
  );
};

export default CreateMatchForm;
