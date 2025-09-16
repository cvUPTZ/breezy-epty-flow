import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types';
import CreateMatchForm from '@/components/CreateMatchForm';
import { useToast } from '@/hooks/use-toast';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useMenuItems } from '@/hooks/useMenuItems';

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const { toast } = useToast();
  const [existingMatch, setExistingMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(!!matchId);
  const menuItems = useMenuItems();

  useEffect(() => {
    if (!matchId) return;

    const fetchMatch = async () => {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();

        if (error) {
          console.error('Error fetching match:', error);
          toast({
            title: "Error",
            description: "Failed to load match data",
            variant: "destructive",
          });
          navigate('/matches');
          return;
        }

        setExistingMatch(data as Match);
      } catch (error) {
        console.error('Error in fetchMatch:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        navigate('/matches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, navigate, toast]);

  const handleMatchSubmit = (match: Match) => {
    toast({
      title: "Success",
      description: matchId ? "Match updated successfully" : "Match created successfully",
    });
    navigate(`/match/${match.id}`);
  };

  if (isLoading) {
    return (
      <SidebarInset>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">{matchId ? 'Edit Match' : 'Create Match'}</h1>
            <p className="text-muted-foreground">
              {matchId ? 'Update match details' : 'Set up a new football match for tracking and analysis'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{matchId ? 'Edit Match Details' : 'Match Setup'}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateMatchForm 
              onMatchSubmit={handleMatchSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
};

export default CreateMatch;