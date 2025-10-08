import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const AdminQualityControl = () => {
  const navigate = useNavigate();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches-for-quality-control'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Quality Control</h1>
          <p className="text-muted-foreground">Select a match to review and manage quality control</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading matches...</div>
      ) : (
        <div className="grid gap-4">
          {matches?.map((match) => (
            <Card key={match.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{match.name || `${match.home_team_name} vs ${match.away_team_name}`}</span>
                  <Button
                    onClick={() => navigate(`/match/${match.id}/quality-control`)}
                    variant="outline"
                    size="sm"
                  >
                    Open Quality Control
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  {match.match_date && format(new Date(match.match_date), 'PPP')} • Status: {match.status}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Home: {match.home_team_name}</span>
                  <span>Away: {match.away_team_name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {matches?.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No matches found
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminQualityControl;
