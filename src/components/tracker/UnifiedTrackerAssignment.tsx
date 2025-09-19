import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Trash2, ChevronRight, Shield, Zap, Target, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EVENT_TYPE_CATEGORIES } from '@/constants/eventTypes';

interface Player {
  id: number;
  jersey_number: number;
  player_name: string;
  team: 'home' | 'away';
  position?: string;
}

interface TrackerUser {
  id: string;
  email: string | null;
  full_name?: string | null;
  role: 'admin' | 'user' | 'tracker' | 'teacher' | string | null;
}

interface Assignment {
  id: string;
  tracker_user_id: string;
  tracker_name: string;
  tracker_email: string;
  player_ids: number[];
  assigned_event_types: string[];
}

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

// Validation schema for assignment data
interface DatabaseAssignment {
  id: string;
  tracker_user_id: string;
  assigned_player_id: number;
  assigned_event_types: string[];
  profiles?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

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
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState<string | null>(null);
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

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Safe state update helper
  const safeSetState = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T | ((prev: T) => T)) => {
    if (mountedRef.current) {
      setter(value);
    }
  }, []);

  // Validate assignment data structure
  const validateAssignmentData = (data: any[]): data is DatabaseAssignment[] => {
    return Array.isArray(data) && data.every(item => 
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.tracker_user_id === 'string' &&
      typeof item.assigned_player_id === 'number' &&
      Array.isArray(item.assigned_event_types)
    );
  };

  const fetchTrackers = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      safeSetState(setLoading, true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'tracker')
        .abortSignal(abortControllerRef.current.signal);

      if (error) throw error;
      
      safeSetState(setLocalTrackers, data || []);
    } catch (error: any) {
      if (error.name !== 'AbortError' && mountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to fetch tracker users",
          variant: "destructive"
        });
      }
    } finally {
      safeSetState(setLoading, false);
    }
  }, [safeSetState, toast]);

  const fetchAssignments = useCallback(async () => {
    if (!matchId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      safeSetState(setLoading, true);
      
      // First fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId)
        .abortSignal(abortControllerRef.current.signal);

      if (assignmentsError) throw assignmentsError;

      if (!assignmentsData || assignmentsData.length === 0) {
        safeSetState(setLocalAssignments, []);
        if (onAssignmentsChange && mountedRef.current) {
          onAssignmentsChange([]);
        }
        return;
      }

      // Validate data structure
      if (!validateAssignmentData(assignmentsData)) {
        throw new Error('Invalid assignment data structure received from database');
      }

      // Get unique tracker user IDs
      const trackerUserIds = [...new Set(assignmentsData.map(a => a.tracker_user_id))];
      
      // Fetch tracker profiles separately to avoid RLS issues
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', trackerUserIds)
        .abortSignal(abortControllerRef.current.signal);

      if (profilesError) {
        console.warn('Failed to fetch profiles, using assignments without names:', profilesError);
      }

      // Merge the data
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const enrichedAssignments = assignmentsData.map(assignment => ({
        ...assignment,
        profiles: profilesMap.get(assignment.tracker_user_id) || null
      }));

      const processedAssignments = processAssignments(enrichedAssignments);
      safeSetState(setLocalAssignments, processedAssignments);
      
      if (onAssignmentsChange && mountedRef.current) {
        onAssignmentsChange(processedAssignments);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && mountedRef.current) {
        console.error('Error fetching assignments:', error);
        toast({
          title: "Error",
          description: `Failed to fetch assignments: ${error.message}`,
          variant: "destructive"
        });
      }
    } finally {
      safeSetState(setLoading, false);
    }
  }, [matchId, safeSetState, toast, onAssignmentsChange]);

  useEffect(() => {
    if (trackerUsers.length === 0) {
      fetchTrackers();
    }
  }, [fetchTrackers, trackerUsers.length]);

  useEffect(() => {
    if (matchId && assignments.length === 0) {
      fetchAssignments();
    }
  }, [fetchAssignments, matchId, assignments.length]);

  const processAssignments = (rawAssignments: DatabaseAssignment[]): Assignment[] => {
    try {
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
    } catch (error) {
      console.error('Error processing assignments:', error);
      return [];
    }
  };

  const handleEventTypeToggle = useCallback((eventType: string) => {
    setSelectedEventTypes(prev =>
      prev.includes(eventType)
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  }, []);

  const handleCategoryToggle = useCallback((categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      newSet.has(categoryKey) ? newSet.delete(categoryKey) : newSet.add(categoryKey);
      return newSet;
    });
  }, []);

  const handlePlayerToggle = useCallback((playerId: number) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  }, []);

  const getLinePlayers = useCallback((trackerType: TrackerType, team?: 'home' | 'away') => {
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
  }, [allPlayers, homeTeamPlayers, awayTeamPlayers, selectedPlayers]);

  const resetForm = useCallback(() => {
    setSelectedTracker('');
    setSelectedEventTypes([]);
    setSelectedPlayers([]);
    setExpandedCategories(new Set());
    setAssignmentVideoUrl(videoUrl || '');
  }, [videoUrl]);

  // Updated saveAssignmentToDB function with proper ID handling
