import React from 'react';
import { AggregatedStats } from '@/lib/analytics/eventAggregator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

/**
 * @interface CumulativePossessionChartProps
 * @description Props for the CumulativePossessionChart component.
 * @property {AggregatedStats[]} statsSegments - An array of aggregated statistics for each time segment.
 * @property {number} intervalMinutes - The duration of each time interval in minutes.
 * @property {string} homeTeamName - The name of the home team.
 * @property {string} awayTeamName - The name of the away team.
 */
interface CumulativePossessionChartProps {
  statsSegments: AggregatedStats[];
  intervalMinutes: number;
  homeTeamName: string;
  awayTeamName: string;
}

/**
 * @interface CumulativeDataPoint
 * @description Represents a single data point for the cumulative area chart.
 * @property {string} name - The label for the time segment (e.g., "15 min").
 * @property {Object.<string, number | string>} [teamKey] - Dynamic keys for team names.
 */
interface CumulativeDataPoint {
  name: string;
  [teamKey: string]: number | string;
}

/**
 * @component CumulativePossessionChart
 * @description A component that displays an area chart showing the cumulative possession
 * for each team over the course of the match, providing a view of overall game dominance.
 * @param {CumulativePossessionChartProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const CumulativePossessionChart: React.FC<CumulativePossessionChartProps> = ({
  statsSegments,
  intervalMinutes,
  homeTeamName,
  awayTeamName,
}) => {
  if (!statsSegments || statsSegments.length === 0) {
    return <Card><CardHeader><CardTitle>Cumulative Possession</CardTitle></CardHeader><CardContent><p>No segmented data available.</p></CardContent></Card>;
  }

  let cumulativeHomeValue = 0;
  let cumulativeAwayValue = 0;

  // Check if actual possessionMinutes data seems available and meaningful
  const hasActualTimeData = statsSegments.some(
    s => (s.homeTeamStats.possessionMinutes || 0) > 0 || (s.awayTeamStats.possessionMinutes || 0) > 0
  );

  let yAxisLabel = "Cumulative Possession Metric (Proxy)";
  let description = "Tracking cumulative sum of segment possession percentages as a proxy for game control.";
  if (hasActualTimeData) {
    yAxisLabel = "Cumulative Possession Time (min)";
    description = "Tracking cumulative possession time in minutes for each team.";
  }


  const cumulativeData: CumulativeDataPoint[] = statsSegments.map((segment, index) => {
    if (hasActualTimeData) {
      cumulativeHomeValue += segment.homeTeamStats.possessionMinutes || 0;
      cumulativeAwayValue += segment.awayTeamStats.possessionMinutes || 0;
    } else {
      // Fallback to summing possessionPercentage as a proxy
      cumulativeHomeValue += segment.homeTeamStats.possessionPercentage || 0;
      cumulativeAwayValue += segment.awayTeamStats.possessionPercentage || 0;
    }

    return {
      name: `${(index + 1) * intervalMinutes} min`,
      [homeTeamName]: parseFloat(cumulativeHomeValue.toFixed(1)), // Keep one decimal for display
      [awayTeamName]: parseFloat(cumulativeAwayValue.toFixed(1)),
    };
  });

  const chartConfig = {
    [homeTeamName]: { label: homeTeamName, color: "hsl(var(--chart-1))" },
    [awayTeamName]: { label: awayTeamName, color: "hsl(var(--chart-2))" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Possession Over Time</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full aspect-[3/1]">
            <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cumulativeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis
                    label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 10, offset: -5 }}
                    tick={{ fontSize: 10 }}
                    allowDecimals={true}
                />
                <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent indicator="line" hideLabel />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey={homeTeamName} stroke={chartConfig[homeTeamName].color} fill={chartConfig[homeTeamName].color} fillOpacity={0.3} name={homeTeamName} dot={false} />
                <Area type="monotone" dataKey={awayTeamName} stroke={chartConfig[awayTeamName].color} fill={chartConfig[awayTeamName].color} fillOpacity={0.3} name={awayTeamName} dot={false} />
            </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CumulativePossessionChart;
