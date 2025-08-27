import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import CreateMatchForm from '@/components/CreateMatchForm';
import TrackerAssignment from '@/components/match/TrackerAssignment';
import TrackerAssignmentTabs from '@/components/admin/TrackerAssignmentTabs';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import MatchAnalysisSidebar from '@/components/match/MatchAnalysisSidebar';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, ListTodo, Users, LayoutDashboard, Play, Calendar, BarChart3, TrendingUp, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { toast } = useToast();
  const { userRole } = useAuth();
  
  // Add state for match data and players
  const [matchData, setMatchData] = useState<any>(null);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<any[]>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      fetchMatchData();
    } else {
      setLoading(false);
    }
  }, [matchId]);

  const fetchMatchData = async () => {
    if (!matchId) return;
    
    try {
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) {
        console.error('Error fetching match:', matchError);
        return;
      }

      setMatchData(match);
      
      // Extract players from the match data - ensure they're arrays
      if (match?.home_team_players && Array.isArray(match.home_team_players)) {
        setHomeTeamPlayers(match.home_team_players);
      }
      
      if (match?.away_team_players && Array.isArray(match.away_team_players)) {
        setAwayTeamPlayers(match.away_team_players);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSubmit = (submittedMatch: any) => {
    if (submittedMatch?.id) {
      if (matchId) {
        toast({
          title: 'Match Updated',
          description: 'The match details have been saved successfully.',
        });
        // Refresh match data after form submission
        fetchMatchData();
      } else {
        // After creation, navigate to the edit page for the new match
        navigate(`/match/${submittedMatch.id}/edit`);
        toast({
          title: 'Match Created',
          description: 'You can now assign trackers to the match.',
        });
      }
    } else {
      // Fallback navigation
      if (matchId) {
        navigate(`/match/${matchId}`);
      } else {
        navigate('/admin');
      }
    }
  };

  const menuItems = [
    { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' }
  ];

  if (userRole === 'admin' || userRole === 'tracker') {
    menuItems.push({ value: 'new-match', label: 'New Match', icon: Play, path: '/match' });
  }
  if (userRole === 'admin' || userRole === 'manager') {
    menuItems.push({ value: 'match-history', label: 'Match History', icon: Calendar, path: '/matches' });
  }
  if (userRole === 'admin' || userRole === 'manager' || userRole === 'teacher') {
    menuItems.push({ value: 'statistics', label: 'Statistics', icon: BarChart3, path: '/statistics' });
  }
  if (userRole === 'admin' || userRole === 'manager') {
    menuItems.push({ value: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' });
  }
  if (userRole === 'admin') {
    menuItems.push({ value: 'admin', label: 'Admin Panel', icon: Target, path: '/admin' });
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex w-full">
        <MatchAnalysisSidebar menuItems={menuItems} groupLabel="Navigation" />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="h-10 w-10 flex-shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back</span>
                </Button>
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {matchId ? 'Edit Match' : 'Create New Match'}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    {matchId ? 'Update match details and manage tracker assignments.' : 'Complete match details to enable tracker assignment.'}
                  </p>
                </div>
              </div>

              <Tabs defaultValue="match-details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger 
                    value="match-details"
                    className="flex items-center gap-2"
                  >
                    <ListTodo className="h-4 w-4" />
                    Match Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tracker-assignment"
                    disabled={!matchId}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Tracker Assignment
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="match-details" className="mt-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-xl rounded-2xl">
                    <CardContent className="p-6 sm:p-8">
                      <CreateMatchForm matchId={matchId} onMatchSubmit={handleMatchSubmit} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tracker-assignment" className="mt-6">
                  {matchId ? (
                    <div className="space-y-6">
                      {/* Match Details Display */}
                      {loading ? (
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-xl rounded-2xl">
                          <CardContent className="text-center py-8 px-6">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                            <p className="text-gray-500 mt-4">Loading match details...</p>
                          </CardContent>
                        </Card>
                      ) : matchData ? (
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-xl rounded-2xl">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Calendar className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">Match Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Match:</span>
                                <p className="text-gray-900">{matchData.name || `${matchData.home_team_name} vs ${matchData.away_team_name}`}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Teams:</span>
                                <p className="text-gray-900">{matchData.home_team_name} vs {matchData.away_team_name}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Players:</span>
                                <p className="text-gray-900">Home: {homeTeamPlayers.length}, Away: {awayTeamPlayers.length}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : null}

                      {/* Enhanced Tracker Assignment with New Options */}
                      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-xl rounded-2xl">
                        <CardContent className="p-6 sm:p-8">
                          <TrackerAssignmentTabs
                            matchId={matchId || ''}
                            homeTeamPlayers={homeTeamPlayers}
                            awayTeamPlayers={awayTeamPlayers}
                          />
                        </CardContent>
                      </Card>
                      
                      {/* Original Tracker Assignment (keeping existing functionality) */}
                      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-xl rounded-2xl">
                        <CardContent className="p-6 sm:p-8">
                          <TrackerAssignment
                            matchId={matchId || ''}
                            homeTeamPlayers={homeTeamPlayers}
                            awayTeamPlayers={awayTeamPlayers}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-xl rounded-2xl">
                      <CardContent className="text-center py-16 px-6 text-gray-500">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">Assign Trackers</h3>
                        <p className="mt-1">You must save the match details before you can assign trackers.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default CreateMatch;
