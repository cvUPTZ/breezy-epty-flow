import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, FileText, Users, TrendingUp, Globe, BarChart3 } from 'lucide-react';
import MatchAnalysisSidebar from '@/components/match/MatchAnalysisSidebar';
// import { useMenuItems } from '@/hooks/useMenuItems';
import PlayerIdentification from '@/components/scouting/PlayerIdentification';
import OppositionAnalysis from '@/components/scouting/OppositionAnalysis';
import YouthDevelopment from '@/components/scouting/YouthDevelopment';
import MarketIntelligence from '@/components/scouting/MarketIntelligence';
import PerformanceAnalysis from '@/components/scouting/PerformanceAnalysis';
import ScoutingDashboard from '@/components/scouting/ScoutingDashboard';
import PlayerScoutReport from '@/components/scouting/PlayerScoutReport';

const Scouting: React.FC = () => {
  // const menuItems = useMenuItems();
  const menuItems: any[] = []; // Temporary placeholder
  const [activeTab, setActiveTab] = useState('dashboard');

  const scoutingModules = [
    {
      id: 'dashboard',
      title: 'Scouting Dashboard',
      description: 'Overview of all scouting activities',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      id: 'player-identification',
      title: 'Player Identification',
      description: 'Scout and evaluate potential signings',
      icon: Eye,
      color: 'bg-green-500'
    },
    {
      id: 'opposition-analysis',
      title: 'Opposition Analysis',
      description: 'Study upcoming opponents and their tactics',
      icon: FileText,
      color: 'bg-red-500'
    },
    {
      id: 'youth-development',
      title: 'Youth Development',
      description: 'Track promising young talent',
      icon: Users,
      color: 'bg-orange-500'
    },
    {
      id: 'market-intelligence',
      title: 'Market Intelligence',
      description: 'Track transfer market and player values',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      id: 'performance-analysis',
      title: 'Performance Analysis',
      description: 'Detailed statistical analysis and video breakdowns',
      icon: Globe,
      color: 'bg-indigo-500'
    },
    {
      id: 'scout-reports',
      title: 'Scout Reports',
      description: 'Create and manage detailed scout reports',
      icon: FileText,
      color: 'bg-pink-500'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ScoutingDashboard />;
      case 'player-identification':
        return <PlayerIdentification />;
      case 'opposition-analysis':
        return <OppositionAnalysis />;
      case 'youth-development':
        return <YouthDevelopment />;
      case 'market-intelligence':
        return <MarketIntelligence />;
      case 'performance-analysis':
        return <PerformanceAnalysis />;
      case 'scout-reports':
        return <PlayerScoutReport />;
      default:
        return <ScoutingDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex w-full">
        <MatchAnalysisSidebar menuItems={menuItems} groupLabel="Navigation" />
        <SidebarInset>
          <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Football Scouting System</h1>
                <p className="text-muted-foreground">Comprehensive talent identification and analysis platform</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2">
                {scoutingModules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <TabsTrigger
                      key={module.id}
                      value={module.id}
                      className="flex flex-col items-center gap-2 p-4 h-auto text-xs"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:block text-center leading-tight">
                        {module.title.split(' ').map((word, i) => (
                          <span key={i} className="block">{word}</span>
                        ))}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <div className="min-h-[600px]">
                {renderTabContent()}
              </div>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Scouting;