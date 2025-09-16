import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

// The Match type from the original application can be used if it's compatible
// For MVP, we'll define a simple one to ensure it works.
type MvpMatch = {
  id: string;
  created_at: string;
  home_team_name: string;
  away_team_name: string;
  status: string;
};

const MvpMatches = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MvpMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMvpMatches = async () => {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('id, created_at, home_team_name, away_team_name, status')
          .eq('is_mvp_match', true) // Fetch only MVP matches
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setMatches(data || []);
      } catch (error: any) {
        console.error('Error fetching MVP matches:', error);
        toast.error('Failed to load MVP matches:', { description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchMvpMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">MVP Matches</h1>
          <p className="text-muted-foreground">A simplified list of matches for the MVP system.</p>
        </div>
        {userRole === 'admin' && (
          <Button onClick={() => navigate('/mvp/create-match')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create MVP Match
          </Button>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No MVP Matches Found</h3>
            <p className="text-muted-foreground mt-2">
                Get started by creating a new MVP match.
            </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <Link to={`/mvp/match/tracker/${match.id}`} key={match.id}>
                <Card className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="truncate">{match.home_team_name} vs {match.away_team_name}</CardTitle>
                  <CardDescription>
                    Status: <span className="font-semibold">{match.status}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(match.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MvpMatches;
