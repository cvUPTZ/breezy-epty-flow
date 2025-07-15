
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

const TrackerAssignment: React.FC<TrackerAssignmentProps> = ({
  matchId,
  homeTeamPlayers,
  awayTeamPlayers
}) => {
  const [assignments, setAssignments] = useState<any[]>([]);
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
      setAssignments(data || []);
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
              <h3 className="font-medium text-blue-900 mb-2">Current Assignments</h3>
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
