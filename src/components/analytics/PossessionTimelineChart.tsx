
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MatchEvent, PlayerStatSummary } from '@/types';

/**
 * @interface PossessionTimelineChartProps
 * @description Props for the PossessionTimelineChart component.
 * @property {MatchEvent[]} events - An array of all events from the match.
 * @property {PlayerStatSummary[]} playerStats - An array of statistics for each player.
 * @property {string} homeTeamName - The name of the home team.
 * @property {string} awayTeamName - The name of the away team.
 */
interface PossessionTimelineChartProps {
  events: MatchEvent[];
  playerStats: PlayerStatSummary[];
  homeTeamName: string;
  awayTeamName: string;
}

/**
 * @interface PossessionChartDataPoint
 * @description Represents a single data point for the possession timeline chart.
 * @property {string} name - The label for the time point (e.g., "45'").
 * @property {Object.<string, number | string>} [key] - Dynamic keys for team names.
 */
interface PossessionChartDataPoint {
  name: string;
  [key: string]: number | string;
}

/**
 * @component PossessionTimelineChart
 * @description A component that displays a line chart visualizing the cumulative possession
 * percentage for each team over the 90 minutes of a match.
 * @param {PossessionTimelineChartProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const PossessionTimelineChart: React.FC<PossessionTimelineChartProps> = ({
  events,
  playerStats,
  homeTeamName,
  awayTeamName,
}) => {
  // Filter events that could be considered possession events
  const possessionEvents = useMemo(() => {
    return events.filter(event => 
      ['pass', 'shot', 'cross', 'dribble', 'tackle', 'interception', 'ballRecovery'].includes(event.type)
    );
  }, [events]);

  // Group events by minute
  const chartData = useMemo(() => {
    const timeSegments = Array.from({ length: 90 }, (_, i) => i + 1); // 1-90 minutes
    
    // Initialize data with time segments and zeroes
    const initialData: PossessionChartDataPoint[] = timeSegments.map(minute => ({
      name: `${minute}'`,
      [homeTeamName]: 0,
      [awayTeamName]: 0,
    }));

    // Count events per minute for each team
    possessionEvents.forEach(event => {
      const minute = Math.floor(event.timestamp / 60);
      if (minute >= 0 && minute < 90) {
        const teamKey = event.team === 'home' ? homeTeamName : awayTeamName;
        initialData[minute][teamKey] = (initialData[minute][teamKey] as number) + 1;
      }
    });

    // Calculate cumulative possession over time
    let homeCumulative = 0;
    let awayCumulative = 0;
    
    return initialData.map((point, index) => {
      homeCumulative += (point[homeTeamName] as number);
      awayCumulative += (point[awayTeamName] as number);
      
      const total = homeCumulative + awayCumulative || 1; // Avoid division by zero
      
      return {
        name: point.name,
        [homeTeamName]: Math.round((homeCumulative / total) * 100),
        [awayTeamName]: Math.round((awayCumulative / total) * 100),
        minute: index + 1,
      };
    });
  }, [possessionEvents, homeTeamName, awayTeamName]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Possession Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                interval={4} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`${value}%`, ""]} />
              <Legend />
              <Line
                name={homeTeamName}
                type="monotone"
                dataKey={homeTeamName}
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                name={awayTeamName}
                type="monotone"
                dataKey={awayTeamName}
                stroke="#ef4444"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PossessionTimelineChart;
