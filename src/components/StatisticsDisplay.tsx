import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Statistics } from '@/types';
import { Target, TrendingUp, Shield, Activity, Zap, Award } from 'lucide-react';

interface StatisticsDisplayProps {
  statistics: Statistics;
  homeTeamName: string;
  awayTeamName: string;
}

interface StatRowProps {
  label: string;
  homeValue: number | string;
  awayValue: number | string;
  isPercentage?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, homeValue, awayValue, isPercentage }) => {
  const homeNumeric = typeof homeValue === 'string' ? parseFloat(homeValue.split('/')[0]) : homeValue;
  const awayNumeric = typeof awayValue === 'string' ? parseFloat(awayValue.split('/')[0]) : awayValue;

  const total = homeNumeric + awayNumeric;
  const homePercentage = total > 0 ? (homeNumeric / total) * 100 : 50;
  
  const isHomeBetter = homeNumeric > awayNumeric;
  const isAwayBetter = awayNumeric > homeNumeric;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className={`font-medium w-1/4 text-left ${isHomeBetter ? 'text-primary' : 'text-muted-foreground'}`}>
          {homeValue}{isPercentage ? '%' : ''}
        </span>
        <span className="text-xs text-muted-foreground font-medium w-1/2 text-center">{label}</span>
        <span className={`font-medium w-1/4 text-right ${isAwayBetter ? 'text-primary' : 'text-muted-foreground'}`}>
          {awayValue}{isPercentage ? '%' : ''}
        </span>
      </div>
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
          style={{ width: `${homePercentage}%` }}
        />
        <div 
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-600 transition-all duration-500"
          style={{ width: `${100 - homePercentage}%` }}
        />
      </div>
    </div>
  );
};

const StatSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ 
  title, 
  icon, 
  children 
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-border">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-base">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({
  statistics,
  homeTeamName,
  awayTeamName,
}) => {
  const { home, away } = statistics;

  const getPassAccuracy = (completed: number, attempted: number) => {
    if (!attempted) return 0;
    return Math.round((completed / attempted) * 100);
  };

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Match Statistics</CardTitle>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
              <span className="font-medium">{homeTeamName}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
              <span className="font-medium">{awayTeamName}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Possession */}
        <StatSection title="Possession" icon={<Activity className="w-4 h-4" />}>
          <StatRow 
            label="Ball Possession"
            homeValue={Math.round(home?.possessionPercentage || 0)}
            awayValue={Math.round(away?.possessionPercentage || 0)}
            isPercentage
          />
          <StatRow 
            label="Touches"
            homeValue={home?.contacts || 0}
            awayValue={away?.contacts || 0}
          />
        </StatSection>

        {/* Attack */}
        <StatSection title="Attack" icon={<Target className="w-4 h-4" />}>
          <StatRow 
            label="Shots"
            homeValue={home?.shots || 0}
            awayValue={away?.shots || 0}
          />
          <StatRow 
            label="Shots on Target"
            homeValue={`${home?.shotsOnTarget || 0}/${home?.shots || 0}`}
            awayValue={`${away?.shotsOnTarget || 0}/${away?.shots || 0}`}
          />
          <StatRow 
            label="Goals"
            homeValue={home?.goals || 0}
            awayValue={away?.goals || 0}
          />
          <StatRow 
            label="Expected Goals (xG)"
            homeValue={parseFloat((home?.totalXg || 0).toFixed(2))}
            awayValue={parseFloat((away?.totalXg || 0).toFixed(2))}
          />
          <StatRow 
            label="Successful Dribbles"
            homeValue={home?.successfulDribbles || 0}
            awayValue={away?.successfulDribbles || 0}
          />
        </StatSection>

        {/* Passing */}
        <StatSection title="Passing" icon={<TrendingUp className="w-4 h-4" />}>
          <StatRow 
            label="Total Passes"
            homeValue={`${home?.passesCompleted || 0}/${home?.passesAttempted || 0}`}
            awayValue={`${away?.passesCompleted || 0}/${away?.passesAttempted || 0}`}
          />
          <StatRow 
            label="Pass Accuracy"
            homeValue={getPassAccuracy(home?.passesCompleted || 0, home?.passesAttempted || 0)}
            awayValue={getPassAccuracy(away?.passesCompleted || 0, away?.passesAttempted || 0)}
            isPercentage
          />
           <StatRow
            label="Forward Passes"
            homeValue={home?.forwardPasses || 0}
            awayValue={away?.forwardPasses || 0}
          />
          <StatRow 
            label="Long Passes"
            homeValue={home?.longPasses || 0}
            awayValue={away?.longPasses || 0}
          />
           <StatRow
            label="Decisive Passes"
            homeValue={home?.decisivePasses || 0}
            awayValue={away?.decisivePasses || 0}
          />
          <StatRow 
            label="Successful Crosses"
            homeValue={`${home?.successfulCrosses || 0}/${home?.crosses || 0}`}
            awayValue={`${away?.successfulCrosses || 0}/${away?.crosses || 0}`}
          />
        </StatSection>

        {/* Defense */}
        <StatSection title="Defense" icon={<Shield className="w-4 h-4" />}>
          <StatRow 
            label="Tackles"
            homeValue={home?.tackles || 0}
            awayValue={away?.tackles || 0}
          />
          <StatRow 
            label="Interceptions"
            homeValue={home?.interceptions || 0}
            awayValue={away?.interceptions || 0}
          />
          <StatRow 
            label="Clearances"
            homeValue={home?.clearances || 0}
            awayValue={away?.clearances || 0}
          />
          <StatRow 
            label="Blocks"
            homeValue={home?.blocks || 0}
            awayValue={away?.blocks || 0}
          />
        </StatSection>

        {/* Duels */}
        <StatSection title="Duels" icon={<Zap className="w-4 h-4" />}>
          <StatRow 
            label="Duels Won"
            homeValue={home?.duelsWon || 0}
            awayValue={away?.duelsWon || 0}
          />
          <StatRow 
            label="Aerial Duels Won"
            homeValue={home?.aerialDuelsWon || 0}
            awayValue={away?.aerialDuelsWon || 0}
          />
          <StatRow 
            label="Ball Recoveries"
            homeValue={home?.ballsRecovered || 0}
            awayValue={away?.ballsRecovered || 0}
          />
           <StatRow
            label="Balls Lost"
            homeValue={home?.ballsLost || 0}
            awayValue={away?.ballsLost || 0}
          />
        </StatSection>

        {/* Discipline */}
        <StatSection title="Discipline" icon={<Award className="w-4 h-4" />}>
          <StatRow 
            label="Fouls Committed"
            homeValue={home?.foulsCommitted || 0}
            awayValue={away?.foulsCommitted || 0}
          />
          <StatRow 
            label="Yellow Cards"
            homeValue={home?.yellowCards || 0}
            awayValue={away?.yellowCards || 0}
          />
          <StatRow 
            label="Red Cards"
            homeValue={home?.redCards || 0}
            awayValue={away?.redCards || 0}
          />
          <StatRow 
            label="Corners"
            homeValue={home?.corners || 0}
            awayValue={away?.corners || 0}
          />
          <StatRow 
            label="Offsides"
            homeValue={home?.offsides || 0}
            awayValue={away?.offsides || 0}
          />
        </StatSection>
      </CardContent>
    </Card>
  );
};

export default StatisticsDisplay;