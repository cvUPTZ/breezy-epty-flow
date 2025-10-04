import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import CreateMatchForm from '@/components/CreateMatchForm';
import UnifiedTrackerAssignment from '@/components/tracker/UnifiedTrackerAssignment';
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
      
      // Parse player data safely - handle both string and array formats
      const parsePlayerData = (data: any): any[] => {
        if (!data) return [];
        
        let players: any[] = [];
        if (typeof data === 'string') {
          try {
            players = JSON.parse(data);
          } catch (e) {
            console.error('Error parsing player data:', e);
            return [];
          }
        } else if (Array.isArray(data)) {
          players = data;
        }
        
        // Filter out invalid players
        return players.filter(p => p && p.player_name?.trim());
      };
      
      const homePlayers = parsePlayerData(match?.home_team_players);
      const awayPlayers = parsePlayerData(match?.away_team_players);
      
      console.log('Parsed players:', { homePlayers, awayPlayers });
      
      setHomeTeamPlayers(homePlayers);
      setAwayTeamPlayers(awayPlayers);
    } catch (error) {
      console.error('Error in fetchMatchData:', error);
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

              <div className="space-y-8">
                {/* Match Details Section */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-xl rounded-2xl">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <ListTodo className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Match Configuration
                      </h2>
                    </div>
                    <CreateMatchForm matchId={matchId} onMatchSubmit={handleMatchSubmit} />
                  </CardContent>
                </Card>

                {/* Match Summary Card (shows after match is saved) */}
                {matchId && matchData && (
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50 shadow-lg rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-900">Match Overview</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-white/60 rounded-lg p-3">
                          <span className="font-medium text-gray-700">Match:</span>
                          <p className="text-gray-900 font-semibold">{matchData.name || `${matchData.home_team_name} vs ${matchData.away_team_name}`}</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <span className="font-medium text-gray-700">Status:</span>
                          <p className="text-gray-900 font-semibold capitalize">{matchData.status}</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <span className="font-medium text-gray-700">Teams:</span>
                          <p className="text-gray-900 font-semibold">{matchData.home_team_name} vs {matchData.away_team_name}</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <span className="font-medium text-gray-700">Players:</span>
                          <p className="text-gray-900 font-semibold">Home: {homeTeamPlayers.length}, Away: {awayTeamPlayers.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tracker Assignment Section */}
                {matchId ? (
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-xl rounded-2xl">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Users className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Tracker Management
                        </h2>
                      </div>
                      
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-gray-500 mt-4">Loading tracker assignments...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Debug info */}
                          {homeTeamPlayers.length === 0 && awayTeamPlayers.length === 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                              <p className="font-medium">No players found for this match.</p>
                              <p className="mt-1">Please ensure team rosters are configured in the Match Configuration section above.</p>
                            </div>
                          )}
                          
                          {/* Unified Tracker Assignment System */}
                          <UnifiedTrackerAssignment
                            matchId={matchId}
                            homeTeamPlayers={homeTeamPlayers.map((player, index) => ({
                              id: Number(player.id) || index,
                              jersey_number: player.jersey_number || player.number || index + 1,
                              player_name: player.player_name || player.name || `Player ${index + 1}`,
                              team: 'home' as const,
                              position: player.position
                            }))}
                            awayTeamPlayers={awayTeamPlayers.map((player, index) => ({
                              id: Number(player.id) || index + 100,
                              jersey_number: player.jersey_number || player.number || index + 1,
                              player_name: player.player_name || player.name || `Player ${index + 1}`,
                              team: 'away' as const,
                              position: player.position
                            }))}
                            showTypeAssignment={true}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50 shadow-lg rounded-2xl">
                    <CardContent className="text-center py-12 px-6">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-amber-800 mb-2">Ready to Assign Trackers</h3>
                      <p className="text-amber-700 mb-4">Save the match details above to enable tracker assignment and management.</p>
                      <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                        <span>Waiting for match creation...</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default CreateMatch;
