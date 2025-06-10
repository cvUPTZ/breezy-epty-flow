import React from 'react';
import { TeamDetailedStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AdvancedEfficiencyRatioChartsProps {
  homeStats: TeamDetailedStats;
  awayStats: TeamDetailedStats;
  homeTeamName: string;
  awayTeamName: string;
}

// Simple Bar component for demonstration
const SimpleRatioBar = ({ label, homeValue, awayValue, unit = '' }: { label: string; homeValue: number; awayValue: number; unit?: string }) => {
  const maxValue = Math.max(homeValue, awayValue, 1); // Ensure max is at least 1 for scaling
  const homePercentage = (homeValue / maxValue) * 100;
  const awayPercentage = (awayValue / maxValue) * 100;

  return (
    <div className="mb-4 p-2 border rounded">
      <h5 className="text-sm font-semibold text-center mb-2">{label}</h5>
      <div className="flex items-center mb-1">
        <span className="text-xs w-1/4 pr-1 text-right">{homeTeamName}:</span>
        <div className="w-3/4 bg-gray-200 rounded h-4">
          <div style={{ width: `${homePercentage}%`, backgroundColor: 'lightblue' }} className="h-4 rounded"></div>
        </div>
        <span className="text-xs pl-1">{homeValue.toFixed(2)}{unit}</span>
      </div>
      <div className="flex items-center">
        <span className="text-xs w-1/4 pr-1 text-right">{awayTeamName}:</span>
        <div className="w-3/4 bg-gray-200 rounded h-4">
          <div style={{ width: `${awayPercentage}%`, backgroundColor: 'lightcoral' }} className="h-4 rounded"></div>
        </div>
        <span className="text-xs pl-1">{awayValue.toFixed(2)}{unit}</span>
      </div>
    </div>
  );
};


const AdvancedEfficiencyRatioCharts: React.FC<AdvancedEfficiencyRatioChartsProps> = ({
  homeStats,
  awayStats,
  homeTeamName,
  awayTeamName,
}) => {
  const calculateRatio = (numerator: number, denominator: number): number => {
    return denominator > 0 ? numerator / denominator : 0;
  };

  const homeBallLossRatio = calculateRatio(homeStats.ballsLost || 0, homeStats.ballsPlayed || 0) * 100; // as percentage
  const awayBallLossRatio = calculateRatio(awayStats.ballsLost || 0, awayStats.ballsPlayed || 0) * 100;

  // Recovery Efficiency
  const totalRecoveries = (homeStats.ballsRecovered || 0) + (awayStats.ballsRecovered || 0);
  const homeRecoveryShare = totalRecoveries > 0 ? ((homeStats.ballsRecovered || 0) / totalRecoveries) * 100 : 0;
  const awayRecoveryShare = totalRecoveries > 0 ? ((awayStats.ballsRecovered || 0) / totalRecoveries) * 100 : 0;

  const homeRecoveryRateVsOpponent = calculateRatio(homeStats.ballsRecovered || 0, awayStats.ballsPlayed || 0) * 100; // Recoveries per 100 opponent balls played
  const awayRecoveryRateVsOpponent = calculateRatio(awayStats.ballsRecovered || 0, homeStats.ballsPlayed || 0) * 100;

  // Possession Efficiency (using possessionPercentage as a proxy for time/control)
  // Note: homeStats.possessionMinutes is likely 0 or unreliable based on previous analysis.
  const homeGoalsPerPossessionProxy = calculateRatio(homeStats.goals || 0, homeStats.possessionPercentage || 1); // Goals per 1% of possession
  const awayGoalsPerPossessionProxy = calculateRatio(awayStats.goals || 0, awayStats.possessionPercentage || 1);
  const homeShotsPerPossessionProxy = calculateRatio(homeStats.shots || 0, homeStats.possessionPercentage || 1); // Shots per 1% of possession
  const awayShotsPerPossessionProxy = calculateRatio(awayStats.shots || 0, awayStats.possessionPercentage || 1);


  const efficiencyMetrics = [
    {
      groupTitle: "Ball Retention & Loss",
      metrics: [
        { label: 'Ball Loss Ratio (%) (Lower is Better)', homeValue: homeBallLossRatio, awayValue: awayBallLossRatio, unit: '%' },
      ]
    },
    {
      groupTitle: "Recovery Efficiency",
      metrics: [
        { label: 'Total Balls Recovered', homeValue: homeStats.ballsRecovered || 0, awayValue: awayStats.ballsRecovered || 0 },
        { label: 'Share of Total Recoveries (%)', homeValue: homeRecoveryShare, awayValue: awayRecoveryShare, unit: '%' },
        { label: 'Recovery Rate (vs Opponent Balls Played %)', homeValue: homeRecoveryRateVsOpponent, awayValue: awayRecoveryRateVsOpponent, unit: '%' },
      ]
    },
    {
      groupTitle: "Possession Efficiency (Proxies based on Possession %)",
      metrics: [
        { label: 'Goals per 1% Possession', homeValue: homeGoalsPerPossessionProxy, awayValue: awayGoalsPerPossessionProxy },
        { label: 'Shots per 1% Possession', homeValue: homeShotsPerPossessionProxy, awayValue: awayShotsPerPossessionProxy },
      ]
    }
  ];

  const successfulPassCounts = [
    { label: "Long Passes", homeValue: homeStats.longPasses || 0, awayValue: awayStats.longPasses || 0 },
    { label: "Forward Passes", homeValue: homeStats.forwardPasses || 0, awayValue: awayStats.forwardPasses || 0 },
    { label: "Backward Passes", homeValue: homeStats.backwardPasses || 0, awayValue: awayStats.backwardPasses || 0 },
    { label: "Lateral Passes", homeValue: homeStats.lateralPasses || 0, awayValue: awayStats.lateralPasses || 0 },
  ];

  // Data for Radar chart (example) - can be expanded
  const radarData = [
    { subject: 'Ball Loss Ratio (Higher=Worse)', A: homeBallLossRatio, B: awayBallLossRatio, fullMark: Math.max(homeBallLossRatio, awayBallLossRatio, 50) },
    { subject: 'Recovery Share', A: homeRecoveryShare, B: awayRecoveryShare, fullMark: 100 },
    { subject: 'Goals/Poss%', A: homeGoalsPerPossessionProxy, B: awayGoalsPerPossessionProxy, fullMark: Math.max(homeGoalsPerPossessionProxy, awayGoalsPerPossessionProxy, 1) },
    { subject: 'Shots/Poss%', A: homeShotsPerPossessionProxy, B: awayShotsPerPossessionProxy, fullMark: Math.max(homeShotsPerPossessionProxy, awayShotsPerPossessionProxy, 5) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Efficiency Ratios Comparison</CardTitle>
        <CardDescription>Comparing {homeTeamName} and {awayTeamName} on advanced efficiency metrics.</CardDescription>
      </CardHeader>
      <CardContent>
        {efficiencyMetrics.map(group => (
          <div key={group.groupTitle} className="mb-6">
            <h4 className="text-md font-semibold mb-3 border-b pb-1">{group.groupTitle}</h4>
            {group.metrics.map(metric => (
              <SimpleRatioBar
                key={metric.label}
                label={metric.label}
                homeValue={metric.homeValue}
                awayValue={metric.awayValue}
                unit={metric.unit}
              />
            ))}
          </div>
        ))}

        <div className="mt-4 p-2 border rounded">
           <h4 className="text-md font-semibold text-center mb-3 border-b pb-1">Successful Pass Type Counts</h4>
           <p className="text-xs text-muted-foreground text-center mb-2">Note: These are counts of successful passes, not success rates for each specific type.</p>
           {successfulPassCounts.map(passStat => (
             <SimpleRatioBar
               key={passStat.label}
               label={passStat.label}
               homeValue={passStat.homeValue}
               awayValue={passStat.awayValue}
             />
           ))}
        </div>

        {/* Placeholder for Radar Chart for overall comparison
        <h4 className="text-md font-semibold mt-6 mb-3 border-b pb-1">Overall Efficiency Profile (Radar)</h4>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
            <Radar name={homeTeamName} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Radar name={awayTeamName} dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
        */}
      </CardContent>
    </Card>
  );
};

export default AdvancedEfficiencyRatioCharts;
