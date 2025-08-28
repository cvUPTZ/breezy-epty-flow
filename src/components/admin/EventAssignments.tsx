
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrackerAssignment {
  id: string;
  tracker_user_id: string;
  assigned_event_types: string[] | null;
  assigned_player_id?: number;
  player_team_id?: string;
  created_at: string;
  tracker_name?: string;
  tracker_email?: string;
  player_info?: {
    id: number;
    team: string;
  } | null;
}

interface EventAssignmentsProps {
  matchId?: string;
}

const EventAssignments: React.FC<EventAssignmentsProps> = ({ matchId }) => {
  const [assignments, setAssignments] = useState<TrackerAssignment[]>([]);
  const [availableTrackers, setAvailableTrackers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);

  const eventTypes = [
    'goal', 'assist', 'yellow_card', 'red_card', 'substitution', 
    'corner', 'free_kick', 'penalty', 'offside', 'foul'
  ];

  useEffect(() => {
    if (matchId) {
      fetchAssignments();
      fetchAvailableTrackers();
    }
  }, [matchId]);

  const fetchAssignments = async () => {
    if (!matchId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select(`
          id,
          tracker_user_id,
          assigned_event_types,
          assigned_player_id,
          player_team_id,
          created_at,
          profiles (
            full_name,
            email
          )
        `)
        .eq('match_id', matchId)
        .not('assigned_player_id', 'is', null);

      if (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Failed to load assignments');
        return;
      }
      
      const assignmentsWithTrackers: TrackerAssignment[] = data?.map(assignment => ({
        id: assignment.id,
        tracker_user_id: assignment.tracker_user_id,
        assigned_event_types: assignment.assigned_event_types,
        assigned_player_id: assignment.assigned_player_id || undefined,
        player_team_id: assignment.player_team_id,
        created_at: assignment.created_at,
        tracker_name: (assignment.profiles as any)?.full_name || 'Unknown',
        tracker_email: (assignment.profiles as any)?.email || 'Unknown',
        player_info: assignment.assigned_player_id ? {
          id: assignment.assigned_player_id,
          team: assignment.player_team_id
        } : null
      })) || [];

      setAssignments(assignmentsWithTrackers);
    } catch (error) {
      console.error('Error in fetchAssignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTrackers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'tracker');

      if (error) {
        console.error('Error fetching trackers:', error);
        return;
      }

      setAvailableTrackers(data || []);
    } catch (error) {
      console.error('Error in fetchAvailableTrackers:', error);
    }
  };

  const handleAssignTracker = async () => {
    if (!selectedTracker || selectedEventTypes.length === 0 || !matchId) {
      toast.error('Please select a tracker and at least one event type');
      return;
    }

    console.log('EventAssignments handleAssignTracker called - no video URL access here');

    try {
      const { error } = await supabase
        .from('match_tracker_assignments')
        .insert({
          match_id: matchId,
          tracker_user_id: selectedTracker,
          assigned_event_types: selectedEventTypes,
          player_team_id: 'home' // Default team for general event assignments
        });

      if (error) {
        console.error('Error assigning tracker:', error);
        toast.error('Failed to assign tracker');
        return;
      }

      // Send match assignment notification (no video URL available in this component)
      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: selectedTracker,
        match_id: matchId,
        type: 'match_assignment',
        title: 'New Match Assignment',
        message: `You have been assigned to track match events. Events: ${selectedEventTypes.join(', ')}`,
        notification_data: {
          match_id: matchId,
          assigned_event_types: selectedEventTypes,
          assignment_type: 'match_tracking'
        }
      });

      if (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't throw error for notifications, just log it
      }

      toast.success('Tracker assigned successfully');
      setSelectedTracker('');
      setSelectedEventTypes([]);
      fetchAssignments();
    } catch (error) {
      console.error('Error in handleAssignTracker:', error);
      toast.error('Failed to assign tracker');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('match_tracker_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        console.error('Error removing assignment:', error);
        toast.error('Failed to remove assignment');
        return;
      }

      toast.success('Assignment removed successfully');
      fetchAssignments();
    } catch (error) {
      console.error('Error in handleRemoveAssignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  const toggleEventType = (eventType: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(eventType) 
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  if (!matchId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Event Type Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Please select a match to manage event assignments</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Event Type Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assignments">Current Assignments</TabsTrigger>
            <TabsTrigger value="new">New Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No tracker assignments found
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{assignment.tracker_name}</h4>
                        <p className="text-sm text-gray-600">{assignment.tracker_email}</p>
                        {assignment.player_info && (
                          <p className="text-sm text-blue-600">
                            Player #{assignment.player_info.id} ({assignment.player_info.team} team)
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {assignment.assigned_event_types?.map((eventType) => (
                        <Badge key={eventType} variant="secondary">
                          {eventType.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Assigned: {new Date(assignment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="tracker-select">Select Tracker</Label>
                <Select value={selectedTracker} onValueChange={setSelectedTracker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tracker" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTrackers.map((tracker) => (
                      <SelectItem key={tracker.id} value={tracker.id}>
                        {tracker.full_name} ({tracker.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Event Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {eventTypes.map((eventType) => (
                    <div
                      key={eventType}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedEventTypes.includes(eventType)
                          ? 'bg-blue-100 border-blue-300'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleEventType(eventType)}
                    >
                      <span className="text-sm">{eventType.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleAssignTracker}
                disabled={!selectedTracker || selectedEventTypes.length === 0}
                className="w-full"
              >
                Assign Tracker
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EventAssignments;
