import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';
import TrackerAssignmentTabs from '@/components/admin/TrackerAssignmentTabs';

interface TrackerAssignmentProps {
  matchId: string;
  homeTeamPlayers: any[];
  awayTeamPlayers: any[];
}

interface Assignment {
  id: string;
  tracker_user_id: string;
  assigned_player_id: number | null;
  assigned_event_types: string[] | null;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

const TrackerAssignment: React.FC<TrackerAssignmentProps> = ({
  matchId,
  homeTeamPlayers,
  awayTeamPlayers
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, [matchId]);

  const fetchAssignments = async () => {
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

      // Deduplicate assignments by grouping by tracker and merging event types
      const deduplicatedAssignments = deduplicateAssignments(data || []);
      setAssignments(deduplicatedAssignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tracker assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deduplicateAssignments = (assignments: Assignment[]): Assignment[] => {
    const grouped = assignments.reduce((acc, assignment) => {
      const key = `${assignment.tracker_user_id}-${assignment.assigned_player_id || 'null'}`;
      
      if (!acc[key]) {
        acc[key] = { ...assignment };
      } else {
        // Merge event types from duplicate assignments
        const existingEvents = acc[key].assigned_event_types || [];
        const newEvents = assignment.assigned_event_types || [];
        acc[key].assigned_event_types = [...new Set([...existingEvents, ...newEvents])];
      }
      
      return acc;
    }, {} as Record<string, Assignment>);

    return Object.values(grouped);
  };

  const cleanupDuplicates = async () => {
    try {
      setLoading(true);
      
      // Get all assignments for this match
      const { data: allAssignments, error: fetchError } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', matchId);

      if (fetchError) throw fetchError;

      // Group duplicates
      const grouped = allAssignments?.reduce((acc, assignment) => {
        const key = `${assignment.tracker_user_id}-${assignment.assigned_player_id || 'null'}-${JSON.stringify(assignment.assigned_event_types)}`;
        
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(assignment);
        
        return acc;
      }, {} as Record<string, Assignment[]>) || {};

      // Delete duplicates (keep the first one)
      const duplicateIds: string[] = [];
      Object.values(grouped).forEach(duplicateGroup => {
        if (duplicateGroup.length > 1) {
          // Keep first, mark others for deletion
          duplicateIds.push(...duplicateGroup.slice(1).map(d => d.id));
        }
      });

      if (duplicateIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('match_tracker_assignments')
          .delete()
          .in('id', duplicateIds);

        if (deleteError) throw deleteError;

        toast({
          title: "Success",
          description: `Removed ${duplicateIds.length} duplicate assignments`,
          variant: "default"
        });

        // Refresh assignments
        await fetchAssignments();
      } else {
        toast({
          title: "Info",
          description: "No duplicates found",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Error cleaning up duplicates:', error);
      toast({
        title: "Error",
        description: "Failed to cleanup duplicates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tracker Assignments
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage how trackers are assigned to this match
          </p>
        </CardHeader>
        <CardContent>
          {/* Current Assignments Summary */}
          {assignments.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-blue-900">Current Assignments</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cleanupDuplicates}
                  disabled={loading}
                >
                  Clean Duplicates
                </Button>
              </div>
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">
                      {assignment.profiles?.full_name || assignment.profiles?.email || 'Unknown Tracker'}
                    </span>
                    <div className="flex gap-1">
                      {assignment.assigned_event_types?.map((eventType: string) => (
                        <Badge key={eventType} variant="outline" className="text-xs">
                          {eventType}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Assignment Interface */}
          <TrackerAssignmentTabs
            matchId={matchId}
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackerAssignment;