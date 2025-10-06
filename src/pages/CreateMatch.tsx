import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CreateMatchForm from '@/components/CreateMatchForm';
import UnifiedTrackerAssignment from '@/components/tracker/UnifiedTrackerAssignment';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import MatchAnalysisSidebar from '@/components/match/MatchAnalysisSidebar';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, ListTodo, Users, LayoutDashboard, Play, Calendar, BarChart3, TrendingUp, Target, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ParsedPlayer {
  id?: number;
  player_name: string;
  jersey_number: number;
  position?: string;
}

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { toast } = useToast();
  const { userRole } = useAuth();
  
  const [matchData, setMatchData] = useState<any>(null);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<ParsedPlayer[]>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<ParsedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (matchId) {
      fetchMatchData();
    } else {
      setLoading(false);
    }
  }, [matchId]);

  const parsePlayerData = (data: any, teamType: 'home' | 'away'): ParsedPlayer[] => {
    if (!data) {
      console.warn(`No player data for ${teamType} team`);
      return [];
    }
    
    let players: any[] = [];
    
    // Handle string (JSON) format
    if (typeof data === 'string') {
      try {
        players = JSON.parse(data);
      } catch (e) {
        console.error(`Error parsing ${teamType} team player data:`, e);
        return [];
      }
    } 
    // Handle array format
    else if (Array.isArray(data)) {
      players = data;
    }
    // Handle unexpected format
    else {
      console.error(`Unexpected player data format for ${teamType} team:`, typeof data);
      return [];
    }
    
    // Validate and normalize player objects
    const validPlayers = players
      .filter(p => {
        if (!p || typeof p !== 'object') return false;
        const hasName = p.player_name?.trim() || p.name?.trim();
        const hasNumber = p.jersey_number !== undefined || p.number !== undefined;
        return hasName && hasNumber;
      })
      .map((p, index) => ({
        id: Number(p.id) || index,
        player_name: (p.player_name || p.name || '').trim(),
        jersey_number: Number(p.jersey_number || p.number || index + 1),
        position: p.position?.trim() || undefined
      }));
    
    console.log(`Parsed ${teamType} team:`, validPlayers);
    return validPlayers;
  };

  const fetchMatchData = async () => {
    if (!matchId) return;
    
    setLoading(true);
    setFetchError(null);
    
    try {
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) {
        console.error('Error fetching match:', matchError);
        setFetchError(matchError.message);
        toast({
          title: "Error Loading Match",
          description: "Could not load match data. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!match) {
        setFetchError('Match not found');
        return;
      }

      setMatchData(match);
      
      // Parse player data with team type for better logging
      const homePlayers = parsePlayerData(match.home_team_players, 'home');
      const awayPlayers = parsePlayerData(match.away_team_players, 'away');
      
      setHomeTeamPlayers(homePlayers);
      setAwayTeamPlayers(awayPlayers);

      // Show warning if rosters are empty
      if (homePlayers.length === 0 && awayPlayers.length === 0) {
        toast({
          title: "Team Rosters Not Configured",
          description: "Please add players to both teams in the Match Configuration section.",
          variant: "destructive"
        });
      } else if (homePlayers.length === 0) {
        toast({
          title: "Home Team Roster Missing",
          description: "Please add players to the home team.",
          variant: "destructive"
        });
      } else if (awayPlayers.length === 0) {
        toast({
          title: "Away Team Roster Missing",
          description: "Please add players to the away team.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error in fetchMatchData:', error);
      setFetchError(error.message || 'Unknown error occurred');
      toast({
        title: "Unexpected Error",
        description: "Failed to load match data. Please refresh the page.",
        variant: "destructive"
      });
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

  const hasPlayers = homeTeamPlayers.length > 0 || awayTeamPlayers.length > 0;
  const hasBothTeams = homeTeamPlayers.length > 0 && awayTeamPlayers.length > 0;

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

                {/* Match Summary Card */}
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
                          <p className="text-gray-900 font-semibold">
                            Home: {homeTeamPlayers.length}, Away: {awayTeamPlayers.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tracker Assignment Section */}
                {matchId ? (
                  <>
                    {!hasPlayers ? (
                      <Card className="bg-amber-50 border-amber-200 shadow-lg rounded-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-6 w-6 text-amber-600" />
                            <h3 className="text-lg font-semibold text-amber-900">Team Rosters Not Configured</h3>
                          </div>
                          <p className="text-amber-800 mb-4">
                            Please add players to both teams in the <strong>Match Configuration</strong> section above before assigning trackers.
                          </p>
                          <div className="bg-white/60 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-amber-900 mb-2">Required Steps:</h4>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800">
                              <li>Scroll to the Match Configuration section</li>
                              <li>Add players with jersey numbers for the home team</li>
                              <li>Add players with jersey numbers for the away team</li>
                              <li>Save the match configuration</li>
                            </ol>
                          </div>
                          <Button
                            variant="outline"
                            onClick={fetchMatchData}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Refreshing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Match Data
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ) : !hasBothTeams ? (
                      <Card className="bg-amber-50 border-amber-200 shadow-lg rounded-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-6 w-6 text-amber-600" />
                            <h3 className="text-lg font-semibold text-amber-900">Incomplete Team Rosters</h3>
                          </div>
                          <p className="text-amber-800 mb-4">
                            {homeTeamPlayers.length === 0 
                              ? "Home team roster is missing. Please add home team players."
                              : "Away team roster is missing. Please add away team players."}
                          </p>
                          <div className="bg-white/60 rounded-lg p-3 mb-4 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Home Team:</span>
                              <span className={homeTeamPlayers.length === 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                                {homeTeamPlayers.length} players
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="font-medium">Away Team:</span>
                              <span className={awayTeamPlayers.length === 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                                {awayTeamPlayers.length} players
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={fetchMatchData}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Refreshing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Match Data
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
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
                            <UnifiedTrackerAssignment
                              matchId={matchId}
                              homeTeamPlayers={homeTeamPlayers.map((player, index) => ({
                                id: player.id || index,
                                jersey_number: player.jersey_number,
                                player_name: player.player_name,
                                team: 'home' as const,
                                position: player.position
                              }))}
                              awayTeamPlayers={awayTeamPlayers.map((player, index) => ({
                                id: player.id || (index + 1000),
                                jersey_number: player.jersey_number,
                                player_name: player.player_name,
                                team: 'away' as const,
                                position: player.position
                              }))}
                              showTypeAssignment={true}
                            />
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
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