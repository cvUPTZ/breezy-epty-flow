// hooks/usePlayerSelection.ts
import { useState, useCallback, useMemo } from 'react';

export type TrackerType = 'specialized' | 'defence' | 'midfield' | 'attack';

interface Player {
  id: number;
  jersey_number: number;
  player_name: string;
  team: 'home' | 'away';
  position?: string;
}

interface UsePlayerSelectionProps {
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
}

interface UsePlayerSelectionReturn {
  selectedPlayers: number[];
  selectedTeam: 'home' | 'away';
  selectedTrackerType: TrackerType;
  setSelectedPlayers: (players: number[]) => void;
  setSelectedTeam: (team: 'home' | 'away') => void;
  setSelectedTrackerType: (type: TrackerType) => void;
  togglePlayer: (playerId: number) => void;
  clearSelection: () => void;
  getLinePlayers: (trackerType: TrackerType, team?: 'home' | 'away') => Player[];
  getCurrentTeamPlayers: () => Player[];
}

export const usePlayerSelection = ({
  homeTeamPlayers,
  awayTeamPlayers
}: UsePlayerSelectionProps): UsePlayerSelectionReturn => {
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedTrackerType, setSelectedTrackerType] = useState<TrackerType>('specialized');

  const allPlayers = useMemo(() => [...homeTeamPlayers, ...awayTeamPlayers], [homeTeamPlayers, awayTeamPlayers]);

  const getLinePlayers = useCallback((trackerType: TrackerType, team?: 'home' | 'away') => {
    if (trackerType === 'specialized') {
      return allPlayers.filter(player => selectedPlayers.includes(player.id));
    }

    const playersToFilter = team ?
      (team === 'home' ? homeTeamPlayers : awayTeamPlayers) :
      allPlayers;

    return playersToFilter.filter(player => {
      const position = player.position?.toLowerCase() || '';
      switch (trackerType) {
        case 'defence':
          return position.includes('def') || position.includes('cb') ||
                 position.includes('lb') || position.includes('rb') || position.includes('gk');
        case 'midfield':
          return position.includes('mid') || position.includes('cm') ||
                 position.includes('dm') || position.includes('am');
        case 'attack':
          return position.includes('att') || position.includes('fw') ||
                 position.includes('st') || position.includes('lw') || position.includes('rw');
        default:
          return false;
      }
    });
  }, [allPlayers, homeTeamPlayers, awayTeamPlayers, selectedPlayers]);

  const getCurrentTeamPlayers = useCallback(() => {
    return selectedTeam === 'home' ? homeTeamPlayers : awayTeamPlayers;
  }, [selectedTeam, homeTeamPlayers, awayTeamPlayers]);

  const togglePlayer = useCallback((playerId: number) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlayers([]);
    setSelectedTrackerType('specialized');
  }, []);

  const handleSetSelectedTeam = useCallback((team: 'home' | 'away') => {
    setSelectedTeam(team);
    setSelectedPlayers([]); // Clear selection when switching teams
  }, []);

  const handleSetSelectedTrackerType = useCallback((type: TrackerType) => {
    setSelectedTrackerType(type);
    if (type !== 'specialized') {
      const linePlayers = getLinePlayers(type, selectedTeam);
      setSelectedPlayers(linePlayers.map(p => p.id));
    } else {
      setSelectedPlayers([]);
    }
  }, [selectedTeam, getLinePlayers]);

  return {
    selectedPlayers,
    selectedTeam,
    selectedTrackerType,
    setSelectedPlayers,
    setSelectedTeam: handleSetSelectedTeam,
    setSelectedTrackerType: handleSetSelectedTrackerType,
    togglePlayer,
    clearSelection,
    getLinePlayers,
    getCurrentTeamPlayers
  };
};
