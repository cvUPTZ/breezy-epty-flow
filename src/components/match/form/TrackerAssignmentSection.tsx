
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface TrackerUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user' | 'tracker' | 'teacher';
}

interface TrackerAssignment {
  tracker_user_id: string;
  assigned_event_types: string[];
  player_ids: number[];
}

interface Player {
  id: number;
  name: string;
  number: number | null;
  position: string;
  isSubstitute: boolean;
}

interface TrackerAssignmentSectionProps {
  trackers: TrackerUser[];
  trackerAssignments: TrackerAssignment[];
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  onTrackerAssignmentsChange: (assignments: TrackerAssignment[]) => void;
}

const EVENT_TYPE_CATEGORIES = [
  { key: 'ball_actions', label: 'Ball Actions', color: '#3b82f6', events: [ { key: 'pass', label: 'Pass' }, { key: 'shot', label: 'Shot' }, { key: 'cross', label: 'Cross' }, { key: 'dribble', label: 'Dribble' }, { key: 'tackle', label: 'Tackle' }, { key: 'interception', label: 'Interception' }, { key: 'clearance', label: 'Clearance' }, { key: 'save', label: 'Save' } ] },
  { key: 'set_pieces', label: 'Set Pieces', color: '#10b981', events: [ { key: 'corner', label: 'Corner Kick' }, { key: 'freeKick', label: 'Free Kick' }, { key: 'throwIn', label: 'Throw In' }, { key: 'goalKick', label: 'Goal Kick' }, { key: 'penalty', label: 'Penalty' } ] },
  { key: 'fouls_cards', label: 'Fouls & Cards', color: '#ef4444', events: [ { key: 'foul', label: 'Foul' }, { key: 'yellowCard', label: 'Yellow Card' }, { key: 'redCard', label: 'Red Card' }, { key: 'offside', label: 'Offside' } ] },
  { key: 'goals_assists', label: 'Goals & Assists', color: '#f59e0b', events: [ { key: 'goal', label: 'Goal' }, { key: 'assist', label: 'Assist' }, { key: 'ownGoal', label: 'Own Goal' } ] },
  { key: 'possession', label: 'Possession', color: '#8b5cf6', events: [ { key: 'ballLost', label: 'Ball Lost' }, { key: 'ballRecovered', label: 'Ball Recovered' }, { key: 'aerialDuel', label: 'Aerial Duel' }, { key: 'groundDuel', label: 'Ground Duel' } ] },
  { key: 'match_events', label: 'Match Events', color: '#6b7280', events: [ { key: 'substitution', label: 'Substitution' }, { key: 'injury', label: 'Injury' }, { key: 'timeout', label: 'Timeout' }, { key: 'halfTime', label: 'Half Time' } ] }
];

