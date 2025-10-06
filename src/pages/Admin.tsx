import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, 
  Play, 
  Mic, 
  Calendar, 
  Replace, 
  Grid, 
  Activity, 
  Battery, 
  Database, 
  UserCheck, 
  Shield, 
  FileText, 
  BarChart3,
  LayoutDashboard,
  LogOut,
  Building2,
  Calculator,
  Video
} from 'lucide-react';

// Sidebar components
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

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
import BusinessPlanManagement from '@/components/admin/BusinessPlanManagement';
import BusinessSimulationDashboard from '@/components/admin/BusinessSimulationDashboard';
import BudgetTrackerConfig from '@/components/admin/BudgetTrackerConfig';
import LineBasedTrackerAssignment from '@/components/admin/LineBasedTrackerAssignment';
import UnifiedTrackerAssignment from '@/components/tracker/UnifiedTrackerAssignment';
import { AssignmentLogsViewer } from '@/components/admin/AssignmentLogsViewer';
import QualityControlInterface from '@/pages/QualityControlInterface'; // adjust path as needed

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'matches', label: 'Matches', icon: Play },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'planning', label: 'Planning', icon: Calendar },
  { id: 'replacement', label: 'Replacement', icon: Replace },
  { id: 'matrix', label: 'Matrix', icon: Grid },
  { id: 'events', label: 'Events', icon: Activity },
  { id: 'battery', label: 'Battery', icon: Battery },
  { id: 'mockdata', label: 'Mock Data', icon: Database },
  { id: 'players', label: 'Players', icon: UserCheck },
  { id: 'access', label: 'Access', icon: Shield },
  { id: 'assignments', label: 'Assignment Logs', icon: FileText },
  { id: 'audit', label: 'Audit', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'simulation', label: 'Business Simulation', icon: Building2 },
  { id: 'business', label: 'Business Plan', icon: Building2 },
  { id: 'budget', label: 'Budget Tracker', icon: Calculator },
  { id: 'video-analyzer', label: 'Video Analyzer', icon: Video },
    { id: 'quality', label: 'Quality Control', icon: Shield }, // Add this line

];