const saveAssignmentToDB = async (assignment: Assignment) => {
  if (!matchId) return null;

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

  const { data, error } = await supabase
    .from('match_tracker_assignments')
    .insert(dbRecords)
    .select('id'); // Return the inserted IDs

  if (error) throw error;
  
  // Return the first inserted record's ID to use as the real assignment ID
  return data && data.length > 0 ? data[0].id : null;
};

// Updated handleCreateAssignment function
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

  setCreatingAssignment(true);

  try {
    const trackerUser = localTrackers.find(t => t.id === selectedTracker);
    if (!trackerUser) {
      throw new Error('Selected tracker not found');
    }

    // Create the assignment object with a temporary ID first
    const tempAssignment: Assignment = {
      id: `temp-${Date.now()}`,
      tracker_user_id: selectedTracker,
      tracker_name: trackerUser.full_name || trackerUser.email || 'Unknown',
      tracker_email: trackerUser.email || 'Unknown',
      player_ids: playersToAssign,
      assigned_event_types: selectedEventTypes
    };

    let realAssignmentId: string | null = null;

    // Save to database first if matchId exists
    if (matchId) {
      realAssignmentId = await saveAssignmentToDB(tempAssignment);
      
      // Send notification after successful DB save
      const finalVideoUrl = assignmentVideoUrl.trim() || undefined;
      await sendNotificationToTracker(selectedTracker, matchId, finalVideoUrl);
    }

    // Create the final assignment object with the real ID from database
    const finalAssignment: Assignment = {
      ...tempAssignment,
      id: realAssignmentId || tempAssignment.id // Use real ID if available, fallback to temp
    };

    // Update local state with the final assignment
    const updatedAssignments = [...localAssignments, finalAssignment];
    safeSetState(setLocalAssignments, updatedAssignments);
    
    if (onAssignmentsChange && mountedRef.current) {
      onAssignmentsChange(updatedAssignments);
    }

    // Reset form
    resetForm();

    toast({
      title: "Success",
      description: "Assignment created successfully"
    });

  } catch (error: any) {
    console.error('Error creating assignment:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to create assignment",
      variant: "destructive"
    });
  } finally {
    safeSetState(setCreatingAssignment, false);
  }
};

