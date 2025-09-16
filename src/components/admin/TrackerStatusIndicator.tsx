
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, Wifi, WifiOff, Battery } from 'lucide-react';

/**
 * @interface TrackerInfo
 * @description Defines the structure for a tracker's real-time activity and status data.
 */
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

/**
 * @interface TrackerStatusIndicatorProps
 * @description Props for the TrackerStatusIndicator component.
 * @property {TrackerInfo} activity - The real-time activity data for the tracker.
 * @property {boolean} isAbsent - Flag indicating if the tracker is marked as absent.
 * @property {function(trackerId: string): void} onMarkAbsent - Callback to manually mark the tracker as absent.
 * @property {function(trackerId: string): void} onReconnect - Callback to manually mark the tracker as reconnected.
 */
interface TrackerStatusIndicatorProps {
  activity: TrackerInfo;
  isAbsent: boolean;
  onMarkAbsent: (trackerId: string) => void;
  onReconnect: (trackerId: string) => void;
}

/**
 * @component TrackerStatusIndicator
 * @description A component that displays a single tracker's status in a compact row.
 * It shows connection status, last activity, and provides actions for absence management.
 * @param {TrackerStatusIndicatorProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const TrackerStatusIndicator: React.FC<TrackerStatusIndicatorProps> = ({
  activity,
  isAbsent,
  onMarkAbsent,
  onReconnect
}) => {
  // Check if tracker is recently active (within last 30 seconds)
  const isRecentlyActive = () => {
    const timeSinceLastActivity = Date.now() - activity.last_activity;
    return timeSinceLastActivity < 30000;
  };

  const connectionStatus = isRecentlyActive();

  const getStatusIcon = () => {
    if (isAbsent) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (activity.status === 'recording') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (connectionStatus) return <Wifi className="h-4 w-4 text-blue-500" />;
    return <WifiOff className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (isAbsent) return 'border-red-300 bg-red-50';
    if (activity.status === 'recording') return 'border-green-300 bg-green-50';
    if (connectionStatus) return 'border-blue-300 bg-blue-50';
    return 'border-gray-300 bg-gray-50';
  };

  const formatLastSeen = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  const getStatusText = () => {
    if (isAbsent) return 'Absent';
    if (activity.status === 'recording') return 'Recording';
    if (connectionStatus) return 'Connected';
    return 'Disconnected';
  };

  const getStatusVariant = () => {
    if (isAbsent) return 'destructive' as const;
    if (activity.status === 'recording') return 'default' as const;
    if (connectionStatus) return 'default' as const;
    return 'secondary' as const;
  };

  return (
    <motion.div
      className={`p-4 rounded-lg border-2 ${getStatusColor()} transition-all duration-300`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {getStatusIcon()}
            {activity.status === 'recording' && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
          
          <div>
            <div className="font-medium text-gray-800 flex items-center gap-2">
              Tracker {activity.user_id.slice(-4)}
              {activity.email && activity.email !== 'tracker' && (
                <span className="text-xs text-gray-500">({activity.email})</span>
              )}
              <div className={`w-2 h-2 rounded-full ${connectionStatus ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {formatLastSeen(activity.last_activity)}
              {activity.current_action && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {activity.current_action}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant()}>
            {getStatusText()}
          </Badge>
          
          {activity.battery_level !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Battery className="h-3 w-3" />
              {activity.battery_level}%
            </div>
          )}

          {activity.network_quality && (
            <Badge variant="outline" className={`text-xs ${
              activity.network_quality === 'excellent' ? 'text-green-600 border-green-300' :
              activity.network_quality === 'good' ? 'text-yellow-600 border-yellow-300' :
              'text-red-600 border-red-300'
            }`}>
              {activity.network_quality}
            </Badge>
          )}

          {isAbsent ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReconnect(activity.user_id)}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Reconnect
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkAbsent(activity.user_id)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Mark Absent
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TrackerStatusIndicator;
