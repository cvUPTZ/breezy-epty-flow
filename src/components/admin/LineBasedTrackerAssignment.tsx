
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, Zap, Target, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrackerUser {
  id: string;
  email: string;
  full_name: string;
}

interface LineAssignment {
  id: string;
  tracker_user_id: string;
  match_id: string;
  assignment_type: 'defense' | 'midfield' | 'attack' | 'all_events';
  player_team_id: 'home' | 'away' | 'both';
  assigned_event_types: string[];
  tracker_name?: string;
  tracker_email?: string;
}

interface LineBasedTrackerAssignmentProps {
  matchId: string;
  homeTeamPlayers: any[];
  awayTeamPlayers: any[];
}

const EVENT_TYPES = [
  'goal', 'assist', 'shot', 'pass', 'tackle', 'foul', 'yellow_card', 'red_card',
  'corner', 'free_kick', 'penalty', 'offside', 'substitution', 'save'
];

const LineBasedTrackerAssignment: React.FC<LineBasedTrackerAssignmentProps> = ({
  matchId,
  homeTeamPlayers,
  awayTeamPlayers
}) => {
  const [trackerUsers, setTrackerUsers] = useState<TrackerUser[]>([]);
  const [assignments, setAssignments] = useState<LineAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<string>('');
  const [selectedAssignmentType, setSelectedAssignmentType] = useState<'defense' | 'midfield' | 'attack' | 'all_events'>('defense');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | 'both'>('both');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchTrackerUsers();
    fetchAssignments();
  }, [matchId]);

  const fetchTrackerUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('role', 'tracker')
        .order('full_name');

      if (error) throw error;

      const typedUsers: TrackerUser[] = (data || [])
        .filter(user => user.id)
        .map(user => ({
          id: user.id!,
          email: user.email || 'No email',
          full_name: user.full_name || 'No name',
        }));

      setTrackerUsers(typedUsers);
    } catch (error: any) {
      console.error('Error fetching tracker users:', error);
      toast.error('Failed to fetch tracker users');
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select(`
          id,
          tracker_user_id,
          match_id,
          player_team_id,
          assigned_event_types,
          profiles!tracker_user_id (
            full_name,
            email
          )
        `)
        .eq('match_id', matchId)
        .is('player_id', null); // Only get line-based assignments

      if (error) throw error;

      const transformedAssignments: LineAssignment[] = (data || [])
        .filter(item => item.id && item.tracker_user_id)
        .map(item => {
          // Determine assignment type from event types or team assignment
          let assignmentType: 'defense' | 'midfield' | 'attack' | 'all_events' = 'all_events';
          
          // This is a simplified logic - you might want to make this more sophisticated
          const eventTypes = item.assigned_event_types || [];
          if (eventTypes.includes('tackle') || eventTypes.includes('save')) {
            assignmentType = 'defense';
          } else if (eventTypes.includes('pass') || eventTypes.includes('assist')) {
            assignmentType = 'midfield';
          } else if (eventTypes.includes('goal') || eventTypes.includes('shot')) {
            assignmentType = 'attack';
          }

          return {
            id: item.id!,
            tracker_user_id: item.tracker_user_id!,
            match_id: item.match_id!,
            assignment_type: assignmentType,
            player_team_id: (item.player_team_id as 'home' | 'away') || 'both',
            assigned_event_types: item.assigned_event_types || [],
            tracker_name: (item.profiles as any)?.full_name || undefined,
            tracker_email: (item.profiles as any)?.email || undefined,
          };
        });

      setAssignments(transformedAssignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    }
  };

  const createLineAssignment = async () => {
    if (!selectedTracker || selectedEventTypes.length === 0) {
      toast.error('Please select a tracker and at least one event type');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_tracker_assignments')
        .insert([{
          match_id: matchId,
          tracker_user_id: selectedTracker,
          player_team_id: selectedTeam === 'both' ? 'home' : selectedTeam, // Store one team, but logic handles both
          assigned_event_types: selectedEventTypes,
          player_id: null // This indicates it's a line-based assignment
        }]);

      if (error) throw error;

      toast.success(`${getAssignmentTypeLabel(selectedAssignmentType)} assignment created successfully`);
      
      // Reset form
      setSelectedTracker('');
      setSelectedEventTypes([]);
      setSelectedAssignmentType('defense');
      setSelectedTeam('both');
      
      await fetchAssignments();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const { error } = await supabase
        .from('match_tracker_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Assignment deleted successfully');
      await fetchAssignments();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const toggleEventType = (eventType: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(eventType) 
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case 'defense': return 'Defense Line';
      case 'midfield': return 'Midfield Line';
      case 'attack': return 'Attack Line';
      case 'all_events': return 'All Events (No Player Assignment)';
      default: return type;
    }
  };

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'defense': return <Shield className="h-4 w-4" />;
      case 'midfield': return <Users className="h-4 w-4" />;
      case 'attack': return <Zap className="h-4 w-4" />;
      case 'all_events': return <Target className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'defense': return 'bg-blue-500';
      case 'midfield': return 'bg-green-500';
      case 'attack': return 'bg-red-500';
      case 'all_events': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getDefaultEventTypesForAssignment = (type: string) => {
    switch (type) {
      case 'defense':
        return ['tackle', 'save', 'foul', 'yellow_card', 'red_card'];
      case 'midfield':
        return ['pass', 'assist', 'tackle', 'foul'];
      case 'attack':
        return ['goal', 'shot', 'assist', 'corner', 'free_kick', 'penalty'];
      case 'all_events':
        return EVENT_TYPES;
      default:
        return [];
    }
  };

  // Auto-select event types when assignment type changes
  useEffect(() => {
    setSelectedEventTypes(getDefaultEventTypesForAssignment(selectedAssignmentType));
  }, [selectedAssignmentType]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Line-Based Tracker Assignment
        </CardTitle>
        <p className="text-sm text-gray-600">
          Assign trackers to different lines of players (Defense, Midfield, Attack) or all events without specific players
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Assignment</TabsTrigger>
            <TabsTrigger value="assignments">Current Assignments ({assignments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tracker-select">Select Tracker</Label>
                <Select value={selectedTracker} onValueChange={setSelectedTracker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tracker" />
                  </SelectTrigger>
                  <SelectContent>
                    {trackerUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignment-type">Assignment Type</Label>
                <Select value={selectedAssignmentType} onValueChange={(value: any) => setSelectedAssignmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defense">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Defense Line Players
                      </div>
                    </SelectItem>
                    <SelectItem value="midfield">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Midfield Line Players
                      </div>
                    </SelectItem>
                    <SelectItem value="attack">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Attack Line Players
                      </div>
                    </SelectItem>
                    <SelectItem value="all_events">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        All Events (No Player Assignment)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="team-select">Team Focus</Label>
              <Select value={selectedTeam} onValueChange={(value: any) => setSelectedTeam(value)}>
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
              <Label>Event Types to Track</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {EVENT_TYPES.map((eventType) => (
                  <div
                    key={eventType}
                    className={`p-2 border rounded cursor-pointer transition-colors text-center ${
                      selectedEventTypes.includes(eventType)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleEventType(eventType)}
                  >
                    <span className="text-sm capitalize">{eventType.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={createLineAssignment}
              disabled={loading || !selectedTracker || selectedEventTypes.length === 0}
              className="w-full"
            >
              Create Line Assignment
            </Button>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No line-based assignments created yet
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="border-l-4" style={{ borderLeftColor: getAssignmentTypeColor(assignment.assignment_type).replace('bg-', '#') }}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getAssignmentTypeIcon(assignment.assignment_type)}
                            <h4 className="font-medium">{assignment.tracker_name}</h4>
                            <Badge 
                              className="text-white"
                              style={{ backgroundColor: getAssignmentTypeColor(assignment.assignment_type).replace('bg-', '') }}
                            >
                              {getAssignmentTypeLabel(assignment.assignment_type)}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{assignment.tracker_email}</p>
                          
                          <div className="mb-2">
                            <p className="text-sm font-medium">Team Focus:</p>
                            <Badge variant="outline">
                              {assignment.player_team_id === 'home' ? 'Home Team' : 
                               assignment.player_team_id === 'away' ? 'Away Team' : 'Both Teams'}
                            </Badge>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-1">Assigned Event Types:</p>
                            <div className="flex flex-wrap gap-1">
                              {assignment.assigned_event_types.map((eventType) => (
                                <Badge key={eventType} variant="secondary" className="text-xs">
                                  {eventType.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LineBasedTrackerAssignment;
