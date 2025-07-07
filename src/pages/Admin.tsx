
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import admin components
import UserManagement from '@/components/admin/UserManagement';
import MatchManagement from '@/components/admin/MatchManagement';
import AccessManagement from '@/components/admin/AccessManagement';
import TrackerAbsenceManager from '@/components/admin/TrackerAbsenceManager';
import TrackerBatteryMonitor from '@/components/admin/TrackerBatteryMonitor';
import AuditLogs from '@/components/admin/AuditLogs';
import { TrackerConnectionMonitor } from '@/components/admin/TrackerConnectionMonitor';
import VideoMatchSetup from '@/components/admin/VideoMatchSetup';
import TrackerNotificationSystem from '@/components/admin/TrackerNotificationSystem';
import VoiceCollaborationManager from '@/components/admin/VoiceCollaborationManager';
import MockDataGenerator from '@/components/admin/MockDataGenerator';
import EventAssignments from '@/components/admin/EventAssignments';
import PlayerAssignments from '@/components/admin/PlayerAssignments';
import SpecializedTrackerAssignment from '@/components/admin/SpecializedTrackerAssignment';
import MatchTrackingMatrix from '@/components/admin/MatchTrackingMatrix';
import RealTimeMatchEvents from '@/components/admin/RealTimeMatchEvents';
import AbsenceSummaryDashboard from '@/components/admin/AbsenceSummaryDashboard';
import QuickPlanningActions from '@/components/admin/QuickPlanningActions';

const Admin: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    activeTrackers: 0,
    pendingNotifications: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (userRole !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    fetchLiveMatches();
    fetchSystemStats();
  }, [user, userRole, navigate]);

  const fetchLiveMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'live');

      if (error) throw error;
      setLiveMatches(data || []);
    } catch (error: any) {
      console.error('Error fetching live matches:', error);
      toast.error('Failed to fetch live matches');
    }
  };

  const fetchSystemStats = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total matches
      const { count: matchCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      // Fetch active trackers
      const { count: trackerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'tracker');

      // Fetch pending notifications
      const { count: notificationCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      setSystemStats({
        totalUsers: userCount || 0,
        totalMatches: matchCount || 0,
        activeTrackers: trackerCount || 0,
        pendingNotifications: notificationCount || 0
      });
    } catch (error: any) {
      console.error('Error fetching system stats:', error);
    }
  };

  if (!user || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive system management and monitoring</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trackers">Trackers</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              {/* System Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.totalMatches}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Trackers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.activeTrackers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.pendingNotifications}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Matches Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Live Matches
                    <Badge variant="outline">{liveMatches.length} Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {liveMatches.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No live matches currently</p>
                  ) : (
                    <div className="space-y-4">
                      {liveMatches.map((match) => (
                        <Card key={match.id} className="border-l-4 border-green-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">
                                  {match.home_team_name} vs {match.away_team_name}
                                </h3>
                                <p className="text-sm text-gray-600">Match ID: {match.id}</p>
                              </div>
                              <Badge className="bg-green-500">LIVE</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuickPlanningActions />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matches">
            <MatchManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="trackers">
            <div className="space-y-6">
              <TrackerBatteryMonitor />
              {liveMatches.length > 0 ? (
                liveMatches.map((match) => (
                  <div key={match.id} className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Match: {match.home_team_name} vs {match.away_team_name}
                          <Badge className="bg-green-500">LIVE</Badge>
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <TrackerAbsenceManager matchId={match.id} />
                  </div>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No live matches currently. Tracker monitoring requires an active match.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="space-y-6">
              <SpecializedTrackerAssignment />
              <MatchTrackingMatrix />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EventAssignments />
                <PlayerAssignments />
              </div>
              <AbsenceSummaryDashboard />
            </div>
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="space-y-6">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Real-Time Match Events
                      <Badge variant="outline">{liveMatches.length} Active Matches</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RealTimeMatchEvents />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Tracker Connection Status
                      <Badge variant="outline">{liveMatches.length} Active</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {liveMatches.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No live matches currently</p>
                    ) : (
                      <div className="space-y-4">
                        {liveMatches.map((match) => (
                          <div key={match.id} className="space-y-2">
                            <h4 className="font-medium">
                              {match.home_team_name} vs {match.away_team_name}
                            </h4>
                            <TrackerConnectionMonitor matchId={match.id} />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <TrackerNotificationSystem />
          </TabsContent>

          <TabsContent value="video">
            <VideoMatchSetup />
          </TabsContent>

          <TabsContent value="voice">
            <VoiceCollaborationManager />
          </TabsContent>

          <TabsContent value="access">
            <AccessManagement />
          </TabsContent>

          <TabsContent value="tools">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Development Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <MockDataGenerator />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <AuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
