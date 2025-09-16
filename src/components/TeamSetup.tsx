
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Team, Player } from '@/types';
import { Plus, Minus } from 'lucide-react';

/**
 * @interface TeamSetupProps
 * @description Props for the TeamSetup component.
 * @property {{ home: Team; away: Team }} teams - The current state of the home and away teams.
 * @property {function(teams: { home: Team; away: Team }): void} onTeamsChange - Callback function to update the teams' state.
 * @property {function(): void} onConfirm - Callback function to be called when the setup is confirmed.
 */
interface TeamSetupProps {
  teams: { home: Team; away: Team };
  onTeamsChange: (teams: { home: Team; away: Team }) => void;
  onConfirm: () => void;
}

const defaultPlayer = (id: number): Player => ({
  id: id.toString(),
  name: `Player ${id}`,
  player_name: `Player ${id}`,
  number: id,
  jersey_number: id,
  position: 'Not Set',
});

/**
 * @component TeamSetup
 * @description A component that provides a user interface for setting up the home and away teams
 * for a match, including their names and player rosters. It uses the TeamForm sub-component
 * for each team.
 * @param {TeamSetupProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const TeamSetup: React.FC<TeamSetupProps> = ({ teams, onTeamsChange, onConfirm }) => {
  const handleTeamNameChange = (team: 'home' | 'away', name: string) => {
    onTeamsChange({
      ...teams,
      [team]: {
        ...teams[team],
        name,
      },
    });
  };

  const handlePlayerChange = (team: 'home' | 'away', player: Player) => {
    const updatedPlayers = teams[team].players.map((p: Player) => 
      p.id === player.id ? player : p
    );

    onTeamsChange({
      ...teams,
      [team]: {
        ...teams[team],
        players: updatedPlayers,
      },
    });
  };

  const handleAddPlayer = (team: 'home' | 'away') => {
    const newId = teams[team].players.length > 0 
      ? Math.max(...teams[team].players.map((p: Player) => typeof p.id === 'string' ? parseInt(p.id) : p.id as number)) + 1 
      : 1;
      
    onTeamsChange({
      ...teams,
      [team]: {
        ...teams[team],
        players: [...teams[team].players, defaultPlayer(newId)],
      },
    });
  };

  const handleRemovePlayer = (team: 'home' | 'away', playerId: string | number) => {
    onTeamsChange({
      ...teams,
      [team]: {
        ...teams[team],
        players: teams[team].players.filter((p: Player) => p.id !== playerId),
      },
    });
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-center">Match Setup</h2>

      <div className="space-y-6">
        <TeamForm
          team={teams.home}
          teamType="home"
          onTeamNameChange={(name) => handleTeamNameChange('home', name)}
          onPlayerChange={(player) => handlePlayerChange('home', player)}
          onAddPlayer={() => handleAddPlayer('home')}
          onRemovePlayer={(id) => handleRemovePlayer('home', id)}
        />

        <TeamForm
          team={teams.away}
          teamType="away"
          onTeamNameChange={(name) => handleTeamNameChange('away', name)}
          onPlayerChange={(player) => handlePlayerChange('away', player)}
          onAddPlayer={() => handleAddPlayer('away')}
          onRemovePlayer={(id) => handleRemovePlayer('away', id)}
        />
      </div>

      <div className="flex justify-center mt-6">
        <Button 
          onClick={onConfirm}
          disabled={teams.home.players.length === 0 || teams.away.players.length === 0}
          className="w-full max-w-md"
        >
          Start Match
        </Button>
      </div>
    </div>
  );
};

/**
 * @interface TeamFormProps
 * @description Props for the TeamForm sub-component.
 * @property {Team} team - The team object to be managed by the form.
 * @property {'home' | 'away'} teamType - The type of team, used for styling and labeling.
 * @property {function(name: string): void} onTeamNameChange - Callback for when the team name changes.
 * @property {function(player: Player): void} onPlayerChange - Callback for when a player's details change.
 * @property {function(): void} onAddPlayer - Callback to add a new player to the team.
 * @property {function(id: string | number): void} onRemovePlayer - Callback to remove a player from the team.
 */
interface TeamFormProps {
  team: Team;
  teamType: 'home' | 'away';
  onTeamNameChange: (name: string) => void;
  onPlayerChange: (player: Player) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (id: string | number) => void;
}

/**
 * @component TeamForm
 * @description A form component for editing the details of a single team,
 * including its name and a list of players.
 * @param {TeamFormProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const TeamForm: React.FC<TeamFormProps> = ({
  team,
  teamType,
  onTeamNameChange,
  onPlayerChange,
  onAddPlayer,
  onRemovePlayer,
}) => {
  return (
    <Card className={`border-l-4 ${teamType === 'home' ? 'border-l-football-home' : 'border-l-football-away'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Input
            value={team.name}
            onChange={(e) => onTeamNameChange(e.target.value)}
            placeholder={teamType === 'home' ? 'Home Team' : 'Away Team'}
            className="font-bold"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {team.players.map((player: Player) => (
            <div key={player.id} className="flex items-center space-x-2">
              <Input
                type="number"
                value={player.number}
                onChange={(e) => onPlayerChange({ ...player, number: parseInt(e.target.value) || 0 })}
                placeholder="№"
                className="w-16"
              />
              <Input
                value={player.name}
                onChange={(e) => onPlayerChange({ ...player, name: e.target.value })}
                placeholder="Name"
                className="flex-grow"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemovePlayer(player.id)}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={onAddPlayer}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSetup;
