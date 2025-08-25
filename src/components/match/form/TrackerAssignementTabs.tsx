import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Trash2, ChevronRight, Layers, PersonStanding, Bug, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_TYPE_CATEGORIES } from '@/constants/eventTypes';

// Updated interfaces to match your actual data structure
interface Player {
  id: number;
  jersey_number: number;
  player_name: string;
  team: 'home' | 'away';
  position?: string;
}

interface TrackerUser {
  id: string;
  email: string;
  full_name?: string | null;
  role: 'admin' | 'user' | 'tracker' | 'teacher';
}

interface Assignment {
  id: string;
  tracker_user_id: string;
  tracker_name: string;
  tracker_email: string;
  player_ids: number[];
  assigned_event_types: string[];
}

interface TrackerAssignmentTabsProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  trackerUsers: TrackerUser[];
  assignments: Assignment[];
  onAssignmentsChange: (assignments: Assignment[]) => void;
  matchId?: string; // Made optional for when creating new matches
}

// Updated and more comprehensive line definitions for football positions
const LINE_DEFINITIONS: Record<string, string[]> = {
  Defense: ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'SW', 'DC', 'DR', 'DL'],
  Midfield: ['DM', 'CM', 'AM', 'LM', 'RM', 'CDM', 'CAM', 'DMC', 'MC', 'AMC', 'ML', 'MR'],
  Attack: ['CF', 'ST', 'LW', 'RW', 'LF', 'RF', 'SS', 'FW'],
};

