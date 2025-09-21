// components/tracker-assignment/PlayerGrid.tsx
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Player } from '@/hooks/useTrackerAssignments';

interface PlayerGridProps {
  players: Player[];
  selectedPlayers: number[];
  onPlayerToggle: (playerId: number) => void;
  selectionMode?: 'single' | 'multiple';
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({
  players,
  selectedPlayers,
  onPlayerToggle,
  selectionMode = 'multiple'
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
      {players.map(player => (
        <div
          key={player.id}
          className={`p-2 border rounded cursor-pointer transition-colors ${
            selectedPlayers.includes(player.id) 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => onPlayerToggle(player.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPlayerToggle(player.id);
            }
          }}
          aria-label={`Toggle player ${player.player_name}`}
          aria-pressed={selectedPlayers.includes(player.id)}
        >
          {selectionMode === 'multiple' && (
            <Checkbox
              checked={selectedPlayers.includes(player.id)}
              onChange={() => {}} // Handled by parent click
              className="mb-1"
            />
          )}
          <div className="text-xs font-medium">#{player.jersey_number}</div>
          <div className="text-xs text-gray-600 truncate">{player.player_name}</div>
          {player.position && (
            <div className="text-xs text-blue-600 font-semibold">{player.position}</div>
          )}
          <div className="text-xs text-gray-400">
            {player.team === 'home' ? 'Home' : 'Away'}
          </div>
        </div>
      ))}
    </div>
  );
};
