
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import TrackerStatusIndicator from './TrackerStatusIndicator';

interface TrackerConnectionMonitorProps {
  matchId: string;
}

interface TrackerInfo {
  user_id: string;
  email?: string;
  status: 'active' | 'inactive' | 'recording';
  last_activity: number;
  current_action?: string;
  event_counts?: Record<string, number>;
  battery_level?: number;
  network_quality?: 'excellent' | 'good' | 'poor';
}

export const TrackerConnectionMonitor: React.FC<TrackerConnectionMonitorProps> = ({ matchId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [trackers, setTrackers] = useState<TrackerInfo[]>([]);
  const [absentTrackers, setAbsentTrackers] = useState<Set<string>>(new Set());

  console.log('TrackerConnectionMonitor: Render', { 
    matchId, 
    isConnected, 
    trackersCount: trackers.length,
    trackers: trackers.map(t => ({ id: t.user_id, status: t.status, lastActivity: t.last_activity }))
  });

  useEffect(() => {
    if (!matchId) return;

    let mounted = true;
    
    // Fetch initial tracker assignments
    const fetchInitialTrackers = async () => {
      try {
        console.log('TrackerConnectionMonitor: Fetching initial assignments for match:', matchId);
        
        const { data } = await supabase
          .from('match_tracker_assignments_view')
          .select('*')
          .eq('match_id', matchId);

        if (data && mounted) {
          const initialTrackers: TrackerInfo[] = data.map(assignment => ({
            user_id: assignment.tracker_user_id,
            email: assignment.tracker_email || undefined,
            status: 'inactive',
            last_activity: Date.now(),
            event_counts: {}
          }));
          
          console.log('TrackerConnectionMonitor: Initial trackers loaded:', initialTrackers);
          setTrackers(initialTrackers);
        }
      } catch (error) {
        console.error('TrackerConnectionMonitor: Error fetching initial trackers:', error);
      }
    };

    fetchInitialTrackers();

    // Set up real-time channel to listen for tracker status broadcasts
    const channelName = `tracker_monitor_${matchId}_${Date.now()}`;
    console.log('TrackerConnectionMonitor: Creating monitoring channel:', channelName);
    
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false }
      }
    });

    // Listen for tracker status broadcasts
    channel.on('broadcast', { event: 'tracker_status' }, (payload: any) => {
      if (!mounted) return;
      
      console.log('TrackerConnectionMonitor: Received tracker status broadcast:', payload);
      
      if (payload.payload?.type === 'tracker_status') {
        const statusUpdate = payload.payload;
        
        setTrackers(prev => {
          const updated = prev.map(t => 
            t.user_id === statusUpdate.user_id 
              ? { 
                  ...t, 
                  status: statusUpdate.status,
                  last_activity: statusUpdate.timestamp || Date.now(),
                  current_action: statusUpdate.action,
                  battery_level: statusUpdate.battery_level,
                  network_quality: statusUpdate.network_quality
                }
              : t
          );
          
          // Add new tracker if not found in assignments
          if (!prev.find(t => t.user_id === statusUpdate.user_id)) {
            updated.push({
              user_id: statusUpdate.user_id,
              email: statusUpdate.email || 'tracker',
              status: statusUpdate.status,
              last_activity: statusUpdate.timestamp || Date.now(),
              current_action: statusUpdate.action,
              event_counts: {},
              battery_level: statusUpdate.battery_level,
              network_quality: statusUpdate.network_quality
            });
          }
          
          console.log('TrackerConnectionMonitor: Updated trackers from broadcast:', updated);
          return updated;
        });
      }
    });

    // Subscribe to the channel
    channel.subscribe(async (status: string, err?: Error) => {
      if (!mounted) return;
      
      console.log('TrackerConnectionMonitor: Channel subscription status:', status, 'error:', err);
      
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        console.log('TrackerConnectionMonitor: Successfully subscribed to monitoring channel');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setIsConnected(false);
        console.error('TrackerConnectionMonitor: Channel error:', status, err);
      } else if (status === 'CLOSED') {
        setIsConnected(false);
        console.log('TrackerConnectionMonitor: Channel closed');
      }
    });

    return () => {
      mounted = false;
      console.log('TrackerConnectionMonitor: Cleaning up monitoring channel');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [matchId]);

  const handleMarkAbsent = (trackerId: string) => {
    console.log('TrackerConnectionMonitor: Marking tracker as absent:', trackerId);
    setAbsentTrackers(prev => new Set(prev).add(trackerId));
  };

  const handleReconnect = (trackerId: string) => {
    console.log('TrackerConnectionMonitor: Reconnecting tracker:', trackerId);
    setAbsentTrackers(prev => {
      const newSet = new Set(prev);
      newSet.delete(trackerId);
      return newSet;
    });
  };

  const activeTrackers = trackers.filter(t => !absentTrackers.has(t.user_id));
  const connectedCount = activeTrackers.filter(t => {
    const timeSinceLastActivity = Date.now() - t.last_activity;
    return timeSinceLastActivity < 30000; // Connected if active within 30 seconds
  }).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tracker Status Monitor</span>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              Monitor: {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Badge variant="outline">
              {connectedCount}/{trackers.length} Online
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trackers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No trackers assigned to this match
          </div>
        ) : (
          <div className="space-y-3">
            {trackers.map((tracker) => (
              <TrackerStatusIndicator
                key={tracker.user_id}
                activity={tracker}
                isAbsent={absentTrackers.has(tracker.user_id)}
                onMarkAbsent={handleMarkAbsent}
                onReconnect={handleReconnect}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
