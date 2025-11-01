import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, TrendingUp, Users, Activity, Target, BarChart3, PieChart, Share2, ShieldCheck,
  LayoutDashboard, ListChecks, Clock, Grid, Crosshair, BarChartBig, Zap
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppSidebar } from '@/components/AppSidebar';
import BallFlowVisualization from '@/components/visualizations/BallFlowVisualization';
import MatchRadarChart from '@/components/visualizations/MatchRadarChart';
import TeamPerformanceRadar from '@/components/analytics/TeamPerformanceRadar';
import AdvancedStatsTable from '@/components/analytics/AdvancedStatsTable';
import PlayerPerformanceChart from '@/components/analytics/PlayerPerformanceChart';
import EventTimelineChart from '@/components/analytics/EventTimelineChart';
import MatchHeatMap from '@/components/analytics/MatchHeatMap';
import StatisticsDisplay from '@/components/StatisticsDisplay';
import DetailedStatsTable from '@/components/DetailedStatsTable';
import PassMatrixTable from '@/components/analytics/PassMatrixTable';
import ShotMap from '@/components/analytics/ShotMap';
import PassingNetworkMap from '@/components/analytics/PassingNetworkMap';
import EnhancedShotMap from '@/components/analytics/EnhancedShotMap';
import EnhancedPassingNetwork from '@/components/analytics/EnhancedPassingNetwork';
import EnhancedBallFlow from '@/components/analytics/EnhancedBallFlow';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import TeamComparisonCharts from '@/components/analytics/TeamComparisonCharts';
import InteractiveMetricsGrid from '@/components/analytics/InteractiveMetricsGrid';
import RealTimeStatsWidget from '@/components/analytics/RealTimeStatsWidget';
import {
  PerformanceDifferenceAnalysis,
  AdvancedEfficiencyRatioCharts,
  PerformanceComparisonGraphs,
  EfficiencyMetricsRatios,
  TargetOffTargetComparison,
  ShootingAccuracyCharts,
  ShotDistributionAnalysis,
  DuelSuccessRateCharts,
  PassDirectionAnalysis,
  ActionEffectivenessMetrics,
  IndividualPlayerCharts,
  PlayerBallHandlingStats,
  PlayerPassingStatsTable,
  PlayerBallLossRatioTable,
  PlayerBallRecoveryStats,
  BallControlTimelineChart,
  CumulativeBallControlChart,
  RecoveryTimelineChart,
  PossessionTimelineChart,
  CumulativePossessionChart
} from '@/components/analytics';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Statistics as StatisticsType, MatchEvent, PlayerStatistics, EventType, Player, Team, TeamDetailedStats, PlayerStatSummary } from '@/types/index';
import { aggregateMatchEvents, AggregatedStats } from '@/lib/analytics/eventAggregator';
import { segmentEventsByTime } from '@/lib/analytics/timeSegmenter';
import { aggregateStatsForSegments } from '@/lib/analytics/timeSegmentedStatsAggregator';

