
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VideoMatchSetup from '@/components/admin/VideoMatchSetup';
import { Calendar, MapPin, Users, Trophy, FileText, Video } from 'lucide-react';

interface CreateMatchFormProps {
  onMatchSubmit: (match: any) => void;
}

interface Match {
  id: string;
  name: string | null;
  home_team_name: string;
  away_team_name: string;
  status: string;
  match_date: string | null;
  created_at: string | null;
}

const CreateMatchForm: React.FC<CreateMatchFormProps> = ({ onMatchSubmit }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    home_team_name: '',
    away_team_name: '',
    match_date: '',
    location: '',
    competition: '',
    description: '',
    notes: '',
    match_type: 'regular'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.home_team_name || !formData.away_team_name) {
      toast({
        title: "Validation Error",
        description: "Please enter both team names",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert([{
          name: formData.name || null,
          home_team_name: formData.home_team_name,
          away_team_name: formData.away_team_name,
          match_date: formData.match_date || null,
          location: formData.location || null,
          competition: formData.competition || null,
          description: formData.description || null,
          notes: formData.notes || null,
          match_type: formData.match_type,
          status: 'draft'
        }])
        .select()
        .single();

      if (matchError) throw matchError;

      // If video URL is provided, save it to match_video_settings
      if (videoUrl.trim()) {
        try {
          const { data: videoData, error: videoError } = await supabase
            .from('match_video_settings')
            .insert([{
              match_id: matchData.id,
              video_url: videoUrl,
              created_by: (await supabase.auth.getUser()).data.user?.id
            }])
            .select()
            .single();

          if (videoError) {
            console.error('Error saving video URL:', videoError);
            toast({
              title: "Warning",
              description: "Match created but video URL could not be saved.",
              variant: "destructive",
            });
          } else {
            console.log('Video URL saved:', videoData);
            toast({
              title: "Success",
              description: "Match and video URL saved successfully!",
              variant: "default",
            });
          }
        } catch (error) {
          console.error('Error with video URL:', error);
        }
      }

      toast({
        title: "Success",
        description: "Match created successfully!",
      });

      // Reset form
      setFormData({
        name: '',
        home_team_name: '',
        away_team_name: '',
        match_date: '',
        location: '',
        competition: '',
        description: '',
        notes: '',
        match_type: 'regular'
      });
      setVideoUrl('');

      onMatchSubmit(matchData);
    } catch (error: any) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create match",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="match-name" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Match Name (Optional)
          </Label>
          <Input
            id="match-name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Premier League Final"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="match-date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Match Date
          </Label>
          <Input
            id="match-date"
            type="datetime-local"
            value={formData.match_date}
            onChange={(e) => handleInputChange('match_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="home-team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Home Team *
          </Label>
          <Input
            id="home-team"
            value={formData.home_team_name}
            onChange={(e) => handleInputChange('home_team_name', e.target.value)}
            placeholder="Enter home team name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="away-team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Away Team *
          </Label>
          <Input
            id="away-team"
            value={formData.away_team_name}
            onChange={(e) => handleInputChange('away_team_name', e.target.value)}
            placeholder="Enter away team name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Wembley Stadium"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="competition">Competition</Label>
          <Input
            id="competition"
            value={formData.competition}
            onChange={(e) => handleInputChange('competition', e.target.value)}
            placeholder="e.g., Premier League"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="match-type">Match Type</Label>
          <Select value={formData.match_type} onValueChange={(value) => handleInputChange('match_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select match type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="tournament">Tournament</SelectItem>
              <SelectItem value="cup">Cup</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of the match"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes or comments"
            rows={2}
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5" />
              Optional: Add Video URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoMatchSetup
              simplifiedView={true}
              videoUrl={videoUrl}
              onVideoUrlChange={setVideoUrl}
            />
          </CardContent>
        </Card>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating...' : 'Create Match'}
      </Button>
    </form>
  );
};

export default CreateMatchForm;
