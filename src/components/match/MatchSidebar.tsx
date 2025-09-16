
import React, { useEffect, useState, useCallback } from 'react';
import MatchTimer from '@/components/MatchTimer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatisticsDisplay from '@/components/StatisticsDisplay';
import { Statistics, Player, TimeSegmentStatistics } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * @interface MatchSidebarProps
 * @description Props for the MatchSidebar component. This component has a wide range of props to manage the state of a live match.
 * @property {number | null} [dbTimerValue] - The current timer value from the database.
 * @property {string | null} [timerStatus] - The status of the timer from the database (e.g., 'running', 'paused').
 * @property {string | null} [timerLastStartedAt] - The ISO timestamp of when the timer was last started.
 * @property {boolean} isRunning - Legacy prop indicating if the timer is running.
 * @property {number} [elapsedTime] - Legacy prop for the elapsed time.
 * @property {(time: number) => void} [setElapsedTime] - Legacy prop to set the elapsed time.
 * @property {'piano' | 'tracking'} mode - The current tracking mode.
 * @property {Player | null} selectedPlayer - The currently selected player.
 * @property {(player: any) => void} onPlayerSelect - Callback function to handle player selection.
 * @property {any[]} ballTrackingPoints - An array of coordinates representing the ball's movement.
 * @property {(coordinates: { x: number; y: number; }) => void} [trackBallMovement] - Callback to track ball movement.
 * @property {{ name: string; players: Player[]; formation: string; }} homeTeam - Data for the home team.
 * @property {{ name: string; players: Player[]; formation: string; }} awayTeam - Data for the away team.
 * @property {Statistics} statistics - The current match statistics.
 * @property {(stats: Statistics) => void} [updateStatistics] - Callback to update the match statistics.
 * @property {(segments: TimeSegmentStatistics[]) => void} [setTimeSegments] - Callback to set the calculated time segments.
 * @property {() => TimeSegmentStatistics[]} [calculateTimeSegments] - Function to calculate time segment statistics.
 * @property {boolean} isPassTrackingModeActive - Flag indicating if pass tracking mode is active.
 * @property {() => void} togglePassTrackingMode - Callback to toggle pass tracking mode.
 * @property {string} [activeTab] - The currently active tab in a parent component.
 * @property {(tab: string) => void} [setActiveTab] - Callback to set the active tab.
 * @property {any} [teamPositions] - The current positions of the teams.
 * @property {(positions: any) => void} [setTeamPositions] - Callback to set team positions.
 * @property {any} [potentialPasser] - The potential passer in pass tracking mode.
 * @property {any} [ballPathHistory] - The history of the ball's path.
 * @property {() => void} [toggleBallTrackingMode] - Callback to toggle ball tracking mode.
 */
interface MatchSidebarProps {
  // Props for DB-driven timer
  dbTimerValue?: number | null;
  timerStatus?: string | null;
  timerLastStartedAt?: string | null;

  // Legacy timer props - keeping for backward compatibility
  isRunning: boolean;
  elapsedTime?: number;
  setElapsedTime?: (time: number) => void;

  mode: 'piano' | 'tracking';
  selectedPlayer: Player | null;
  onPlayerSelect: (player: any) => void;
  ballTrackingPoints: any[];
  trackBallMovement?: (coordinates: {
    x: number;
    y: number;
  }) => void;
  homeTeam: {
    name: string;
    players: Player[];
    formation: string;
  };
  awayTeam: {
    name: string;
    players: Player[];
    formation: string;
  };
  statistics: Statistics;
  updateStatistics?: (stats: Statistics) => void;
  setTimeSegments?: (segments: TimeSegmentStatistics[]) => void;
  calculateTimeSegments?: () => TimeSegmentStatistics[];
  isPassTrackingModeActive: boolean;
  togglePassTrackingMode: () => void;
  // Additional props
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  teamPositions?: any;
  setTeamPositions?: (positions: any) => void;
  potentialPasser?: any;
  ballPathHistory?: any;
  toggleBallTrackingMode?: () => void;
}

/**
 * @component MatchSidebar
 * @description A sidebar component for the main match interface. It displays the match timer, provides tracking controls,
 * and shows team summaries and statistics. It features a responsive design, collapsing into an accordion on mobile devices.
 * @param {MatchSidebarProps} props The props for the component.
 * @returns {JSX.Element} The rendered MatchSidebar component.
 */
