import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, FileText, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from './shared/StatCard';
import { ReportCard } from './shared/ReportCard';

interface DashboardStats {
  totalPlayers: number;
  activeReports: number;
  youthProspects: number;
  oppositionAnalyses: number;
  recentActivity: any[];
  recommendations: any[];
}

export const ScoutingDashboard = () => {
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

      const { data: recentReports } = await supabase
        .from('scout_reports')
        .select(`
          id,
          performance_rating,
          recommendation,
          report_date,
          match_context,
          strengths,
          weaknesses,
          detailed_notes,
          player_id,
          scouted_players(name, position, current_club)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      setStats({
        totalPlayers: playersResult.count || 0,
        activeReports: reportsResult.count || 0,
        youthProspects: youthResult.count || 0,
        oppositionAnalyses: oppositionResult.count || 0,
        recentActivity: recentReports || [],
        recommendations: recentReports?.filter(r => r.recommendation === 'sign').slice(0, 3) || []
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
    <div className="space-y-8 animate-fade-in">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Scouted Players"
          value={stats.totalPlayers}
          description="Total players in database"
          icon={Eye}
        />
        <StatCard
          title="Scout Reports"
          value={stats.activeReports}
          description="Reports completed"
          icon={FileText}
        />
        <StatCard
          title="Youth Prospects"
          value={stats.youthProspects}
          description="Young players tracked"
          icon={Users}
        />
        <StatCard
          title="Opposition Analysis"
          value={stats.oppositionAnalyses}
          description="Teams analyzed"
          icon={TrendingUp}
        />
      </div>

      {/* Recent Reports & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Recent Scout Reports</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {stats.recentActivity.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No recent reports</p>
                </CardContent>
              </Card>
            ) : (
              stats.recentActivity.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            )}
          </div>
        </div>

        {/* Recommendations Sidebar */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Top Recommendations</h2>
          <div className="space-y-4">
            {stats.recommendations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">No current recommendations</p>
                </CardContent>
              </Card>
            ) : (
              stats.recommendations.map((rec) => (
                <Card key={rec.id} className="border-success/50 bg-success/5">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {rec.scouted_players?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {rec.scouted_players?.position}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-success">
                          {rec.performance_rating}/10
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Coverage Map */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Scouting Coverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Europe', 'South America', 'Africa'].map((region) => (
                <div key={region} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{region}</span>
                    <span className="text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
