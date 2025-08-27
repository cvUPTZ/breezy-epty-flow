
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target } from 'lucide-react';
import { TrackerUser, EVENT_TYPES, Assignment } from '../types/TrackerAssignmentTypes';

interface SpecializedAssignmentFormProps {
  trackerUsers: TrackerUser[];
  homeTeamPlayers: any[];
  awayTeamPlayers: any[];
  assignments: Assignment[];
  loading: boolean;
  onCreateAssignment: (trackerId: string, playerId: number, teamId: 'home' | 'away', eventTypes: string[]) => Promise<boolean>;
}

const SpecializedAssignmentForm: React.FC<SpecializedAssignmentFormProps> = ({
  trackerUsers,
  homeTeamPlayers,
  awayTeamPlayers,
  assignments,
  loading,
  onCreateAssignment
}) => {
  const [selectedTracker, setSelectedTracker] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);

  const getTeamPlayers = () => {
    return selectedTeam === 'home' ? homeTeamPlayers : awayTeamPlayers;
  };

  const toggleEventType = (eventType: string) => {
    setSelectedEventTypes(prev =>
      prev.includes(eventType)
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  const getAssignedTrackerForEvent = (playerId: number, teamId: 'home' | 'away', eventType: string): string | null => {
    const assignment = assignments.find(a =>
      a.player_id === playerId &&
      a.player_team_id === teamId &&
      a.assigned_event_types.includes(eventType)
    );
    return assignment ? assignment.tracker_name || 'Assigned' : null;
  };

  const handleCreateAssignment = async () => {
    if (!selectedTracker || !selectedPlayer || selectedEventTypes.length === 0) {
      return;
    }

    const playerId = parseInt(selectedPlayer);

    const success = await onCreateAssignment(selectedTracker, playerId, selectedTeam, selectedEventTypes);
    if (success) {
      setSelectedTracker('');
      setSelectedPlayer('');
      setSelectedEventTypes([]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Specialized Tracker Assignment
        </CardTitle>
        <p className="text-sm text-gray-600">
          Assign one tracker to track one specific event type for one player
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tracker</label>
            <Select value={selectedTracker} onValueChange={setSelectedTracker}>
              <SelectTrigger>
                <SelectValue placeholder="Select tracker" />
              </SelectTrigger>
              <SelectContent>
                {trackerUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Team</label>
            <Select value={selectedTeam} onValueChange={(value: 'home' | 'away') => setSelectedTeam(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home Team</SelectItem>
                <SelectItem value="away">Away Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Player</label>
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {getTeamPlayers().map(player => (
                  <SelectItem key={player.id} value={player.id.toString()}>
                    #{player.jersey_number} {player.player_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Event Types</label>
            <div className="grid grid-cols-3 gap-2 border rounded-md p-2 min-h-[100px]">
              {EVENT_TYPES.map(eventType => {
                const assignedTracker = selectedPlayer ? getAssignedTrackerForEvent(parseInt(selectedPlayer), selectedTeam, eventType) : null;
                const isSelected = selectedEventTypes.includes(eventType);
                const isDisabled = assignedTracker !== null;

                return (
                  <div
                    key={eventType}
                    onClick={() => !isDisabled && toggleEventType(eventType)}
                    className={`p-2 border rounded text-center text-xs transition-colors ${
                      isDisabled
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-100 border-blue-300 cursor-pointer'
                        : 'hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    {eventType.replace('_', ' ')}
                    {assignedTracker && <span className="block text-red-500 truncate">({assignedTracker})</span>}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={handleCreateAssignment}
              disabled={loading || !selectedTracker || !selectedPlayer || selectedEventTypes.length === 0}
              className="w-full"
            >
              Assign
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpecializedAssignmentForm;
