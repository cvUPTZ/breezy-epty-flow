import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Zap, Target, Users, Trash2, Plus, PersonStanding, ChevronRight } from 'lucide-react';
import { EVENT_TYPE_CATEGORIES } from '@/constants/eventTypes';

interface TrackerTypeAssignmentProps {
  matchId: string;
  homeTeamPlayers: any[];
  awayTeamPlayers: any[];
}

type TrackerType = 'specialized' | 'defence' | 'midfield' | 'attack';

interface TrackerAssignment {
  id: string;
  tracker_type: TrackerType;
  tracker_user_id: string;
  assigned_event_types: string[];
  line_players: any[];
  tracker_name?: string;
  tracker_email?: string;
}

// Updated and more comprehensive line definitions for football positions
const LINE_DEFINITIONS: Record<string, string[]> = {
  Defense: ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'SW', 'DC', 'DR', 'DL'],
  Midfield: ['DM', 'CM', 'AM', 'LM', 'RM', 'CDM', 'CAM', 'DMC', 'MC', 'AMC', 'ML', 'MR'],
  Attack: ['CF', 'ST', 'LW', 'RW', 'LF', 'RF', 'SS', 'FW'],
};

const TrackerTypeAssignment: React.FC<TrackerTypeAssignmentProps> = ({
  matchId,
  homeTeamPlayers,
  awayTeamPlayers
}) => {
  const [assignments, setAssignments] = useState<TrackerAssignment[]>([]);
  const [trackerUsers, setTrackerUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrackerType, setSelectedTrackerType] = useState<TrackerType>('specialized');
  const [selectedTracker, setSelectedTracker] = useState<string>('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // New state for player selection
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | 'both'>('both');
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>('');

  const trackerTypeConfig = {
    specialized: {
      icon: Users,
      label: 'Specialized Tracker',
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      description: 'Tracks specific events across selected players'
    },
    defence: {
      icon: Shield,
      label: 'Defence Tracker',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      description: 'Tracks defensive players and related events'
    },
    midfield: {
      icon: Zap,
      label: 'Midfield Tracker',
      color: 'bg-green-100 border-green-300 text-green-800',
      description: 'Tracks midfield players and related events'
    },
    attack: {
      icon: Target,
      label: 'Attack Tracker',
      color: 'bg-red-100 border-red-300 text-red-800',
      description: 'Tracks attacking players and related events'
    }
  };

  useEffect(() => {
    fetchData();
  }, [matchId]);

  // Reset selected players when tracker type or team changes
  useEffect(() => {
    setSelectedPlayers([]);
    setSelectedLine('');
  }, [selectedTrackerType, selectedTeam]);

  const fetchData = async () => {
    await Promise.all([fetchAssignments(), fetchTrackerUsers()]);
    setLoading(false);
  };

  const fetchAssignments = async () => {
    try {
      // Clean up old individual assignments first
      await supabase
        .from('match_tracker_assignments')
        .delete()
        .eq('match_id', matchId);

      const { data, error } = await supabase
        .from('tracker_line_assignments')
        .select(`
          *,
          tracker_profile:profiles!tracker_user_id(
            full_name,
            email
          )
        `)
        .eq('match_id', matchId);

      if (error) throw error;

      const processedAssignments = (data || []).map(assignment => {
        // Ensure line_players is an array and remove duplicates
        let linePlayers = Array.isArray(assignment.line_players) ? assignment.line_players : [];
        
        // Remove duplicate players based on ID
        const uniquePlayers = linePlayers.filter((player: any, index, self) => 
          player && typeof player === 'object' && player.id &&
          index === self.findIndex((p: any) => p && typeof p === 'object' && p.id === player.id)
        );

        console.log('Processing assignment:', {
          id: assignment.id,
          tracker_type: assignment.tracker_type,
          playersCount: uniquePlayers.length,
          eventTypes: assignment.assigned_event_types
        });

        return {
          ...assignment,
          line_players: uniquePlayers,
          tracker_name: (assignment as any).tracker_profile?.full_name,
          tracker_email: (assignment as any).tracker_profile?.email
        };
      });

      console.log('Total assignments fetched:', processedAssignments.length);
      setAssignments(processedAssignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tracker assignments",
        variant: "destructive"
      });
    }
  };

  const fetchTrackerUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'tracker');

      if (error) throw error;
      setTrackerUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching tracker users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tracker users",
        variant: "destructive"
      });
    }
  };

  // Helper function to get players count for each line
  const getLinePlayersCount = (team: 'home' | 'away', line: string) => {
    const targetPlayers = team === 'home' ? homeTeamPlayers : awayTeamPlayers;
    const linePositions = LINE_DEFINITIONS[line] || [];
    return targetPlayers.filter(player => {
      if (!player.position) return false;
      const playerPosition = player.position.toUpperCase().trim();
      return linePositions.includes(playerPosition);
    }).length;
  };

  const getLinePlayers = (trackerType: TrackerType) => {
    if (trackerType === 'specialized') {
      // For specialized tracker, return selected players
      const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
      return allPlayers.filter(player => selectedPlayers.includes(player.id));
    }

    // Get players based on team selection
    let playersToFilter = [];
    if (selectedTeam === 'home') {
      playersToFilter = homeTeamPlayers;
    } else if (selectedTeam === 'away') {
      playersToFilter = awayTeamPlayers;
    } else {
      playersToFilter = [...homeTeamPlayers, ...awayTeamPlayers];
    }

    // If a specific line is selected, use line definitions
    if (selectedLine && LINE_DEFINITIONS[selectedLine]) {
      const linePositions = LINE_DEFINITIONS[selectedLine];
      return playersToFilter.filter(player => {
        if (!player.position) return false;
        const playerPosition = player.position.toUpperCase().trim();
        return linePositions.includes(playerPosition);
      });
    }

    // Fallback to position-based filtering (original logic)
    return playersToFilter.filter(player => {
      const position = player.position?.toLowerCase() || '';
      switch (trackerType) {
        case 'defence':
          return position.includes('def') || position.includes('cb') || position.includes('lb') || position.includes('rb') || position.includes('gk');
        case 'midfield':
          return position.includes('mid') || position.includes('cm') || position.includes('dm') || position.includes('am') || position.includes('rm') || position.includes('lm');
        case 'attack':
          return position.includes('att') || position.includes('fw') || position.includes('st') || position.includes('lw') || position.includes('rw') || position.includes('cf');
        default:
          return false;
      }
    });
  };

  const handleEventTypeToggle = (eventType: string) => {
    setSelectedEventTypes(prev =>
      prev.includes(eventType)
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  const handleCategoryToggle = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      newSet.has(categoryKey) ? newSet.delete(categoryKey) : newSet.add(categoryKey);
      return newSet;
    });
  };

  const handlePlayerToggle = (playerId: number) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleCreateAssignment = async () => {
    if (!selectedTracker || selectedEventTypes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a tracker and at least one event type",
        variant: "destructive"
      });
      return;
    }

    if (selectedTrackerType === 'specialized' && selectedPlayers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one player for specialized tracking",
        variant: "destructive"
      });
      return;
    }

    try {
      const linePlayers = getLinePlayers(selectedTrackerType);
      
      if (linePlayers.length === 0 && selectedTrackerType !== 'specialized') {
        toast({
          title: "Validation Error",
          description: `No players found for ${selectedTrackerType} in the selected team(s)`,
          variant: "destructive"
        });
        return;
      }
      
      // First, delete any existing assignments for this tracker and match
      await supabase
        .from('tracker_line_assignments')
        .delete()
        .eq('match_id', matchId)
        .eq('tracker_user_id', selectedTracker);
      
      // Also delete any old individual assignments
      await supabase
        .from('match_tracker_assignments')
        .delete()
        .eq('match_id', matchId)
        .eq('tracker_user_id', selectedTracker);
      
      // Create new assignment
      const { error } = await supabase
        .from('tracker_line_assignments')
        .insert({
          match_id: matchId,
          tracker_type: selectedTrackerType,
          tracker_user_id: selectedTracker,
          assigned_event_types: selectedEventTypes,
          line_players: linePlayers
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tracker assignment created successfully"
      });

      await fetchAssignments();
      
      // Reset form
      setSelectedTracker('');
      setSelectedEventTypes([]);
      setSelectedPlayers([]);
      setSelectedLine('');
      setExpandedCategories(new Set());
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create tracker assignment",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    console.log('Delete button clicked for assignment:', assignmentId);
    
    if (!assignmentId) {
      console.error('Assignment ID is undefined');
      toast({
        title: "Error",
        description: "Invalid assignment ID",
        variant: "destructive"
      });
      return;
    }

    try {
      // Find the assignment to get tracker_user_id
      const { data: assignment } = await supabase
        .from('tracker_line_assignments')
        .select('tracker_user_id')
        .eq('id', assignmentId)
        .single();

      if (assignment) {
        // Delete from both tables to ensure cleanup
        const { error: lineError } = await supabase
          .from('tracker_line_assignments')
          .delete()
          .eq('id', assignmentId);
        
        if (lineError) {
          console.error('Error deleting line assignment:', lineError);
        }
        
        const { error: playerError } = await supabase
          .from('match_tracker_assignments')
          .delete()
          .eq('match_id', matchId)
          .eq('tracker_user_id', assignment.tracker_user_id);
        
        if (playerError) {
          console.error('Error deleting player assignments:', playerError);
        }
      }

      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      });

      await fetchAssignments();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      });
    }
  };

  const renderPlayerGrid = (players: any[], selectedPlayerIds: number[], onToggle: (id: number) => void) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {players.map(player => (
        <div
          key={player.id}
          className={`p-2 border rounded cursor-pointer transition-colors ${selectedPlayerIds.includes(player.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onClick={() => onToggle(player.id)}
        >
          <div className="text-xs font-medium">#{player.jersey_number}</div>
          <div className="text-xs text-gray-600 truncate">{player.player_name}</div>
          {player.position && (
            <div className="text-xs text-blue-600 font-semibold">{player.position}</div>
          )}
        </div>
      ))}
    </div>
  );

  const renderEventTypeCategories = () => (
    <div className="space-y-3">
      {EVENT_TYPE_CATEGORIES.map(category => (
        <div key={category.key} className="border rounded-lg">
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" 
            onClick={() => handleCategoryToggle(category.key)}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={category.events.every(e => selectedEventTypes.includes(e.key))}
                onCheckedChange={(checked) => {
                  const eventKeys = category.events.map(e => e.key);
                  if (checked) {
                    setSelectedEventTypes(prev => [...new Set([...prev, ...eventKeys])]);
                  } else {
                    setSelectedEventTypes(prev => prev.filter(k => !eventKeys.includes(k)));
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Badge style={{ backgroundColor: category.color }} className="text-white">
                {category.label}
              </Badge>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${
              expandedCategories.has(category.key) ? 'rotate-90' : ''
            }`} />
          </div>
          {expandedCategories.has(category.key) && (
            <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {category.events.map(event => (
                <div
                  key={event.key}
                  className={`p-2 border rounded cursor-pointer text-center text-xs transition-colors ${
                    selectedEventTypes.includes(event.key)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleEventTypeToggle(event.key)}
                >
                  {event.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className="p-4 text-center">Loading tracker assignments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Tracker Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tracker Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Tracker Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(trackerTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <div
                    key={type}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTrackerType === type
                        ? config.color
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTrackerType(type as TrackerType)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {trackerTypeConfig[selectedTrackerType].description}
            </p>
          </div>

          {/* Tracker Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Tracker</label>
            <Select value={selectedTracker} onValueChange={setSelectedTracker}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a tracker" />
              </SelectTrigger>
              <SelectContent>
                {trackerUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Selection and Line Selection for non-specialized trackers */}
          {selectedTrackerType !== 'specialized' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">2. Select Team</label>
                <Select value={selectedTeam} onValueChange={(value) => setSelectedTeam(value as 'home' | 'away' | 'both')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both Teams</SelectItem>
                    <SelectItem value="home">Home Team Only</SelectItem>
                    <SelectItem value="away">Away Team Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">3. Select Line (Optional)</label>
                <Select value={selectedLine} onValueChange={setSelectedLine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect by tracker type or select specific line" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto-detect by tracker type</SelectItem>
                    {Object.keys(LINE_DEFINITIONS).map(line => {
                      let playersCount = 0;
                      if (selectedTeam === 'both') {
                        playersCount = getLinePlayersCount('home', line) + getLinePlayersCount('away', line);
                      } else if (selectedTeam === 'home' || selectedTeam === 'away') {
                        playersCount = getLinePlayersCount(selectedTeam, line);
                      }
                      return (
                        <SelectItem key={line} value={line}>
                          {line} ({playersCount} players)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Show which players will be assigned for line trackers */}
          {selectedTrackerType !== 'specialized' && (selectedLine || selectedTrackerType !== 'specialized') && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Players that will be assigned:
              </p>
              <div className="flex flex-wrap gap-2">
                {getLinePlayers(selectedTrackerType).map(player => (
                  <Badge key={player.id} variant="outline" className="text-xs">
                    #{player.jersey_number} {player.player_name} ({player.position || 'No position'})
                  </Badge>
                ))}
              </div>
              {getLinePlayers(selectedTrackerType).length === 0 && (
                <p className="text-sm text-amber-700">
                  No players found for the selected criteria. Try adjusting your team or line selection.
                </p>
              )}
            </div>
          )}

          {/* Player Selection for specialized tracker */}
          {selectedTrackerType === 'specialized' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Players</label>
              <Tabs value={selectedTeam === 'both' ? 'both' : selectedTeam} onValueChange={(value) => setSelectedTeam(value as 'home' | 'away' | 'both')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="both">Both Teams</TabsTrigger>
                  <TabsTrigger value="home">Home Team</TabsTrigger>
                  <TabsTrigger value="away">Away Team</TabsTrigger>
                </TabsList>
                <TabsContent value="both" className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Home Team</h4>
                    {renderPlayerGrid(homeTeamPlayers, selectedPlayers, handlePlayerToggle)}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Away Team</h4>
                    {renderPlayerGrid(awayTeamPlayers, selectedPlayers, handlePlayerToggle)}
                  </div>
                </TabsContent>
                <TabsContent value="home" className="mt-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Home Team</h4>
                  {renderPlayerGrid(homeTeamPlayers, selectedPlayers, handlePlayerToggle)}
                </TabsContent>
                <TabsContent value="away" className="mt-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Away Team</h4>
                  {renderPlayerGrid(awayTeamPlayers, selectedPlayers, handlePlayerToggle)}
                </TabsContent>
              </Tabs>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {selectedPlayers.length} player(s)
              </p>
            </div>
          )}

          {/* Event Types Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Event Types</label>
            {renderEventTypeCategories()}
          </div>

          <Button
            onClick={handleCreateAssignment}
            disabled={
              !selectedTracker || 
              selectedEventTypes.length === 0 || 
              (selectedTrackerType === 'specialized' && selectedPlayers.length === 0)
            }
            className="w-full"
          >
            Create Assignment
          </Button>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No assignments created yet</p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const config = trackerTypeConfig[assignment.tracker_type];
                const Icon = config.icon;
                
                return (
                  <div key={assignment.id} className={`border-2 rounded-lg p-4 ${config.color}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{config.label}</h4>
                          <p className="text-sm opacity-80">
                            {assignment.tracker_name || assignment.tracker_email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('Delete button clicked for assignment:', assignment.id);
                          handleDeleteAssignment(assignment.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Assigned Players:</p>
                      <div className="flex flex-wrap gap-1">
                        {assignment.line_players?.map((player: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{player.jersey_number} {player.player_name}
                            {player.position && ` (${player.position})`}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Event Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {assignment.assigned_event_types.map((eventType) => (
                          <Badge key={eventType} variant="outline" className="text-xs">
                            {eventType}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackerTypeAssignment;
