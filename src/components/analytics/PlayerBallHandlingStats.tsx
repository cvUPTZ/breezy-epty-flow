import React from 'react';
import { PlayerStatSummary, Player } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * @interface PlayerBallHandlingStatsProps
 * @description Props for the PlayerBallHandlingStats component.
 * @property {PlayerStatSummary[]} playerStats - An array of statistics for each player.
 */
interface PlayerBallHandlingStatsProps {
  playerStats: PlayerStatSummary[];
}

/**
 * @component PlayerBallHandlingStats
 * @description A component that displays a table of detailed ball handling statistics
 * for each player, including balls played, lost, received, and recovered.
 * @param {PlayerBallHandlingStatsProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const PlayerBallHandlingStats: React.FC<PlayerBallHandlingStatsProps> = ({
  playerStats,
}) => {
  if (!playerStats || playerStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Player Ball Handling Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No player statistics available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Ball Handling</CardTitle>
        <CardDescription>Key ball control and interaction metrics per player.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">Played</TableHead>
              <TableHead className="text-right">Given (Lost)</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Recovered</TableHead>
              <TableHead className="text-right">Contacts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playerStats.map((stat) => (
              <TableRow key={stat.playerId}>
                <TableCell className="font-medium">{stat.playerName || `ID: ${stat.playerId}`}</TableCell>
                <TableCell>{stat.team}</TableCell>
                <TableCell className="text-right">{stat.ballsPlayed || 0}</TableCell>
                <TableCell className="text-right">{stat.ballsGiven || 0}</TableCell>
                <TableCell className="text-right">{stat.ballsReceived || 0}</TableCell>
                <TableCell className="text-right">{stat.ballsRecovered || 0}</TableCell>
                <TableCell className="text-right">{stat.contacts || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PlayerBallHandlingStats;
