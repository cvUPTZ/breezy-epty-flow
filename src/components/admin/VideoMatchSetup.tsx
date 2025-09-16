
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { YouTubeService } from '@/services/youtubeService';

/**
 * @interface Match
 * @description Represents a match that can be selected for video analysis.
 */
interface Match {
  id: string;
  name: string;
}

/**
 * @interface TrackerUser
 * @description Represents a user with the 'tracker' role who can be assigned to a task.
 */
interface TrackerUser {
  id: string;
  full_name: string | null;
  email: string | null;
}

/**
 * @interface EventType
 * @description Represents a type of event that can be tracked in the analysis.
 */
interface EventType {
  id: string;
  name: string;
}

/**
 * @interface VideoMatchSetupProps
 * @description Props for the VideoMatchSetup component.
 * @property {boolean} [simplifiedView] - If true, renders a simplified version of the form, typically for embedding.
 * @property {string} videoUrl - The current value of the video URL input.
 * @property {function(url: string): void} onVideoUrlChange - Callback to handle changes to the video URL.
 */
interface VideoMatchSetupProps {
  simplifiedView?: boolean;
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
}

/**
 * @component VideoMatchSetup
 * @description An administrative form for creating a video analysis task. It allows linking
 * a YouTube video to a match and assigning trackers to analyze it for specific event types.
 * @param {VideoMatchSetupProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const VideoMatchSetup: React.FC<VideoMatchSetupProps> = ({
  simplifiedView = false,
  videoUrl,
  onVideoUrlChange,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [allTrackers, setAllTrackers] = useState<TrackerUser[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [assignedTrackers, setAssignedTrackers] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Event types - replace with actual fetching if needed
  const eventTypes: EventType[] = [
    { id: 'pass', name: 'Pass' },
    { id: 'shot', name: 'Shot' },
    { id: 'foul', name: 'Foul' },
    { id: 'goal', name: 'Goal' }
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('id, name, home_team_name, away_team_name')
          .order('match_date', { ascending: false });
        
        if (matchesError) throw matchesError;
        
        if (isMounted) {
          setAllMatches(matchesData.map(m => ({ 
            id: m.id, 
            name: m.name || `${m.home_team_name} vs ${m.away_team_name}` 
          })));
        }

        // Fetch trackers
        const { data: trackersData, error: trackersError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'tracker');
        
        if (trackersError) throw trackersError;
        
        if (isMounted) {
          setAllTrackers(trackersData as TrackerUser[]);
        }

      } catch (error: any) {
        console.error('Error fetching data for VideoMatchSetup:', error);
        if (isMounted) {
          toast({
            title: 'Error Fetching Data',
            description: `Could not load matches or trackers: ${error.message}`,
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };
    
    if (!simplifiedView) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [simplifiedView, toast]);

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVideoUrlChange(e.target.value);
  };

  const handleSubmit = async () => {
    if (simplifiedView) {
      console.log('handleSubmit called in simplifiedView, typically handled by parent.');
      return;
    }

    // Validation
    if (!selectedMatch) {
      toast({ title: 'Validation Error', description: 'Please select a match.', variant: 'destructive' });
      return;
    }
    if (!videoUrl) {
      toast({ title: 'Validation Error', description: 'Please enter a YouTube video URL.', variant: 'destructive' });
      return;
    }
    if (assignedTrackers.length === 0) {
      toast({ title: 'Validation Error', description: 'Please assign at least one tracker.', variant: 'destructive' });
      return;
    }
    if (!user || !user.id) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to save a setup.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const videoAssignments = assignedTrackers.map(trackerId => ({
        tracker_id: trackerId,
        assigned_event_types: selectedEvents,
      }));

      const result = await YouTubeService.saveVideoMatchSetup(
        selectedMatch,
        videoUrl,
        videoAssignments,
        user.id
      );

      // Send notifications to assigned trackers with video information
      if (result.videoSetting && result.assignmentResults.length > 0) {
        const matchName = allMatches.find(m => m.id === selectedMatch)?.name || 'Selected Match';
        const notifications = result.assignmentResults.map((assignment: any) => ({
          user_id: assignment.tracker_id,
          match_id: selectedMatch,
          type: 'video_assignment',
          title: `New Video Assignment: ${result.videoSetting.video_title || 'Video'} for ${matchName}`,
          message: `You have been assigned to track video: "${result.videoSetting.video_title || videoUrl}" for match "${matchName}". Events: ${assignment.assigned_event_types.join(', ') || 'All'}`,
          notification_data: {
            match_id: selectedMatch,
            match_video_setting_id: result.videoSetting.id,
            video_tracker_assignment_id: assignment.id,
            video_url: result.videoSetting.video_url,
            video_title: result.videoSetting.video_title,
            video_description: result.videoSetting.video_description,
            duration_seconds: result.videoSetting.duration_seconds,
            assigned_event_types: assignment.assigned_event_types,
          },
          created_by: user.id,
        }));

        if (notifications.length > 0) {
          const { error: notificationError } = await supabase.from('notifications').insert(notifications);
          if (notificationError) {
            console.error('Error creating direct video assignment notifications:', notificationError);
            toast({ 
              title: "Notification Error", 
              description: "Video setup saved, but failed to send notifications.", 
              variant: "destructive" 
            });
          } else {
            console.log(`${notifications.length} direct video assignment notifications sent.`);
          }
        }
      }

      toast({ title: 'Success', description: 'Video match setup saved and trackers notified!' });
      
    } catch (error: any) {
      console.error('Error saving video match setup:', error);
      toast({
        title: 'Save Error',
        description: `Failed to save video match setup: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!simplifiedView && <h3 className="text-lg font-semibold">Video Match Setup</h3>}
      
      <div className="space-y-2">
        <label htmlFor="videoUrlInput" className="block text-sm font-medium">YouTube Video URL:</label>
        <input
          id="videoUrlInput"
          type="text"
          value={videoUrl}
          onChange={handleVideoUrlChange}
          placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          className="w-full p-2 border rounded-md"
        />
      </div>

      {!simplifiedView && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Match:</label>
            <select
              onChange={(e) => setSelectedMatch(e.target.value)}
              value={selectedMatch || ''}
              className="w-full p-2 border rounded-md"
              disabled={loadingData}
            >
              <option value="" disabled>
                {loadingData ? "Loading matches..." : "Select a match"}
              </option>
              {allMatches.map(match => (
                <option key={match.id} value={match.id}>{match.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Assign Trackers:</label>
            {loadingData && <p className="text-sm text-gray-500">Loading trackers...</p>}
            {!loadingData && (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {allTrackers.map(tracker => (
                  <div key={tracker.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tracker-${tracker.id}`}
                      value={tracker.id}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignedTrackers([...assignedTrackers, tracker.id]);
                        } else {
                          setAssignedTrackers(assignedTrackers.filter(id => id !== tracker.id));
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={`tracker-${tracker.id}`} className="text-sm">
                      {tracker.full_name || tracker.email} ({tracker.id.substring(0,6)})
                    </label>
                  </div>
                ))}
                {allTrackers.length === 0 && (
                  <p className="text-sm text-gray-500">No trackers found.</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Events to Track:</label>
            <div className="space-y-2 border rounded-md p-2">
              {eventTypes.map(event => (
                <div key={event.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`event-${event.id}`}
                    value={event.id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvents([...selectedEvents, event.id]);
                      } else {
                        setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                      }
                    }}
                    className="rounded"
                  />
                  <label htmlFor={`event-${event.id}`} className="text-sm">{event.name}</label>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting || loadingData}
          >
            {isSubmitting ? 'Saving...' : 'Save Full Setup & Notify Trackers'}
          </button>
        </>
      )}
    </div>
  );
};

export default VideoMatchSetup;