const MatchSidebar: React.FC<MatchSidebarProps> = ({
  dbTimerValue,
  timerStatus,
  timerLastStartedAt,
  isRunning,
  elapsedTime,
  setElapsedTime,
  mode,
  selectedPlayer,
  onPlayerSelect,
  ballTrackingPoints,
  trackBallMovement,
  homeTeam,
  awayTeam,
  statistics,
  updateStatistics,
  setTimeSegments,
  calculateTimeSegments,
  isPassTrackingModeActive,
  togglePassTrackingMode,
  activeTab,
  setActiveTab,
  teamPositions,
  setTeamPositions,
  potentialPasser,
  ballPathHistory,
  toggleBallTrackingMode
}) => {
  const { toast } = useToast();
  const [hasCalculatedSegments, setHasCalculatedSegments] = useState(false);
  const isMobile = useIsMobile();
  
  const handleCalculateTimeSegments = useCallback(() => {
    if (calculateTimeSegments && setTimeSegments) {
      const segments = calculateTimeSegments();
      setTimeSegments(segments);
      setHasCalculatedSegments(true);
      toast({
        title: "Time Segments Calculated",
        description: `Analysis complete for ${segments.length} time segments`
      });
    }
  }, [calculateTimeSegments, setTimeSegments, toast]);
  
  const handleVideoAnalysis = (videoStats: Statistics) => {
    if (updateStatistics) {
      console.log("Video analysis complete, updating statistics:", videoStats);
      updateStatistics(videoStats);
      toast({
        title: "Statistics Updated",
        description: "Match statistics have been updated from video analysis"
      });
    } else {
      console.warn("Cannot update statistics: updateStatistics function not provided");
    }
  };

  useEffect(() => {
    if (!hasCalculatedSegments && ballTrackingPoints.length > 50 && calculateTimeSegments && setTimeSegments) {
      handleCalculateTimeSegments();
    }
  }, [ballTrackingPoints, hasCalculatedSegments, calculateTimeSegments, setTimeSegments, handleCalculateTimeSegments]);
  
  return (
    <div className="space-y-2 sm:space-y-4">
      <Card className="p-3 sm:p-4 bg-white shadow-md">
        <MatchTimer 
          dbTimerValue={dbTimerValue}
          timerStatus={timerStatus}
          timerLastStartedAt={timerLastStartedAt}
        />
      </Card>

      <Card className="p-3 sm:p-4 bg-white shadow-md">
        <h3 className="font-semibold mb-2 text-xs sm:text-sm">Controls</h3>
        <Button 
          onClick={togglePassTrackingMode} 
          variant={isPassTrackingModeActive ? "default" : "outline"}
          className="w-full text-xs sm:text-sm py-2"
          size={isMobile ? "sm" : "default"}
        >
          {isPassTrackingModeActive ? "Pass Mode: ON" : "Pass Mode: OFF"}
        </Button>
      </Card>
      
      <Accordion type="single" collapsible defaultValue="actions" className="xl:hidden">
        <AccordionItem value="teams">
          <AccordionTrigger className="text-sm">Team Summary</AccordionTrigger>
          <AccordionContent>
            <Card className="p-3 sm:p-4 bg-white shadow-md">
              <h3 className="font-semibold mb-2 text-sm">Team Summary</h3>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <div className="text-xs sm:text-sm font-medium truncate">Home: {homeTeam.name}</div>
                  <div className="text-xs text-muted-foreground">Formation: {homeTeam.formation}</div>
                  <div className="text-xs text-muted-foreground">Players: {homeTeam.players.length}</div>
                </div>
                
                <div>
                  <div className="text-xs sm:text-sm font-medium truncate">Away: {awayTeam.name}</div>
                  <div className="text-xs text-muted-foreground">Formation: {awayTeam.formation}</div>
                  <div className="text-xs text-muted-foreground">Players: {awayTeam.players.length}</div>
                </div>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="stats">
          <AccordionTrigger className="text-sm">Match Statistics</AccordionTrigger>
          <AccordionContent>
            <StatisticsDisplay statistics={statistics} homeTeamName={homeTeam.name} awayTeamName={awayTeam.name} />
          </AccordionContent>
        </AccordionItem>
        
        {ballTrackingPoints.length > 20 && (
          <AccordionItem value="analysis">
            <AccordionTrigger className="text-sm">Time Analysis</AccordionTrigger>
            <AccordionContent>
              <Card className="p-3 sm:p-4 bg-white shadow-md">
                <div className="text-xs sm:text-sm">
                  <p className="mb-2">Time segment analysis helps visualize statistics over 5-minute intervals.</p>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <Button 
                      onClick={handleCalculateTimeSegments} 
                      className="text-xs sm:text-sm" 
                      size={isMobile ? "sm" : "default"}
                      disabled={!calculateTimeSegments || ballTrackingPoints.length < 20}
                    >
                      Calculate Segments
                    </Button>
                    <Link to="/stats">
                      <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-1 text-xs sm:text-sm">
                        View Stats
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
      
      {/* Desktop version */}
      <div className="hidden xl:block">
        <Card className="p-4 bg-white shadow-md mb-4">
          <h3 className="font-semibold mb-2">Team Summary</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Home Team: {homeTeam.name}</div>
              <div className="text-xs text-muted-foreground">Formation: {homeTeam.formation}</div>
              <div className="text-xs text-muted-foreground">Players: {homeTeam.players.length}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Away Team: {awayTeam.name}</div>
              <div className="text-xs text-muted-foreground">Formation: {awayTeam.formation}</div>
              <div className="text-xs text-muted-foreground">Players: {awayTeam.players.length}</div>
            </div>
          </div>
        </Card>
        
        <StatisticsDisplay statistics={statistics} homeTeamName={homeTeam.name} awayTeamName={awayTeam.name} />
        
        {ballTrackingPoints.length > 20 && (
          <Card className="p-4 bg-white shadow-md mt-4">
            <h3 className="font-semibold mb-2">Time Segment Analysis</h3>
            <div className="text-sm mb-4">
              <p>Calculate detailed time segment statistics for visualization.</p>
            </div>
            <div className="flex justify-between">
              <Button 
                onClick={handleCalculateTimeSegments} 
                size="sm" 
                disabled={!calculateTimeSegments || ballTrackingPoints.length < 20}
              >
                Calculate Segments
              </Button>
              <Link to="/stats">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  View Stats
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MatchSidebar;