const UnifiedAnalytics = () => {
  const navigate = useNavigate();
  const { matchId: urlMatchId } = useParams();
  const { toast } = useToast();
  
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>(urlMatchId || '');
  const [selectedMatchFullData, setSelectedMatchFullData] = useState<any>(null);
  const [statistics, setStatistics] = useState<StatisticsType | null>(null);
  const [ballData, setBallData] = useState<any[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [allPlayersForMatch, setAllPlayersForMatch] = useState<Player[]>([]);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Player[]>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Player[]>([]);
  const [selectedPlayerForChart, setSelectedPlayerForChart] = useState<string | number | null>(null);

  const [statsSegments, setStatsSegments] = useState<AggregatedStats[] | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<number>(15);
  const [matchDuration, setMatchDuration] = useState<number>(90);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchMatchData(selectedMatch);
    }
  }, [selectedMatch, selectedInterval, matchDuration]);

  const handleIntervalChange = (value: string) => {
    setSelectedInterval(Number(value));
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, name, home_team_name, away_team_name, match_date, status')
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
      
      if (data && data.length > 0 && !selectedMatch) {
        setSelectedMatch(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchData = async (matchId: string) => {
    try {
      setLoading(true);
      
      const { data: matchDetailData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;
      setSelectedMatchFullData(matchDetailData);

      const { data: eventsData, error: eventsError } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', matchId)
        .order('timestamp', { ascending: true });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        setEvents([]);
      } else {
        const parsePlayerData = (data: any): Player[] => {
          if (typeof data === 'string') {
            try {
              return JSON.parse(data);
            } catch {
              return [];
            }
          }
          return Array.isArray(data) ? data : [];
        };

        const homePlayersList: Player[] = parsePlayerData(matchDetailData.home_team_players);
        const awayPlayersList: Player[] = parsePlayerData(matchDetailData.away_team_players);
        const allPlayers = [...homePlayersList, ...awayPlayersList];
        
        setAllPlayersForMatch(allPlayers);
        setHomeTeamPlayers(homePlayersList);
        setAwayTeamPlayers(awayPlayersList);

        const formattedEvents: MatchEvent[] = (eventsData || []).map(event => {
          let coordinates = { x: 0, y: 0 };
          if (event.coordinates) {
            try {
              if (typeof event.coordinates === 'string') {
                coordinates = JSON.parse(event.coordinates);
              } else if (typeof event.coordinates === 'object' && event.coordinates !== null) {
                coordinates = event.coordinates as { x: number; y: number };
              }
            } catch (e) {
              console.warn('Failed to parse coordinates:', event.coordinates);
            }
          }
          if (!coordinates.x) coordinates.x = 0;
          if (!coordinates.y) coordinates.y = 0;

          const eventData = (event as any).event_data || {};

          return {
            id: event.id,
            match_id: event.match_id,
            timestamp: event.timestamp || 0,
            type: event.event_type as EventType,
            event_data: eventData,
            created_at: event.created_at,
            tracker_id: null,
            team_id: null,
            player_id: event.player_id,
            team: event.team === 'home' || event.team === 'away' ? event.team : undefined,
            coordinates,
            created_by: event.created_by,
            player: allPlayers.find((p: Player) => String(p.id) === String(event.player_id) || p.jersey_number === event.player_id)
          };
        });
        setEvents(formattedEvents);

        const aggregatedData: AggregatedStats = aggregateMatchEvents(formattedEvents, homePlayersList, awayPlayersList);

        setStatistics({
            home: aggregatedData.homeTeamStats,
            away: aggregatedData.awayTeamStats,
        });

        setPlayerStats(aggregatedData.playerStats);

        if (aggregatedData.playerStats && aggregatedData.playerStats.length > 0) {
            setSelectedPlayerForChart(aggregatedData.playerStats[0].playerId);
        } else {
            setSelectedPlayerForChart(null);
        }

        if (formattedEvents.length > 0 && homePlayersList.length > 0 && awayPlayersList.length > 0) {
          const segmentedMatchEvents = segmentEventsByTime(formattedEvents, selectedInterval, matchDuration);
          const aggregatedSegmentStats = aggregateStatsForSegments(segmentedMatchEvents, homePlayersList, awayPlayersList);
          setStatsSegments(aggregatedSegmentStats);
        } else {
          setStatsSegments(null);
        }
      }

      if (matchDetailData?.ball_tracking_data) {
        const ballTrackingArray = Array.isArray(matchDetailData.ball_tracking_data)
          ? matchDetailData.ball_tracking_data
          : [];
        const ballDataFiltered = ballTrackingArray.filter((point: any) => 
          point && typeof point.x === 'number' && typeof point.y === 'number' &&
          !isNaN(point.x) && !isNaN(point.y)
        );
        setBallData(ballDataFiltered);
      } else {
        setBallData([]);
      }

    } catch (error) {
      console.error('Error fetching match data:', error);
      toast({
        title: "Error",
        description: "Failed to load match data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedMatchInfo = matches.find(m => m.id === selectedMatch);
  const topPerformer = playerStats.length > 0 ? playerStats[0] : null;

  const renderView = () => {
    if (!statistics || !selectedMatchFullData) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Please select a match to view analytics.</p>
          </CardContent>
        </Card>
      );
    }

    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StatisticsDisplay
                  statistics={statistics}
                  homeTeamName={selectedMatchFullData.home_team_name}
                  awayTeamName={selectedMatchFullData.away_team_name}
                />
              </div>
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Match Vitals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RealTimeStatsWidget
                    statistics={statistics}
                    events={events}
                    homeTeamName={selectedMatchFullData.home_team_name}
                    awayTeamName={selectedMatchFullData.away_team_name}
                    isLive={selectedMatchFullData.status === 'live'}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MatchRadarChart
                statistics={statistics}
                homeTeamName={selectedMatchFullData.home_team_name}
                awayTeamName={selectedMatchFullData.away_team_name}
              />
              <EventTimelineChart
                events={events}
                homeTeamName={selectedMatchFullData.home_team_name}
                awayTeamName={selectedMatchFullData.away_team_name}
              />
            </div>
          </div>
        );

      case 'advanced':
        return (
          <AdvancedAnalyticsDashboard
            statistics={statistics}
            playerStats={playerStats}
            homeTeamName={selectedMatchFullData.home_team_name}
            awayTeamName={selectedMatchFullData.away_team_name}
          />
        );

      case 'metrics':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Interactive Metrics Analysis
              </CardTitle>
              <CardDescription>Explore detailed team performance metrics with interactive comparisons</CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveMetricsGrid
                statistics={statistics}
                homeTeamName={selectedMatchFullData.home_team_name}
                awayTeamName={selectedMatchFullData.away_team_name}
              />
            </CardContent>
          </Card>
        );

      case 'detailed':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Detailed Match Statistics
              </CardTitle>
              <CardDescription>Comprehensive breakdown of match statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <DetailedStatsTable
                statistics={statistics}
                homeTeamName={selectedMatchFullData.home_team_name}
                awayTeamName={selectedMatchFullData.away_team_name}
              />
            </CardContent>
          </Card>
        );

      case 'teamAnalysis':
        return (
          <div className="space-y-6">
            <TeamComparisonCharts
              homeStats={statistics.home}
              awayStats={statistics.away}
              homeTeamName={selectedMatchFullData.home_team_name}
              awayTeamName={selectedMatchFullData.away_team_name}
            />
            <PerformanceDifferenceAnalysis
              homeStats={statistics.home}
              awayStats={statistics.away}
              homeTeamName={selectedMatchFullData.home_team_name}
              awayTeamName={selectedMatchFullData.away_team_name}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdvancedEfficiencyRatioCharts
                homeStats={statistics.home}
                awayStats={statistics.away}
                homeTeamName={selectedMatchFullData.home_team_name}
                awayTeamName={selectedMatchFullData.away_team_name}
              />
              <PerformanceComparisonGraphs
                homeStats={statistics.home}
                awayStats={statistics.away}
                homeTeamName={selectedMatchFullData.home_team_name}
                awayTeamName={selectedMatchFullData.away_team_name}
              />
            </div>
          </div>
        );

      case 'shootingActions':
        return (
          <div className="space-y-6">
            <TargetOffTargetComparison
              homeStats={statistics.home}
              awayStats={statistics.away}
              homeTeamName={selectedMatchFullData.home_team_name}
              awayTeamName={selectedMatchFullData.away_team_name}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ShootingAccuracyCharts teamStats={statistics.home} teamName={selectedMatchFullData.home_team_name} />
              <ShootingAccuracyCharts teamStats={statistics.away} teamName={selectedMatchFullData.away_team_name} />
              <ShotDistributionAnalysis teamStats={statistics.home} teamName={selectedMatchFullData.home_team_name} />
              <ShotDistributionAnalysis teamStats={statistics.away} teamName={selectedMatchFullData.away_team_name} />
            </div>
          </div>
        );

      case 'timeAnalysis':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Time-Based Analysis</CardTitle>
                <CardDescription>
                  Statistics broken down by {selectedInterval}-minute intervals over {matchDuration} minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Select Interval (minutes):</label>
                  <Select value={String(selectedInterval)} onValueChange={handleIntervalChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="45">Half-time (45 min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {statsSegments && statsSegments.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BallControlTimelineChart 
                      statsSegments={statsSegments} 
                      intervalMinutes={selectedInterval}
                      homeTeamName={selectedMatchFullData.home_team_name} 
                      awayTeamName={selectedMatchFullData.away_team_name} 
                    />
                    <PossessionTimelineChart 
                      events={events}
                      playerStats={playerStats}
                      homeTeamName={selectedMatchFullData.home_team_name} 
                      awayTeamName={selectedMatchFullData.away_team_name} 
                    />
                    <CumulativeBallControlChart 
                      statsSegments={statsSegments} 
                      intervalMinutes={selectedInterval}
                      homeTeamName={selectedMatchFullData.home_team_name} 
                      awayTeamName={selectedMatchFullData.away_team_name} 
                    />
                    <CumulativePossessionChart 
                      statsSegments={statsSegments} 
                      intervalMinutes={selectedInterval}
                      homeTeamName={selectedMatchFullData.home_team_name} 
                      awayTeamName={selectedMatchFullData.away_team_name} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'players':
        return (
          <div className="space-y-6">
            <IndividualPlayerCharts 
              playerStats={playerStats} 
              selectedPlayerId={selectedPlayerForChart} 
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlayerBallHandlingStats playerStats={playerStats} />
              <PlayerPassingStatsTable playerStats={playerStats} />
              <PlayerBallLossRatioTable playerStats={playerStats} />
              <PlayerBallRecoveryStats playerStats={playerStats} />
            </div>
          </div>
        );

      case 'passingNetwork':
        return (
          <div className="space-y-6">
            <EnhancedPassingNetwork
              playerStats={playerStats}
              homeTeamName={selectedMatchFullData.home_team_name}
              awayTeamName={selectedMatchFullData.away_team_name}
            />
          </div>
        );

      case 'passMatrix':
        return (
          <PassMatrixTable
            events={events}
            homeTeamName={selectedMatchFullData.home_team_name}
            awayTeamName={selectedMatchFullData.away_team_name}
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
          />
        );

      case 'shotmap':
        return (
          <div className="space-y-6">
            <EnhancedShotMap
              events={events}
              homeTeamName={selectedMatchFullData.home_team_name}
              awayTeamName={selectedMatchFullData.away_team_name}
            />
          </div>
        );

      case 'flow':
        return (
          <div className="space-y-6">
            <EnhancedBallFlow
              ballTrackingPoints={ballData}
              homeTeam={{
                id: selectedMatchFullData.home_team_id || 'home',
                name: selectedMatchFullData.home_team_name || 'Home',
                players: homeTeamPlayers,
                formation: '4-4-2'
              }}
              awayTeam={{
                id: selectedMatchFullData.away_team_id || 'away',
                name: selectedMatchFullData.away_team_name || 'Away',
                players: awayTeamPlayers,
                formation: '4-4-2'
              }}
            />
            <BallFlowVisualization
              ballTrackingPoints={ballData}
              homeTeam={{
                id: selectedMatchFullData.home_team_id || 'home',
                name: selectedMatchFullData.home_team_name || 'Home',
                players: homeTeamPlayers,
                formation: '4-4-2'
              }}
              awayTeam={{
                id: selectedMatchFullData.away_team_id || 'away',
                name: selectedMatchFullData.away_team_name || 'Away',
                players: awayTeamPlayers,
                formation: '4-4-2'
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Match Analytics
                  </h1>
                  <p className="text-muted-foreground">Comprehensive match statistics and insights</p>
                </div>
              </div>
              <div className="w-full sm:w-80">
                <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a match..." />
                  </SelectTrigger>
                  <SelectContent>
                    {matches.map((match) => (
                      <SelectItem key={match.id} value={match.id}>
                        {match.name || `${match.home_team_name} vs ${match.away_team_name}`}
                        {match.match_date && ` - ${new Date(match.match_date).toLocaleDateString()}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Navigation Tabs */}
            {selectedMatchFullData && (
              <Card>
                <CardContent className="pt-6">
                  <Tabs value={activeView} onValueChange={setActiveView}>
                    <TabsList className="grid w-full grid-cols-5 lg:grid-cols-11 gap-1">
                      <TabsTrigger value="overview" className="text-xs"><LayoutDashboard className="h-3 w-3 mr-1" />Overview</TabsTrigger>
                      <TabsTrigger value="advanced" className="text-xs"><Zap className="h-3 w-3 mr-1" />Advanced</TabsTrigger>
                      <TabsTrigger value="metrics" className="text-xs"><Target className="h-3 w-3 mr-1" />Metrics</TabsTrigger>
                      <TabsTrigger value="detailed" className="text-xs"><ListChecks className="h-3 w-3 mr-1" />Detailed</TabsTrigger>
                      <TabsTrigger value="teamAnalysis" className="text-xs"><ShieldCheck className="h-3 w-3 mr-1" />Teams</TabsTrigger>
                      <TabsTrigger value="shootingActions" className="text-xs"><Target className="h-3 w-3 mr-1" />Shooting</TabsTrigger>
                      <TabsTrigger value="timeAnalysis" className="text-xs"><Clock className="h-3 w-3 mr-1" />Time</TabsTrigger>
                      <TabsTrigger value="players" className="text-xs"><Users className="h-3 w-3 mr-1" />Players</TabsTrigger>
                      <TabsTrigger value="passingNetwork" className="text-xs"><Share2 className="h-3 w-3 mr-1" />Network</TabsTrigger>
                      <TabsTrigger value="passMatrix" className="text-xs"><Grid className="h-3 w-3 mr-1" />Matrix</TabsTrigger>
                      <TabsTrigger value="shotmap" className="text-xs"><Crosshair className="h-3 w-3 mr-1" />Shots</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            ) : (
              renderView()
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UnifiedAnalytics;
