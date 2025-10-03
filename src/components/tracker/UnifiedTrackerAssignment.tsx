
import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Trash2, ChevronRight, Shield, Zap, Target, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EVENT_TYPE_CATEGORIES } from '@/constants/eventTypes';

// Strict type definitions
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
  role: 'admin' | 'user' | 'tracker' | 'teacher';
}

interface Assignment {
  id: string;
  tracker_user_id: string;
  tracker_name: string;
  tracker_email: string;
  tracker_type: 'player' | 'ball';
  player_ids: number[] | null;
  assigned_event_types: string[]; // ✅ never null
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

// State management with reducer
interface TrackerAssignmentState {
  trackers: TrackerUser[];
  assignments: Assignment[];
  selectedTracker: string;
  selectedPlayers: number[];
  selectedEventTypes: string[];
  selectedTrackerType: TrackerType;
  assignmentRole: 'player' | 'ball';
  selectedTeam: 'home' | 'away';
  expandedCategories: Set<string>;
  assignmentVideoUrl: string;
  loading: boolean;
  creatingAssignment: boolean;
  deletingAssignment: string | null;
  error: string | null;
  autoSelectedTrackers: string[]; // For auto-assign
}

type AssignmentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRACKERS'; payload: TrackerUser[] }
  | { type: 'SET_ASSIGNMENTS'; payload: Assignment[] }
  | { type: 'SET_SELECTED_TRACKER'; payload: string }
  | { type: 'SET_SELECTED_PLAYERS'; payload: number[] }
  | { type: 'SET_SELECTED_EVENT_TYPES'; payload: string[] }
  | { type: 'SET_TRACKER_TYPE'; payload: TrackerType }
  | { type: 'SET_ASSIGNMENT_ROLE'; payload: 'player' | 'ball' }
  | { type: 'SET_TEAM'; payload: 'home' | 'away' }
  | { type: 'TOGGLE_CATEGORY'; payload: string }
  | { type: 'SET_VIDEO_URL'; payload: string }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: string | null }
  | { type: 'RESET_FORM' }
  | { type: 'SET_AUTO_SELECTED_TRACKERS'; payload: string[] };

const initialState = (videoUrl: string = ''): TrackerAssignmentState => ({
  trackers: [],
  assignments: [],
  selectedTracker: '',
  selectedPlayers: [],
  selectedEventTypes: [],
  selectedTrackerType: 'specialized',
  assignmentRole: 'player',
  selectedTeam: 'home',
  expandedCategories: new Set(),
  assignmentVideoUrl: videoUrl,
  loading: false,
  creatingAssignment: false,
  deletingAssignment: null,
  error: null,
  autoSelectedTrackers: [],
});

function assignmentReducer(state: TrackerAssignmentState, action: AssignmentAction): TrackerAssignmentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TRACKERS':
      return { ...state, trackers: action.payload };
    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload };
    case 'SET_SELECTED_TRACKER':
      return { ...state, selectedTracker: action.payload };
    case 'SET_SELECTED_PLAYERS':
      return { ...state, selectedPlayers: action.payload };
    case 'SET_SELECTED_EVENT_TYPES':
      return { ...state, selectedEventTypes: action.payload };
    case 'SET_TRACKER_TYPE':
      return { ...state, selectedTrackerType: action.payload };
    case 'SET_ASSIGNMENT_ROLE':
      return { ...state, assignmentRole: action.payload };
    case 'SET_TEAM':
      return { ...state, selectedTeam: action.payload, selectedPlayers: [] };
    case 'TOGGLE_CATEGORY': {
      const newSet = new Set(state.expandedCategories);
      newSet.has(action.payload) ? newSet.delete(action.payload) : newSet.add(action.payload);
      return { ...state, expandedCategories: newSet };
    }
    case 'SET_VIDEO_URL':
      return { ...state, assignmentVideoUrl: action.payload };
    case 'SET_CREATING':
      return { ...state, creatingAssignment: action.payload };
    case 'SET_DELETING':
      return { ...state, deletingAssignment: action.payload };
    case 'RESET_FORM':
      return {
        ...state,
        selectedTracker: '',
        selectedEventTypes: [],
        selectedPlayers: [],
        expandedCategories: new Set(),
        selectedTrackerType: 'specialized',
        assignmentRole: 'player',
      };
    case 'SET_AUTO_SELECTED_TRACKERS':
      return { ...state, autoSelectedTrackers: action.payload.slice(0, 3) };
    default:
      return state;
  }
}

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

