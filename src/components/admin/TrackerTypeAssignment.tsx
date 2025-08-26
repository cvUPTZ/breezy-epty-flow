import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Zap, Target, Users, Trash2, Plus } from 'lucide-react';
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
  const { toast } = useToast();

  const trackerTypeConfig = {
    specialized: {
      icon: Users,
      label: 'Specialized Tracker',
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      description: 'Tracks specific events across all players'
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

        console.log('🔍 Processing assignment:', {
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

      console.log('📊 Total assignments fetched:', processedAssignments.length);
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

  const getLinePlayers = (trackerType: TrackerType) => {
    if (trackerType === 'specialized') return [];

    const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
    return allPlayers.filter(player => {
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

  const handleCreateAssignment = async () => {
    if (!selectedTracker || selectedEventTypes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a tracker and at least one event type",
        variant: "destructive"
      });
      return;
    }

    try {
      const linePlayers = getLinePlayers(selectedTrackerType);
      
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
    console.log('🖱️ Delete button clicked for assignment:', assignmentId);
    
    if (!assignmentId) {
      console.error('❌ Assignment ID is undefined');
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

          {/* Event Types Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Event Types</label>
            <div className="space-y-3">
              {EVENT_TYPE_CATEGORIES.map((category) => (
                <div key={category.key} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge style={{ backgroundColor: category.color }} className="text-white">
                      {category.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {category.events.map((event) => (
                      <div key={event.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={event.key}
                          checked={selectedEventTypes.includes(event.key)}
                          onCheckedChange={() => handleEventTypeToggle(event.key)}
                        />
                        <label htmlFor={event.key} className="text-sm">
                          {event.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCreateAssignment}
            disabled={!selectedTracker || selectedEventTypes.length === 0}
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
                          console.log('🖱️ Delete button clicked for assignment:', assignment.id);
                          handleDeleteAssignment(assignment.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {assignment.tracker_type !== 'specialized' && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Assigned Players:</p>
                        <div className="flex flex-wrap gap-1">
                          {assignment.line_players?.map((player: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{player.jersey_number} {player.player_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

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