import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Clock, Users, TrendingUp, Download, Search, RefreshCw, Loader2, BarChart3, Shield } from 'lucide-react';
import MatchAnalysisSidebar from '@/components/MatchAnalysisSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

// Type definitions
interface QualityControl {
  is_valid: boolean;
  issues: string[];
  validated_at: string;
}

interface EventData {
  recorded_at?: string;
  [key: string]: any;
}

interface Player {
  id: string;
  player_name: string;
  jersey_number?: string;
}

// More specific types for Supabase data
interface MatchEvent {
  id: string;
  event_type: string | null;
  player_id: string | null;
  team: string | null;
  timestamp: string | null;
  created_by: string | null;
  event_data: EventData | null;
  metadata: {
    quality_control?: QualityControl;
    [key: string]: any;
  } | null;
}

interface MatchData {
  home_team_players: Player[] | null;
  away_team_players: Player[] | null;
}

interface Profile {
  id: string;
  email: string | null;
}

interface ProcessedEvent {
  id: string;
  event_type: string;
  player_id: string;
  player_name: string;
  team: string;
  timestamp: string;
  tracker: string;
  delay_seconds: number;
  validation: QualityControl | null;
  completeness: number;
  original_metadata: Record<string, any> | null;
}

interface Metrics {
  match_id: string;
  total_events: number;
  validated_events: number;
  pending_validation: number;
  critical_issues: number;
  data_completeness: number;
  tracker_coverage: number;
  avg_response_time: string;
  last_updated: string;
}

