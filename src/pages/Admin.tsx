import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import AccessManagement from '@/components/admin/AccessManagement';
import RealTimeMatchEvents from '@/components/admin/RealTimeMatchEvents';
import UserManagement from '@/components/admin/UserManagement';
import MatchManagement from '@/components/admin/MatchManagement';
import EventAssignments from '@/components/admin/EventAssignments';
import PlayerAssignments from '@/components/admin/PlayerAssignments';
import AuditLogs from '@/components/admin/AuditLogs';
import TrackerBatteryMonitor from '@/components/admin/TrackerBatteryMonitor';
import MatchTrackingMatrix from '@/components/admin/MatchTrackingMatrix';
import MatchPlanningNetwork from '@/components/match/MatchPlanningNetwork';
import TrackerAbsenceManager from '@/components/admin/TrackerAbsenceManager';
import TrackerReplacementManager from '@/components/admin/TrackerReplacementManager';
import QuickPlanningActions from '@/components/admin/QuickPlanningActions';
import VoiceCollaborationManager from '@/components/admin/VoiceCollaborationManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertTriangle, Users, CheckCircle2, ChevronDown, Menu } from 'lucide-react';
import MockDataGenerator from '@/components/admin/MockDataGenerator';
import { Button } from '@/components/ui/button';

interface Match {
  id: string;
  name?: string | null;
  home_team_name: string;
  away_team_name: string;
  match_date?: string | null;
  status: string;
}

