import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, FileText, Users, TrendingUp, Globe, BarChart3 } from 'lucide-react';
import { ScoutingLayout } from '@/components/scouting/ScoutingLayout';
import { ScoutingDashboard } from '@/components/scouting/ScoutingDashboard';
import PlayerIdentification from '@/components/scouting/PlayerIdentification';
import OppositionAnalysis from '@/components/scouting/OppositionAnalysis';
import YouthDevelopment from '@/components/scouting/YouthDevelopment';
import MarketIntelligence from '@/components/scouting/MarketIntelligence';
import PerformanceAnalysis from '@/components/scouting/PerformanceAnalysis';
import PlayerScoutReport from '@/components/scouting/PlayerScoutReport';
import AlgerianClubs from '@/components/scouting/AlgerianClubs';

const ScoutingV2 = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const scoutingModules = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
      component: ScoutingDashboard
    },
    {
      id: 'player-identification',
      title: 'Players',
      icon: Eye,
      component: PlayerIdentification
    },
    {
      id: 'scout-reports',
      title: 'Reports',
      icon: FileText,
      component: PlayerScoutReport
    },
    {
      id: 'opposition-analysis',
      title: 'Opposition',
      icon: TrendingUp,
      component: OppositionAnalysis
    },
    {
      id: 'youth-development',
      title: 'Youth',
      icon: Users,
      component: YouthDevelopment
    },
    {
      id: 'market-intelligence',
      title: 'Market',
      icon: TrendingUp,
      component: MarketIntelligence
    },
    {
      id: 'performance-analysis',
      title: 'Performance',
      icon: BarChart3,
      component: PerformanceAnalysis
    },
    {
      id: 'algerian-clubs',
      title: 'Algerian Clubs',
      icon: Globe,
      component: AlgerianClubs
    }
  ];

  const ActiveComponent = scoutingModules.find(m => m.id === activeTab)?.component || ScoutingDashboard;

  return (
    <ScoutingLayout
      title="Football Scouting System"
      description="Comprehensive talent identification and analysis platform"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-auto w-full max-w-full overflow-x-auto bg-muted p-1 rounded-lg">
          {scoutingModules.map((module) => {
            const Icon = module.icon;
            return (
              <TabsTrigger
                key={module.id}
                value={module.id}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <Icon className="w-4 h-4" />
                <span>{module.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="min-h-[600px] animate-fade-in">
          <ActiveComponent />
        </div>
      </Tabs>
    </ScoutingLayout>
  );
};

export default ScoutingV2;