const TrackerAssignmentSection: React.FC<TrackerAssignmentSectionProps> = ({
  trackers,
  trackerAssignments,
  homeTeamPlayers,
  awayTeamPlayers,
  onTrackerAssignmentsChange,
}) => {
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [selectedTeamForAssignment, setSelectedTeamForAssignment] = useState<{[key: number]: 'home' | 'away' | 'both'}>({});

  const addTrackerAssignment = () => {
    onTrackerAssignmentsChange([...trackerAssignments, { tracker_user_id: '', assigned_event_types: [], player_ids: [] }]);
  };

  const removeTrackerAssignment = (index: number) => {
    onTrackerAssignmentsChange(trackerAssignments.filter((_, i) => i !== index));
  };

  const updateTrackerAssignment = (index: number, field: keyof TrackerAssignment, value: any) => {
    const updated = [...trackerAssignments];
    updated[index] = { ...updated[index], [field]: value };
    onTrackerAssignmentsChange(updated);
  };

  const toggleCategory = (categoryKey: string) => {
    setOpenCategories(prev => prev.includes(categoryKey) ? prev.filter(k => k !== categoryKey) : [...prev, categoryKey]);
  };

  const handleEventTypeChange = (key: string, checked: boolean, index: number) => {
    const assignment = trackerAssignments[index];
    updateTrackerAssignment(index, 'assigned_event_types', checked ? [...assignment.assigned_event_types, key] : assignment.assigned_event_types.filter(k => k !== key));
  };

  const handleCategoryToggle = (category: any, checked: boolean, index: number) => {
    const keys = category.events.map((e: any) => e.key);
    const assignment = trackerAssignments[index];
    updateTrackerAssignment(index, 'assigned_event_types', checked ? [...new Set([...assignment.assigned_event_types, ...keys])] : assignment.assigned_event_types.filter((k: string) => !keys.includes(k)));
  };

  const getCategoryState = (category: any, index: number) => {
    const assignment = trackerAssignments[index];
    if (!assignment) return 'none';
    const keys = category.events.map((e: any) => e.key);
    const count = keys.filter((k: string) => assignment.assigned_event_types.includes(k)).length;
    if (count === 0) return 'none';
    if (count === keys.length) return 'all';
    return 'some';
  };

  const handleTeamFilterChange = (index: number, team: 'home' | 'away' | 'both') => {
    setSelectedTeamForAssignment(prev => ({ ...prev, [index]: team }));
  };

  const getFilteredPlayers = (index: number, team: 'home' | 'away') => {
    const filter = selectedTeamForAssignment[index];
    if (filter && filter !== 'both' && filter !== team) return [];
    return team === 'home' ? homeTeamPlayers : awayTeamPlayers;
  };

  const handlePlayerToggle = (playerId: number, checked: boolean, assignmentIndex: number) => {
    const assignment = trackerAssignments[assignmentIndex];
    const newPlayerIds = checked
      ? [...assignment.player_ids, playerId]
      : assignment.player_ids.filter(id => id !== playerId);
    updateTrackerAssignment(assignmentIndex, 'player_ids', newPlayerIds);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Tracker Assignments
          <Button type="button" onClick={addTrackerAssignment} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {trackerAssignments.map((assignment, index) => (
          <Card key={index} className="border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Assignment #{index + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTrackerAssignment(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tracker</Label>
                <Select
                  value={assignment.tracker_user_id}
                  onValueChange={(value) => updateTrackerAssignment(index, 'tracker_user_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tracker" />
                  </SelectTrigger>
                  <SelectContent>
                    {trackers.map((tracker) => (
                      <SelectItem key={tracker.id} value={tracker.id}>
                        {tracker.full_name} ({tracker.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Type Selection */}
              <div>
                <Label className="text-base font-medium">Event Types</Label>
                <div className="space-y-2 mt-2">
                  {EVENT_TYPE_CATEGORIES.map((category) => {
                    const categoryState = getCategoryState(category, index);
                    return (
                      <Collapsible
                        key={category.key}
                        open={openCategories.includes(category.key)}
                        onOpenChange={() => toggleCategory(category.key)}
                      >
                        <div className="flex items-center space-x-2 p-2 rounded-md border">
                          <Checkbox
                            checked={categoryState === 'all'}
                            onCheckedChange={(checked) => handleCategoryToggle(category, !!checked, index)}
                            className={categoryState === 'some' ? 'data-[state=checked]:bg-blue-300' : ''}
                          />
                          <Badge variant="outline" style={{ backgroundColor: category.color, color: 'white', borderColor: category.color }}>
                            {category.label}
                          </Badge>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="ml-auto p-0 h-auto">
                              {openCategories.includes(category.key) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="ml-6 mt-2 space-y-1">
                          {category.events.map((event) => (
                            <div key={event.key} className="flex items-center space-x-2">
                              <Checkbox
                                checked={assignment.assigned_event_types.includes(event.key)}
                                onCheckedChange={(checked) => handleEventTypeChange(event.key, !!checked, index)}
                              />
                              <span className="text-sm">{event.label}</span>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>

              {/* Player Assignment */}
              <div>
                <Label>Assigned Players</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={selectedTeamForAssignment[index] === 'home' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTeamFilterChange(index, 'home')}
                    >
                      Home
                    </Button>
                    <Button
                      type="button"
                      variant={selectedTeamForAssignment[index] === 'away' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTeamFilterChange(index, 'away')}
                    >
                      Away
                    </Button>
                    <Button
                      type="button"
                      variant={selectedTeamForAssignment[index] === 'both' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTeamFilterChange(index, 'both')}
                    >
                      Both
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['home', 'away'] as const).map((team) => {
                      const filteredPlayers = getFilteredPlayers(index, team);
                      if (filteredPlayers.length === 0) return null;
                      return (
                        <div key={team}>
                          <h4 className="font-medium text-sm mb-2 capitalize">{team} Team</h4>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {filteredPlayers.map((player) => (
                              <div key={player.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`player-${player.id}-assignment-${index}`}
                                  checked={assignment.player_ids.includes(player.id)}
                                  onCheckedChange={(checked) => handlePlayerToggle(player.id, !!checked, index)}
                                />
                                <label 
                                  htmlFor={`player-${player.id}-assignment-${index}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {player.number ? `#${player.number}` : ''} {player.name || `Player ${player.id}`}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {trackerAssignments.length === 0 && (
          <div className="text-center text-muted-foreground py-6">
            No tracker assignments yet. Click "Add Assignment" to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackerAssignmentSection;
