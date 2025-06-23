import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { YouTubeService } from '@/services/youtubeService';
import MatchBasicInfo from './match/form/MatchBasicInfo';
import TeamSetupSection from './match/form/TeamSetupSection';
import TrackerAssignmentSection from './match/form/TrackerAssignmentSection';
import VideoSetupSection from './match/form/VideoSetupSection';
import { Button } from './ui/button';

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
          setTrackerAssignments(assignmentsData.map(assignment => ({
            tracker_user_id: assignment.tracker_user_id,
            assigned_event_types: assignment.assigned_event_types || [],
            player_ids: assignment.player_id ? [assignment.player_id] : [],
          })));
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
        // Clear existing assignments
        if (matchId) {
          await supabase
            .from('match_tracker_assignments')
            .delete()
            .eq('match_id', matchId);
        }

        // Insert new assignments - Fix the constraint violation
        const assignmentData = trackerAssignments.flatMap(assignment => {
          // If there are specific player IDs, create assignments for each player
          if (assignment.player_ids.length > 0) {
            return assignment.player_ids.map(playerId => {
              // Determine which team the player belongs to
              const isHomePlayer = homeTeamPlayers.some(p => p.id === playerId);
              const playerTeamId = isHomePlayer ? 'home' : 'away';
              
              return {
                match_id: savedMatch.id,
                tracker_user_id: assignment.tracker_user_id,
                assigned_event_types: assignment.assigned_event_types,
                player_id: playerId,
                player_team_id: playerTeamId
              };
            });
          } else {
            // If no specific players, create a general assignment for both teams
            return [{
              match_id: savedMatch.id,
              tracker_user_id: assignment.tracker_user_id,
              assigned_event_types: assignment.assigned_event_types,
              player_id: null,
              player_team_id: 'home' // Default to home, could be 'both' if supported
            }];
          }
        });

        const { error: assignmentError } = await supabase
          .from('match_tracker_assignments')
          .insert(assignmentData);

        if (assignmentError) {
          console.error('Error saving tracker assignments:', assignmentError);
          throw assignmentError;
        }

        console.log('Tracker assignments saved:', assignmentData);

        // Send notifications to assigned trackers (regular match assignments)
        for (const assignment of trackerAssignments) {
          const notificationData = {
            match_id: savedMatch.id,
            assigned_event_types: assignment.assigned_event_types,
            assigned_player_ids: assignment.player_ids,
            assignment_type: 'match_tracking'
          };

          try {
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                user_id: assignment.tracker_user_id,
                match_id: savedMatch.id,
                title: 'New Match Assignment',
                message: `You have been assigned to track match: ${savedMatch.name}. Events: ${assignment.assigned_event_types.join(', ') || 'All assigned events'}.`,
                type: 'match_assignment',
                notification_data: notificationData,
                is_read: false
              });

            if (notificationError) {
              console.error('Error sending tracker notification:', notificationError);
            } else {
              console.log('Match assignment notification sent to tracker:', assignment.tracker_user_id);
            }
          } catch (notificationErr) {
            console.error('Exception while sending tracker notification:', notificationErr);
          }
        }
      }

      // Step 3: Handle video setup if provided
      if (videoUrl && videoUrl.trim()) {
        console.log('Processing video URL:', videoUrl);
        
        try {
          // Create video assignments from tracker assignments if they exist
          const videoAssignments = trackerAssignments.map(assignment => ({
            tracker_id: assignment.tracker_user_id,
            assigned_event_types: assignment.assigned_event_types,
          }));

          console.log('Video assignments to be created:', videoAssignments);

          // Use YouTubeService to save video setup and send notifications
          const videoResult = await YouTubeService.saveVideoMatchSetup(
            savedMatch.id,
            videoUrl,
            videoAssignments,
            user.id
          );

          console.log('Video setup result:', videoResult);
          
          toast({
            title: 'Success',
            description: 'Match saved with video setup and all notifications sent successfully!',
          });
        } catch (videoError) {
          console.error('Error setting up video:', videoError);
          toast({
            title: 'Partial Success',
            description: 'Match saved, but there was an issue with video setup. You can configure it later.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Success',
          description: matchId ? 'Match updated successfully!' : 'Match created successfully!',
        });
      }

      // Call the callback with the saved match
      if (onMatchSubmit) {
        onMatchSubmit(savedMatch);
      }

    } catch (error: any) {
      console.error('Error saving match:', error);
      toast({
        title: 'Error',
        description: `Failed to save match: ${error.message}`,
        variant: 'destructive',
      });
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
      <TrackerAssignmentSection
        trackers={trackers}
        trackerAssignments={trackerAssignments}
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        onTrackerAssignmentsChange={handleTrackerAssignmentsChange}
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
