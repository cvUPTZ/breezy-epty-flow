
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Settings, Trash2, ChevronRight } from 'lucide-react';
import { TrackerAssignment, Player } from '@/types/trackerAssignment';
import { EVENT_TYPE_CATEGORIES } from '@/constants/eventTypes';

/**
 * @interface TrackerAssignmentSectionProps
 * @description Props for the TrackerAssignmentSection component.
 * @property {Player[]} homeTeamPlayers - An array of players for the home team.
 * @property {Player[]} awayTeamPlayers - An array of players for the away team.
 * @property {any[]} trackerUsers - An array of available tracker users.
 * @property {TrackerAssignment[]} assignments - The current list of tracker assignments.
 * @property {(assignments: TrackerAssignment[]) => void} onAssignmentsChange - Callback to update the list of assignments.
 */
interface TrackerAssignmentSectionProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  trackerUsers: any[];
  assignments: TrackerAssignment[];
  onAssignmentsChange: (assignments: TrackerAssignment[]) => void;
}

/**
 * @function getPlayerIdentifier
 * @description A helper function to generate a consistent and unique numeric identifier for a player.
 * It prefers an existing numeric ID, but falls back to creating a unique ID based on the team and player index
 * to prevent collisions and ensure stability within the component's state.
 * @param {any} player - The player object.
 * @param {'home' | 'away'} team - The team the player belongs to.
 * @param {number} index - The index of the player in their team's array.
 * @returns {number} A unique numeric identifier for the player.
 */
const getPlayerIdentifier = (player: any, team: 'home' | 'away', index: number): number => {
  if (typeof player.id === 'number' && player.id > 0) {
    return player.id;
  }
  // Create a unique numeric ID using team prefix and index
  // Home team: 1000-1999, Away team: 2000-2999
  const baseId = team === 'home' ? 1000 : 2000;
  return baseId + index;
};

/**
 * @component TrackerAssignmentSection
 * @description A form section for creating and managing tracker assignments for a match.
 * It provides a UI to select a tracker, assign them to multiple players from both teams,
 * and select specific event types for them to monitor. It also displays a list of all current assignments.
 * @param {TrackerAssignmentSectionProps} props The props for the component.
 * @returns {JSX.Element} The rendered TrackerAssignmentSection component.
 */
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  const handleCategoryToggle = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
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

  const renderEventTypeCategories = () => (
    <div className="space-y-3">
      {EVENT_TYPE_CATEGORIES.map((category) => (
        <div key={category.key} className="border rounded-lg">
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
            onClick={() => handleCategoryToggle(category.key)}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={category.events.every(event => selectedEventTypes.includes(event.key))}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedEventTypes(prev => [
                      ...prev,
                      ...category.events.map(e => e.key).filter(key => !prev.includes(key))
                    ]);
                  } else {
                    setSelectedEventTypes(prev => 
                      prev.filter(type => !category.events.some(e => e.key === type))
                    );
                  }
                }}
              />
              <Badge 
                style={{ backgroundColor: category.color }} 
                className="text-white"
              >
                {category.label}
              </Badge>
            </div>
            <ChevronRight 
              className={`h-4 w-4 transition-transform ${
                expandedCategories.has(category.key) ? 'rotate-90' : ''
              }`}
            />
          </div>
          
          {expandedCategories.has(category.key) && (
            <div className="px-3 pb-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {category.events.map((event) => (
                  <div
                    key={event.key}
                    className={`p-2 border rounded cursor-pointer text-center text-xs transition-colors ${
                      selectedEventTypes.includes(event.key)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleEventTypeToggle(event.key)}
                  >
                    {event.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
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

          {/* Event Type Selection by Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Event Types</label>
            {renderEventTypeCategories()}
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
                    {assignment.assigned_event_types.map((eventType) => {
                      const category = EVENT_TYPE_CATEGORIES.find(cat => 
                        cat.events.some(e => e.key === eventType)
                      );
                      return (
                        <Badge 
                          key={eventType} 
                          className="text-xs text-white"
                          style={{ backgroundColor: category?.color || '#6B7280' }}
                        >
                          {eventType}
                        </Badge>
                      );
                    })}
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
