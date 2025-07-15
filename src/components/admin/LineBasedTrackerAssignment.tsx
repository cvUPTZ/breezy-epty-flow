
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Target, Shield, Zap, Globe } from 'lucide-react';

interface Match {
  id: string;
  name?: string | null;
  home_team_name: string;
  away_team_name: string;
  home_team_players: any[];
  away_team_players: any[];
}

interface Tracker {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface LineAssignment {
  line: 'defense' | 'midfield' | 'attack' | 'all_events';
  team: 'home' | 'away' | 'both';
  tracker_id: string;
  match_id: string;
}

const LineBasedTrackerAssignment: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [assignments, setAssignments] = useState<LineAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // All available event types
  const allEventTypes = ['goal', 'shot', 'pass', 'tackle', 'foul', 'assist', 'save', 'corner', 'freeKick', 'throw_in', 'offside', 'yellow_card', 'red_card'];

  useEffect(() => {
    fetchMatches();
    fetchTrackers();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchExistingAssignments();
    }
  }, [selectedMatch]);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, name, home_team_name, away_team_name, home_team_players, away_team_players')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to handle Json types properly
      const transformedMatches: Match[] = (data || []).map(match => ({
        id: match.id,
        name: match.name,
        home_team_name: match.home_team_name,
        away_team_name: match.away_team_name,
        home_team_players: Array.isArray(match.home_team_players) ? match.home_team_players : [],
        away_team_players: Array.isArray(match.away_team_players) ? match.away_team_players : []
      }));
      
      setMatches(transformedMatches);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive"
      });
    }
  };

  const fetchTrackers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'tracker')
        .order('full_name');

      if (error) throw error;
      
      // Handle nullable fields properly
      const transformedTrackers: Tracker[] = (data || []).map(tracker => ({
        id: tracker.id,
        full_name: tracker.full_name,
        email: tracker.email
      }));
      
      setTrackers(transformedTrackers);
    } catch (error: any) {
      console.error('Error fetching trackers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trackers",
        variant: "destructive"
      });
    }
  };

  const fetchExistingAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', selectedMatch);

      if (error) throw error;

      // Convert existing assignments to line-based format for display
      const lineAssignments: LineAssignment[] = [];
      // This is a simplified version - in a real implementation, you'd need to 
      // determine how to map existing player assignments to line assignments
      setAssignments(lineAssignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
    }
  };

  const getLineIcon = (line: string) => {
    switch (line) {
      case 'defense': return <Shield className="h-4 w-4" />;
      case 'midfield': return <Target className="h-4 w-4" />;
      case 'attack': return <Zap className="h-4 w-4" />;
      case 'all_events': return <Globe className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getLineColor = (line: string) => {
    switch (line) {
      case 'defense': return 'border-blue-200';
      case 'midfield': return 'border-green-200';
      case 'attack': return 'border-red-200';
      case 'all_events': return 'border-purple-200';
      default: return 'border-gray-200';
    }
  };

  const getLinePlayersForPosition = (match: Match, line: string, team: 'home' | 'away') => {
    const players = team === 'home' ? match.home_team_players : match.away_team_players;
    
    if (line === 'all_events') {
      return players; // All players
    }

    // Filter players by position/line
    return players.filter((player: any) => {
      const position = player.position?.toLowerCase() || '';
      switch (line) {
        case 'defense':
          return position.includes('def') || position.includes('back') || position.includes('gk');
        case 'midfield':
          return position.includes('mid') || position.includes('center');
        case 'attack':
          return position.includes('for') || position.includes('att') || position.includes('wing');
        default:
          return false;
      }
    });
  };

  const assignTrackerToLine = async (line: 'defense' | 'midfield' | 'attack' | 'all_events', team: 'home' | 'away' | 'both', trackerId: string) => {
    if (!selectedMatch) {
      toast({
        title: "Error",
        description: "Please select a match first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const selectedMatchData = matches.find(m => m.id === selectedMatch);
      if (!selectedMatchData) throw new Error('Match not found');

      const teamsToAssign = team === 'both' ? ['home', 'away'] : [team];
      
      for (const teamId of teamsToAssign) {
        let playersToAssign: any[] = [];
        
        if (line === 'all_events') {
          // For "all events", we don't assign to specific players - tracker handles all events
          playersToAssign = []; // Empty array means no specific player assignment
        } else {
          // Get players for specific line
          playersToAssign = getLinePlayersForPosition(selectedMatchData, line, teamId as 'home' | 'away');
        }

        if (line === 'all_events') {
          // Create a single assignment for all events without specific players
          const { error } = await supabase
            .from('match_tracker_assignments')
            .insert({
              match_id: selectedMatch,
              tracker_user_id: trackerId,
              player_id: null, // No specific player for all events
              player_team_id: teamId,
              assigned_event_types: allEventTypes
            });

          if (error) throw error;
        } else {
          // Create assignments for each player in the line
          for (const player of playersToAssign) {
            const { error } = await supabase
              .from('match_tracker_assignments')
              .insert({
                match_id: selectedMatch,
                tracker_user_id: trackerId,
                player_id: player.id,
                player_team_id: teamId,
                assigned_event_types: allEventTypes
              });

            if (error) throw error;
          }
        }
      }

      toast({
        title: "Success",
        description: `Tracker assigned to ${line} line for ${team} team(s)`
      });

      fetchExistingAssignments();
    } catch (error: any) {
      console.error('Error assigning tracker:', error);
      toast({
        title: "Error",
        description: "Failed to assign tracker",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAllAssignments = async () => {
    if (!selectedMatch) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_tracker_assignments')
        .delete()
        .eq('match_id', selectedMatch);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All assignments cleared"
      });

      setAssignments([]);
    } catch (error: any) {
      console.error('Error clearing assignments:', error);
      toast({
        title: "Error",
        description: "Failed to clear assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedMatchData = matches.find(m => m.id === selectedMatch);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Line-Based Tracker Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Match</label>
            <Select value={selectedMatch} onValueChange={setSelectedMatch}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a match" />
              </SelectTrigger>
              <SelectContent>
                {matches.map((match) => (
                  <SelectItem key={match.id} value={match.id}>
                    {match.name || `${match.home_team_name} vs ${match.away_team_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMatch && selectedMatchData && (
            <>
              {/* Line Assignment Grid */}
              <div className="grid gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">
                    {selectedMatchData.home_team_name} vs {selectedMatchData.away_team_name}
                  </h3>
                </div>

                {/* Defense Line */}
                <Card className={getLineColor('defense')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Shield className="h-5 w-5" />
                      Defense Line
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Home Team Defense */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{selectedMatchData.home_team_name} Defense</h4>
                        <div className="space-y-1">
                          {getLinePlayersForPosition(selectedMatchData, 'defense', 'home').map((player: any) => (
                            <Badge key={player.id} variant="outline" className="text-xs">
                              #{player.jersey_number} {player.name}
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('defense', 'home', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Away Team Defense */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{selectedMatchData.away_team_name} Defense</h4>
                        <div className="space-y-1">
                          {getLinePlayersForPosition(selectedMatchData, 'defense', 'away').map((player: any) => (
                            <Badge key={player.id} variant="outline" className="text-xs">
                              #{player.jersey_number} {player.name}
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('defense', 'away', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Both Teams Defense */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Both Teams Defense</h4>
                        <p className="text-xs text-muted-foreground">Assign one tracker to both teams' defense</p>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('defense', 'both', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Midfield Line */}
                <Card className={getLineColor('midfield')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Target className="h-5 w-5" />
                      Midfield Line
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Home Team Midfield */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{selectedMatchData.home_team_name} Midfield</h4>
                        <div className="space-y-1">
                          {getLinePlayersForPosition(selectedMatchData, 'midfield', 'home').map((player: any) => (
                            <Badge key={player.id} variant="outline" className="text-xs">
                              #{player.jersey_number} {player.name}
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('midfield', 'home', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Away Team Midfield */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{selectedMatchData.away_team_name} Midfield</h4>
                        <div className="space-y-1">
                          {getLinePlayersForPosition(selectedMatchData, 'midfield', 'away').map((player: any) => (
                            <Badge key={player.id} variant="outline" className="text-xs">
                              #{player.jersey_number} {player.name}
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('midfield', 'away', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Both Teams Midfield */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Both Teams Midfield</h4>
                        <p className="text-xs text-muted-foreground">Assign one tracker to both teams' midfield</p>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('midfield', 'both', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attack Line */}
                <Card className={getLineColor('attack')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <Zap className="h-5 w-5" />
                      Attack Line
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Home Team Attack */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{selectedMatchData.home_team_name} Attack</h4>
                        <div className="space-y-1">
                          {getLinePlayersForPosition(selectedMatchData, 'attack', 'home').map((player: any) => (
                            <Badge key={player.id} variant="outline" className="text-xs">
                              #{player.jersey_number} {player.name}
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('attack', 'home', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Away Team Attack */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{selectedMatchData.away_team_name} Attack</h4>
                        <div className="space-y-1">
                          {getLinePlayersForPosition(selectedMatchData, 'attack', 'away').map((player: any) => (
                            <Badge key={player.id} variant="outline" className="text-xs">
                              #{player.jersey_number} {player.name}
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('attack', 'away', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Both Teams Attack */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Both Teams Attack</h4>
                        <p className="text-xs text-muted-foreground">Assign one tracker to both teams' attack</p>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('attack', 'both', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* All Events Assignment */}
                <Card className={getLineColor('all_events')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Globe className="h-5 w-5" />
                      All Events Tracker
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Home Team All Events */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{selectedMatchData.home_team_name} All Events</h4>
                        <p className="text-xs text-muted-foreground">Track all events for home team without specific player assignment</p>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('all_events', 'home', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Away Team All Events */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{selectedMatchData.away_team_name} All Events</h4>
                        <p className="text-xs text-muted-foreground">Track all events for away team without specific player assignment</p>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('all_events', 'away', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Both Teams All Events */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">All Teams All Events</h4>
                        <p className="text-xs text-muted-foreground">Track all events for both teams without specific player assignment</p>
                        <Select onValueChange={(trackerId) => assignTrackerToLine('all_events', 'both', trackerId)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign tracker" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackers.map((tracker) => (
                              <SelectItem key={tracker.id} value={tracker.id}>
                                {tracker.full_name || tracker.email || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button 
                    variant="destructive" 
                    onClick={clearAllAssignments}
                    disabled={loading}
                  >
                    Clear All Assignments
                  </Button>
                  <Button 
                    onClick={fetchExistingAssignments}
                    disabled={loading}
                  >
                    Refresh Assignments
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LineBasedTrackerAssignment;
