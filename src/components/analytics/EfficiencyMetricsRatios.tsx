import React from 'react';
import { TeamDetailedStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

/**
 * @interface EfficiencyMetricsRatiosProps
 * @description Props for the EfficiencyMetricsRatios component.
 * @property {TeamDetailedStats} teamStats - The detailed statistics for a single team.
 * @property {string} teamName - The name of the team.
 */
interface EfficiencyMetricsRatiosProps {
  teamStats: TeamDetailedStats;
  teamName: string;
}

/**
 * @interface RatioMetric
 * @description Represents a single calculated ratio metric for display.
 * @property {string} label - The display name of the metric.
 * @property {number} value - The calculated value, typically a percentage from 0-100.
 * @property {string} displayValue - The formatted string value to be displayed.
 * @property {string} [description] - An optional description providing context (e.g., the raw numbers).
 */
interface RatioMetric {
  label: string;
  value: number;
  displayValue: string;
  description?: string;
}

/**
 * @component EfficiencyMetricsRatios
 * @description A component that calculates and displays various efficiency ratios for a single team,
 * such as pass completion, shot efficiency, and duel success rates.
 * @param {EfficiencyMetricsRatiosProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const EfficiencyMetricsRatios: React.FC<EfficiencyMetricsRatiosProps> = ({
  teamStats,
  teamName,
}) => {
  const calculateRatio = (numerator: number, denominator: number, asPercentage: boolean = true): number => {
    if (denominator === 0) return 0;
    const ratio = numerator / denominator;
    return asPercentage ? ratio * 100 : ratio;
  };

  const shotEfficiencyGoalsPerShot = calculateRatio(teamStats.goals || 0, teamStats.shots || 0);
  const shotEfficiencyGoalsPerShotOnTarget = calculateRatio(teamStats.goals || 0, teamStats.shotsOnTarget || 0);
  const passCompletionRate = calculateRatio(teamStats.passesCompleted || 0, teamStats.passesAttempted || 0);
  const duelSuccessRate = calculateRatio(teamStats.duelsWon || 0, (teamStats.duelsWon || 0) + (teamStats.duelsLost || 0));
  // Ball Loss Ratio: Lower is better. (Balls Lost / Balls Played)
  // For progress bar, we might want to show (1 - BallLossRatio) if progress bar indicates "goodness"
  const ballLossRatio = calculateRatio(teamStats.ballsLost || 0, teamStats.ballsPlayed || 0);
  // const ballRetentionRate = 100 - ballLossRatio; // Example if we want to show retention

  const metrics: RatioMetric[] = [
    {
      label: 'Pass Completion Rate',
      value: passCompletionRate,
      displayValue: `${passCompletionRate.toFixed(1)}%`,
      description: `(${teamStats.passesCompleted || 0} / ${teamStats.passesAttempted || 0})`,
    },
    {
      label: 'Shot Efficiency (Goals / Total Shots)',
      value: shotEfficiencyGoalsPerShot,
      displayValue: `${shotEfficiencyGoalsPerShot.toFixed(1)}%`,
      description: `(${teamStats.goals || 0} / ${teamStats.shots || 0})`,
    },
    {
      label: 'Shot Accuracy (Goals / Shots on Target)',
      value: shotEfficiencyGoalsPerShotOnTarget,
      displayValue: `${shotEfficiencyGoalsPerShotOnTarget.toFixed(1)}%`,
      description: `(${teamStats.goals || 0} / ${teamStats.shotsOnTarget || 0})`,
    },
    {
      label: 'Duel Success Rate',
      value: duelSuccessRate,
      displayValue: `${duelSuccessRate.toFixed(1)}%`,
      description: `(${teamStats.duelsWon || 0} / ${(teamStats.duelsWon || 0) + (teamStats.duelsLost || 0)})`,
    },
    {
      label: 'Ball Loss Ratio (Lost/Played)',
      value: ballLossRatio, // Lower is better
      displayValue: `${ballLossRatio.toFixed(1)}%`,
      description: `(${teamStats.ballsLost || 0} / ${teamStats.ballsPlayed || 0}) - Lower is better`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Efficiency Metrics: {teamName}</CardTitle>
        <CardDescription>Key performance ratios and efficiency rates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{metric.label}</span>
              <span className="text-sm font-semibold">{metric.displayValue}</span>
            </div>
            {/* Progress bar shows the percentage value directly. For 'Ball Loss Ratio', a high bar is 'bad'.
                Consider inverting for 'goodness' if needed, or use different visual. */}
            <Progress value={metric.value} max={100} className="h-2" />
            {metric.description && (
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EfficiencyMetricsRatios;
