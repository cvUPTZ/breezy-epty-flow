import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { AdminOnly } from '@/components/RequireAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CreateMvpMatchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teamOneName, setTeamOneName] = useState('');
  const [teamTwoName, setTeamTwoName] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a match.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.from('matches').insert({
        home_team_name: teamOneName,
        away_team_name: teamTwoName,
        created_by: user.id,
        is_mvp_match: true,
        status: 'draft' // Using a status from the existing table schema
      }).select().single();

      if (error) {
        throw error;
      }

      toast.success('MVP Match created successfully!');
      navigate(`/mvp/match/tracker/${data.id}`);
    } catch (error: any) {
      console.error('Error creating MVP match:', error);
      toast.error('Failed to create MVP match:', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Create an MVP Match</CardTitle>
          <CardDescription>
            This is a simplified form for creating a match for the MVP system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamOneName">Home Team Name</Label>
              <Input
                id="teamOneName"
                value={teamOneName}
                onChange={(e) => setTeamOneName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamTwoName">Away Team Name</Label>
              <Input
                id="teamTwoName"
                value={teamTwoName}
                onChange={(e) => setTeamTwoName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create MVP Match'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// This component ensures that only admins can access the page
const CreateMvpMatch = () => (
  <AdminOnly>
    <CreateMvpMatchPage />
  </AdminOnly>
);

export default CreateMvpMatch;
