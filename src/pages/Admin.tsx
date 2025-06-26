
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

const Admin: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matches');
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

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
          <p className="text-gray-600">Manage users, matches, and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trackers">Trackers</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <MatchManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="trackers">
            <div className="space-y-6">
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
              <TrackerBatteryMonitor />
            </div>
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="space-y-6">
              <div className="grid gap-4">
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
                              <div className="mt-4">
                                <TrackerConnectionMonitor matchId={match.id} />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="access">
            <AccessManagement />
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
