
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUnifiedTrackerConnection, TrackerInfo } from '@/hooks/useUnifiedTrackerConnection';
import TrackerStatusIndicator from './TrackerStatusIndicator';

interface TrackerConnectionMonitorProps {
  matchId: string;
}

export const TrackerConnectionMonitor: React.FC<TrackerConnectionMonitorProps> = ({ matchId }) => {
  const { isConnected, trackers } = useUnifiedTrackerConnection(matchId);
  const [absentTrackers, setAbsentTrackers] = useState<Set<string>>(new Set());

  console.log('TrackerConnectionMonitor: Render', { 
    matchId, 
    isConnected, 
    trackersCount: trackers.length,
    trackers: trackers.map(t => ({ id: t.user_id, status: t.status, lastActivity: t.last_activity }))
  });

  const handleMarkAbsent = (trackerId: string) => {
    setAbsentTrackers(prev => new Set(prev).add(trackerId));
  };

  const handleReconnect = (trackerId: string) => {
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