const processAssignments = (rawAssignments: any[]): Assignment[] => {
  try {
    return rawAssignments.map(assignment => ({
      id: assignment.id,
      tracker_user_id: assignment.tracker_user_id,
      tracker_name: assignment.profiles?.full_name || 'Unknown',
      tracker_email: assignment.profiles?.email || 'Unknown',
      tracker_type: assignment.tracker_type,
      player_ids: assignment.assigned_player_ids,
      assigned_event_types: assignment.assigned_event_types || [], // ✅ never null
    }));
  } catch (error) {
    console.error('Error processing assignments:', error);
    return [];
  }
};

const UnifiedTrackerAssignment: React.FC<UnifiedTrackerAssignmentProps> = ({
  matchId,
  videoUrl = '',
  homeTeamPlayers = [],
  awayTeamPlayers = [],
  trackerUsers = [],
  assignments = [],
  onAssignmentsChange,
  showTypeAssignment = true
}) => {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(assignmentReducer, initialState(videoUrl));

  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const operationsRef = useRef<Set<string>>(new Set());
  const hasFetchedTrackers = useRef(false);
  const hasFetchedAssignments = useRef(false);

  const allPlayers = useMemo(() => [...homeTeamPlayers, ...awayTeamPlayers], [homeTeamPlayers, awayTeamPlayers]);

  useEffect(() => {
    if (trackerUsers.length > 0) {
      dispatch({ type: 'SET_TRACKERS', payload: trackerUsers });
      hasFetchedTrackers.current = true;
    }
    if (assignments.length > 0) {
      dispatch({ type: 'SET_ASSIGNMENTS', payload: assignments });
      hasFetchedAssignments.current = true;
    }
  }, [trackerUsers, assignments]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const safeAsync = useCallback(async <T,>(
    operation: () => Promise<T>,
    operationKey: string
  ): Promise<T | null> => {
    if (operationsRef.current.has(operationKey)) {
      console.warn(`Operation ${operationKey} already in progress`);
      return null;
    }
    operationsRef.current.add(operationKey);
    try {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const result = await operation();
      return mountedRef.current ? result : null;
    } catch (error: any) {
      if (error.name !== 'AbortError' && mountedRef.current) {
        console.error(`Error in ${operationKey}:`, error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Operation failed' });
      }
      return null;
    } finally {
      operationsRef.current.delete(operationKey);
      if (mountedRef.current) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, []);

  const fetchTrackers = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data, error } = await supabase.functions.invoke('get-tracker-users');
      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Failed to load tracker users.');
      }
      dispatch({ type: 'SET_TRACKERS', payload: data || [] });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_LOADING', payload: false });
      return data;
    } catch (err: any) {
      console.error('Failed to fetch trackers:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to load trackers' });
      dispatch({ type: 'SET_LOADING', payload: false });
      toast({
        title: "Error Loading Trackers",
        description: "Could not load tracker users.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const fetchAssignments = useCallback(async () => {
    if (!matchId) return null;
    dispatch({ type: 'SET_LOADING', payload: true });
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('match_tracker_assignments')
      .select('*')
      .eq('match_id', matchId);
    if (assignmentsError) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw assignmentsError;
    }
    if (!assignmentsData || assignmentsData.length === 0) {
      dispatch({ type: 'SET_ASSIGNMENTS', payload: [] });
      dispatch({ type: 'SET_LOADING', payload: false });
      onAssignmentsChange?.([]);
      return [];
    }
    const trackerUserIds = [...new Set(assignmentsData.map(a => a.tracker_user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', trackerUserIds);
    if (profilesError) {
      console.warn('Failed to fetch profiles:', profilesError);
    }
    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    const enrichedAssignments = assignmentsData.map(assignment => ({
      ...assignment,
      profiles: profilesMap.get(assignment.tracker_user_id) || null
    }));
    const processedAssignments = processAssignments(enrichedAssignments);
    dispatch({ type: 'SET_ASSIGNMENTS', payload: processedAssignments });
    dispatch({ type: 'SET_LOADING', payload: false });
    onAssignmentsChange?.(processedAssignments);
    return processedAssignments;
  }, [matchId, onAssignmentsChange]);

  useEffect(() => {
    if (trackerUsers.length === 0 && !hasFetchedTrackers.current) {
      hasFetchedTrackers.current = true;
      fetchTrackers().catch(err => {
        console.error('Failed to fetch trackers:', err);
        hasFetchedTrackers.current = false;
      });
    }
  }, [trackerUsers.length]);

  useEffect(() => {
    if (matchId && assignments.length === 0 && !hasFetchedAssignments.current) {
      hasFetchedAssignments.current = true;
      fetchAssignments().catch(err => {
        console.error('Failed to fetch assignments:', err);
        hasFetchedAssignments.current = false;
      });
    }
  }, [matchId, assignments.length]);

  const getLinePlayers = useCallback((trackerType: TrackerType, team?: 'home' | 'away') => {
    if (trackerType === 'specialized') {
      return allPlayers.filter(player => state.selectedPlayers.includes(player.id));
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
  }, [allPlayers, homeTeamPlayers, awayTeamPlayers, state.selectedPlayers]);

  // 🔥 AUTO-DISTRIBUTE PLAYERS BY POSITION
  const autoDistributePlayers = useCallback((
    team: 'home' | 'away',
    numTrackers: number = 3
  ): number[][] => {
    const teamPlayers = team === 'home' ? homeTeamPlayers : awayTeamPlayers;

    const defense: Player[] = [];
    const midfield: Player[] = [];
    const attack: Player[] = [];

    teamPlayers.forEach(player => {
      const pos = player.position?.toLowerCase() || '';
      if (pos.includes('def') || pos.includes('cb') || pos.includes('lb') || pos.includes('rb') || pos.includes('gk')) {
        defense.push(player);
      } else if (pos.includes('mid') || pos.includes('cm') || pos.includes('dm') || pos.includes('am')) {
        midfield.push(player);
      } else if (pos.includes('att') || pos.includes('fw') || pos.includes('st') || pos.includes('lw') || pos.includes('rw')) {
        attack.push(player);
      }
    });

    const assignments: number[][] = Array(numTrackers).fill(null).map(() => []);

    const distributeByLine = (line: Player[]) => {
      line.forEach((player, index) => {
        const trackerIndex = index % numTrackers;
        assignments[trackerIndex].push(player.id);
      });
    };

    distributeByLine(defense);
    distributeByLine(midfield);
    distributeByLine(attack);

    return assignments;
  }, [homeTeamPlayers, awayTeamPlayers]);

  const saveAssignmentToDB = useCallback(async (assignment: Omit<Assignment, 'id' | 'tracker_name' | 'tracker_email'>) => {
    if (!matchId) return null;
    const recordToInsert = {
      match_id: matchId,
      tracker_user_id: assignment.tracker_user_id,
      tracker_type: assignment.tracker_type,
      assigned_player_ids: assignment.player_ids,
      player_team_id: 'home',
      assigned_event_types: assignment.assigned_event_types // ✅ now includes event types
    };
    const { data, error } = await supabase
      .from('match_tracker_assignments')
      .insert([recordToInsert])
      .select('id')
      .single();
    if (error) throw error;
    return data?.id || null;
  }, [matchId]);

  const sendNotificationToTracker = useCallback(async (trackerId: string, matchId: string, videoUrl?: string) => {
    try {
      const notificationType = videoUrl ? 'video_assignment' : 'match_assignment';
      const notificationTitle = videoUrl ? 'New Video Tracking Assignment' : 'New Match Assignment';
      const notificationMessage = videoUrl 
        ? 'You have been assigned to track video analysis.'
        : 'You have been assigned to track a new match.';
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
      }
    } catch (error) {
      console.warn('Notification error:', error);
    }
  }, []);

  // 🔥 AUTO-ASSIGN HANDLER (with event types + user-selected trackers)
  const handleAutoAssignTrackers = useCallback(async () => {
    const selectedTrackers = state.autoSelectedTrackers
      .map(id => state.trackers.find(t => t.id === id))
      .filter((t): t is TrackerUser => !!t);

    if (selectedTrackers.length !== 3) {
      toast({
        title: "Invalid Selection",
        description: "Please select exactly 3 trackers.",
        variant: "destructive"
      });
      return;
    }

    // ✅ Get ALL event types for auto-assignment
    const allEventTypes = EVENT_TYPE_CATEGORIES.flatMap(cat => cat.events.map(e => e.key));

    return safeAsync(async () => {
      dispatch({ type: 'SET_CREATING', payload: true });

      const distributions = autoDistributePlayers(state.selectedTeam, 3);
      const newAssignments: Assignment[] = [];

      for (let i = 0; i < 3; i++) {
        const tracker = selectedTrackers[i];
        const playerIds = distributions[i];

        const assignmentToSave = {
          tracker_user_id: tracker.id,
          tracker_type: 'player' as const,
          player_ids: playerIds,
          assigned_event_types: allEventTypes // ✅ fixed: now includes all event types
        };

        const assignmentId = matchId
          ? await saveAssignmentToDB(assignmentToSave)
          : `temp-${Date.now()}-${i}`;

        if (assignmentId && matchId) {
          const finalVideoUrl = state.assignmentVideoUrl.trim() || undefined;
          await sendNotificationToTracker(tracker.id, matchId, finalVideoUrl);
        }

        newAssignments.push({
          id: assignmentId || `temp-${Date.now()}-${i}`,
          tracker_user_id: tracker.id,
          tracker_name: tracker.full_name || tracker.email || 'Unknown',
          tracker_email: tracker.email || 'Unknown',
          tracker_type: 'player',
          player_ids: playerIds,
          assigned_event_types: allEventTypes,
        });
      }

      const updatedAssignments = [...state.assignments, ...newAssignments];
      dispatch({ type: 'SET_ASSIGNMENTS', payload: updatedAssignments });
      onAssignmentsChange?.(updatedAssignments);
      dispatch({ type: 'SET_CREATING', payload: false });
      dispatch({ type: 'SET_AUTO_SELECTED_TRACKERS', payload: [] });

      toast({
        title: "Success",
        description: `Created ${newAssignments.length} player tracker assignments`,
      });

      return newAssignments;
    }, 'autoAssignTrackers');
  }, [
    state.autoSelectedTrackers,
    state.trackers,
    state.selectedTeam,
    state.assignments,
    state.assignmentVideoUrl,
    autoDistributePlayers,
    saveAssignmentToDB,
    sendNotificationToTracker,
    matchId,
    onAssignmentsChange,
    safeAsync,
    toast,
    dispatch
  ]);

  const handleEventTypeToggle = useCallback((eventType: string) => {
    const newEventTypes = state.selectedEventTypes.includes(eventType)
      ? state.selectedEventTypes.filter(type => type !== eventType)
      : [...state.selectedEventTypes, eventType];
    dispatch({ type: 'SET_SELECTED_EVENT_TYPES', payload: newEventTypes });
  }, [state.selectedEventTypes]);

  const handlePlayerToggle = useCallback((playerId: number) => {
    const newPlayers = state.selectedPlayers.includes(playerId)
      ? state.selectedPlayers.filter(id => id !== playerId)
      : [...state.selectedPlayers, playerId];
    dispatch({ type: 'SET_SELECTED_PLAYERS', payload: newPlayers });
  }, [state.selectedPlayers]);

  const handleCreateAssignment = useCallback(async () => {
    if (!state.selectedTracker) {
      toast({
        title: "Validation Error",
        description: "Please select a tracker.",
        variant: "destructive"
      });
      return;
    }
    if (state.assignmentRole === 'player' && state.selectedPlayers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one player for a Player Tracker role.",
        variant: "destructive"
      });
      return;
    }

    // ✅ Determine player_ids based on role
    let playerIds: number[] | null = null;
    if (state.assignmentRole === 'ball') {
      // Ball tracker gets ALL players from selected team
      playerIds = (state.selectedTeam === 'home' ? homeTeamPlayers : awayTeamPlayers).map(p => p.id);
    } else if (state.assignmentRole === 'player') {
      playerIds = state.selectedPlayers;
    }

    return safeAsync(async () => {
      dispatch({ type: 'SET_CREATING', payload: true });
      const trackerUser = state.trackers.find(t => t.id === state.selectedTracker);
      if (!trackerUser) {
        throw new Error('Selected tracker not found');
      }

      const assignmentToSave = {
        tracker_user_id: state.selectedTracker,
        tracker_type: state.assignmentRole,
        player_ids: playerIds,
        assigned_event_types: state.selectedEventTypes.length > 0 
          ? state.selectedEventTypes 
          : EVENT_TYPE_CATEGORIES.flatMap(cat => cat.events.map(e => e.key)) // fallback to all
      };

      const realAssignmentId = matchId ? await saveAssignmentToDB(assignmentToSave) : `temp-${Date.now()}`;
      if (realAssignmentId && matchId) {
         const finalVideoUrl = state.assignmentVideoUrl.trim() || undefined;
         await sendNotificationToTracker(state.selectedTracker, matchId, finalVideoUrl);
      }

      const finalAssignment: Assignment = {
        id: realAssignmentId || `temp-${Date.now()}`,
        tracker_user_id: state.selectedTracker,
        tracker_name: trackerUser.full_name || trackerUser.email || 'Unknown',
        tracker_email: trackerUser.email || 'Unknown',
        tracker_type: state.assignmentRole,
        player_ids: playerIds,
        assigned_event_types: assignmentToSave.assigned_event_types,
      };

      const updatedAssignments = [...state.assignments, finalAssignment];
      dispatch({ type: 'SET_ASSIGNMENTS', payload: updatedAssignments });
      onAssignmentsChange?.(updatedAssignments);
      dispatch({ type: 'RESET_FORM' });
      dispatch({ type: 'SET_CREATING', payload: false });

      toast({
        title: "Success",
        description: "Assignment created successfully"
      });

      return finalAssignment;
    }, 'createAssignment');
  }, [
    state.selectedTracker,
    state.assignmentRole,
    state.selectedPlayers,
    state.selectedTeam,
    state.selectedEventTypes,
    state.trackers,
    state.assignments,
    state.assignmentVideoUrl,
    homeTeamPlayers,
    awayTeamPlayers,
    saveAssignmentToDB,
    sendNotificationToTracker,
    matchId,
    onAssignmentsChange,
    safeAsync,
    toast
  ]);

  const handleDeleteAssignment = useCallback(async (assignmentId: string) => {
    return safeAsync(async () => {
      dispatch({ type: 'SET_DELETING', payload: assignmentId });
      const assignment = state.assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }
      if (matchId && !assignmentId.startsWith('temp-')) {
        const { error } = await supabase
          .from('match_tracker_assignments')
          .delete()
          .eq('id', assignmentId);
        if (error) throw error;
      }
      const updatedAssignments = state.assignments.filter(a => a.id !== assignmentId);
      dispatch({ type: 'SET_ASSIGNMENTS', payload: updatedAssignments });
      dispatch({ type: 'SET_DELETING', payload: null });
      onAssignmentsChange?.(updatedAssignments);
      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      });
      return true;
    }, 'deleteAssignment');
  }, [state.assignments, matchId, onAssignmentsChange, safeAsync, toast]);

  const renderEventTypeCategories = useCallback(() => (
    <div className="space-y-3">
      {EVENT_TYPE_CATEGORIES.map(category => (
        <div key={category.key} className="border rounded-lg">
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" 
            onClick={() => dispatch({ type: 'TOGGLE_CATEGORY', payload: category.key })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dispatch({ type: 'TOGGLE_CATEGORY', payload: category.key });
              }
            }}
            aria-expanded={state.expandedCategories.has(category.key)}
            aria-label={`Toggle ${category.label} category`}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={category.events.every(e => state.selectedEventTypes.includes(e.key))}
                onCheckedChange={(checked) => {
                  const eventKeys = category.events.map(e => e.key);
                  if (checked) {
                    const newEventTypes = [...new Set([...state.selectedEventTypes, ...eventKeys])];
                    dispatch({ type: 'SET_SELECTED_EVENT_TYPES', payload: newEventTypes });
                  } else {
                    const newEventTypes = state.selectedEventTypes.filter(k => !eventKeys.includes(k));
                    dispatch({ type: 'SET_SELECTED_EVENT_TYPES', payload: newEventTypes });
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
              state.expandedCategories.has(category.key) ? 'rotate-90' : ''
            }`} />
          </div>
          {state.expandedCategories.has(category.key) && (
            <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {category.events.map(event => (
                <div
                  key={event.key}
                  className={`p-2 border rounded cursor-pointer text-center text-xs transition-colors ${
                    state.selectedEventTypes.includes(event.key)
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
                  aria-pressed={state.selectedEventTypes.includes(event.key)}
                >
                  {event.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  ), [state.expandedCategories, state.selectedEventTypes, handleEventTypeToggle]);

  const renderPlayerGrid = useCallback((players: Player[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
      {players.map(player => (
        <div
          key={player.id}
          className={`p-2 border rounded cursor-pointer transition-colors ${
            state.selectedPlayers.includes(player.id) 
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
          aria-pressed={state.selectedPlayers.includes(player.id)}
        >
          <div className="text-xs font-medium">#{player.jersey_number}</div>
          <div className="text-xs text-gray-600 truncate">{player.player_name}</div>
          {player.position && (
            <div className="text-xs text-blue-600 font-semibold">{player.position}</div>
          )}
        </div>
      ))}
    </div>
  ), [state.selectedPlayers, handlePlayerToggle]);

  if (state.loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading assignments...</span>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Error</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{state.error}</p>
        <Button 
          onClick={() => {
            dispatch({ type: 'SET_ERROR', payload: null });
            hasFetchedTrackers.current = false;
            hasFetchedAssignments.current = false;
            if (trackerUsers.length === 0) fetchTrackers();
            if (matchId && assignments.length === 0) fetchAssignments();
          }}
          variant="outline" 
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  }

  const availableTrackers = state.trackers.filter(
    t => !state.assignments.some(a => a.tracker_user_id === t.id)
  );

  return (
    <div className="space-y-6">
      {/* Current Assignments */}
      {state.assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Assignments ({state.assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.assignments.map(assignment => {
                const assignedPlayers = (assignment.player_ids || [])
                  .map(playerId => allPlayers.find(player => player.id === playerId))
                  .filter((player): player is Player => Boolean(player));
                return (
                  <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-medium text-lg">{assignment.tracker_name}</span>
                        <div className="text-sm text-gray-600">{assignment.tracker_email}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        disabled={state.deletingAssignment === assignment.id}
                        className="text-red-600 hover:text-red-700"
                        aria-label={`Delete assignment for ${assignment.tracker_name}`}
                      >
                        {state.deletingAssignment === assignment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Event Types ({assignment.assigned_event_types.length})
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {assignment.assigned_event_types.slice(0, 6).map((eventType) => (
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
            Create New Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 🔥 AUTO-ASSIGN SECTION */}
          <div className="pt-2 border-t">
            <h3 className="text-sm font-medium mb-3">Quick Setup: Auto-Assign 3 Trackers</h3>

            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">
                Select 3 Trackers for Auto-Assignment
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded">
                {availableTrackers.map(tracker => {
                  const isSelected = state.autoSelectedTrackers.includes(tracker.id);
                  const isDisabled = !isSelected && state.autoSelectedTrackers.length >= 3;
                  return (
                    <div
                      key={tracker.id}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        isSelected
                          ? 'bg-blue-100 border-blue-300'
                          : isDisabled
                          ? 'opacity-50'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        if (isDisabled && !isSelected) return;
                        let newSelection = state.autoSelectedTrackers;
                        if (isSelected) {
                          newSelection = newSelection.filter(id => id !== tracker.id);
                        } else {
                          newSelection = [...newSelection, tracker.id].slice(0, 3);
                        }
                        dispatch({ type: 'SET_AUTO_SELECTED_TRACKERS', payload: newSelection });
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled && !isSelected}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {tracker.full_name || tracker.email}
                      </span>
                    </div>
                  );
                })}
              </div>
              {availableTrackers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No available trackers. All are already assigned.
                </p>
              )}
              {state.autoSelectedTrackers.length < 3 && availableTrackers.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Please select exactly 3 trackers to enable auto-assignment.
                </p>
              )}
            </div>

            {state.autoSelectedTrackers.length === 3 && (
              <Card className="bg-blue-50 border-blue-200 mb-3">
                <CardContent className="p-3">
                  <h4 className="font-medium text-xs mb-2">Preview (by position):</h4>
                  {(() => {
                    const distributions = autoDistributePlayers(state.selectedTeam, 3);
                    const selectedTrackers = state.autoSelectedTrackers.map(id =>
                      state.trackers.find(t => t.id === id)
                    ).filter((t): t is TrackerUser => !!t);

                    return distributions.map((playerIds, index) => {
                      const tracker = selectedTrackers[index];
                      const players = allPlayers.filter(p => playerIds.includes(p.id));
                      const positions = players.map(p => {
                        const pos = p.position?.toLowerCase() || '';
                        if (pos.includes('def') || pos.includes('gk')) return 'D';
                        if (pos.includes('mid')) return 'M';
                        if (pos.includes('att') || pos.includes('fw')) return 'A';
                        return '?';
                      });
                      return (
                        <div key={index} className="text-xs mb-1">
                          <span className="font-medium">
                            {tracker?.full_name || tracker?.email || `Tracker ${index + 1}`}:
                          </span>
                          <span className="ml-2 text-gray-700">
                            {players.length} players ({positions.join(', ')})
                          </span>
                        </div>
                      );
                    });
                  })()}
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleAutoAssignTrackers}
              disabled={
                state.creatingAssignment ||
                state.autoSelectedTrackers.length !== 3
              }
              className="w-full"
              size="sm"
            >
              {state.creatingAssignment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Auto-Assign 3 Player Trackers'
              )}
            </Button>
          </div>

          {/* Manual Assignment Tabs */}
          <Tabs defaultValue="by-player" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="by-player">By Player</TabsTrigger>
              <TabsTrigger value="by-line">By Line</TabsTrigger>
            </TabsList>
            <TabsContent value="by-player" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="videoUrl" className="text-sm font-medium text-gray-700">
                  YouTube Video URL (Optional)
                </label>
                <input
                  id="videoUrl"
                  type="text"
                  value={state.assignmentVideoUrl}
                  onChange={(e) => dispatch({ type: 'SET_VIDEO_URL', payload: e.target.value })}
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-describedby="videoUrl-description"
                />
                <div id="videoUrl-description" className="text-xs text-gray-500">
                  Leave empty for live match tracking
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Select Tracker</label>
                  <Select
                    value={state.selectedTracker}
                    onValueChange={(value) => dispatch({ type: 'SET_SELECTED_TRACKER', payload: value })}
                    disabled={state.trackers.length === 0}
                  >
                    <SelectTrigger aria-label="Select tracker" className="bg-background">
                      <SelectValue placeholder={state.trackers.length === 0 ? "No trackers available" : "Choose a tracker"} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-[100]">
                      {state.trackers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No tracker users found
                        </div>
                      ) : (
                        state.trackers.map(tracker => (
                          <SelectItem key={tracker.id} value={tracker.id}>
                            {tracker.full_name || tracker.email || 'Unknown'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {state.trackers.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No tracker users available. Please contact an admin.
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Assignment Role</label>
                  <Select
                    value={state.assignmentRole}
                    onValueChange={(value: 'player' | 'ball') => dispatch({ type: 'SET_ASSIGNMENT_ROLE', payload: value })}
                  >
                    <SelectTrigger aria-label="Select assignment role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">Player Tracker</SelectItem>
                      <SelectItem value="ball">Ball Tracker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {state.assignmentRole === 'player' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Team</label>
                    <Select
                      value={state.selectedTeam}
                      onValueChange={(value: 'home' | 'away') => dispatch({ type: 'SET_TEAM', payload: value })}
                    >
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Players ({state.selectedPlayers.length} selected)
                    </label>
                    {renderPlayerGrid(state.selectedTeam === 'home' ? homeTeamPlayers : awayTeamPlayers)}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Event Types ({state.selectedEventTypes.length} selected)
                    </label>
                    {renderEventTypeCategories()}
                  </div>
                </>
              )}
              <Button
                onClick={handleCreateAssignment}
                disabled={
                  state.creatingAssignment ||
                  !state.selectedTracker ||
                  (state.assignmentRole === 'player' && state.selectedPlayers.length === 0)
                  // ✅ Ball tracker no longer requires player selection
                }
                className="w-full"
                aria-label="Create assignment"
              >
                {state.creatingAssignment ? (
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
               <div className="space-y-2">
                <label htmlFor="videoUrl-line" className="text-sm font-medium text-gray-700">
                  YouTube Video URL (Optional)
                </label>
                <input
                  id="videoUrl-line"
                  type="text"
                  value={state.assignmentVideoUrl}
                  onChange={(e) => dispatch({ type: 'SET_VIDEO_URL', payload: e.target.value })}
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-describedby="videoUrl-line-description"
                />
                <div id="videoUrl-line-description" className="text-xs text-gray-500">
                  Leave empty for live match tracking
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Select Tracker</label>
                <Select 
                  value={state.selectedTracker} 
                  onValueChange={(value) => dispatch({ type: 'SET_SELECTED_TRACKER', payload: value })}
                >
                  <SelectTrigger aria-label="Select tracker">
                    <SelectValue placeholder="Choose a tracker" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.trackers.map(tracker => (
                      <SelectItem key={tracker.id} value={tracker.id}>
                        {tracker.full_name || tracker.email || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Select Team</label>
                <Select 
                  value={state.selectedTeam} 
                  onValueChange={(value: 'home' | 'away') => dispatch({ type: 'SET_TEAM', payload: value })}
                >
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
              <div>
                <label className="text-sm font-medium mb-2 block">Select Tracker Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(trackerTypeConfig) as TrackerType[]).filter(type => type !== 'specialized').map(type => {
                    const config = trackerTypeConfig[type];
                    const Icon = config.icon;
                    const linePlayers = getLinePlayers(type, state.selectedTeam);
                    return (
                      <div
                        key={type}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          state.selectedTrackerType === type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => {
                          dispatch({ type: 'SET_TRACKER_TYPE', payload: type });
                          dispatch({ type: 'SET_SELECTED_PLAYERS', payload: linePlayers.map(p => p.id) });
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            dispatch({ type: 'SET_TRACKER_TYPE', payload: type });
                            dispatch({ type: 'SET_SELECTED_PLAYERS', payload: linePlayers.map(p => p.id) });
                          }
                        }}
                        aria-label={`Select ${config.label}`}
                        aria-pressed={state.selectedTrackerType === type}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{config.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {linePlayers.length} players
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{config.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Event Types ({state.selectedEventTypes.length} selected)
                </label>
                {renderEventTypeCategories()}
              </div>
              <Button
                onClick={handleCreateAssignment}
                disabled={state.creatingAssignment || !state.selectedTracker || state.selectedEventTypes.length === 0}
                className="w-full"
                aria-label="Create line-based assignment"
              >
                {state.creatingAssignment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Assignment...
                  </>
                ) : (
                  `Create ${trackerTypeConfig[state.selectedTrackerType].label}`
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
