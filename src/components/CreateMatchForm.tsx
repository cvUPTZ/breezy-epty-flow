import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { YouTubeService } from '@/services/youtubeService';
import MatchBasicInfo from './match/form/MatchBasicInfo';
import TeamSetupSection from './match/form/TeamSetupSection';
import VideoSetupSection from './match/form/VideoSetupSection';
import { Button } from './ui/button';

/**
 * @typedef {'draft' | 'scheduled' | 'live' | 'completed'} MatchStatus
 * @description The possible statuses of a match.
 */
type MatchStatus = 'draft' | 'scheduled' | 'live' | 'completed';

/**
 * @typedef {'4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2' | '3-4-3'} Formation
 * @description The possible tactical formations for a team.
 */
type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2' | '3-4-3';

/**
 * @interface MatchFormData
 * @description Represents the core data for a match being created or edited.
 */
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

/**
 * @interface Player
 * @description Represents a player in a team's roster.
 */
interface Player {
  id: number;
  name: string;
  number: number | null;
  position: string;
  isSubstitute: boolean;
}

/**
 * @interface CreateMatchFormProps
 * @description Props for the CreateMatchForm component.
 * @property {string} [matchId] - The ID of the match to edit. If not provided, the form is in creation mode.
 * @property {function(match: any): void} onMatchSubmit - Callback function triggered after a successful match creation or update.
 */
interface Match {
  id: string;
  name: string;
  description: string;
  home_team_name: string;
  away_team_name: string;
  match_date: string;
  location: string;
  competition: string;
  match_type: string;
  status: MatchStatus;
  notes: string;
  home_team_formation: Formation;
  away_team_formation: Formation;
  home_team_flag_url: string;
  away_team_flag_url: string;
  home_team_players: Player[];
  away_team_players: Player[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CreateMatchFormProps {
  matchId?: string;
  onMatchSubmit: (match: Partial<Match>) => void;
}

/**
 * @component CreateMatchForm
 * @description A comprehensive form for creating and editing football matches.
 * It handles match details, team setups, player rosters, and video links.
 * It can fetch existing match data for editing or create a new match from scratch.
 * @param {CreateMatchFormProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
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
            ? (data.home_team_players as Player[]).map((player: Player) => ({
                id: player.id || 0,
                name: player.name || '',
                number: player.number || null,
                position: player.position || '',
                isSubstitute: player.isSubstitute || false
              }))
            : [];
          const awayTeamPlayersData = Array.isArray(data.away_team_players)
            ? (data.away_team_players as Player[]).map((player: Player) => ({
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

    fetchMatchData();
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
      // Save/update match data
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
        home_team_players: homeTeamPlayers,
        away_team_players: awayTeamPlayers,
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

      // Handle video setup if URL provided
      if (videoUrl && videoUrl.trim()) {
        try {
          await YouTubeService.saveVideoMatchSetup(savedMatch.id, videoUrl, [], user.id);
          toast({ title: 'Success', description: 'Match saved with video setup!' });
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
    } catch (error: unknown) {
      console.error('Error saving match:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({ title: 'Error', description: `Failed to save match: ${errorMessage}`, variant: 'destructive' });
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