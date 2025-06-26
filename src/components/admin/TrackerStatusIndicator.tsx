
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, Wifi, WifiOff, Battery } from 'lucide-react';
import { TrackerInfo } from '@/hooks/useUnifiedTrackerConnection';

interface TrackerStatusIndicatorProps {
  activity: TrackerInfo;
  isAbsent: boolean;
  onMarkAbsent: (trackerId: string) => void;
  onReconnect: (trackerId: string) => void;
}

const TrackerStatusIndicator: React.FC<TrackerStatusIndicatorProps> = ({
  activity,
  isAbsent,
  onMarkAbsent,
  onReconnect
}) => {
  const getStatusIcon = () => {
    if (isAbsent) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (activity.status === 'recording') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (activity.status === 'active') return <Wifi className="h-4 w-4 text-blue-500" />;
    return <WifiOff className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (isAbsent) return 'border-red-300 bg-red-50';
    if (activity.status === 'recording') return 'border-green-300 bg-green-50';
    if (activity.status === 'active') return 'border-blue-300 bg-blue-50';
    return 'border-gray-300 bg-gray-50';
  };

  const formatLastSeen = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  const isConnected = () => {
    const timeSinceLastActivity = Date.now() - activity.last_activity;
    return timeSinceLastActivity < 30000; // Consider connected if active within last 30 seconds
  };

  const connectionStatus = isConnected();

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
              {activity.email && (
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
          <Badge variant={isAbsent ? 'destructive' : connectionStatus ? 'default' : 'secondary'}>
            {isAbsent ? 'Absent' : connectionStatus ? 'Connected' : 'Disconnected'}
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