function AdminSidebar({ activeSection, setActiveSection }: { activeSection: string; setActiveSection: (section: string) => void }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const handleDashboard = () => {
    navigate('/');
  };

  const handleVideoAnalyzer = () => {
    navigate('/direct-analyzer');
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard Link */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleDashboard}>
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Video Analyzer Link */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleVideoAnalyzer}>
                  <Video className="h-4 w-4" />
                  <span>Video Analyzer</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Admin Sections */}
              {sidebarItems.filter(item => item.id !== 'video-analyzer').map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Logout */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const Admin: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [mockTrackers] = useState([
    { user_id: '1', email: 'tracker1@example.com', status: 'active' as const, last_activity: Date.now(), battery_level: 85 },
    { user_id: '2', email: 'tracker2@example.com', status: 'inactive' as const, last_activity: Date.now() - 300000, battery_level: 45 },
  ]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    activeTrackers: 0,
    pendingNotifications: 0
  });

  // Mock data for components that need it
  const mockPlayers = [
    { id: 1, jersey_number: 10, player_name: 'Lionel Messi', team: 'home' as const, position: 'RW' },
    { id: 2, jersey_number: 11, player_name: 'Angel Di Maria', team: 'home' as const, position: 'LW' },
    { id: 3, jersey_number: 9, player_name: 'Julián Álvarez', team: 'home' as const, position: 'ST' },
    { id: 4, jersey_number: 22, player_name: 'Lautaro Martínez', team: 'home' as const, position: 'ST' },
    { id: 5, jersey_number: 8, player_name: 'Enzo Fernández', team: 'home' as const, position: 'CM' },
  ];

  const mockAwayPlayers = [
    { id: 6, jersey_number: 10, player_name: 'Kylian Mbappé', team: 'away' as const, position: 'LW' },
    { id: 7, jersey_number: 7, player_name: 'Ousmane Dembélé', team: 'away' as const, position: 'RW' },
    { id: 8, jersey_number: 9, player_name: 'Randal Kolo Muani', team: 'away' as const, position: 'ST' },
    { id: 9, jersey_number: 6, player_name: 'Warren Zaïre-Emery', team: 'away' as const, position: 'CM' },
    { id: 10, jersey_number: 8, player_name: 'Fabián Ruiz', team: 'away' as const, position: 'CM' },
  ];

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
    fetchAllMatches();
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

  const fetchAllMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllMatches(data || []);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to fetch matches');
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

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
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
                <QuickPlanningActions matchId={allMatches[0]?.id || null} />
              </CardContent>
            </Card>
          </div>
        );

      case 'users':
        return <UserManagement />;

      case 'matches':
        return <MatchManagement />;

      case 'voice':
        return <VoiceCollaborationManager />;

      case 'planning':
        return (
          <div className="space-y-6">
            <UnifiedTrackerAssignment 
              matchId={allMatches[0]?.id || 'default-match-id'}
              homeTeamPlayers={mockPlayers}
              awayTeamPlayers={mockAwayPlayers}
            />
            <QuickPlanningActions matchId={allMatches[0]?.id || null} />
          </div>
        );

      case 'replacement':
        return (
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
                  <p className="text-gray-500">No live matches currently. Tracker replacement requires an active match.</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'matrix':
        return <MatchTrackingMatrix />;

      case 'events':
        return (
          <div className="space-y-6">
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
            <EventAssignments />
          </div>
        );

      case 'battery':
        return <TrackerBatteryMonitor />;

      case 'mockdata':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Development Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <MockDataGenerator />
            </CardContent>
          </Card>
        );

      case 'players':
        return (
          <div className="space-y-6">
            <PlayerAssignments />
            <SpecializedTrackerAssignment 
              matchId={allMatches[0]?.id || 'default-match-id'}
              homeTeamPlayers={allMatches[0]?.home_team_players?.map((p: any, index: number) => ({
                id: p.id || index + 1,
                jersey_number: p.number || p.jersey_number,
                player_name: p.name || p.player_name,
                team: 'home' as const,
                position: p.position
              })) || mockPlayers}
              awayTeamPlayers={allMatches[0]?.away_team_players?.map((p: any, index: number) => ({
                id: p.id || index + 100,
                jersey_number: p.number || p.jersey_number,
                player_name: p.name || p.player_name,
                team: 'away' as const,
                position: p.position
              })) || mockAwayPlayers}
            />
            <AbsenceSummaryDashboard 
              totalTrackers={systemStats.activeTrackers}
              activeTrackers={systemStats.activeTrackers}
              absentTrackers={0}
              averageResponseTime={2.5}
            />
          </div>
        );

      case 'access':
        return <AccessManagement />;

      case 'assignments':
        return <AssignmentLogsViewer className="h-full" />;

      case 'audit':
        return <AuditLogs />;

      case 'analytics':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Advanced analytics and reporting features will be available here.</p>
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

            <Card>
              <CardHeader>
                <CardTitle>Tracker Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <TrackerNotificationSystem 
                  trackers={mockTrackers}
                  matchId={allMatches[0]?.id || 'default-match-id'}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Video Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoMatchSetup 
                  videoUrl={videoUrl}
                  onVideoUrlChange={setVideoUrl}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'simulation':
        return <BusinessSimulationDashboard />;

      case 'business':
        return <BusinessPlanManagement />;

      case 'budget':
        return <BudgetTrackerConfig />;
 case 'quality':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Quality Control</CardTitle>
          </CardHeader>
          <CardContent>
            {allMatches.length > 0 ? (
              <QualityControlInterface />
            ) : (
              <p className="text-gray-500 text-center py-4">
                No matches available. Create a match first.
              </p>
            )}
          </CardContent>
        </Card>
      );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <SidebarInset>
          <header className="flex h-16 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="text-sm text-gray-600">
                  {sidebarItems.find(item => item.id === activeSection)?.label}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
