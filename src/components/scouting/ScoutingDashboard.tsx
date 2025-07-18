import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, FileText, Users, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalPlayers: number;
  activeReports: number;
  youthProspects: number;
  oppositionAnalyses: number;
  recentActivity: any[];
  recommendations: any[];
}

const ScoutingDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    activeReports: 0,
    youthProspects: 0,
    oppositionAnalyses: 0,
    recentActivity: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [playersResult, reportsResult, youthResult, oppositionResult] = await Promise.all([
        supabase.from('scouted_players').select('id', { count: 'exact' }),
        supabase.from('scout_reports').select('id', { count: 'exact' }),
        supabase.from('youth_prospects').select('id', { count: 'exact' }),
        supabase.from('opposition_analysis').select('id', { count: 'exact' })
      ]);

      // Fetch recent activity
      const { data: recentReports } = await supabase
        .from('scout_reports')
        .select(`
          id,
          performance_rating,
          recommendation,
          report_date,
          scouted_players(name, position)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalPlayers: playersResult.count || 0,
        activeReports: reportsResult.count || 0,
        youthProspects: youthResult.count || 0,
        oppositionAnalyses: oppositionResult.count || 0,
        recentActivity: recentReports || [],
        recommendations: recentReports?.filter(r => r.recommendation === 'sign') || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'sign': return 'bg-green-500';
      case 'monitor': return 'bg-yellow-500';
      case 'reject': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'sign': return CheckCircle;
      case 'monitor': return Clock;
      case 'reject': return AlertCircle;
      default: return AlertCircle;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scouted Players</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">
              Total players in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scout Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReports}</div>
            <p className="text-xs text-muted-foreground">
              Reports completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Youth Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.youthProspects}</div>
            <p className="text-xs text-muted-foreground">
              Young players tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opposition Analysis</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.oppositionAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              Teams analyzed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Scout Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent reports</p>
            ) : (
              stats.recentActivity.map((report) => {
                const Icon = getRecommendationIcon(report.recommendation);
                return (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 text-white p-1 rounded-full ${getRecommendationColor(report.recommendation)}`} />
                      <div>
                        <p className="font-medium text-sm">
                          {report.scouted_players?.name || 'Unknown Player'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.scouted_players?.position} • Rating: {report.performance_rating}/10
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {report.recommendation}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Signings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recommendations.length === 0 ? (
              <p className="text-muted-foreground text-sm">No current recommendations</p>
            ) : (
              stats.recommendations.map((recommendation) => (
                <div key={recommendation.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">
                        {recommendation.scouted_players?.name || 'Unknown Player'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recommendation.scouted_players?.position} • Rating: {recommendation.performance_rating}/10
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Sign
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scouting Coverage Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Global Scouting Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Europe', 'South America', 'Africa'].map((region) => (
              <div key={region} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{region}</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">Coverage rating</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoutingDashboard;