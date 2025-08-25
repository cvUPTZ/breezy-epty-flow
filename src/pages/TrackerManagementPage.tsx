// pages/TrackerManagementPage.tsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import TrackerAssignmentTabs from '@/components/admin/TrackerAssignmentTabs';
import LineBasedTrackerUI from '@/components/match/LineBasedTrackerUI';
import { 
  Player, 
  TrackerAssignment, 
  TrackerUser,
  LineAssignment,
  EventRecord,
  Match,
  DataValidationResult
} from '@/types/trackerAssignment';
import {
  transformAssignmentsToLineAssignments,
  validatePlayerData,
  debugTransformation
} from '@/utils/trackerTransformers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Play, AlertTriangle, CheckCircle, Download, Trash2, RefreshCw } from 'lucide-react';

interface TrackerManagementPageProps {
  match: Match;
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  trackerUsers: TrackerUser[];
  onEventRecord?: (event: EventRecord) => void;
  onAssignmentsSave?: (assignments: TrackerAssignment[]) => void;
  initialAssignments?: TrackerAssignment[];
}

const TrackerManagementPage: React.FC<TrackerManagementPageProps> = ({
  match,
  homeTeamPlayers,
  awayTeamPlayers,
  trackerUsers,
  onEventRecord,
  onAssignmentsSave,
  initialAssignments = []
}) => {
  // State management
  const [assignments, setAssignments] = useState<TrackerAssignment[]>(initialAssignments);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [activeTab, setActiveTab] = useState('assignments');
  const [debugMode, setDebugMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize assignments from props
  useEffect(() => {
    if (initialAssignments.length > 0) {
      setAssignments(initialAssignments);
    }
  }, [initialAssignments]);

  // Validate player data on component mount
  const playerValidation = useMemo(() => 
    validatePlayerData(homeTeamPlayers, awayTeamPlayers),
    [homeTeamPlayers, awayTeamPlayers]
  );

  // Memoize transformation with dependency tracking
  const lineAssignments = useMemo(() => {
    if (assignments.length === 0) return [];
    
    const transformed = transformAssignmentsToLineAssignments(
      assignments, 
      homeTeamPlayers, 
      awayTeamPlayers,
      match.home_team_name,
      match.away_team_name
    );
    
    if (debugMode) {
      debugTransformation(assignments, transformed);
    }
    
    return transformed;
  }, [assignments, homeTeamPlayers, awayTeamPlayers, match.home_team_name, match.away_team_name, debugMode]);

  // Handle assignment changes with callback
  const handleAssignmentsChange = useCallback((newAssignments: TrackerAssignment[]) => {
    console.log('📝 Assignments updated:', newAssignments.length);
    setAssignments(newAssignments);
    
    // Optional callback for parent component
    onAssignmentsSave?.(newAssignments);
  }, [onAssignmentsSave]);

  // Handle event recording with optimistic updates
  const handleEventRecord = useCallback((eventType: string, playerId?: number, teamId?: 'home' | 'away') => {
    const newEvent: EventRecord = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      match_id: match.id,
      event_type: eventType,
      player_id: playerId,
      team_id: teamId || 'home',
      timestamp: Date.now(),
    };

    setEvents(prev => [newEvent, ...prev]);
    console.log('🎯 Event recorded:', newEvent);

    // Optional callback for parent component
    onEventRecord?.(newEvent);
  }, [match.id, onEventRecord]);

  // Clear all assignments with confirmation
  const handleClearAssignments = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all assignments? This cannot be undone.')) {
      setAssignments([]);
      setEvents([]); // Also clear related events
    }
  }, []);

  // Export assignments data
  const handleExportAssignments = useCallback(() => {
    setIsLoading(true);
    
    try {
      const exportData = {
        match: {
          id: match.id,
          home_team: match.home_team_name,
          away_team: match.away_team_name,
          status: match.status,
          export_timestamp: new Date().toISOString()
        },
        assignments: assignments.map(a => ({
          id: a.id,
          tracker: a.tracker_name,
          email: a.tracker_email,
          players: a.player_ids.length,
          events: a.assigned_event_types.length,
          event_types: a.assigned_event_types
        })),
        line_assignments: lineAssignments.map(la => ({
          line: la.line,
          team: la.team,
          team_name: la.teamName,
          players: la.players.length,
          event_types: la.eventTypes.length
        })),
        recent_events: events.slice(0, 50),
        statistics: {
          total_assignments: assignments.length,
          total_line_assignments: lineAssignments.length,
          total_events_recorded: events.length,
          trackers_count: new Set(assignments.map(a => a.tracker_user_id)).size,
          players_assigned: new Set(assignments.flatMap(a => a.player_ids)).size
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `tracker_data_${match.id}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      console.log('✅ Data exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [match, assignments, lineAssignments, events]);

  // Reset all data
  const handleReset = useCallback(() => {
    if (window.confirm('Reset all assignments and events? This cannot be undone.')) {
      setAssignments([]);
      setEvents([]);
      setActiveTab('assignments');
    }
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => ({
    totalTrackers: new Set(assignments.map(a => a.tracker_user_id)).size,
    totalPlayersAssigned: new Set(assignments.flatMap(a => a.player_ids)).size,
    totalEventTypes: new Set(assignments.flatMap(a => a.assigned_event_types)).size,
    averagePlayersPerAssignment: assignments.length > 0 ? 
      Math.round((assignments.reduce((sum, a) => sum + a.player_ids.length, 0) / assignments.length) * 10) / 10 : 0
  }), [assignments]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Header with Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Tracker Management
              <Badge variant={match.status === 'in_progress' ? 'default' : 'secondary'}>
                {match.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDebugMode(!debugMode)}
              >
                Debug: {debugMode ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAssignments}
                disabled={assignments.length === 0 || isLoading}
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
                disabled={assignments.length === 0 && events.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Reset All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div>
              <strong>Match:</strong> 
              <div className="text-xs text-gray-600">
                {match.home_team_name} vs {match.away_team_name}
              </div>
            </div>
            <div>
              <strong>Assignments:</strong> 
              <div className="text-lg font-bold text-blue-600">{assignments.length}</div>
            </div>
            <div>
              <strong>Line Assignments:</strong> 
              <div className="text-lg font-bold text-green-600">{lineAssignments.length}</div>
            </div>
            <div>
              <strong>Events:</strong> 
              <div className="text-lg font-bold text-purple-600">{events.length}</div>
            </div>
            <div>
              <strong>Trackers:</strong> 
              <div className="text-lg font-bold text-orange-600">{statistics.totalTrackers}</div>
            </div>
            <div>
              <strong>Players Assigned:</strong> 
              <div className="text-lg font-bold text-red-600">{statistics.totalPlayersAssigned}</div>
            </div>
          </div>
          
          {/* Additional Statistics */}
          {assignments.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-medium">Event Types:</span> {statistics.totalEventTypes}
                </div>
                <div>
                  <span className="font-medium">Avg Players/Assignment:</span> {statistics.averagePlayersPerAssignment}
                </div>
                <div>
                  <span className="font-medium">Home Players:</span> {homeTeamPlayers.length}
                </div>
                <div>
                  <span className="font-medium">Away Players:</span> {awayTeamPlayers.length}
                </div>
                <div>
                  <span className="font-medium">Available Trackers:</span> {trackerUsers.length}
                </div>
                <div>
                  <span className="font-medium">Transformation Success:</span> {
                    assignments.length > 0 ? `${Math.round((lineAssignments.length / assignments.length) * 100)}%` : '0%'
                  }
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Validation Alerts */}
      {!playerValidation.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Validation Issues Found:</strong>
            <div className="mt-2 space-y-1">
              {playerValidation.errors.map((error, index) => (
                <div key={index} className="text-sm">• {error}</div>
              ))}
            </div>
            <div className="mt-2 text-sm">
              Please fix these issues before creating assignments.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {assignments.length > 0 && lineAssignments.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Assignment Transformation Failed:</strong>
            <div className="mt-1 text-sm">
              {assignments.length} assignment(s) created but none could be transformed for tracking.
            </div>
            <div className="mt-2 text-sm">
              <strong>Common causes:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Assigned players no longer exist in the team rosters</li>
                <li>Player ID mismatches between assignments and player data</li>
                <li>Missing or invalid player position data</li>
              </ul>
            </div>
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => setDebugMode(true)}>
                Enable Debug Mode
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success indicator */}
      {assignments.length > 0 && lineAssignments.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Ready for Tracking:</strong> {assignments.length} assignment(s) successfully configured. 
            {lineAssignments.length} line assignment(s) ready for event tracking.
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Create Assignments 
            <Badge variant="secondary" className="ml-1">{assignments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="tracking" 
            className="flex items-center gap-2" 
            disabled={lineAssignments.length === 0}
          >
            <Play className="h-4 w-4" />
            Live Tracking 
            <Badge variant="secondary" className="ml-1">{lineAssignments.length}</Badge>
            {events.length > 0 && (
              <Badge variant="destructive" className="ml-1">{events.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Assignment Creation Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <TrackerAssignmentTabs
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
            trackerUsers={trackerUsers}
            assignments={assignments}
            onAssignmentsChange={handleAssignmentsChange}
          />
        </TabsContent>

        {/* Live Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          {lineAssignments.length > 0 ? (
            <>
              <LineBasedTrackerUI
                assignments={lineAssignments}
                recordEvent={handleEventRecord}
                matchId={match.id}
              />

              {/* Enhanced Recent Events */}
              {events.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Recent Events 
                      <Badge variant="outline">{events.length} total</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {events.slice(0, 20).map((event, index) => {
                        const player = [...homeTeamPlayers, ...awayTeamPlayers].find(p => p.id === event.player_id);
                        return (
                          <div 
                            key={event.id} 
                            className={`flex justify-between items-center p-3 border rounded-lg text-sm ${
                              index === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                {event.event_type}
                              </Badge>
                              {player ? (
                                <div>
                                  <span className="font-medium">
                                    #{player.jersey_number} {player.player_name}
                                  </span>
                                  <span className="text-gray-500 ml-2">({event.team_id})</span>
                                  {player.position && (
                                    <span className="text-gray-500 ml-1">- {player.position}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">
                                  General event ({event.team_id})
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </div>
                              {index === 0 && (
                                <Badge variant="default" className="text-xs mt-1">Latest</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {events.length > 20 && (
                        <div className="text-center text-sm text-gray-500 py-2">
                          ... and {events.length - 20} more events
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-gray-400">
                    <Play className="h-12 w-12 mx-auto mb-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Tracking Assignments Available
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create assignments in the previous tab to start tracking events.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('assignments')}
                      variant="outline"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Go to Assignments
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Debug Information */}
      {debugMode && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
              🐛 Debug Information
              <Button
                variant="outline"
                size="sm"
                onClick={() => debugTransformation(assignments, lineAssignments)}
              >
                Run Debug
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Raw Data:</h4>
                  <div className="space-y-1 text-xs">
                    <div>Home Players: {homeTeamPlayers.length}</div>
                    <div>Away Players: {awayTeamPlayers.length}</div>
                    <div>Tracker Users: {trackerUsers.length}</div>
                    <div>Assignments: {assignments.length}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Transformed:</h4>
                  <div className="space-y-1 text-xs">
                    <div>Line Assignments: {lineAssignments.length}</div>
                    <div>Events Recorded: {events.length}</div>
                    <div>Active Trackers: {statistics.totalTrackers}</div>
                    <div>Assigned Players: {statistics.totalPlayersAssigned}</div>
                  </div>
                </div>
              </div>
              
              {assignments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Assignment Details:</h4>
                  <div className="max-h-40 overflow-y-auto text-xs space-y-1">
                    {assignments.map((a, i) => (
                      <div key={a.id} className="border-l-2 border-yellow-300 pl-2">
                        Assignment {i + 1}: {a.tracker_name} → {a.player_ids.length} players, {a.assigned_event_types.length} events
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackerManagementPage;