const Admin: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlanning, setLoadingPlanning] = useState(false);
  const [planningData, setPlanningData] = useState<any>(null);
  const [isAbsenceMonitorOpen, setIsAbsenceMonitorOpen] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (selectedMatchId) {
      fetchPlanningData();
    }
  }, [selectedMatchId]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }

      setMatches(data || []);
      if (data && data.length > 0 && !selectedMatchId) {
        setSelectedMatchId(data[0].id);
      }
    } catch (error) {
      console.error('Error in fetchMatches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanningData = async () => {
    if (!selectedMatchId) return;
    
    setLoadingPlanning(true);
    try {
      // Fetch planning data using the correct table name
      const { data, error } = await supabase
        .from('match_tracker_assignments')
        .select('*')
        .eq('match_id', selectedMatchId);

      if (error) {
        console.error('Error fetching planning data:', error);
        return;
      }

      setPlanningData(data);
    } catch (error) {
      console.error('Error in fetchPlanningData:', error);
    } finally {
      setLoadingPlanning(false);
    }
  };

  const getAssignmentStats = () => {
    if (!planningData) return { assigned: 0, unassigned: 0, total: 0 };
    
    const assigned = planningData.filter((item: any) => item.tracker_user_id).length;
    const total = planningData.length;
    const unassigned = total - assigned;
    
    return { assigned, unassigned, total };
  };

  const getTrackerStats = () => {
    if (!planningData) return { active: 0, inactive: 0, total: 0 };
    
    // This is a placeholder - adjust based on your actual tracker status logic
    const active = planningData.filter((item: any) => item.tracker_user_id).length;
    const total = planningData.length;
    const inactive = total - active;
    
    return { active, inactive, total };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-full">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage users, matches, and system settings</p>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <div className="mb-4 overflow-x-auto">
            <TabsList className={`inline-flex h-auto ${isMobile ? 'w-full flex-wrap' : 'w-auto'} bg-white border border-gray-200 rounded-lg p-1`}>
              <div className={`${isMobile ? 'grid grid-cols-2 gap-1 w-full' : 'flex flex-wrap'}`}>
                <TabsTrigger 
                  value="users" 
                  className={`${isMobile ? 'text-xs px-2 py-2 flex-1' : 'text-sm px-3 py-2'} whitespace-nowrap`}
                >
                  👥 Users
                </TabsTrigger>
                <TabsTrigger 
                  value="matches" 
                  className={`${isMobile ? 'text-xs px-2 py-2 flex-1' : 'text-sm px-3 py-2'} whitespace-nowrap`}
                >
                  ⚽ Matches
                </TabsTrigger>
                <TabsTrigger 
                  value="voice" 
                  className={`${isMobile ? 'text-xs px-2 py-2 flex-1' : 'text-sm px-3 py-2'} whitespace-nowrap bg-purple-50 border-purple-200`}
                >
                  🎤 Voice
                </TabsTrigger>
                <TabsTrigger 
                  value="planning" 
                  className={`${isMobile ? 'text-xs px-2 py-2 flex-1' : 'text-sm px-3 py-2'} whitespace-nowrap bg-blue-50 border-blue-200`}
                >
                  📋 Planning
                </TabsTrigger>
                <TabsTrigger 
                  value="replacement" 
                  className={`${isMobile ? 'text-xs px-2 py-2 flex-1' : 'text-sm px-3 py-2'} whitespace-nowrap bg-purple-50 border-purple-200`}
                >
                  🔄 Replace
                </TabsTrigger>
                <TabsTrigger 
                  value="matrix" 
                  className={`${isMobile ? 'text-xs px-2 py-2 flex-1' : 'text-sm px-3 py-2'} whitespace-nowrap`}
                >
                  📊 Matrix
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className={`${isMobile ? 'text-xs px-2 py-2 flex-1' : 'text-sm px-3 py-2'} whitespace-nowrap`}
                >
                  🎯 Events
                </TabsTrigger>
                <TabsTrigger 
                  value="battery" 
                  className={`${isMobile ? 'text-xs px-2 py-2 flex-1' : 'text-sm px-3 py-2'} whitespace-nowrap`}
                >
                  🔋 Battery
                </TabsTrigger>
                <TabsTrigger 
                  value="mock-data" 
                  className={`${isMobile ? 'text-xs px-2 py-2 flex-1' : 'text-sm px-3 py-2'} whitespace-nowrap bg-green-50 border-green-200`}
                >
                  🎭 Mock
                </TabsTrigger>
                {!isMobile && (
                  <>
                    <TabsTrigger value="players" className="text-sm px-3 py-2 whitespace-nowrap">
                      🏃 Players
                    </TabsTrigger>
                    <TabsTrigger value="access" className="text-sm px-3 py-2 whitespace-nowrap">
                      🔐 Access
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="text-sm px-3 py-2 whitespace-nowrap">
                      📝 Audit
                    </TabsTrigger>
                  </>
                )}
                {isMobile && (
                  <TabsTrigger value="more" className="text-xs px-2 py-2 flex-1">
                    <Menu className="h-3 w-3 mr-1" />
                    More
                  </TabsTrigger>
                )}
              </div>
            </TabsList>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 min-h-[600px]">
            <TabsContent value="users" className="p-4 sm:p-6 m-0">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="matches" className="p-4 sm:p-6 m-0">
              <MatchManagement />
            </TabsContent>

            <TabsContent value="voice" className="p-4 sm:p-6 m-0">
              <VoiceCollaborationManager />
            </TabsContent>

            <TabsContent value="planning" className="p-4 sm:p-6 m-0">
              <div className="space-y-6">
                {/* Enhanced Match Selection Header */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      📋 Comprehensive Match Planning Center
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      Complete planning, assignment management, readiness tracking, and absence monitoring for match operations
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        Loading matches...
                      </div>
                    ) : matches.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-4">📋</div>
                        <p className="text-lg font-medium">No matches available</p>
                        <p className="text-sm">Create a match first to start planning</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Select Match for Planning</label>
                          <select
                            value={selectedMatchId || ''}
                            onChange={(e) => setSelectedMatchId(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          >
                            {matches.map((match) => (
                              <option key={match.id} value={match.id}>
                                {match.name || `${match.home_team_name} vs ${match.away_team_name}`}
                                {match.match_date && ` - ${new Date(match.match_date).toLocaleDateString()}`}
                                {` (${match.status.toUpperCase()})`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Planning Overview Cards */}
                {selectedMatchId && planningData && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-green-800">Assigned</p>
                            <p className="text-xl sm:text-2xl font-bold text-green-900">{getAssignmentStats().assigned}</p>
                          </div>
                          <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-yellow-800">Unassigned</p>
                            <p className="text-xl sm:text-2xl font-bold text-yellow-900">{getAssignmentStats().unassigned}</p>
                          </div>
                          <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-blue-800">Active</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-900">{getTrackerStats().active}</p>
                          </div>
                          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 bg-gray-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-800">Total</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{getAssignmentStats().total}</p>
                          </div>
                          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Collapsible Tracker Absence Management */}
                {selectedMatchId && (
                  <Collapsible open={isAbsenceMonitorOpen} onOpenChange={setIsAbsenceMonitorOpen}>
                    <Card className="border-l-4 border-l-orange-500">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-orange-50/50 transition-colors">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                              Tracker Absence Monitor
                            </div>
                            <Button variant="ghost" size="sm" className="p-0 h-auto">
                              <ChevronDown 
                                className={`h-5 w-5 text-orange-600 transition-transform duration-200 ${
                                  isAbsenceMonitorOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </Button>
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Real-time monitoring and automatic replacement for absent trackers
                          </p>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <TrackerAbsenceManager matchId={selectedMatchId} />
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

                {/* Quick Actions - Now Functional */}
                {selectedMatchId && planningData && (
                  <QuickPlanningActions 
                    matchId={selectedMatchId} 
                    onActionComplete={fetchPlanningData}
                  />
                )}

                {/* Enhanced Planning Network */}
                {selectedMatchId && (
                  <>
                    {loadingPlanning ? (
                      <Card>
                        <CardContent className="py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <div className="text-lg font-semibold">Loading planning data...</div>
                            <div className="text-sm text-gray-600">Analyzing assignments and tracker status</div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <MatchPlanningNetwork matchId={selectedMatchId} />
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="replacement" className="p-4 sm:p-6 m-0">
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    🔄 Tracker Replacement Management
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Manage backup tracker assignments and replacement procedures for match operations
                  </p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                      Loading matches...
                    </div>
                  ) : matches.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">👥</div>
                      <p className="text-lg font-medium">No matches available</p>
                      <p className="text-sm">Create a match first to manage tracker replacements</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Select Match for Replacement Management</label>
                        <select
                          value={selectedMatchId || ''}
                          onChange={(e) => setSelectedMatchId(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                        >
                          {matches.map((match) => (
                            <option key={match.id} value={match.id}>
                              {match.name || `${match.home_team_name} vs ${match.away_team_name}`}
                              {match.match_date && ` - ${new Date(match.match_date).toLocaleDateString()}`}
                              {` (${match.status.toUpperCase()})`}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedMatchId && (
                        <TrackerReplacementManager 
                          matchId={selectedMatchId} 
                          onReplacementUpdate={fetchPlanningData}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matrix" className="p-4 sm:p-6 m-0">
              <MatchTrackingMatrix />
            </TabsContent>

            <TabsContent value="events" className="p-4 sm:p-6 m-0">
              <EventAssignments />
            </TabsContent>

            <TabsContent value="battery" className="p-4 sm:p-6 m-0">
              <TrackerBatteryMonitor />
            </TabsContent>

            <TabsContent value="mock-data" className="p-4 sm:p-6 m-0">
              <MockDataGenerator />
            </TabsContent>

            {isMobile ? (
              <TabsContent value="more" className="p-4 sm:p-6 m-0">
                <Tabs defaultValue="players" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="players" className="text-xs sm:text-sm">🏃 Players</TabsTrigger>
                    <TabsTrigger value="access" className="text-xs sm:text-sm">🔐 Access</TabsTrigger>
                    <TabsTrigger value="audit" className="text-xs sm:text-sm">📝 Audit</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="players" className="mt-4">
                    <PlayerAssignments />
                  </TabsContent>
                  
                  <TabsContent value="access" className="mt-4">
                    <AccessManagement />
                  </TabsContent>
                  
                  <TabsContent value="audit" className="mt-4">
                    <AuditLogs />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            ) : (
              <>
                <TabsContent value="players" className="p-4 sm:p-6 m-0">
                  <PlayerAssignments />
                </TabsContent>
                
                <TabsContent value="access" className="p-4 sm:p-6 m-0">
                  <AccessManagement />
                </TabsContent>

                <TabsContent value="audit" className="p-4 sm:p-6 m-0">
                  <AuditLogs />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
