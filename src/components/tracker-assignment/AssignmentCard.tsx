
// components/tracker-assignment/AssignmentCard.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Loader2 } from 'lucide-react';
import type { Assignment, Player } from '@/hooks/useTrackerAssignments';

interface AssignmentCardProps {
  assignment: Assignment;
  allPlayers: Player[];
  onDelete: (assignmentId: string) => void;
  isDeleting: boolean;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  allPlayers,
  onDelete,
  isDeleting
}) => {
  const assignedPlayers = assignment.player_ids
    .map(playerId => allPlayers.find(player => player.id === playerId))
    .filter((player): player is Player => Boolean(player));

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-medium text-lg">{assignment.tracker_name}</span>
          <div className="text-sm text-gray-600">{assignment.tracker_email}</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(assignment.id)}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700"
          aria-label={`Delete assignment for ${assignment.tracker_name}`}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Assigned Players ({assignedPlayers.length})
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
          {assignedPlayers.map(player => (
            <div
              key={player.id}
              className="p-2 bg-white border border-gray-200 rounded text-center"
            >
              <div className="text-xs font-semibold text-blue-600">
                #{player.jersey_number}
              </div>
              <div className="text-xs text-gray-800 truncate font-medium">
                {player.player_name}
              </div>
              {player.position && (
                <div className="text-xs text-gray-500">{player.position}</div>
              )}
              <div className="text-xs text-gray-400">
                {player.team === 'home' ? 'Home' : 'Away'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Event Types ({assignment.assigned_event_types.length})
        </label>
        <div className="flex flex-wrap gap-1">
          {assignment.assigned_event_types.slice(0, 8).map(eventType => (
            <Badge key={eventType} variant="outline" className="text-xs">
              {eventType}
            </Badge>
          ))}
          {assignment.assigned_event_types.length > 8 && (
            <Badge variant="outline" className="text-xs bg-gray-100">
              +{assignment.assigned_event_types.length - 8} more
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
