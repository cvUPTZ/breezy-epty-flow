
import React, { useState, useEffect, useCallback } from 'react';

/**
 * @interface PlayerPosition
 * @description Represents the position and details of a single player for tactical visualization.
 * @property {string} id - The unique identifier for the player.
 * @property {number} x - The x-coordinate as a percentage of the video width (0-1).
 * @property {number} y - The y-coordinate as a percentage of the video height (0-1).
 * @property {'home' | 'away'} team - The team the player belongs to.
 * @property {number} [jerseyNumber] - The player's jersey number.
 * @property {'GK' | 'DEF' | 'MID' | 'FWD'} position - The general position of the player.
 */
interface PlayerPosition {
  id: string;
  x: number; // Percentage (0-1)
  y: number; // Percentage (0-1)
  team: 'home' | 'away';
  jerseyNumber?: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
}

/**
 * @interface FormationLine
 * @description Represents a line connecting two players to visualize a team's formation.
 * @property {string} from - The ID of the starting player.
 * @property {string} to - The ID of the ending player.
 * @property {'home' | 'away'} team - The team the line belongs to.
 */
interface FormationLine {
  from: string; // player id
  to: string; // player id
  team: 'home' | 'away';
}

/**
 * @interface TacticalPlayerHighlightingProps
 * @description Props for the TacticalPlayerHighlighting component.
 * @property {{ width: number; height: number }} videoDimensions - The dimensions of the video player.
 * @property {boolean} isVisible - Whether the highlighting overlay is currently visible.
 * @property {() => void} onToggle - Callback function to toggle the visibility of the overlay.
 */
interface TacticalPlayerHighlightingProps {
  videoDimensions: { width: number; height: number };
  isVisible: boolean;
  onToggle: () => void;
}

/**
 * @function generateMockPlayerPositions
 * @description A helper function to generate a set of mock player positions for demonstration purposes.
 * @returns {PlayerPosition[]} An array of mock player positions.
 */
const generateMockPlayerPositions = (): PlayerPosition[] => {
  return [
    // Home team (Purple/Barcelona-style) - More spread out attacking formation
    { id: 'h1', x: 0.1, y: 0.5, team: 'home', jerseyNumber: 1, position: 'GK' },
    { id: 'h2', x: 0.25, y: 0.2, team: 'home', jerseyNumber: 2, position: 'DEF' },
    { id: 'h3', x: 0.25, y: 0.4, team: 'home', jerseyNumber: 3, position: 'DEF' },
    { id: 'h4', x: 0.25, y: 0.6, team: 'home', jerseyNumber: 4, position: 'DEF' },
    { id: 'h5', x: 0.25, y: 0.8, team: 'home', jerseyNumber: 5, position: 'DEF' },
    { id: 'h6', x: 0.45, y: 0.3, team: 'home', jerseyNumber: 6, position: 'MID' },
    { id: 'h7', x: 0.45, y: 0.5, team: 'home', jerseyNumber: 7, position: 'MID' },
    { id: 'h8', x: 0.45, y: 0.7, team: 'home', jerseyNumber: 8, position: 'MID' },
    { id: 'h9', x: 0.65, y: 0.4, team: 'home', jerseyNumber: 9, position: 'FWD' },
    { id: 'h10', x: 0.65, y: 0.6, team: 'home', jerseyNumber: 10, position: 'FWD' },
    { id: 'h11', x: 0.8, y: 0.5, team: 'home', jerseyNumber: 11, position: 'FWD' },

    // Away team (Yellow/Atlético-style) - Compact defensive block 4-4-2
    { id: 'a1', x: 0.9, y: 0.5, team: 'away', jerseyNumber: 1, position: 'GK' },
    { id: 'a2', x: 0.75, y: 0.25, team: 'away', jerseyNumber: 2, position: 'DEF' },
    { id: 'a3', x: 0.75, y: 0.42, team: 'away', jerseyNumber: 3, position: 'DEF' },
    { id: 'a4', x: 0.75, y: 0.58, team: 'away', jerseyNumber: 4, position: 'DEF' },
    { id: 'a5', x: 0.75, y: 0.75, team: 'away', jerseyNumber: 5, position: 'DEF' },
    { id: 'a6', x: 0.62, y: 0.3, team: 'away', jerseyNumber: 6, position: 'MID' },
    { id: 'a7', x: 0.62, y: 0.45, team: 'away', jerseyNumber: 7, position: 'MID' },
    { id: 'a8', x: 0.62, y: 0.55, team: 'away', jerseyNumber: 8, position: 'MID' },
    { id: 'a9', x: 0.62, y: 0.7, team: 'away', jerseyNumber: 9, position: 'MID' },
    { id: 'a10', x: 0.52, y: 0.4, team: 'away', jerseyNumber: 10, position: 'FWD' },
    { id: 'a11', x: 0.52, y: 0.6, team: 'away', jerseyNumber: 11, position: 'FWD' },
  ];
};

/**
 * @function generateFormationLines
 * @description A helper function that generates formation lines by connecting players of the same team and position type.
 * @param {PlayerPosition[]} players - An array of player positions.
 * @returns {FormationLine[]} An array of formation lines to be drawn.
 */
