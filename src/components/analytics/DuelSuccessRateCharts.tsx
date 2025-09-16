import React from 'react';
import { TeamDetailedStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

/**
 * @interface DuelSuccessRateChartsProps
 * @description Props for the DuelSuccessRateCharts component.
 * @property {TeamDetailedStats} teamStats - The detailed statistics for a single team.
 * @property {string} teamName - The name of the team.
 */
interface DuelSuccessRateChartsProps {
  teamStats: TeamDetailedStats;
  teamName: string;
}

/**
 * @interface SuccessRateMetric
 * @description Represents the data for a single success rate metric to be displayed.
 * @property {string} label - The display name of the metric (e.g., 'Overall Duel Success Rate').
 * @property {number} value - The calculated percentage value (0-100).
 * @property {number} won - The number of successful actions.
 * @property {number} total - The total number of actions.
 */
interface SuccessRateMetric {
  label: string;
  value: number;
  won: number;
  total: number;
}

/**
 * @component DuelSuccessRateCharts
 * @description A component that visualizes the success rates for overall and aerial duels for a single team.
 * @param {DuelSuccessRateChartsProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const DuelSuccessRateCharts: React.FC<DuelSuccessRateChartsProps> = ({
  teamStats,
  teamName,
}) => {
  const totalDuels = (teamStats.duelsWon || 0) + (teamStats.duelsLost || 0);
  const overallDuelSuccessRate = totalDuels > 0 ? ((teamStats.duelsWon || 0) / totalDuels) * 100 : 0;

  const totalAerialDuels = (teamStats.aerialDuelsWon || 0) + (teamStats.aerialDuelsLost || 0);
  const aerialDuelSuccessRate = totalAerialDuels > 0 ? ((teamStats.aerialDuelsWon || 0) / totalAerialDuels) * 100 : 0;

  const duelMetrics: SuccessRateMetric[] = [
    {
      label: 'Overall Duel Success Rate',
      value: overallDuelSuccessRate,
      won: teamStats.duelsWon || 0,
      total: totalDuels,
    },
    {
      label: 'Aerial Duel Success Rate',
      value: aerialDuelSuccessRate,
      won: teamStats.aerialDuelsWon || 0,
      total: totalAerialDuels,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duel Success Rates: {teamName}</CardTitle>
        <CardDescription>Effectiveness in overall and aerial duels.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {duelMetrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{metric.label}</span>
              <span className="text-sm font-semibold">{`${metric.value.toFixed(1)}%`}</span>
            </div>
            <Progress value={metric.value} max={100} className="h-3 mb-1" />
            <p className="text-xs text-muted-foreground text-right">
              ({metric.won} Won / {metric.total} Total)
            </p>
          </div>
        ))}
        {/*
          Placeholder for potential bar chart visualization if preferred:
          e.g., using Recharts BarChart if available
          <ResponsiveContainer width="100%" height={150 * duelMetrics.length}>
            <BarChart layout="vertical" data={duelMetrics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis dataKey="label" type="category" width={150} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="value" name="Success Rate" fill="#8884d8" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        */}
      </CardContent>
    </Card>
  );
};

export default DuelSuccessRateCharts;
