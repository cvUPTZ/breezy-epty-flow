import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Settings, Trash2 } from 'lucide-react';
import { TrackerAssignment, Player } from '@/types/trackerAssignment';

interface TrackerAssignmentSectionProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  trackerUsers: any[];
  assignments: TrackerAssignment[];
  onAssignmentsChange: (assignments: TrackerAssignment[]) => void;
}

const EVENT_TYPES = [
  'pass', 'shot', 'goal', 'foul', 'card', 'substitution',
  'corner', 'throw_in', 'offside', 'tackle', 'interception',
  'cross', 'header', 'save', 'clearance'
];

// Helper function to get a unique identifier for players
const getPlayerIdentifier = (player: any, team: 'home' | 'away', index: number): number => {
  if (typeof player.id === 'number' && player.id > 0) {
    return player.id;
  }
  // Create a unique numeric ID using team prefix and index
  // Home team: 1000-1999, Away team: 2000-2999
  const baseId = team === 'home' ? 1000 : 2000;
  return baseId + index;
};

const TrackerAssignmentSection: React.FC<TrackerAssignmentSectionProps> = ({
  homeTeamPlayers,
  awayTeamPlayers,
  trackerUsers,
  assignments,
  onAssignmentsChange
}) => {
  const [selectedTracker, setSelectedTracker] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);

  // Create processed player lists with consistent IDs
  const processedHomePlayers = homeTeamPlayers.map((player, index) => ({
    ...player,
    id: getPlayerIdentifier(player, 'home', index),
    team: 'home' as const
  }));

  const processedAwayPlayers = awayTeamPlayers.map((player, index) => ({
    ...player,
    id: getPlayerIdentifier(player, 'away', index),
    team: 'away' as const
  }));

  const allPlayers = [...processedHomePlayers, ...processedAwayPlayers];

  const handlePlayerToggle = (playerId: number) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleEventTypeToggle = (eventType: string) => {
    setSelectedEventTypes(prev =>
      prev.includes(eventType)
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  const handleCreateAssignment = () => {
    if (!selectedTracker || selectedPlayers.length === 0 || selectedEventTypes.length === 0) {
      return;
    }

    const trackerUser = trackerUsers.find(user => user.id === selectedTracker);
    const newAssignment: TrackerAssignment = {
      id: crypto.randomUUID(),
      tracker_user_id: selectedTracker,
      player_ids: selectedPlayers,
      assigned_event_types: selectedEventTypes,
      tracker_name: trackerUser?.full_name || trackerUser?.email,
      tracker_email: trackerUser?.email
    };

    onAssignmentsChange([...assignments, newAssignment]);
    
    // Reset form
    setSelectedTracker('');
    setSelectedPlayers([]);
    setSelectedEventTypes([]);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    onAssignmentsChange(assignments.filter(assignment => assignment.id !== assignmentId));
  };

  const renderPlayerGrid = (players: Player[], team: 'home' | 'away') => (
    <div className="space-y-2">
      <h4 className="font-medium text-sm text-gray-700 capitalize">{team} Team</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {players.map((player) => (
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
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Tracker Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Assignment */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create New Assignment
          </h3>
          
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

          {/* Player Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Players</label>
            <div className="space-y-4">
              {renderPlayerGrid(processedHomePlayers, 'home')}
              {renderPlayerGrid(processedAwayPlayers, 'away')}
            </div>
          </div>

          {/* Event Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Event Types</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {EVENT_TYPES.map((eventType) => (
                <div
                  key={eventType}
                  className={`p-2 border rounded cursor-pointer text-center text-xs transition-colors ${
                    selectedEventTypes.includes(eventType)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleEventTypeToggle(eventType)}
                >
                  {eventType}
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleCreateAssignment}
            disabled={!selectedTracker || selectedPlayers.length === 0 || selectedEventTypes.length === 0}
            className="w-full"
          >
            Create Assignment
          </Button>
        </div>

        {/* Existing Assignments */}
        <div className="space-y-3">
          <h3 className="font-medium">Current Assignments ({assignments.length})</h3>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No assignments created yet</p>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{assignment.tracker_name}</h4>
                    <p className="text-sm text-gray-600">{assignment.tracker_email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => assignment.id && handleDeleteAssignment(assignment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Assigned Players:</p>
                  <div className="flex flex-wrap gap-1">
                    {assignment.player_ids.map((playerId) => {
                      const player = allPlayers.find(p => p.id === playerId);
                      return player ? (
                        <Badge key={playerId} variant="outline" className="text-xs">
                          #{player.jersey_number} {player.player_name} ({player.team})
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Event Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {assignment.assigned_event_types.map((eventType) => (
                      <Badge key={eventType} className="text-xs">
                        {eventType}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackerAssignmentSection;
