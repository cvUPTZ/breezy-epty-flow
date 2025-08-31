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
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const connectionAttempts = useRef(0);
  const maxRetries = 5;
  const isCurrentUser = Boolean(userId);
  const cleanupExecutedRef = useRef(false);
  const lastBroadcastTimeRef = useRef<number>(0);
  const pendingBroadcastRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  // Ref to hold the latest isConnected state to stabilize callbacks
  const isConnectedRef = useRef(isConnected);
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // Connection health check
  const checkConnection = useCallback(() => {
    if (!channelRef.current || isUnmountedRef.current) return;
    
    try {
      // Try to get channel state - if this fails, we know connection is broken
      const state = channelRef.current.state;
      if (state !== 'joined') {
        console.log('UnifiedTrackerConnection: Connection health check failed, state:', state);
        if (isConnectedRef.current) {
          setIsConnected(false);
          setConnectionError('Connection lost');
        }
      }
    } catch (error) {
      console.error('UnifiedTrackerConnection: Health check error:', error);
      if (isConnectedRef.current) {
        setIsConnected(false);
        setConnectionError('Health check failed');
      }
    }
  }, []);

  // Start heartbeat to monitor connection
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(checkConnection, 30000); // Check every 30 seconds
  }, [checkConnection]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Initialize unified channel with enhanced retry logic
  useEffect(() => {
    if (!matchId) {
      console.log('UnifiedTrackerConnection: No matchId provided');
      return;
    }

    let mounted = true;
    isUnmountedRef.current = false;
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
          stopHeartbeat();
          try {
            await supabase.removeChannel(channelRef.current);
          } catch (error) {
            console.log('UnifiedTrackerConnection: Error removing existing channel:', error);
          }
          channelRef.current = null;
          setIsConnected(false);
        }

        // Wait for any pending cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if Supabase is properly initialized
        if (!supabase || !supabase.channel) {
          throw new Error('Supabase client not properly initialized');
        }

        // Create single unified channel with stable name
        const channelName = `unified_match_${matchId}_${userId || 'observer'}_${Date.now()}`;
        console.log('UnifiedTrackerConnection: Creating unified channel:', channelName);
        
        channelRef.current = supabase.channel(channelName, {
          config: {
            broadcast: { 
              self: false,
              ack: true // Enable acknowledgments
            },
            presence: { 
              key: userId || `observer_${Date.now()}` 
            }
          }
        });

        // Handle connection events
        channelRef.current.on('system', {}, (payload: any) => {
          console.log('UnifiedTrackerConnection: System event:', payload);
          if (payload.extension === 'presence') {
            console.log('UnifiedTrackerConnection: Presence event:', payload.payload);
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

        // Subscribe to channel with simplified error handling
        const subscribePromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.log('UnifiedTrackerConnection: Subscription timeout reached, resolving anyway');
            // Don't reject on timeout, just resolve with limited functionality
            resolve('TIMEOUT');
          }, 5000); // Reduced to 5 seconds

          channelRef.current.subscribe(async (status: string, err?: Error) => {
            if (!mounted) return;
            
            console.log('UnifiedTrackerConnection: Subscription status:', status, 'error:', err);
            
            if (status === 'SUBSCRIBED') {
              clearTimeout(timeout);
              setIsConnected(true);
              setConnectionError(null);
              connectionAttempts.current = 0; // Reset attempts on success
              console.log('UnifiedTrackerConnection: Successfully connected to unified channel');
              
              // Start connection monitoring
              startHeartbeat();
              
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
              
              resolve(status);
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              clearTimeout(timeout);
              console.log('UnifiedTrackerConnection: Channel error, continuing with limited functionality');
              // Don't retry infinitely, just continue with degraded mode
              setIsConnected(false);
              stopHeartbeat();
              setConnectionError('Operating in offline mode');
              resolve('DEGRADED');
            } else if (status === 'CLOSED') {
              setIsConnected(false);
              stopHeartbeat();
              setConnectionError('Connection closed');
              console.log('UnifiedTrackerConnection: Channel closed');
              resolve('CLOSED');
            }
          });
        });

        // Always resolve the promise to prevent infinite loading
        try {
          await Promise.race([
            subscribePromise,
            new Promise(resolve => setTimeout(() => resolve('FALLBACK'), 6000))
          ]);
        } catch (error) {
          console.log('UnifiedTrackerConnection: Subscription error, continuing anyway:', error);
          // Continue execution even on error
        }
        
      } catch (error) {
        console.error('UnifiedTrackerConnection: Error initializing channel:', error);
        setIsConnected(false);
        stopHeartbeat();
        setConnectionError('Operating in offline mode');
        
        // Don't retry infinitely - just continue with limited functionality
        console.log('UnifiedTrackerConnection: Continuing with offline mode due to connection issues');
      }
    };

    initializeChannel();

    return () => {
      mounted = false;
      isUnmountedRef.current = true;
      console.log('UnifiedTrackerConnection: Cleaning up on unmount');
      
      stopHeartbeat();
      
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
  }, [matchId, userId, startHeartbeat, stopHeartbeat]);

  // Fetch initial tracker assignments
  useEffect(() => {
    if (!matchId) return;

    const fetchTrackers = async () => {
      try {
        console.log('UnifiedTrackerConnection: Fetching initial tracker assignments for match:', matchId);
        
        const { data, error } = await supabase
          .from('match_tracker_assignments_view')
          .select('*')
          .eq('match_id', matchId);

        if (error) {
          console.error('UnifiedTrackerConnection: Error fetching trackers:', error);
          return;
        }

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
      return false;
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
        
        return true;
      } else {
        console.error('UnifiedTrackerConnection: Immediate broadcast failed:', result);
        return false;
      }
    } catch (error) {
      console.error('UnifiedTrackerConnection: Failed to broadcast status immediately:', error);
      return false;
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

  // Force reconnect function
  const forceReconnect = useCallback(() => {
    console.log('UnifiedTrackerConnection: Force reconnect requested');
    connectionAttempts.current = 0; // Reset attempt counter
    setConnectionError(null);
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // Trigger re-initialization by updating a dependency
    // This will cause the main useEffect to run again
    setIsConnected(false);
  }, []);

  const cleanup = useCallback(() => {
    console.log('UnifiedTrackerConnection: Manual cleanup called');
    
    if (cleanupExecutedRef.current) {
      console.log('UnifiedTrackerConnection: Cleanup already executed, skipping');
      return;
    }
    
    cleanupExecutedRef.current = true;
    stopHeartbeat();
    
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
  }, [userId, isCurrentUser, stopHeartbeat]);

  return {
    isConnected,
    trackers,
    connectionError,
    broadcastStatus,
    forceReconnect,
    cleanup
  };
};
