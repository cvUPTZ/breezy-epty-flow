import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedEventTypeIcon } from '@/components/match/EnhancedEventTypeIcon';
import { Loader2, User } from 'lucide-react';

/**
 * @interface CompactPlayerTrackerProps
 * @description Props for the CompactPlayerTracker component.
 * @property {string} playerId - The ID of the player being tracked.
 * @property {string} playerName - The name of the player.
 * @property {'home' | 'away'} playerTeam - The team the player belongs to.
 * @property {string[]} assignedEventTypes - An array of event types assigned to this player.
 * @property {string} matchId - The ID of the current match.
 * @property {() => number} getCurrentVideoTime - A function that returns the current timestamp of the video.
 * @property {number} [jerseyNumber] - The jersey number of the player.
 */
interface CompactPlayerTrackerProps {
  playerId: string;
  playerName: string;
  playerTeam: 'home' | 'away';
  assignedEventTypes: string[];
  matchId: string;
  getCurrentVideoTime: () => number;
  jerseyNumber?: number;
}

/**
 * @component CompactPlayerTracker
 * @description A compact UI component designed for tracking the events of a single player,
 * typically used alongside a video player. It displays the player's name, team, and a grid of
 * buttons for their assigned event types, which records events with the video's current timestamp.
 * @param {CompactPlayerTrackerProps} props The props for the component.
 * @returns {JSX.Element} The rendered CompactPlayerTracker component.
 */
const CompactPlayerTracker: React.FC<CompactPlayerTrackerProps> = ({
  playerId,
  playerName,
  playerTeam,
  assignedEventTypes,
  matchId,
  getCurrentVideoTime,
  jerseyNumber,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingEventType, setRecordingEventType] = useState<string | null>(null);

  const handleEventRecord = useCallback(async (eventType: string) => {
    if (!user || isRecording) return;

    setIsRecording(true);
    setRecordingEventType(eventType);

    try {
      const videoTimestamp = getCurrentVideoTime();

      const eventToInsert = {
        match_id: matchId,
        event_type: eventType,
        player_id: parseInt(playerId, 10),
        team: playerTeam,
        coordinates: null,
        details: {
          video_timestamp: videoTimestamp,
          recorded_by_video_tracker: true,
          recorded_via_compact_tracker: true,
        },
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('match_events')
        .insert(eventToInsert)
        .select()
        .single();

      if (error) throw error;

      toast({ 
        title: "Event Recorded", 
        description: `${eventType} for ${playerName} at ${videoTimestamp.toFixed(1)}s`,
        duration: 2000,
      });

    } catch (error: any) {
      console.error('Error recording event:', error);
      toast({ 
        title: "Recording Error", 
        description: `Failed to record ${eventType}`, 
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRecording(false);
      setRecordingEventType(null);
    }
  }, [user, playerId, playerName, playerTeam, matchId, getCurrentVideoTime, toast, isRecording]);

  const getTeamColor = (team: 'home' | 'away') => {
    return team === 'home' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className="w-full max-w-sm border shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground" />
              {jerseyNumber && (
                <Badge variant="outline" className="h-5 px-1 text-xs">
                  #{jerseyNumber}
                </Badge>
              )}
            </div>
            <h4 className="text-sm font-medium truncate">{playerName}</h4>
          </div>
          <Badge className={`text-xs ${getTeamColor(playerTeam)}`}>
            {playerTeam}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="grid grid-cols-3 gap-1">
          {assignedEventTypes.map((eventType) => {
            const isRecordingThis = isRecording && recordingEventType === eventType;
            return (
              <Button
                key={eventType}
                onClick={() => handleEventRecord(eventType)}
                disabled={isRecording}
                variant="outline"
                size="sm"
                className={`h-10 p-1 flex flex-col items-center justify-center gap-1 text-xs transition-all ${
                  isRecordingThis 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'hover:bg-muted/50'
                }`}
                title={`Record ${eventType} for ${playerName}`}
              >
                {isRecordingThis ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <EnhancedEventTypeIcon eventType={eventType as any} size={14} />
                )}
                <span className="text-[10px] leading-none">{eventType}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactPlayerTracker;