
// components/tracker-assignment/TrackerTypeSelector.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Target, Users } from 'lucide-react';
import type { TrackerType } from '@/hooks/usePlayerSelection';
import type { Player } from '@/hooks/useTrackerAssignments';

interface TrackerTypeSelectorProps {
  selectedType: TrackerType;
  onTypeSelect: (type: TrackerType) => void;
  getLinePlayers: (type: TrackerType, team?: 'home' | 'away') => Player[];
  selectedTeam: 'home' | 'away';
}

const trackerTypeConfig = {
  specialized: {
    icon: Users,
    label: 'Specialized Tracker',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    description: 'Tracks specific events across selected players'
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

export const TrackerTypeSelector: React.FC<TrackerTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  getLinePlayers,
  selectedTeam
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {(Object.keys(trackerTypeConfig) as TrackerType[]).map(type => {
        const config = trackerTypeConfig[type];
        const Icon = config.icon;
        const linePlayers = type === 'specialized' ? [] : getLinePlayers(type, selectedTeam);

        return (
          <div
            key={type}
            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
              selectedType === type
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => onTypeSelect(type)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTypeSelect(type);
              }
            }}
            aria-label={`Select ${config.label}`}
            aria-pressed={selectedType === type}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-5 w-5" />
              <span className="font-medium">{config.label}</span>
              {type !== 'specialized' && (
                <Badge variant="outline" className="text-xs">
                  {linePlayers.length} players
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{config.description}</p>

            {type !== 'specialized' && linePlayers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {linePlayers.slice(0, 3).map(player => (
                  <span key={player.id} className="text-xs bg-white px-1 py-0.5 rounded border">
                    #{player.jersey_number}
                  </span>
                ))}
                {linePlayers.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{linePlayers.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
