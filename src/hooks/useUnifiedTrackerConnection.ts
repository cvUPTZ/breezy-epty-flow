
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrackerStatusData {
  status: 'active' | 'inactive' | 'recording';
  action?: string;
  timestamp: number;
  battery_level?: number;
  network_quality?: 'excellent' | 'good' | 'poor';
}

export interface TrackerInfo {
  user_id: string;
  email?: string;
  status: 'active' | 'inactive' | 'recording';
  last_activity: number;
  current_action?: string;
  event_counts?: Record<string, number>;
  battery_level?: number;
  network_quality?: 'excellent' | 'good' | 'poor';
}

export const useUnifiedTrackerConnection = (matchId: string, userId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [trackers, setTrackers] = useState<TrackerInfo[]>([]);
  const channelRef = useRef<any>(null);
  const connectionAttempts = useRef(0);
  const maxRetries = 5;
  const isCurrentUser = Boolean(userId);
  const cleanupExecutedRef = useRef(false);
  const lastBroadcastTimeRef = useRef<number>(0);
  const pendingBroadcastRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to hold the latest isConnected state to stabilize callbacks
  const isConnectedRef = useRef(isConnected);
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // Initialize unified channel with enhanced retry logic
  useEffect(() => {
    if (!matchId) {
      console.log('UnifiedTrackerConnection: No matchId provided');
      return;
    }

    let mounted = true;
    cleanupExecutedRef.current = false;

    const initializeChannel = async () => {
      if (!mounted || connectionAttempts.current >= maxRetries) return;

      console.log('UnifiedTrackerConnection: Initialize attempt', connectionAttempts.current + 1, { 
        matchId, 
        userId, 
        isCurrentUser,
        timestamp: new Date().toISOString() 
      });
      
      try {
        // Clean up existing channel
        if (channelRef.current) {
          console.log('UnifiedTrackerConnection: Cleaning up existing channel');
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          setIsConnected(false);
        }

        // Create single unified channel with stable name
        const channelName = `unified_match_${matchId}_${userId || 'observer'}`;
        console.log('UnifiedTrackerConnection: Creating unified channel:', channelName);
        
        channelRef.current = supabase.channel(channelName, {
          config: {
            broadcast: { self: false },
            presence: { key: userId || `observer_${Date.now()}` }
          }
        });

        // Handle tracker status broadcasts
        channelRef.current.on('broadcast', { event: 'tracker_status' }, (payload: any) => {
          if (!mounted) return;
          
          console.log('UnifiedTrackerConnection: Received tracker status:', payload);
          
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
              
              // Add new tracker if not found
              if (!prev.find(t => t.user_id === statusUpdate.user_id)) {
                updated.push({
                  user_id: statusUpdate.user_id,
                  email: statusUpdate.email,
                  status: statusUpdate.status,
                  last_activity: statusUpdate.timestamp || Date.now(),
                  current_action: statusUpdate.action,
                  event_counts: {},
                  battery_level: statusUpdate.battery_level,
                  network_quality: statusUpdate.network_quality
                });
              }
              
              console.log('UnifiedTrackerConnection: Updated trackers:', updated);
              return updated;
            });
          }
        });

        // Subscribe to channel with enhanced error handling
        channelRef.current.subscribe(async (status: string, err?: Error) => {
          if (!mounted) return;
          
          console.log('UnifiedTrackerConnection: Subscription status:', status, 'error:', err);
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            connectionAttempts.current = 0; // Reset attempts on success
            console.log('UnifiedTrackerConnection: Successfully connected to unified channel');
            
            // Send immediate presence signal if current user
            if (isCurrentUser && userId) {
              setTimeout(() => {
                if (mounted && channelRef.current) {
                  broadcastStatusImmediate({
                    status: 'active',
                    timestamp: Date.now(),
                    action: 'connection_established'
                  });
                }
              }, 1000);
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsConnected(false);
            console.error('UnifiedTrackerConnection: Channel error:', status, err);
            
            // Retry connection if attempts remain
            if (connectionAttempts.current < maxRetries && mounted) {
              connectionAttempts.current++;
              const retryDelay = Math.min(2000 * connectionAttempts.current, 10000); // Exponential backoff
              console.log(`UnifiedTrackerConnection: Retrying connection in ${retryDelay}ms (attempt ${connectionAttempts.current}/${maxRetries})`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                if (mounted) initializeChannel();
              }, retryDelay);
            }
          } else if (status === 'CLOSED') {
            setIsConnected(false);
            console.log('UnifiedTrackerConnection: Channel closed');
          }
        });
        
      } catch (error) {
        console.error('UnifiedTrackerConnection: Error initializing channel:', error);
        setIsConnected(false);
        
        // Retry on error
        if (connectionAttempts.current < maxRetries && mounted) {
          connectionAttempts.current++;
          const retryDelay = Math.min(2000 * connectionAttempts.current, 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mounted) initializeChannel();
          }, retryDelay);
        }
      }
    };

    initializeChannel();

    return () => {
      mounted = false;
      console.log('UnifiedTrackerConnection: Cleaning up on unmount');
      
      // Clear any pending broadcasts and timeouts
      if (pendingBroadcastRef.current) {
        clearTimeout(pendingBroadcastRef.current);
        pendingBroadcastRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Prevent multiple cleanup executions
      if (!cleanupExecutedRef.current) {
        cleanupExecutedRef.current = true;
        
        if (isCurrentUser && userId && channelRef.current && isConnected) {
          try {
            channelRef.current.send({
              type: 'broadcast',
              event: 'tracker_status',
              payload: {
                type: 'tracker_status',
                user_id: userId,
                status: 'inactive',
                timestamp: Date.now(),
                action: 'component_unmount'
              }
            });
          } catch (error) {
            console.log('UnifiedTrackerConnection: Error broadcasting inactive status during cleanup:', error);
          }
        }
        
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        setIsConnected(false);
      }
    };
  }, [matchId, userId]);

  // Fetch initial tracker assignments
  useEffect(() => {
    if (!matchId) return;

    const fetchTrackers = async () => {
      try {
        console.log('UnifiedTrackerConnection: Fetching initial tracker assignments for match:', matchId);
        
        const { data } = await supabase
          .from('match_tracker_assignments_view')
          .select('*')
          .eq('match_id', matchId);

        if (data) {
          const trackerMap = new Map<string, TrackerInfo>();
          data.forEach(assignment => {
            if (assignment.tracker_user_id && !trackerMap.has(assignment.tracker_user_id)) {
              trackerMap.set(assignment.tracker_user_id, {
                user_id: assignment.tracker_user_id,
                email: assignment.tracker_email || undefined,
                status: 'inactive',
                last_activity: Date.now(),
                event_counts: {}
              });
            }
          });
          
          const initialTrackers = Array.from(trackerMap.values());
          console.log('UnifiedTrackerConnection: Initial trackers loaded:', initialTrackers);
          setTrackers(initialTrackers);
        }
      } catch (error) {
        console.error('UnifiedTrackerConnection: Error fetching trackers:', error);
      }
    };

    fetchTrackers();
  }, [matchId]);

  // Immediate broadcast function (no throttling for critical updates)
  const broadcastStatusImmediate = useCallback(async (statusData: TrackerStatusData) => {
    if (!userId || !matchId || !channelRef.current || !isConnectedRef.current) {
      console.log('UnifiedTrackerConnection: Cannot broadcast immediately - missing requirements', { 
        userId, 
        matchId, 
        hasChannel: !!channelRef.current,
        isConnected: isConnectedRef.current
      });
      return;
    }

    try {
      const payload = {
        type: 'tracker_status',
        user_id: userId,
        email: 'tracker',
        ...statusData,
        timestamp: Date.now()
      };

      console.log('UnifiedTrackerConnection: Broadcasting status immediately:', payload);

      const result = await channelRef.current.send({
        type: 'broadcast',
        event: 'tracker_status',
        payload
      });

      if (result === 'ok') {
        console.log('UnifiedTrackerConnection: Immediate broadcast successful');
        lastBroadcastTimeRef.current = Date.now();
        
        // Update local tracker state optimistically
        setTrackers(prev => {
          const updated = prev.map(t => 
            t.user_id === userId 
              ? { 
                  ...t, 
                  status: statusData.status,
                  last_activity: Date.now(),
                  current_action: statusData.action,
                  battery_level: statusData.battery_level,
                  network_quality: statusData.network_quality
                }
              : t
          );
          
          // Add self if not found
          if (!prev.find(t => t.user_id === userId)) {
            updated.push({
              user_id: userId,
              email: 'tracker',
              status: statusData.status,
              last_activity: Date.now(),
              current_action: statusData.action,
              event_counts: {},
              battery_level: statusData.battery_level,
              network_quality: statusData.network_quality
            });
          }
          
          return updated;
        });
      } else {
        console.error('UnifiedTrackerConnection: Immediate broadcast failed:', result);
      }
    } catch (error) {
      console.error('UnifiedTrackerConnection: Failed to broadcast status immediately:', error);
    }
  }, [matchId, userId]);

  // Throttled broadcast function for regular updates
  const broadcastStatus = useCallback(async (statusData: TrackerStatusData) => {
    if (!userId || !matchId || !channelRef.current || !isConnectedRef.current) {
      console.log('UnifiedTrackerConnection: Cannot broadcast - missing requirements', { 
        userId, 
        matchId, 
        hasChannel: !!channelRef.current,
        isConnected: isConnectedRef.current
      });
      return;
    }

    const now = Date.now();
    
    // Throttling - minimum 5 seconds between regular broadcasts
    const timeSinceLastBroadcast = now - lastBroadcastTimeRef.current;
    if (timeSinceLastBroadcast < 5000) {
      console.log('UnifiedTrackerConnection: Broadcast throttled', { timeSinceLastBroadcast });
      return;
    }

    // Clear any pending broadcast
    if (pendingBroadcastRef.current) {
      clearTimeout(pendingBroadcastRef.current);
      pendingBroadcastRef.current = null;
    }

    // Use immediate broadcast for critical status changes
    if (statusData.status === 'recording' || statusData.action?.includes('connected') || statusData.action?.includes('ready')) {
      return broadcastStatusImmediate(statusData);
    }

    // Delay regular broadcasts slightly
    pendingBroadcastRef.current = setTimeout(async () => {
      return broadcastStatusImmediate(statusData);
    }, 1000);
  }, [matchId, userId, broadcastStatusImmediate]);

  const cleanup = useCallback(() => {
    console.log('UnifiedTrackerConnection: Manual cleanup called');
    
    if (cleanupExecutedRef.current) {
      console.log('UnifiedTrackerConnection: Cleanup already executed, skipping');
      return;
    }
    
    cleanupExecutedRef.current = true;
    
    // Clear pending broadcasts and timeouts
    if (pendingBroadcastRef.current) {
      clearTimeout(pendingBroadcastRef.current);
      pendingBroadcastRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (isCurrentUser && userId && channelRef.current && isConnectedRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'tracker_status',
          payload: {
            type: 'tracker_status',
            user_id: userId,
            status: 'inactive',
            timestamp: Date.now(),
            action: 'manual_cleanup'
          }
        });
      } catch (error) {
        console.log('UnifiedTrackerConnection: Error during manual cleanup:', error);
      }
    }
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setIsConnected(false);
  }, [userId, isCurrentUser]);

  return {
    isConnected,
    trackers,
    broadcastStatus,
    cleanup
  };
};
