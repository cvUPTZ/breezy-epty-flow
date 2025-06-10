import React, { useMemo } from 'react';
import { PlayerStatSummary, Player } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ZAxis } from 'recharts';

interface PassFrequencyHeatmapProps {
  playerStats: PlayerStatSummary[];
  allPlayers: Player[];
}

interface HeatmapDataPoint {
  fromPlayerId: string;
  toPlayerId: string;
  fromPlayerName: string;
  toPlayerName: string;
  count: number;
}

// Custom shape for ScatterChart to render rectangles (cells)
const HeatmapCell = (props: any) => {
  const { cx, cy, width, height, fill, payload } = props;
  // cx, cy are center of the cell, width/height are cell dimensions
  // We want to draw a rect from (cx - width/2, cy - height/2)
  if (payload.count === 0) return null; // Don't render for zero count

  return (
    <rect
      x={cx - width / 2}
      y={cy - height / 2}
      width={width}
      height={height}
      fill={fill}
      stroke="#fff" // Optional: add a border to cells
      strokeWidth={0.5}
    />
  );
};


const PassFrequencyHeatmap: React.FC<PassFrequencyHeatmapProps> = ({
  playerStats,
  allPlayers,
}) => {
  const { heatmapData, sortedPlayerNames, maxFrequency } = useMemo(() => {
    if (!playerStats || playerStats.length === 0 || !allPlayers || allPlayers.length === 0) {
      return { heatmapData: [], sortedPlayerNames: [], maxFrequency: 0 };
    }

    const playerMap = new Map(allPlayers.map(p => [String(p.id), p.playerName || p.name || `ID: ${p.id}`]));
    const tempSortedPlayers = [...allPlayers].sort((a, b) => (playerMap.get(String(a.id)) || '').localeCompare(playerMap.get(String(b.id)) || ''));
    const currentSortedPlayerNames = tempSortedPlayers.map(p => playerMap.get(String(p.id)) || '');


    const matrix: { [fromId: string]: { [toId: string]: number } } = {};
    let currentMaxFrequency = 0;

    tempSortedPlayers.forEach(player => {
      const fromIdStr = String(player.id);
      matrix[fromIdStr] = {};
      tempSortedPlayers.forEach(p2 => matrix[fromIdStr][String(p2.id)] = 0);

      const stats = playerStats.find(ps => String(ps.playerId) === fromIdStr);
      if (stats?.passNetworkSent) {
        stats.passNetworkSent.forEach(link => {
          const toIdStr = String(link.toPlayerId);
          if (matrix[fromIdStr] && typeof matrix[fromIdStr][toIdStr] !== 'undefined') {
            matrix[fromIdStr][toIdStr] = (matrix[fromIdStr][toIdStr] || 0) + link.count;
            if (matrix[fromIdStr][toIdStr] > currentMaxFrequency) {
              currentMaxFrequency = matrix[fromIdStr][toIdStr];
            }
          }
        });
      }
    });

    const data: HeatmapDataPoint[] = [];
    tempSortedPlayers.forEach(fromPlayer => {
      tempSortedPlayers.forEach(toPlayer => {
        const fromIdStr = String(fromPlayer.id);
        const toIdStr = String(toPlayer.id);
        const count = matrix[fromIdStr]?.[toIdStr] || 0;
        if (count > 0) { // Only add points if there's a pass count
             data.push({
                fromPlayerId: fromIdStr,
                toPlayerId: toIdStr,
                fromPlayerName: playerMap.get(fromIdStr) || '',
                toPlayerName: playerMap.get(toIdStr) || '',
                count: count,
            });
        }
      });
    });
    return { heatmapData: data, sortedPlayerNames: currentSortedPlayerNames, maxFrequency: currentMaxFrequency };
  }, [playerStats, allPlayers]);


  const getCellFillColor = (value: number) => {
    if (value === 0 || maxFrequency === 0) return 'rgba(200, 200, 200, 0.1)'; // Very light for zero or no max
    const intensity = Math.min(1, value / (maxFrequency * 0.85)); // Cap intensity
    const alpha = intensity * 0.7 + 0.3; // from 0.3 to 1.0
    return `rgba(79, 70, 229, ${alpha})`; // Indigo scale (Tailwind indigo-600 is approx this)
  };


  if (heatmapData.length === 0 || sortedPlayerNames.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Pass Frequency Heatmap</CardTitle></CardHeader>
        <CardContent><p>Not enough data to render heatmap, or no passes recorded between selected players.</p></CardContent>
      </Card>
    );
  }

  const chartHeight = Math.max(300, sortedPlayerNames.length * 30 + 50); // Dynamic height
  const cellWidth = sortedPlayerNames.length > 0 ? Math.max(20, 600 / sortedPlayerNames.length) : 20; // Dynamic cell width

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pass Frequency Heatmap</CardTitle>
        <CardDescription>Frequency of passes between players (attempted passes shown). Cell color intensity indicates pass count.</CardDescription>
      </CardHeader>
      <CardContent style={{ userSelect: 'none' }}>
        <ChartContainer config={{}} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 80 }}> {/* Increased bottom/left margin for labels */}
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3}/>
              <XAxis
                type="category"
                dataKey="toPlayerName"
                name="To Player"
                allowDuplicatedCategory={false}
                domain={sortedPlayerNames} // Ensure axis includes all players for consistent ordering
                ticks={sortedPlayerNames} // Explicitly set ticks
                interval={0}
                tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                height={50} // Allocate space for rotated labels
              />
              <YAxis
                type="category"
                dataKey="fromPlayerName"
                name="From Player"
                allowDuplicatedCategory={false}
                domain={sortedPlayerNames} // Ensure axis includes all players
                ticks={sortedPlayerNames} // Explicitly set ticks
                interval={0}
                width={80} // Allocate space for labels
                tick={{ fontSize: 10 }}
              />
              <ZAxis type="number" dataKey="count" range={[0, maxFrequency]} /> {/* For potential use by Recharts features, not directly for cell fill here */}
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as HeatmapDataPoint;
                    return (
                      <ChartTooltipContent className="bg-background text-foreground border rounded shadow-lg p-2">
                        <p>{`${data.fromPlayerName} → ${data.toPlayerName}`}</p>
                        <p>Passes: {data.count}</p>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Pass Frequency"
                data={heatmapData}
                shape={(props) => <HeatmapCell {...props} width={cellWidth} height={chartHeight / (sortedPlayerNames.length + 2)} /> } // Dynamically size cell
                fill={(props: HeatmapDataPoint) => getCellFillColor(props.count)} // Apply color based on count
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PassFrequencyHeatmap;
