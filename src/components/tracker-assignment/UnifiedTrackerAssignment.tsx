// components/tracker-assignment/UnifiedTrackerAssignment.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Custom hooks
import { useTrackerAssignments, type Player, type TrackerUser, type Assignment } from '@/hooks/useTrackerAssignments';
import { usePlayerSelection, type TrackerType } from '@/hooks/usePlayerSelection';

// Sub-components
import { PlayerGrid } from './PlayerGrid';
import { EventTypeSelector } from './EventTypeSelector';
import { TrackerTypeSelector } from './TrackerTypeSelector';
import { AssignmentCard } from './AssignmentCard';

// Types
import { type EventType } from '@/types/eventTypes';

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

const UnifiedTrackerAssignment: React.FC<UnifiedTrackerAssignmentProps> = ({
  matchId,
  videoUrl = '',
  homeTeamPlayers = [],
  awayTeamPlayers = [],
  trackerUsers: initialTrackerUsers = [],
  assignments: initialAssignments = [],
  onAssignmentsChange,
  showTypeAssignment = true
}) => {
  const { toast } = useToast();
  
  // State for form data
  const [selectedTracker, setSelectedTracker] = useState<string>('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
  const [assignmentVideoUrl, setAssignmentVideoUrl] = useState(videoUrl);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState<string | null>(null);

  // Custom hooks
  const {
    trackers,
    assignments,
    loading,
    error,
    createAssignment,
    deleteAssignment
  } = useTrackerAssignments({
    matchId,
    homeTeamPlayers,
    onAssignmentsChange
  });

  const {
    selectedPlayers,
    selectedTeam,
    selectedTrackerType,
    setSelectedTeam,
    setSelectedTrackerType,
    togglePlayer,
    clearSelection,
    getLinePlayers,
    getCurrentTeamPlayers
  } = usePlayerSelection({
    homeTeamPlayers,
    awayTeamPlayers
  });

  // Memoized values
  const allPlayers = useMemo(() => [...homeTeamPlayers, ...awayTeamPlayers], [homeTeamPlayers, awayTeamPlayers]);
  const displayTrackers = trackers.length > 0 ? trackers : initialTrackerUsers;
  const displayAssignments = assignments.length > 0 ? assignments : initialAssignments;

  // Event handlers
  const handleEventTypeToggle = (eventType: EventType) => {
    setSelectedEventTypes(prev =>
      prev.includes(eventType)
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  const resetForm = () => {
    setSelectedTracker('');
    setSelectedEventTypes([]);
    clearSelection();
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

    const trackerUser = displayTrackers.find(t => t.id === selectedTracker);
    if (!trackerUser) {
      toast({
        title: "Error",
        description: "Selected tracker not found",
        variant: "destructive"
      });
      return;
    }

    setCreatingAssignment(true);

    try {
      await createAssignment({
        tracker_user_id: selectedTracker,
        tracker_name: trackerUser.full_name || trackerUser.email || 'Unknown',
        tracker_email: trackerUser.email || 'Unknown',
        player_ids: playersToAssign,
        assigned_event_types: selectedEventTypes,
        videoUrl: assignmentVideoUrl.trim() || undefined
      });

      resetForm();
    } catch (error) {
      console.error('Failed to create assignment:', error);
    } finally {
      setCreatingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    setDeletingAssignment(assignmentId);
    try {
      await deleteAssignment(assignmentId);
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    } finally {
      setDeletingAssignment(null);
    }
  };

  // Loading state
  if (loading && displayTrackers.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading assignments...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Error</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline" 
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Assignments */}
      {displayAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Assignments ({displayAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayAssignments.map(assignment => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  allPlayers={allPlayers}
                  onDelete={handleDeleteAssignment}
                  isDeleting={deletingAssignment === assignment.id}
                />
              ))}
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
          <Tabs defaultValue="by-player" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="by-player">By Player</TabsTrigger>
              <TabsTrigger value="by-line">By Line</TabsTrigger>
            </TabsList>

            {/* Common Form Fields */}
            <div className="space-y-4 mt-4">
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
                <div className="text-xs text-gray-500">
                  Leave empty for live match tracking
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Select Tracker</label>
                <Select value={selectedTracker} onValueChange={setSelectedTracker}>
                  <SelectTrigger aria-label="Select tracker">
                    <SelectValue placeholder="Choose a tracker" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayTrackers.map(tracker => (
                      <SelectItem key={tracker.id} value={tracker.id}>
                        {tracker.full_name || tracker.email || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="by-player" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
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

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Players ({selectedPlayers.length} selected)
                </label>
                <PlayerGrid
                  players={getCurrentTeamPlayers()}
                  selectedPlayers={selectedPlayers}
                  onPlayerToggle={togglePlayer}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Event Types ({selectedEventTypes.length} selected)
                </label>
                <EventTypeSelector
                  selectedEventTypes={selectedEventTypes}
                  onEventTypeToggle={handleEventTypeToggle}
                />
              </div>

              <Button
                onClick={handleCreateAssignment}
                disabled={creatingAssignment || !selectedTracker || selectedEventTypes.length === 0 || selectedPlayers.length === 0}
                className="w-full"
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
              <div>
                <label className="text-sm font-medium mb-2 block">Select Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Select Tracker Type</label>
                <TrackerTypeSelector
                  selectedType={selectedTrackerType}
                  onTypeSelect={setSelectedTrackerType}
                  getLinePlayers={getLinePlayers}
                  selectedTeam={selectedTeam}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Event Types ({selectedEventTypes.length} selected)
                </label>
                <EventTypeSelector
                  selectedEventTypes={selectedEventTypes}
                  onEventTypeToggle={handleEventTypeToggle}
                />
              </div>

              <Button
                onClick={handleCreateAssignment}
                disabled={creatingAssignment || !selectedTracker || selectedEventTypes.length === 0}
                className="w-full"
              >
                {creatingAssignment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Assignment...
                  </>
                ) : (
                  `Create ${selectedTrackerType.charAt(0).toUpperCase() + selectedTrackerType.slice(1)} Assignment`
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