const generateFormationLines = (players: PlayerPosition[]): FormationLine[] => {
  const lines: FormationLine[] = [];
  
  const homeDefenders = players.filter(p => p.team === 'home' && p.position === 'DEF');
  const homeMidfielders = players.filter(p => p.team === 'home' && p.position === 'MID');
  const homeForwards = players.filter(p => p.team === 'home' && p.position === 'FWD');
  
  const awayDefenders = players.filter(p => p.team === 'away' && p.position === 'DEF');
  const awayMidfielders = players.filter(p => p.team === 'away' && p.position === 'MID');
  const awayForwards = players.filter(p => p.team === 'away' && p.position === 'FWD');

  // Connect home team formation lines
  // Defensive line
  for (let i = 0; i < homeDefenders.length - 1; i++) {
    lines.push({
      from: homeDefenders[i].id,
      to: homeDefenders[i + 1].id,
      team: 'home'
    });
  }
  
  // Midfield line
  for (let i = 0; i < homeMidfielders.length - 1; i++) {
    lines.push({
      from: homeMidfielders[i].id,
      to: homeMidfielders[i + 1].id,
      team: 'home'
    });
  }
  
  // Forward line
  for (let i = 0; i < homeForwards.length - 1; i++) {
    lines.push({
      from: homeForwards[i].id,
      to: homeForwards[i + 1].id,
      team: 'home'
    });
  }

  // Connect away team formation lines (compact defensive block)
  // Defensive line
  for (let i = 0; i < awayDefenders.length - 1; i++) {
    lines.push({
      from: awayDefenders[i].id,
      to: awayDefenders[i + 1].id,
      team: 'away'
    });
  }
  
  // Midfield line
  for (let i = 0; i < awayMidfielders.length - 1; i++) {
    lines.push({
      from: awayMidfielders[i].id,
      to: awayMidfielders[i + 1].id,
      team: 'away'
    });
  }
  
  // Forward line
  for (let i = 0; i < awayForwards.length - 1; i++) {
    lines.push({
      from: awayForwards[i].id,
      to: awayForwards[i + 1].id,
      team: 'away'
    });
  }

  return lines;
};

/**
 * @component TacticalPlayerHighlighting
 * @description An overlay component that visualizes team formations by drawing markers for players
 * and lines connecting them. It uses mock data for demonstration purposes.
 * @param {TacticalPlayerHighlightingProps} props The props for the component.
 * @returns {JSX.Element | null} The rendered overlay, or null if it's not visible or dimensions are not set.
 */
export const TacticalPlayerHighlighting: React.FC<TacticalPlayerHighlightingProps> = ({
  videoDimensions,
  isVisible,
  onToggle
}) => {
  const [players, setPlayers] = useState<PlayerPosition[]>([]);
  const [formationLines, setFormationLines] = useState<FormationLine[]>([]);

  useEffect(() => {
    const mockPlayers = generateMockPlayerPositions();
    setPlayers(mockPlayers);
    setFormationLines(generateFormationLines(mockPlayers));
  }, []);

  const getPlayerById = useCallback((id: string) => {
    return players.find(p => p.id === id);
  }, [players]);

  if (!isVisible || videoDimensions.width === 0 || videoDimensions.height === 0) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      style={{ 
        width: videoDimensions.width, 
        height: videoDimensions.height 
      }}
    >
      {/* Formation Lines */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${videoDimensions.width} ${videoDimensions.height}`}
        preserveAspectRatio="none"
      >
        {formationLines.map((line, index) => {
          const fromPlayer = getPlayerById(line.from);
          const toPlayer = getPlayerById(line.to);
          
          if (!fromPlayer || !toPlayer) return null;
          
          return (
            <line
              key={`line-${index}`}
              x1={fromPlayer.x * videoDimensions.width}
              y1={fromPlayer.y * videoDimensions.height}
              x2={toPlayer.x * videoDimensions.width}
              y2={toPlayer.y * videoDimensions.height}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="2"
              strokeDasharray="none"
            />
          );
        })}
      </svg>

      {/* Player Markers */}
      {players.map((player) => {
        const isHome = player.team === 'home';
        const markerSize = 24;
        
        return (
          <div
            key={player.id}
            className="absolute flex items-center justify-center rounded-full font-bold text-sm shadow-lg border-2"
            style={{
              left: player.x * videoDimensions.width - markerSize / 2,
              top: player.y * videoDimensions.height - markerSize / 2,
              width: markerSize,
              height: markerSize,
              backgroundColor: isHome ? '#8B5CF6' : '#F59E0B', // Purple for home, Yellow for away
              borderColor: 'white',
              color: 'white',
              fontSize: '10px',
              zIndex: 20,
            }}
          >
            {player.jerseyNumber}
          </div>
        );
      })}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-4 right-4 px-3 py-2 bg-black/70 text-white rounded-lg text-sm font-medium pointer-events-auto hover:bg-black/80 transition-colors"
      >
        {isVisible ? 'Hide Formation' : 'Show Formation'}
      </button>

      {/* Legend */}
      {isVisible && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg text-xs pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>
              <span>Home Team</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
              <span>Away Team</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-300">
            Formation lines show tactical structure
          </div>
        </div>
      )}
    </div>
  );
};

export default TacticalPlayerHighlighting;