// Alternative approach: If you need to create a single assignment record instead of multiple
const saveAssignmentToDBAlternative = async (assignment: Assignment) => {
  if (!matchId) return null;

  // Create a single record with arrays for player IDs
  const dbRecord = {
    match_id: matchId,
    tracker_user_id: assignment.tracker_user_id,
    assigned_player_ids: assignment.player_ids, // Use the array column
    player_team_id: 'both', // Or determine logic for mixed teams
    assigned_event_types: assignment.assigned_event_types,
  };

  const { data, error } = await supabase
    .from('match_tracker_assignments')
    .insert(dbRecord)
    .select('id')
    .single(); // Get single record

  if (error) throw error;
  
  return data?.id || null;
};
  const sendNotificationToTracker = async (trackerId: string, matchId: string, videoUrl?: string) => {
    try {
      const notificationType = videoUrl ? 'video_assignment' : 'match_assignment';
      const notificationTitle = videoUrl ? 'New Video Tracking Assignment' : 'New Match Assignment';
      const notificationMessage = videoUrl 
        ? `You have been assigned to track video analysis.`
        : `You have been assigned to track a new match.`;

      const { error } = await supabase.from('notifications').insert({
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

      if (error) {
        console.warn('Failed to send notification:', error);
        // Don't throw - notification failure shouldn't break assignment
      }
    } catch (error) {
      console.warn('Notification error:', error);
      // Notification failure shouldn't break the assignment process
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    setDeletingAssignment(assignmentId);

    try {
      const assignment = localAssignments.find(a => a.id === assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Delete from database first if it's not a temporary assignment
      if (matchId && !assignmentId.startsWith('temp-')) {
        const { error } = await supabase
          .from('match_tracker_assignments')
          .delete()
          .eq('match_id', matchId)
          .eq('tracker_user_id', assignment.tracker_user_id)
          .in('assigned_player_id', assignment.player_ids);

        if (error) {
          throw error;
        }
      }

      // Only update local state after successful database operation
      const updatedAssignments = localAssignments.filter(a => a.id !== assignmentId);
      safeSetState(setLocalAssignments, updatedAssignments);
      
      if (onAssignmentsChange && mountedRef.current) {
        onAssignmentsChange(updatedAssignments);
      }

      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive"
      });
    } finally {
      safeSetState(setDeletingAssignment, null);
    }
  };

  const handleTeamChange = useCallback((value: string) => {
    const newTeam = value as 'home' | 'away';
    setSelectedTeam(newTeam);
    setSelectedPlayers([]); // Clear selected players when switching teams
  }, []);

  const renderEventTypeCategories = () => (
    <div className="space-y-3">
      {EVENT_TYPE_CATEGORIES.map(category => (
        <div key={category.key} className="border rounded-lg">
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" 
            onClick={() => handleCategoryToggle(category.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCategoryToggle(category.key);
              }
            }}
            aria-expanded={expandedCategories.has(category.key)}
            aria-label={`Toggle ${category.label} category`}
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
                aria-label={`Select all ${category.label} events`}
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
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEventTypeToggle(event.key);
                    }
                  }}
                  aria-label={`Toggle ${event.label} event type`}
                  aria-pressed={selectedEventTypes.includes(event.key)}
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
      {players.map(player => (
        <div
          key={player.id}
          className={`p-2 border rounded cursor-pointer transition-colors ${
            selectedPlayers.includes(player.id) 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => handlePlayerToggle(player.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePlayerToggle(player.id);
            }
          }}
          aria-label={`Toggle player ${player.player_name}`}
          aria-pressed={selectedPlayers.includes(player.id)}
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
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading assignments...</span>
      </div>
    );
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
                        disabled={deletingAssignment === assignment.id}
                        className="text-red-600 hover:text-red-700"
                        aria-label={`Delete assignment for ${assignment.tracker_name}`}
                      >
                        {deletingAssignment === assignment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Assigned Players */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Assigned Players ({assignedPlayers.length})
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
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
                  aria-describedby="videoUrl-description"
                />
                <div id="videoUrl-description" className="text-xs text-gray-500">
                  Leave empty for live match tracking
                </div>
              </div>

              {/* Tracker Selection */}
              <div>
                <label className="text-sm font-medium">Select Tracker</label>
                <Select value={selectedTracker} onValueChange={setSelectedTracker}>
                  <SelectTrigger aria-label="Select tracker">
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
                <Select value={selectedTeam} onValueChange={handleTeamChange}>
                  <SelectTrigger aria-label="Select team">
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
                disabled={creatingAssignment}
              >
                {creatingAssignment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Assignment...
                  </>
                ) : (
                  'Create Assignment'
                )}
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
                  aria-describedby="videoUrlLine-description"
                />
                <div id="videoUrlLine-description" className="text-xs text-gray-500">
                  Leave empty for live match tracking
                </div>
              </div>

              {/* Team Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Team</label>
                <Select value={selectedTeam} onValueChange={handleTeamChange}>
                  <SelectTrigger aria-label="Select team">
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
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedTrackerType(key as TrackerType);
                          }
                        }}
                        aria-label={`Select ${config.label}`}
                        aria-pressed={selectedTrackerType === key}
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
                    {getLinePlayers(selectedTrackerType, selectedTeam).length > 0 ? (
                      <div className="text-xs space-y-1">
                        {getLinePlayers(selectedTrackerType, selectedTeam).map(player => (
                          <div key={player.id}>
                            #{player.jersey_number} {player.player_name} ({player.position || 'N/A'})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        No players found for this position type in the selected team
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tracker Selection */}
              <div>
                <label className="text-sm font-medium">Select Tracker</label>
                <Select value={selectedTracker} onValueChange={setSelectedTracker}>
                  <SelectTrigger aria-label="Select tracker">
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
                disabled={creatingAssignment}
              >
                {creatingAssignment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Assignment...
                  </>
                ) : (
                  'Create Assignment'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedTrackerAssignment;
