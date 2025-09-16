import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Eye, X, ClipboardList, Info, TriangleAlert, BellOff, Video } from 'lucide-react'; // Added Video icon
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { PushNotificationService } from '@/services/pushNotificationService';

/**
 * @interface NotificationData
 * @description Represents the flexible data payload within a notification.
 */
interface NotificationData {
  assigned_event_types?: string[];
  assigned_player_ids?: number[];
  assignment_type?: string;
  with_sound?: boolean;
  timestamp?: string;
  video_url?: string;
  video_title?: string;
  video_description?: string;
  video_duration?: string;
  video_thumbnail?: string;
  video_id?: string;
  match_video_id?: string;
  match_name?: string;
}

/**
 * @interface MatchInfo
 * @description Represents basic information about a match, often linked to a notification.
 */
interface MatchInfo {
  name: string | null;
  home_team_name: string;
  away_team_name: string;
  status: string;
}

/**
 * @interface NotificationWithMatch
 * @description A composite type that combines a notification with its related match data.
 */
interface NotificationWithMatch {
  id: string;
  match_id: string | null;
  title: string;
  message: string;
  type: string;
  notification_data?: NotificationData;
  is_read: boolean;
  created_at: string;
  match_name?: string | null;
  home_team_name?: string | null;
  away_team_name?: string | null;
  match_date?: string | null;
}

/**
 * @component TrackerNotifications
 * @description A comprehensive component for displaying user notifications in real-time.
 * It fetches notifications, subscribes to live updates from Supabase, handles various
 * notification types with custom icons and actions, and supports push notifications and sounds.
 * @returns {React.FC} A React functional component.
 */
const TrackerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Initialize push notifications when component mounts
  useEffect(() => {
    PushNotificationService.initialize();
  }, []);

  // Play notification sound for urgent notifications
  const playNotificationSound = useCallback(() => {
    if ('Audio' in window) {
      try {
        // Create a more attention-grabbing sound for urgent notifications
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Create a two-tone urgent sound
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        console.log('Could not play notification sound:', e);
      }
    }
  }, []);

  const getNotificationIcon = (type: string) => {
    const iconProps = { className: "h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" };
    switch (type) {
      case 'match_assignment':
        return <ClipboardList {...iconProps} className="text-primary" />;
      case 'urgent_replacement_assignment':
        return <TriangleAlert {...iconProps} className="text-destructive" />;
      case 'video_assignment': // New case for video assignment
        return <Video {...iconProps} className="text-purple-500" />;
      default:
        return <Info {...iconProps} className="text-blue-500" />;
    }
  };

  const getNotificationStyle = (type: string, is_read: boolean) => {
    const base = 'flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors duration-200 border-l-4';
    let styles = '';

    switch (type) {
      case 'urgent_replacement_assignment':
        styles = 'border-destructive hover:bg-destructive/10';
        if (!is_read) styles += ' bg-destructive/5';
        break;
      case 'match_assignment':
        styles = 'border-primary hover:bg-primary/10';
        if (!is_read) styles += ' bg-primary/5';
        break;
      case 'video_assignment': // New case for video assignment
        styles = 'border-purple-500 hover:bg-purple-500/10';
        if (!is_read) styles += ' bg-purple-500/5';
        break;
      default:
        styles = 'border-blue-500 hover:bg-blue-500/10';
        if (!is_read) styles += ' bg-blue-500/5';
        break;
    }

    return `${base} ${styles}`;
  };

  const getNotificationTypeFormatted = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    console.log('Fetching notifications for user:', user.id);

    try {
      // Fetch notifications directly from notifications table
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select(`
          id,
          match_id,
          title,
          message,
          type,
          notification_data,
          is_read,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      console.log('Notifications data:', notifications);
      
      // Get match details separately for notifications that have match_id
      const matchIds = notifications
        ?.filter(n => n.match_id)
        .map(n => n.match_id)
        .filter((id): id is string => id !== null) // Type guard to filter out nulls
        .filter((id, index, self) => self.indexOf(id) === index); // unique match IDs

      let matchesData: Array<{id: string; name: string | null; home_team_name: string; away_team_name: string; match_date: string | null}> = [];
      if (matchIds && matchIds.length > 0) {
        const { data: matches } = await supabase
          .from('matches')
          .select('id, name, home_team_name, away_team_name, match_date')
          .in('id', matchIds);
        matchesData = matches || [];
      }

      // Combine notifications with match data
      const notificationsWithMatches: NotificationWithMatch[] = (notifications || []).map(notification => {
        const matchData = matchesData.find(m => m.id === notification.match_id);
        return {
          id: notification.id || '',
          match_id: notification.match_id,
          title: notification.title || '',
          message: notification.message || '',
          type: notification.type || 'general',
          notification_data: notification.notification_data as NotificationData | undefined,
          is_read: notification.is_read || false,
          created_at: notification.created_at || '',
          match_name: matchData?.name,
          home_team_name: matchData?.home_team_name,
          away_team_name: matchData?.away_team_name,
          match_date: matchData?.match_date
        };
      });

      console.log('Processed notifications:', notificationsWithMatches.length);
      setNotifications(notificationsWithMatches);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id, playNotificationSound]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );

      toast.success('All notifications marked as read');
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification dismissed');
    } catch (error: any) {
      console.error('Error dismissing notification:', error);
      toast.error('Failed to dismiss notification');
    }
  };

  const handleViewMatch = (matchId: string, notificationId: string) => {
    if (matchId && matchId.length > 0) {
      markAsRead(notificationId);
      navigate(`/match/${matchId}`);
    } else {
      console.error('Match ID is missing or invalid for notification:', notificationId);
      toast.error('Cannot start tracking: Match ID is missing or invalid.');
    }
  };

  const handleViewVideoTracker = (matchId: string | null, notificationId: string, notificationData?: NotificationData) => {
    markAsRead(notificationId);
    
    // Construct match URL with video information
    const params = new URLSearchParams();
    if (notificationData?.video_url) params.append('videoUrl', notificationData.video_url);
    if (notificationData?.match_video_id) params.append('matchVideoId', notificationData.match_video_id);
    if (notificationData?.video_id) params.append('videoId', notificationData.video_id);
    
    const queryString = params.toString();
    const url = queryString ? `/match/${matchId}?${queryString}` : `/match/${matchId}`;
    
    navigate(url);
  };

  useEffect(() => {
    // Request notification permission when component mounts
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (user?.id) {
      console.log('User logged in, setting up notifications for:', user.id);
      fetchNotifications();

      // Subscribe to real-time notifications
      const channel = supabase
        .channel('tracker-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Notification change received via Supabase RT:', payload);
            fetchNotifications();
            if (payload.eventType === 'INSERT') {
              const newNotification = payload.new as any;
              console.log('New notification received:', newNotification);
              
              // Play sound for urgent notifications
              if (newNotification?.notification_data?.with_sound) {
                playNotificationSound();
              }
              
              toast.info('New notification received!');
            }
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to tracker-notifications channel for user:', user.id);
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Tracker notification channel error:', status, err);
          }
        });

      return () => {
        if (channel) {
          supabase.removeChannel(channel).then(status => {
            console.log('Unsubscribed from tracker-notifications. Status:', status);
          }).catch(error => {
            console.error('Error unsubscribing from tracker-notifications:', error);
          });
        }
      };
    } else {
      console.log('No user logged in, clearing notifications');
      setNotifications([]);
      setLoading(false);
    }
  }, [user?.id, fetchNotifications, playNotificationSound]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center text-muted-foreground">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 sm:p-6 border-b">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            <CardTitle className="text-lg sm:text-xl">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-6">
                {unreadCount} New
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={markAllAsRead}
              className="text-xs sm:text-sm"
            >
              <Check className="mr-1" />
              {isMobile ? "Mark All Read" : "Mark All as Read"}
            </Button>
          )}
        </div>
        <CardDescription className="text-xs sm:text-sm mt-2">
          Stay updated with match assignments and system alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 sm:py-16">
            <BellOff className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No notifications yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">New notifications will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={getNotificationStyle(notification.type, notification.is_read)}
              >
                <div className="flex-shrink-0 pt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base">{notification.title}</span>
                    <Badge
                      variant={
                        notification.type === 'urgent_replacement_assignment'
                          ? 'destructive'
                          : notification.type === 'match_assignment'
                          ? 'default'
                          : notification.type === 'video_assignment'
                          ? 'secondary'
                          : 'secondary'
                      }
                      className="text-xs capitalize"
                    >
                      {getNotificationTypeFormatted(notification.type)}
                    </Badge>
                  </div>

                   {notification.match_name && (
                     <div className="mb-2">
                       <span className="font-medium text-sm sm:text-base text-muted-foreground">
                         {notification.match_name ||
                          `${notification.home_team_name} vs ${notification.away_team_name}`}
                       </span>
                     </div>
                   )}

                  {/* Video assignment specific information */}
                  {notification.type === 'video_assignment' && notification.notification_data && (
                    <div className="mb-2 p-2 bg-purple-50 rounded-md border border-purple-200">
                      {notification.notification_data.video_title && (
                        <div className="text-sm font-medium text-purple-900 mb-1">
                          📹 {notification.notification_data.video_title}
                        </div>
                      )}
                      {notification.notification_data.match_name && (
                        <div className="text-xs text-purple-700">
                          Match: {notification.notification_data.match_name}
                        </div>
                      )}
                      {notification.notification_data.video_duration && (
                        <div className="text-xs text-purple-600">
                          Duration: {notification.notification_data.video_duration}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                    {notification.message}
                  </p>

                  {notification.notification_data && notification.type !== 'video_assignment' && (
                    <div className="text-xs space-y-1 mb-2 bg-muted/50 p-2 rounded-md border">
                      {notification.notification_data.assigned_event_types && (
                        <div className="break-words">
                          <strong>Event Types:</strong> {notification.notification_data.assigned_event_types.join(', ')}
                        </div>
                      )}
                      {notification.notification_data.assigned_player_ids && (
                        <div>
                          <strong>Players:</strong> {notification.notification_data.assigned_player_ids.length} assigned
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end flex-shrink-0 self-start">
                  {notification.type === 'match_assignment' && notification.match_id && (
                    <Button
                      size="sm"
                      onClick={() => handleViewMatch(notification.match_id!, notification.id)}
                      className="h-8 sm:h-9 text-xs"
                    >
                      <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{isMobile ? "Track" : "Start Tracking"}</span>
                    </Button>
                  )}
                  {notification.type === 'video_assignment' && (
                    <Button
                      size="sm"
                      onClick={() => handleViewVideoTracker(notification.match_id, notification.id, notification.notification_data)}
                      className="h-8 sm:h-9 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Video className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{isMobile ? "View" : "View Video"}</span>
                    </Button>
                  )}

                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8"
                        title="Mark as read"
                      >
                        <Check />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Dismiss notification"
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackerNotifications;
