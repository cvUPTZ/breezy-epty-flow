
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
  const [lastBroadcast, setLastBroadcast] = useState<number>(0);
  const channelRef = useRef<any>(null);
  const connectionAttempts = useRef(0);
  const maxRetries = 3;
  const isCurrentUser = Boolean(userId);

  // Initialize unified channel with retry logic
  useEffect(() => {
    if (!matchId) {
      console.log('UnifiedTrackerConnection: No matchId provided');
      return;
    }

    const initializeChannel = async () => {
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

        // Create single unified channel with unique name
        const channelName = `unified_match_${matchId}_${Date.now()}`;
        console.log('UnifiedTrackerConnection: Creating unified channel:', channelName);
        
        channelRef.current = supabase.channel(channelName, {
          config: {
            broadcast: { self: false },
            presence: { key: userId || `observer_${Date.now()}` }
          }
        });

        // Handle tracker status broadcasts
        channelRef.current.on('broadcast', { event: 'tracker_status' }, (payload: any) => {
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

        // Subscribe to channel with retry logic
        channelRef.current.subscribe(async (status: string, err?: Error) => {
          console.log('UnifiedTrackerConnection: Subscription status:', status, 'error:', err);
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            connectionAttempts.current = 0; // Reset attempts on success
            console.log('UnifiedTrackerConnection: Successfully connected to unified channel');
            
            // If current user, broadcast initial active status with delay
            if (isCurrentUser && userId) {
              setTimeout(() => {
                console.log('UnifiedTrackerConnection: Broadcasting initial active status for user:', userId);
                broadcastStatus({
                  status: 'active',
                  timestamp: Date.now(),
                  action: 'initial_connection'
                });
              }, 1000);
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsConnected(false);
            console.error('UnifiedTrackerConnection: Channel error:', status, err);
            
            // Retry connection if attempts remain
            if (connectionAttempts.current < maxRetries) {
              connectionAttempts.current++;
              console.log(`UnifiedTrackerConnection: Retrying connection in 2s (attempt ${connectionAttempts.current}/${maxRetries})`);
              setTimeout(initializeChannel, 2000);
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
        if (connectionAttempts.current < maxRetries) {
          connectionAttempts.current++;
          setTimeout(initializeChannel, 2000);
        }
      }
    };

    initializeChannel();

    return () => {
      console.log('UnifiedTrackerConnection: Cleaning up on unmount');
      
      if (isCurrentUser && userId && channelRef.current) {
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
    };
  }, [matchId, userId, isCurrentUser]);

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

  // Enhanced broadcast status function with better error handling
  const broadcastStatus = useCallback(async (statusData: TrackerStatusData) => {
    if (!userId || !matchId || !channelRef.current || !isConnected) {
      console.log('UnifiedTrackerConnection: Cannot broadcast - missing requirements', { 
        userId, 
        matchId, 
        hasChannel: !!channelRef.current,
        isConnected 
      });
      return;
    }

    const now = Date.now();
    
    // More lenient throttling for important status updates
    const isImportantUpdate = statusData.action?.includes('connection') || 
                             statusData.action?.includes('recording') ||
                             statusData.status === 'inactive';
    
    if (!isImportantUpdate && now - lastBroadcast < 5000) {
      console.log('UnifiedTrackerConnection: Broadcast throttled');
      return;
    }

    try {
      const payload = {
        type: 'tracker_status',
        user_id: userId,
        email: 'tracker', // Basic identifier
        ...statusData,
        timestamp: now
      };

      console.log('UnifiedTrackerConnection: Broadcasting status:', payload);

      const result = await channelRef.current.send({
        type: 'broadcast',
        event: 'tracker_status',
        payload
      });

      if (result === 'ok') {
        console.log('UnifiedTrackerConnection: Broadcast successful');
        setLastBroadcast(now);
        
        // Update local tracker state optimistically
        setTrackers(prev => {
          const updated = prev.map(t => 
            t.user_id === userId 
              ? { 
                  ...t, 
                  status: statusData.status,
                  last_activity: now,
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
              last_activity: now,
              current_action: statusData.action,
              event_counts: {},
              battery_level: statusData.battery_level,
              network_quality: statusData.network_quality
            });
          }
          
          return updated;
        });
      } else {
        console.error('UnifiedTrackerConnection: Broadcast failed:', result);
      }
    } catch (error) {
      console.error('UnifiedTrackerConnection: Failed to broadcast status:', error);
    }
  }, [matchId, userId, lastBroadcast, isConnected]);

  const cleanup = useCallback(() => {
    console.log('UnifiedTrackerConnection: Manual cleanup called');
    
    if (isCurrentUser && userId && channelRef.current) {
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