const QualityControlInterface: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'trackers'>('overview');
  const [metrics, setMetrics] = useState<Metrics>({
    match_id: matchId || '',
    total_events: 0,
    validated_events: 0,
    pending_validation: 0,
    critical_issues: 0,
    data_completeness: 0,
    tracker_coverage: 0,
    avg_response_time: '0',
    last_updated: new Date().toISOString()
  });

  const [events, setEvents] = useState<ProcessedEvent[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'validated' | 'issues' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ProcessedEvent | null>(null);

  // Sidebar menu items
  const menuItems = [
    {
      value: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: `/match/${matchId}/analytics`,
      permission: 'viewAnalytics' as const
    },
    {
      value: 'quality-control',
      label: 'Quality Control',
      icon: Shield,
      path: `/match/${matchId}/quality-control`,
      permission: 'viewQualityControl' as const
    }
  ];

  const fetchQualityData = useCallback(async () => {
    if (!matchId) return;

    setLoading(true);
    try {
      // Fetch match events
      const { data: eventData, error: eventsError } = await supabase
        .from('match_events')
        .select(`
          id,
          event_type,
          player_id,
          team,
          timestamp,
          created_by,
          event_data,
          metadata
        `)
        .eq('match_id', matchId)
        .order('timestamp', { ascending: false })
        .returns<MatchEvent[]>();

      if (eventsError) throw eventsError;

      // Fetch match details to get player rosters
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('home_team_players, away_team_players')
        .eq('id', matchId)
        .single<MatchData>();

      if (matchError) throw matchError;

      const homeTeamPlayers = matchData?.home_team_players || [];
      const awayTeamPlayers = matchData?.away_team_players || [];
      const allPlayers: Player[] = [...homeTeamPlayers, ...awayTeamPlayers];

      const playerMap = new Map<string, Player>(allPlayers.map(p => [p.id, p]));

      // Fetch user profiles to map tracker IDs to names/emails
      const trackerIds = [...new Set(eventData?.map(e => e.created_by).filter(Boolean) as string[] || [])];
      const { data: trackerData, error: trackersError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', trackerIds)
        .returns<Profile[]>();

      if (trackersError) throw trackersError;

      const trackerMap = new Map<string, string>(
        (trackerData || []).map(t => [t.id, t.email || 'Unknown'])
      );

      const processedEvents: ProcessedEvent[] = (eventData || []).map(e => {
        const player = playerMap.get(e.player_id || '');
        const eventDataObj = e.event_data || {};
        const metadata = e.metadata || {};

        const qualityControl = metadata.quality_control || null;

        const recordedAt = eventDataObj.recorded_at ? new Date(eventDataObj.recorded_at) : null;
        const eventTimestamp = new Date(e.timestamp || 0);
        const delay = recordedAt ? Math.abs((eventTimestamp.getTime() - recordedAt.getTime()) / 1000) : 0;

        return {
          id: e.id,
          event_type: e.event_type || 'Unknown',
          player_id: e.player_id || '',
          player_name: player?.player_name || 'Unknown Player',
          team: e.team || 'Unknown',
          timestamp: eventTimestamp.toISOString(),
          tracker: trackerMap.get(e.created_by || '') || 'Unknown Tracker',
          delay_seconds: delay,
          validation: qualityControl,
          completeness: (e.player_id && e.event_type) ? 100 : 50,
          original_metadata: metadata,
        };
      });

      setEvents(processedEvents);
      calculateMetrics(processedEvents);

    } catch (error) {
      console.error("Error fetching quality data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch quality control data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [matchId, toast]);

  useEffect(() => {
    fetchQualityData();
  }, [fetchQualityData]);

  const calculateMetrics = (currentEvents: ProcessedEvent[]) => {
    const total = currentEvents.length;
    if (total === 0) return;

    const validated = currentEvents.filter(e => e.validation?.is_valid === true).length;
    const pending = currentEvents.filter(e => !e.validation).length;
    const issues = currentEvents.filter(e => e.validation?.is_valid === false).length;
    const complete = currentEvents.filter(e => e.completeness === 100).length;
    const uniquePlayers = new Set(currentEvents.map(e => e.player_id).filter(id => id)).size;
    const totalDelay = currentEvents.reduce((sum, e) => sum + e.delay_seconds, 0);

    setMetrics({
      match_id: matchId || '',
      total_events: total,
      validated_events: validated,
      pending_validation: pending,
      critical_issues: issues,
      data_completeness: Math.round((complete / total) * 100),
      tracker_coverage: uniquePlayers,
      avg_response_time: (totalDelay / total).toFixed(2),
      last_updated: new Date().toISOString()
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.event_type.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'validated') return matchesSearch && event.validation?.is_valid;
    if (filterStatus === 'issues') return matchesSearch && event.validation && !event.validation.is_valid;
    if (filterStatus === 'pending') return matchesSearch && !event.validation;
    return matchesSearch;
  });

  const handleValidate = async (eventId: string, isValid: boolean, issues: string[] = []) => {
    const eventToUpdate = events.find(e => e.id === eventId);
    if (!eventToUpdate) return;

    const newValidationState: QualityControl = {
      is_valid: isValid,
      issues,
      validated_at: new Date().toISOString(),
    };

    const originalEvents = [...events];
    const updatedEvents = events.map(e =>
      e.id === eventId
        ? { ...e, validation: newValidationState }
        : e
    );
    setEvents(updatedEvents);
    calculateMetrics(updatedEvents);

    try {
      // Preserve existing metadata and only update the quality_control part
      const newMetadata = {
        ...eventToUpdate.original_metadata,
        quality_control: newValidationState,
      };

      const { error } = await supabase
        .from('match_events')
        .update({ metadata: newMetadata })
        .eq('id', eventId);

      if (error) {
        // Rollback on error
        setEvents(originalEvents);
        calculateMetrics(originalEvents);
        throw error;
      }

      toast({
        title: "Success",
        description: `Event ${isValid ? 'validated' : 'flagged'} successfully.`,
      });

    } catch (error) {
      console.error("Error updating event validation:", error);
      setEvents(originalEvents);
      calculateMetrics(originalEvents);
      toast({
        title: "Error",
        description: "Failed to update event validation.",
        variant: "destructive",
      });
    }
  };

  const exportReport = () => {
    const csv = [
      ['Event ID', 'Type', 'Player', 'Team', 'Timestamp', 'Tracker', 'Valid', 'Issues', 'Delay(s)'].join(','),
      ...events.map(e => [
        e.id,
        e.event_type,
        e.player_name,
        e.team,
        new Date(e.timestamp).toLocaleString(),
        e.tracker,
        e.validation?.is_valid ?? 'Pending',
        (e.validation?.issues || []).join('; '),
        e.delay_seconds
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quality-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  interface MetricCardProps {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }

  const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Loading Quality Data...</p>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <MatchAnalysisSidebar
          menuItems={menuItems}
          groupLabel="Match Tools"
        />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quality Control Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Match ID: {metrics.match_id} • Last updated: {new Date(metrics.last_updated).toLocaleString()}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchQualityData}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={exportReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 px-6">
            <div className="flex gap-6">
              {(['overview', 'events', 'trackers'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    icon={CheckCircle}
                    title="Total Events"
                    value={metrics.total_events}
                    subtitle={`${metrics.validated_events} validated`}
                    color="text-blue-600"
                  />
                  <MetricCard
                    icon={AlertCircle}
                    title="Pending Validation"
                    value={metrics.pending_validation}
                    subtitle={`${metrics.total_events > 0 ? Math.round((metrics.pending_validation/metrics.total_events)*100) : 0}% of total`}
                    color="text-yellow-600"
                  />
                  <MetricCard
                    icon={TrendingUp}
                    title="Data Completeness"
                    value={`${metrics.data_completeness}%`}
                    subtitle="Events with all fields"
                    color="text-green-600"
                  />
                  <MetricCard
                    icon={Clock}
                    title="Avg Response Time"
                    value={`${metrics.avg_response_time}s`}
                    subtitle="Entry delay"
                    color="text-purple-600"
                  />
                </div>

                {/* Issues Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality Issues</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-900">Critical Issues</p>
                          <p className="text-sm text-gray-600">Events with validation failures</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-red-600">{metrics.critical_issues}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900">Delayed Entries</p>
                          <p className="text-sm text-gray-600">Events with &gt;3s delay</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-yellow-600">
                        {events.filter(e => e.delay_seconds > 3).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Tracker Coverage</p>
                          <p className="text-sm text-gray-600">Unique players tracked</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{metrics.tracker_coverage}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search events, players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      {(['all', 'validated', 'issues', 'pending'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filterStatus === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Events Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracker</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delay</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredEvents.map(event => (
                          <tr key={event.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{event.event_type}</p>
                                <p className="text-sm text-gray-500">{event.id}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-gray-900">{event.player_name}</p>
                                <p className="text-sm text-gray-500">{event.team}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {event.tracker.split('@')[0]}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                event.delay_seconds < 2 ? 'bg-green-100 text-green-700' :
                                event.delay_seconds < 3 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {event.delay_seconds.toFixed(1)}s
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {!event.validation ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                  Pending
                                </span>
                              ) : event.validation.is_valid ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Issues
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedEvent(event)}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trackers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...new Set(events.map(e => e.tracker))].map(tracker => {
                  const trackerEvents = events.filter(e => e.tracker === tracker);
                  if (trackerEvents.length === 0) return null;
                  const validatedEvents = trackerEvents.filter(e => e.validation?.is_valid).length;
                  const avgDelay = trackerEvents.reduce((sum, e) => sum + e.delay_seconds, 0) / trackerEvents.length;

                  return (
                    <div key={tracker} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">{tracker.split('@')[0]}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Events Tracked</span>
                          <span className="font-semibold text-gray-900">{trackerEvents.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Validation Rate</span>
                          <span className="font-semibold text-gray-900">
                            {Math.round((validatedEvents / trackerEvents.length) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Delay</span>
                          <span className={`font-semibold ${avgDelay < 2 ? 'text-green-600' : avgDelay < 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {avgDelay.toFixed(1)}s
                          </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(validatedEvents / trackerEvents.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Event Validation</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Event Type</label>
                  <p className="text-gray-900 font-medium">{selectedEvent.event_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Event ID</label>
                  <p className="text-gray-900 font-medium">{selectedEvent.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Player</label>
                  <p className="text-gray-900 font-medium">{selectedEvent.player_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Team</label>
                  <p className="text-gray-900 font-medium">{selectedEvent.team}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Timestamp</label>
                  <p className="text-gray-900 font-medium">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Delay</label>
                  <p className="text-gray-900 font-medium">{selectedEvent.delay_seconds.toFixed(1)}s</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tracker</label>
                  <p className="text-gray-900 font-medium">{selectedEvent.tracker}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Completeness</label>
                  <p className="text-gray-900 font-medium">{selectedEvent.completeness}%</p>
                </div>
              </div>

              {selectedEvent.validation && !selectedEvent.validation.is_valid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-medium text-red-900 mb-2">Validation Issues:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedEvent.validation.issues.map((issue, idx) => (
                      <li key={idx} className="text-red-700 text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  handleValidate(selectedEvent.id, true);
                  setSelectedEvent(null);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as Valid
              </button>
              <button
                onClick={() => {
                  handleValidate(selectedEvent.id, false, ['Needs review']);
                  setSelectedEvent(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Flag Issues
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
};

export default QualityControlInterface;