const TrackerAssignmentTabs: React.FC<TrackerAssignmentTabsProps> = ({
  homeTeamPlayers,
  awayTeamPlayers,
  trackerUsers,
  assignments,
  onAssignmentsChange,
  matchId
}) => {
  // Debug state to show logs
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [deletingAssignments, setDeletingAssignments] = useState<Set<string>>(new Set());

  // Debug logging function
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [logMessage, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  // Monitor assignments changes
  useEffect(() => {
    addDebugLog(`Assignments updated. Count: ${assignments.length}`);
    addDebugLog(`Assignment IDs: [${assignments.map(a => a.id || 'UNDEFINED').join(', ')}]`);
  }, [assignments]);

  // State for "By Player" tab
  const [playerTabState, setPlayerTabState] = useState({
    selectedTracker: '',
    selectedPlayers: [] as number[],
    selectedEventTypes: [] as string[],
  });

  // State for "By Line" tab
  const [lineTabState, setLineTabState] = useState({
    selectedTracker: '',
    selectedTeam: 'home' as 'home' | 'away',
    selectedLine: 'Defense',
    selectedEventTypes: [] as string[],
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];

  // Database function to delete assignment
  const deleteAssignmentFromDB = async (assignmentId: string): Promise<boolean> => {
    if (!matchId) {
      addDebugLog('⚠️ No matchId provided, skipping database deletion');
      return true; // Allow local deletion for new matches
    }

    try {
      addDebugLog(`🗄️ Deleting assignment ${assignmentId} from database...`);
      
      const { error } = await supabase
        .from('match_tracker_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        addDebugLog(`❌ Database deletion failed: ${error.message}`);
        throw error;
      }

      addDebugLog(`✅ Assignment ${assignmentId} successfully deleted from database`);
      return true;
    } catch (error) {
      addDebugLog(`💥 Database deletion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error deleting assignment from database:', error);
      return false;
    }
  };

  // Database function to create assignment
  const createAssignmentInDB = async (assignment: Assignment): Promise<boolean> => {
    if (!matchId) {
      addDebugLog('⚠️ No matchId provided, skipping database creation');
      return true; // Allow local creation for new matches
    }

    try {
      addDebugLog(`🗄️ Creating assignment in database...`);
      
      // Create separate records for each player
      const dbRecords = [];
      
      for (const playerId of assignment.player_ids) {
        const playerTeamId = homeTeamPlayers.some(p => p.id === playerId) ? 'home' : 'away';
        
        dbRecords.push({
          match_id: matchId,
          tracker_user_id: assignment.tracker_user_id,
          assigned_player_id: playerId,
          player_team_id: playerTeamId,
          assigned_event_types: assignment.assigned_event_types,
        });
      }

      const { error } = await supabase
        .from('match_tracker_assignments')
        .insert(dbRecords);

      if (error) {
        addDebugLog(`❌ Database creation failed: ${error.message}`);
        throw error;
      }

      addDebugLog(`✅ Assignment successfully created in database`);
      return true;
    } catch (error) {
      addDebugLog(`💥 Database creation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error creating assignment in database:', error);
      return false;
    }
  };

  // Generate unique ID with fallback
  const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch (error) {
        addDebugLog(`crypto.randomUUID() failed, using fallback: ${error}`);
      }
    }
    // Fallback ID generation
    return 'assignment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const handleCreateAssignment = async (newAssignment: Omit<Assignment, 'id' | 'tracker_name' | 'tracker_email'>) => {
    addDebugLog('Creating new assignment...');
    
    const trackerUser = trackerUsers.find(user => user.id === newAssignment.tracker_user_id);
    if (!trackerUser) {
      addDebugLog(`ERROR: Tracker user not found for ID: ${newAssignment.tracker_user_id}`);
      return;
    }

    // Validate that all player IDs exist
    const validPlayerIds = newAssignment.player_ids.filter(id => 
      allPlayers.some(player => player.id === id)
    );
    
    if (validPlayerIds.length !== newAssignment.player_ids.length) {
      addDebugLog(`WARNING: Some player IDs not found. Expected: ${newAssignment.player_ids.length}, Found: ${validPlayerIds.length}`);
      const missingIds = newAssignment.player_ids.filter(id => !validPlayerIds.includes(id));
      addDebugLog(`Missing player IDs: ${missingIds.join(', ')}`);
    }

    if (validPlayerIds.length === 0) {
      addDebugLog('ERROR: No valid players found for assignment');
      return;
    }

    const newId = generateId();
    
    const assignmentToAdd: Assignment = {
      id: newId,
      ...newAssignment,
      player_ids: validPlayerIds,
      tracker_name: trackerUser.full_name || trackerUser.email,
      tracker_email: trackerUser.email,
    };
    
    addDebugLog(`Generated assignment ID: ${newId}`);
    addDebugLog(`Assignment object: ${JSON.stringify({
      id: assignmentToAdd.id,
      tracker: assignmentToAdd.tracker_name,
      playerCount: assignmentToAdd.player_ids.length
    })}`);
    
    // Try to create in database first (only if matchId exists)
    const dbSuccess = await createAssignmentInDB(assignmentToAdd);
    
    if (dbSuccess) {
      // Update local state
      const newAssignments = [...assignments, assignmentToAdd];
      addDebugLog(`Calling onAssignmentsChange with ${newAssignments.length} assignments`);
      onAssignmentsChange(newAssignments);
    } else {
      addDebugLog('❌ Failed to create assignment in database, not updating local state');
      alert('Failed to create assignment. Please try again.');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    addDebugLog(`🗑️ DELETE REQUESTED for assignment ID: ${assignmentId}`);
    
    if (!assignmentId) {
      addDebugLog(`❌ ERROR: Assignment ID is undefined or empty!`);
      return;
    }
    
    // Check if assignment exists
    const assignmentToDelete = assignments.find(a => a.id === assignmentId);
    if (!assignmentToDelete) {
      addDebugLog(`❌ ERROR: Assignment with ID ${assignmentId} not found in local state!`);
      return;
    }
    
    addDebugLog(`✅ Found assignment to delete: ${assignmentToDelete.tracker_name}`);
    
    // Set loading state for this specific assignment
    setDeletingAssignments(prev => new Set([...prev, assignmentId]));
    
    try {
      // Delete from database first (only if matchId exists)
      const dbSuccess = await deleteAssignmentFromDB(assignmentId);
      
      if (dbSuccess) {
        // Update local state
        const newAssignments = assignments.filter(a => a.id !== assignmentId);
        
        addDebugLog(`Assignments after filter: ${newAssignments.length}`);
        addDebugLog(`New assignment IDs: [${newAssignments.map(a => a.id).join(', ')}]`);
        
        addDebugLog(`📞 Calling onAssignmentsChange with ${newAssignments.length} assignments`);
        onAssignmentsChange(newAssignments);
        
        addDebugLog(`✅ Assignment ${assignmentId} successfully deleted`);
      } else {
        addDebugLog('❌ Failed to delete from database, not updating local state');
        alert('Failed to delete assignment. Please try again.');
      }
    } catch (error) {
      addDebugLog(`💥 Unexpected error during deletion: ${error instanceof Error ? error.message : 'Unknown error'}`);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      // Remove loading state
      setDeletingAssignments(prev => {
        const newSet = new Set(prev);
        newSet.delete(assignmentId);
        return newSet;
      });
    }
  };

  const handleCategoryToggle = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      newSet.has(categoryKey) ? newSet.delete(categoryKey) : newSet.add(categoryKey);
      return newSet;
    });
  };

  // --- "By Player" Tab Logic ---
  const handlePlayerToggle = (playerId: number) => {
    setPlayerTabState(prev => ({
      ...prev,
      selectedPlayers: prev.selectedPlayers.includes(playerId)
        ? prev.selectedPlayers.filter(id => id !== playerId)
        : [...prev.selectedPlayers, playerId],
    }));
  };

  const handlePlayerEventToggle = (eventType: string) => {
    setPlayerTabState(prev => ({
      ...prev,
      selectedEventTypes: prev.selectedEventTypes.includes(eventType)
        ? prev.selectedEventTypes.filter(type => type !== eventType)
        : [...prev.selectedEventTypes, eventType],
    }));
  };

  const createPlayerAssignment = () => {
    if (!playerTabState.selectedTracker || playerTabState.selectedPlayers.length === 0 || playerTabState.selectedEventTypes.length === 0) {
      addDebugLog('Cannot create player assignment: missing required fields');
      return;
    }
    
    handleCreateAssignment({
      tracker_user_id: playerTabState.selectedTracker,
      player_ids: playerTabState.selectedPlayers,
      assigned_event_types: playerTabState.selectedEventTypes,
    });
    setPlayerTabState({ selectedTracker: '', selectedPlayers: [], selectedEventTypes: [] });
  };

  // --- "By Line" Tab Logic ---
  const handleLineEventToggle = (eventType: string) => {
    setLineTabState(prev => ({
      ...prev,
      selectedEventTypes: prev.selectedEventTypes.includes(eventType)
        ? prev.selectedEventTypes.filter(type => type !== eventType)
        : [...prev.selectedEventTypes, eventType],
    }));
  };
  
  const createLineAssignment = () => {
    const { selectedTracker, selectedTeam, selectedLine, selectedEventTypes } = lineTabState;
    if (!selectedTracker || !selectedLine || selectedEventTypes.length === 0) {
      addDebugLog('Cannot create line assignment: missing required fields');
      return;
    }

    const targetPlayers = selectedTeam === 'home' ? homeTeamPlayers : awayTeamPlayers;
    const linePositions = LINE_DEFINITIONS[selectedLine] || [];

    const assignedPlayerIds = targetPlayers
      .filter(player => {
        if (!player.position) return false;
        const playerPosition = player.position.toUpperCase().trim();
        return linePositions.includes(playerPosition);
      })
      .map(player => player.id);
    
    if (assignedPlayerIds.length === 0) {
        addDebugLog(`No players found for ${selectedLine} in the ${selectedTeam} team`);
        return;
    }
    
    handleCreateAssignment({
      tracker_user_id: selectedTracker,
      player_ids: assignedPlayerIds,
      assigned_event_types: selectedEventTypes,
    });
    setLineTabState(prev => ({ ...prev, selectedTracker: '', selectedEventTypes: [] }));
  };

  // Get players count for each line to help with selection
  const getLinePlayersCount = (team: 'home' | 'away', line: string) => {
    const targetPlayers = team === 'home' ? homeTeamPlayers : awayTeamPlayers;
    const linePositions = LINE_DEFINITIONS[line] || [];
    return targetPlayers.filter(player => {
      if (!player.position) return false;
      const playerPosition = player.position.toUpperCase().trim();
      return linePositions.includes(playerPosition);
    }).length;
  };

  // --- Reusable Render Functions ---
  const renderPlayerGrid = (players: Player[], selectedPlayerIds: number[], onToggle: (id: number) => void) => (
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

  const renderEventTypeCategories = (selectedTypes: string[], onToggle: (type: string) => void, onCategoryChange: (checked: boolean, keys: string[]) => void) => (
    <div className="space-y-3">
      {EVENT_TYPE_CATEGORIES.map(category => (
        <div key={category.key} className="border rounded-lg">
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleCategoryToggle(category.key)}>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={category.events.every(e => selectedTypes.includes(e.key))}
                onCheckedChange={(checked) => onCategoryChange(Boolean(checked), category.events.map(e => e.key))}
                onClick={(e) => e.stopPropagation()}
              />
              <Badge style={{ backgroundColor: category.color }} className="text-white">{category.label}</Badge>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedCategories.has(category.key) ? 'rotate-90' : ''}`} />
          </div>
          {expandedCategories.has(category.key) && (
            <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {category.events.map(event => (
                <div key={event.key}
                  className={`p-2 border rounded cursor-pointer text-center text-xs transition-colors ${selectedTypes.includes(event.key) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 hover:border-gray-400'}`}
                  onClick={() => onToggle(event.key)}>
                  {event.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" /> 
            Tracker Assignments
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs"
          >
            <Bug className="h-4 w-4 mr-1" />
            {showDebug ? 'Hide' : 'Show'} Debug
          </Button>
        </CardTitle>
      </CardHeader>
      
      {/* Debug Panel */}
      {showDebug && (
        <div className="mx-6 mb-4 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-xs max-h-60 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <strong>Debug Console</strong>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDebugLogs([])}
              className="text-xs text-green-400 hover:text-green-300"
            >
              Clear
            </Button>
          </div>
          <div className="space-y-1">
            {debugLogs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>
      )}
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="by-player" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="by-player"><PersonStanding className="h-4 w-4 mr-2" />By Player & Events</TabsTrigger>
            <TabsTrigger value="by-line"><Layers className="h-4 w-4 mr-2" />By Line (Attack/Mid/Def)</TabsTrigger>
          </TabsList>

          {/* Tab 1: Assignment by Player & Events */}
          <TabsContent value="by-player" className="pt-4">
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium flex items-center gap-2"><UserPlus className="h-4 w-4" />Create Detailed Assignment</h3>
              <div>
                <label className="block text-sm font-medium mb-2">1. Select Tracker</label>
                <Select value={playerTabState.selectedTracker} onValueChange={v => setPlayerTabState(p => ({...p, selectedTracker: v}))}>
                  <SelectTrigger><SelectValue placeholder="Choose a tracker" /></SelectTrigger>
                  <SelectContent>{trackerUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">2. Select Players</label>
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-700">Home Team</h4>
                  {renderPlayerGrid(homeTeamPlayers, playerTabState.selectedPlayers, handlePlayerToggle)}
                  <h4 className="font-medium text-sm text-gray-700">Away Team</h4>
                  {renderPlayerGrid(awayTeamPlayers, playerTabState.selectedPlayers, handlePlayerToggle)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">3. Select Event Types</label>
                {renderEventTypeCategories(playerTabState.selectedEventTypes, handlePlayerEventToggle, (checked, keys) => {
                  setPlayerTabState(prev => ({ ...prev, selectedEventTypes: checked ? [...new Set([...prev.selectedEventTypes, ...keys])] : prev.selectedEventTypes.filter(k => !keys.includes(k)) }));
                })}
              </div>
              <Button onClick={createPlayerAssignment} disabled={!playerTabState.selectedTracker || playerTabState.selectedPlayers.length === 0 || playerTabState.selectedEventTypes.length === 0} className="w-full">Create Assignment</Button>
            </div>
          </TabsContent>

          {/* Tab 2: Assignment by Line */}
          <TabsContent value="by-line" className="pt-4">
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium flex items-center gap-2"><UserPlus className="h-4 w-4" />Create Line Assignment</h3>
              <div>
                <label className="block text-sm font-medium mb-2">1. Select Tracker</label>
                <Select value={lineTabState.selectedTracker} onValueChange={v => setLineTabState(p => ({...p, selectedTracker: v}))}>
                  <SelectTrigger><SelectValue placeholder="Choose a tracker" /></SelectTrigger>
                  <SelectContent>{trackerUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">2. Select Team</label>
                  <Select value={lineTabState.selectedTeam} onValueChange={v => setLineTabState(p => ({...p, selectedTeam: v as 'home' | 'away'}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Team</SelectItem>
                      <SelectItem value="away">Away Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">3. Select Line</label>
                  <Select value={lineTabState.selectedLine} onValueChange={v => setLineTabState(p => ({...p, selectedLine: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(LINE_DEFINITIONS).map(line => {
                        const playersCount = getLinePlayersCount(lineTabState.selectedTeam, line);
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
              
              {/* Show which players will be assigned */}
              {lineTabState.selectedLine && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Players in {lineTabState.selectedLine} line ({lineTabState.selectedTeam} team):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(lineTabState.selectedTeam === 'home' ? homeTeamPlayers : awayTeamPlayers)
                      .filter(player => {
                        if (!player.position) return false;
                        const playerPosition = player.position.toUpperCase().trim();
                        return LINE_DEFINITIONS[lineTabState.selectedLine]?.includes(playerPosition);
                      })
                      .map(player => (
                        <Badge key={player.id} variant="outline" className="text-xs">
                          #{player.jersey_number} {player.player_name} ({player.position})
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">4. Select Event Types</label>
                {renderEventTypeCategories(lineTabState.selectedEventTypes, handleLineEventToggle, (checked, keys) => {
                  setLineTabState(prev => ({ ...prev, selectedEventTypes: checked ? [...new Set([...prev.selectedEventTypes, ...keys])] : prev.selectedEventTypes.filter(k => !keys.includes(k)) }));
                })}
              </div>
              <Button onClick={createLineAssignment} disabled={!lineTabState.selectedTracker || !lineTabState.selectedLine || lineTabState.selectedEventTypes.length === 0} className="w-full">Create Assignment</Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Existing Assignments */}
        <div className="space-y-3">
          <h3 className="font-medium">Current Assignments ({assignments.length})</h3>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No assignments created yet</p>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id || 'no-id'} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{assignment.tracker_name}</h4>
                    <p className="text-sm text-gray-600">{assignment.tracker_email}</p>
                    {showDebug && (
                      <p className="text-xs text-gray-500 font-mono">ID: {assignment.id || 'UNDEFINED'}</p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      addDebugLog(`🖱️ Delete button clicked for assignment: ${assignment.id || 'UNDEFINED'}`);
                      if (assignment.id) {
                        handleDeleteAssignment(assignment.id);
                      } else {
                        addDebugLog(`❌ ERROR: Assignment ID is missing!`);
                      }
                    }} 
                    disabled={deletingAssignments.has(assignment.id || '')}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    {deletingAssignments.has(assignment.id || '') ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Assigned Players:</p>
                  <div className="flex flex-wrap gap-1">
                    {assignment.player_ids.map(playerId => {
                      const player = allPlayers.find(p => p.id === playerId);
                      return player ? (
                        <Badge key={playerId} variant="outline" className="text-xs">
                          #{player.jersey_number} {player.player_name} ({player.team}) 
                          {player.position && ` - ${player.position}`}
                        </Badge>
                      ) : (
                        <Badge key={playerId} variant="destructive" className="text-xs">
                          Player ID {playerId} not found
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Event Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {assignment.assigned_event_types.map(eventType => {
                      const category = EVENT_TYPE_CATEGORIES.find(c => c.events.some(e => e.key === eventType));
                      return <Badge key={eventType} className="text-xs text-white" style={{ backgroundColor: category?.color || '#6B7280' }}>{eventType}</Badge>;
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackerAssignmentTabs;