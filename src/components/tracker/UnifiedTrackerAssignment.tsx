import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Trash2, ChevronRight, Shield, Zap, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EVENT_TYPE_CATEGORIES } from '@/constants/eventTypes';

/**
 * @interface Player
 * @description Represents a player with basic information for assignment purposes.
 * @property {number} id - The unique identifier for the player.
 * @property {number} jersey_number - The player's jersey number.
 * @property {string} player_name - The name of the player.
 * @property {'home' | 'away'} team - The team the player belongs to.
 * @property {string} [position] - The player's position on the field.
 */
interface Player {
  id: number;
  jersey_number: number;
  player_name: string;
  team: 'home' | 'away';
  position?: string;
}

/**
 * @interface TrackerUser
 * @description Represents a user with the 'tracker' role.
 * @property {string} id - The unique identifier for the user.
 * @property {string | null} email - The user's email address.
 * @property {string | null} [full_name] - The full name of the user.
 * @property {string | null} role - The user's role (e.g., 'tracker').
 */
interface TrackerUser {
  id: string;
  email: string | null;
  full_name?: string | null;
  role: 'admin' | 'user' | 'tracker' | 'teacher' | string | null;
}

/**
 * @interface Assignment
 * @description Represents a single, consolidated assignment of a tracker to players and event types.
 * @property {string} id - The unique identifier for the assignment.
 * @property {string} tracker_user_id - The ID of the assigned tracker.
 * @property {string} tracker_name - The name of the assigned tracker.
 * @property {string} tracker_email - The email of the assigned tracker.
 * @property {number[]} player_ids - An array of player IDs assigned to the tracker.
 * @property {string[]} assigned_event_types - An array of event type keys assigned to the tracker.
 */
interface Assignment {
  id: string;
  tracker_user_id: string;
  tracker_name: string;
  tracker_email: string;
  player_ids: number[];
  assigned_event_types: string[];
}

/**
 * @interface UnifiedTrackerAssignmentProps
 * @description Props for the UnifiedTrackerAssignment component.
 * @property {string} [matchId] - The ID of the match for which assignments are being made.
 * @property {string} [videoUrl] - The URL of the video to be tracked, if applicable.
 * @property {Player[]} homeTeamPlayers - An array of players for the home team.
 * @property {Player[]} awayTeamPlayers - An array of players for the away team.
 * @property {TrackerUser[]} [trackerUsers] - An optional pre-fetched list of available tracker users.
 * @property {Assignment[]} [assignments] - An optional pre-fetched list of existing assignments.
 * @property {(assignments: Assignment[]) => void} [onAssignmentsChange] - Callback to update the parent component's state when assignments change.
 * @property {boolean} [showTypeAssignment=true] - Flag to show or hide the tracker type assignment UI.
 */
interface UnifiedTrackerAssignmentProps {
  matchId?: string;
  videoUrl?: string;
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  trackerUsers?: TrackerUser[];
  assignments?: Assignment[];
  onAssignmentsChange?: (assignments: Assignment[]) => void;
  showTypeAssignment?: boolean;
}

type TrackerType = 'specialized' | 'defence' | 'midfield' | 'attack';

const LINE_DEFINITIONS: Record<string, string[]> = {
  Defense: ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'SW', 'DC', 'DR', 'DL'],
  Midfield: ['DM', 'CM', 'AM', 'LM', 'RM', 'CDM', 'CAM', 'DMC', 'MC', 'AMC', 'ML', 'MR'],
  Attack: ['CF', 'ST', 'LW', 'RW', 'LF', 'RF', 'SS', 'FW'],
};

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

/**
 * @component UnifiedTrackerAssignment
 * @description A comprehensive component for creating and managing all tracker assignments for a match.
 * It supports assigning trackers to individual players or to entire lines (defence, midfield, attack).
 * The component fetches necessary data (trackers, existing assignments) from Supabase and provides a rich UI
 * for creating, viewing, and deleting assignments.
 * @param {UnifiedTrackerAssignmentProps} props The props for the component.
 * @returns {JSX.Element} The rendered UnifiedTrackerAssignment component.
 */
const UnifiedTrackerAssignment: React.FC<UnifiedTrackerAssignmentProps> = ({
  matchId,
  videoUrl,
  homeTeamPlayers = [],
  awayTeamPlayers = [],
  trackerUsers = [],
  assignments = [],
  onAssignmentsChange,
  showTypeAssignment = true
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [localTrackers, setLocalTrackers] = useState<TrackerUser[]>(trackerUsers);
  const [localAssignments, setLocalAssignments] = useState<Assignment[]>(assignments);
  
  // State for assignment creation
  const [selectedTracker, setSelectedTracker] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedTrackerType, setSelectedTrackerType] = useState<TrackerType>('specialized');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [assignmentVideoUrl, setAssignmentVideoUrl] = useState<string>(videoUrl || '');

  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];

  useEffect(() => {
    if (trackerUsers.length === 0) {
      fetchTrackers();
    }
  }, []);

  useEffect(() => {
    if (matchId && assignments.length === 0) {
      fetchAssignments();
    }
  }, [matchId]);

  const fetchTrackers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'tracker');

      if (error) throw error;
      setLocalTrackers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch tracker users",
        variant: "destructive"
      });
    }
  };

  const fetchAssignments = async () => {
    if (!matchId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select(`
          *,
          profiles:tracker_user_id (
            full_name,
            email
          )
        `)
        .eq('match_id', matchId);

      if (error) throw error;

      const processedAssignments = processAssignments(data || []);
      setLocalAssignments(processedAssignments);
      
      if (onAssignmentsChange) {
        onAssignmentsChange(processedAssignments);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processAssignments = (rawAssignments: any[]): Assignment[] => {
    const grouped = rawAssignments.reduce((acc, assignment) => {
      const key = assignment.tracker_user_id;
      
      if (!acc[key]) {
        acc[key] = {
          id: assignment.id,
          tracker_user_id: assignment.tracker_user_id,
          tracker_name: assignment.profiles?.full_name || 'Unknown',
          tracker_email: assignment.profiles?.email || 'Unknown',
          player_ids: [],
          assigned_event_types: [...(assignment.assigned_event_types || [])]
        };
      }
      
      if (assignment.assigned_player_id && !acc[key].player_ids.includes(assignment.assigned_player_id)) {
        acc[key].player_ids.push(assignment.assigned_player_id);
      }
      
      return acc;
    }, {} as Record<string, Assignment>);

    return Object.values(grouped);
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

  const getLinePlayers = (trackerType: TrackerType, team?: 'home' | 'away') => {
    if (trackerType === 'specialized') {
      return allPlayers.filter(player => selectedPlayers.includes(player.id));
    }

    const playersToFilter = team ? 
      (team === 'home' ? homeTeamPlayers : awayTeamPlayers) : 
      allPlayers;

    return playersToFilter.filter(player => {
      const position = player.position?.toLowerCase() || '';
      switch (trackerType) {
        case 'defence':
          return position.includes('def') || position.includes('cb') || 
                 position.includes('lb') || position.includes('rb') || position.includes('gk');
        case 'midfield':
          return position.includes('mid') || position.includes('cm') || 
                 position.includes('dm') || position.includes('am');
        case 'attack':
          return position.includes('att') || position.includes('fw') || 
                 position.includes('st') || position.includes('lw') || position.includes('rw');
        default:
          return false;
      }
    });
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

    const playersToAssign = selectedTrackerType === 'specialized' 
      ? selectedPlayers 
      : getLinePlayers(selectedTrackerType, selectedTeam).map(p => p.id);

    if (playersToAssign.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one player",
        variant: "destructive"
      });
      return;
    }

    try {
      const trackerUser = localTrackers.find(t => t.id === selectedTracker);
      if (!trackerUser) return;

      const newAssignment: Assignment = {
        id: `temp-${Date.now()}`,
        tracker_user_id: selectedTracker,
        tracker_name: trackerUser.full_name || trackerUser.email || 'Unknown',
        tracker_email: trackerUser.email || 'Unknown',
        player_ids: playersToAssign,
        assigned_event_types: selectedEventTypes
      };

      // Update local state
      const updatedAssignments = [...localAssignments, newAssignment];
      setLocalAssignments(updatedAssignments);
      
      if (onAssignmentsChange) {
        onAssignmentsChange(updatedAssignments);
      }

      // Save to database if matchId exists
      if (matchId) {
        await saveAssignmentToDB(newAssignment);
      }

      // Send notification
      if (matchId) {
        const finalVideoUrl = assignmentVideoUrl.trim() || undefined;
        await sendNotificationToTracker(selectedTracker, matchId, finalVideoUrl);
      }

      // Reset form
      setSelectedTracker('');
      setSelectedEventTypes([]);
      setSelectedPlayers([]);
      setExpandedCategories(new Set());
      setAssignmentVideoUrl('');

      toast({
        title: "Success",
        description: "Assignment created successfully"
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive"
      });
    }
  };

  const saveAssignmentToDB = async (assignment: Assignment) => {
    if (!matchId) return;

    const dbRecords = assignment.player_ids.map(playerId => {
      const playerTeamId = homeTeamPlayers.some(p => p.id === playerId) ? 'home' : 'away';
      
      return {
        match_id: matchId,
        tracker_user_id: assignment.tracker_user_id,
        assigned_player_id: playerId,
        player_team_id: playerTeamId,
        assigned_event_types: assignment.assigned_event_types,
      };
    });

    const { error } = await supabase
      .from('match_tracker_assignments')
      .insert(dbRecords);

    if (error) throw error;
  };

  const sendNotificationToTracker = async (trackerId: string, matchId: string, videoUrl?: string) => {
    console.log('sendNotificationToTracker called with:', { trackerId, matchId, videoUrl: !!videoUrl });
    try {
      const notificationType = videoUrl ? 'video_assignment' : 'match_assignment';
      const notificationTitle = videoUrl ? 'New Video Tracking Assignment' : 'New Match Assignment';
      const notificationMessage = videoUrl 
        ? `You have been assigned to track video analysis.`
        : `You have been assigned to track a new match.`;

      await supabase.from('notifications').insert({
        user_id: trackerId,
        match_id: matchId,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        notification_data: { 
          match_id: matchId,
          assignment_type: videoUrl ? 'video_tracking' : 'match_tracking',
          video_url: videoUrl || null
        },
        is_read: false,
      });
    } catch (error) {
      // Notification failure shouldn't break the assignment process
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const updatedAssignments = localAssignments.filter(a => a.id !== assignmentId);
      setLocalAssignments(updatedAssignments);
      
      if (onAssignmentsChange) {
        onAssignmentsChange(updatedAssignments);
      }

      if (matchId && !assignmentId.startsWith('temp-')) {
        const assignment = localAssignments.find(a => a.id === assignmentId);
        if (assignment) {
          await supabase
            .from('match_tracker_assignments')
            .delete()
            .eq('match_id', matchId)
            .eq('tracker_user_id', assignment.tracker_user_id);
        }
      }

      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      });
    }
  };

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

  const renderPlayerGrid = (players: Player[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {players.map(player => (
        <div
          key={player.id}
          className={`p-2 border rounded cursor-pointer transition-colors ${
            selectedPlayers.includes(player.id) 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => handlePlayerToggle(player.id)}
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

  if (loading) {
    return <div className="p-4 text-center">Loading assignments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current Assignments */}
      {localAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {localAssignments.map(assignment => {
                // Get player details for this assignment
                const assignedPlayers = assignment.player_ids
                  .map(playerId => allPlayers.find(player => player.id === playerId))
                  .filter((player): player is Player => Boolean(player));

                return (
                  <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    {/* Tracker Info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-medium text-lg">{assignment.tracker_name}</span>
                        <div className="text-sm text-gray-600">{assignment.tracker_email}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Assigned Players */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Assigned Players ({assignedPlayers.length})
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {assignedPlayers.map(player => (
                          <div
                            key={player.id}
                            className="p-2 bg-white border border-gray-200 rounded text-center"
                          >
                            <div className="text-xs font-semibold text-blue-600">
                              #{player.jersey_number}
                            </div>
                            <div className="text-xs text-gray-800 truncate font-medium">
                              {player.player_name}
                            </div>
                            {player.position && (
                              <div className="text-xs text-gray-500">{player.position}</div>
                            )}
                            <div className="text-xs text-gray-400">
                              {player.team === 'home' ? 'Home' : 'Away'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Event Types */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Event Types ({assignment.assigned_event_types.length})
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {assignment.assigned_event_types.slice(0, 6).map(eventType => (
                          <Badge key={eventType} variant="outline" className="text-xs">
                            {eventType}
                          </Badge>
                        ))}
                        {assignment.assigned_event_types.length > 6 && (
                          <Badge variant="outline" className="text-xs bg-gray-100">
                            +{assignment.assigned_event_types.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="by-player" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="by-player">By Player</TabsTrigger>
              <TabsTrigger value="by-line">By Line</TabsTrigger>
            </TabsList>

            <TabsContent value="by-player" className="space-y-4">
              {/* Video URL Input - Optional */}
              <div className="space-y-2">
                <label htmlFor="videoUrl" className="text-sm font-medium text-gray-700">
                  YouTube Video URL (Optional)
                </label>
                <input
                  id="videoUrl"
                  type="text"
                  value={assignmentVideoUrl}
                  onChange={(e) => setAssignmentVideoUrl(e.target.value)}
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tracker Selection */}
              <div>
                <label className="text-sm font-medium">Select Tracker</label>
                <Select value={selectedTracker} onValueChange={setSelectedTracker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tracker" />
                  </SelectTrigger>
                  <SelectContent>
                    {localTrackers.map(tracker => (
                      <SelectItem key={tracker.id} value={tracker.id}>
                        {tracker.full_name || tracker.email || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Team</label>
                <Select value={selectedTeam} onValueChange={(value: 'home' | 'away') => {
                  setSelectedTeam(value);
                  setSelectedPlayers([]); // Clear selected players when switching teams
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">
                      Home Team ({homeTeamPlayers.length} players)
                    </SelectItem>
                    <SelectItem value="away">
                      Away Team ({awayTeamPlayers.length} players)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Player Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Players ({selectedPlayers.length} selected)
                </label>
                {renderPlayerGrid(selectedTeam === 'home' ? homeTeamPlayers : awayTeamPlayers)}
              </div>

              {/* Event Types */}
              <div>
                <label className="text-sm font-medium mb-2 block">Event Types</label>
                {renderEventTypeCategories()}
              </div>

              <Button 
                onClick={handleCreateAssignment} 
                className="w-full"
              >
                Create Assignment
              </Button>
            </TabsContent>

            <TabsContent value="by-line" className="space-y-4">
              {/* Video URL Input - Optional */}
              <div className="space-y-2">
                <label htmlFor="videoUrlLine" className="text-sm font-medium text-gray-700">
                  YouTube Video URL (Optional)
                </label>
                <input
                  id="videoUrlLine"
                  type="text"
                  value={assignmentVideoUrl}
                  onChange={(e) => setAssignmentVideoUrl(e.target.value)}
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Team Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Team</label>
                <Select value={selectedTeam} onValueChange={(value: 'home' | 'away') => setSelectedTeam(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">
                      Home Team ({homeTeamPlayers.length} players)
                    </SelectItem>
                    <SelectItem value="away">
                      Away Team ({awayTeamPlayers.length} players)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tracker Type Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tracker Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(trackerTypeConfig).map(([key, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <div
                        key={key}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedTrackerType === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTrackerType(key as TrackerType)}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="text-sm font-medium">{config.label}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{config.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Show selected players for current type */}
              {selectedTrackerType !== 'specialized' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Players ({getLinePlayers(selectedTrackerType, selectedTeam).length} selected)
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                    <div className="text-xs space-y-1">
                      {getLinePlayers(selectedTrackerType, selectedTeam).map(player => (
                        <div key={player.id}>
                          #{player.jersey_number} {player.player_name} ({player.position})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tracker Selection */}
              <div>
                <label className="text-sm font-medium">Select Tracker</label>
                <Select value={selectedTracker} onValueChange={setSelectedTracker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tracker" />
                  </SelectTrigger>
                  <SelectContent>
                    {localTrackers.map(tracker => (
                      <SelectItem key={tracker.id} value={tracker.id}>
                        {tracker.full_name || tracker.email || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Types */}
              <div>
                <label className="text-sm font-medium mb-2 block">Event Types</label>
                {renderEventTypeCategories()}
              </div>

              <Button 
                onClick={handleCreateAssignment} 
                className="w-full"
              >
                Create Assignment
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedTrackerAssignment;