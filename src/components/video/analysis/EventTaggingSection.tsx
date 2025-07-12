
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag, Trash2 } from 'lucide-react';

export interface EventTaggingSectionProps {
  currentTime: number;
  videoUrl: string;
  onEventAdd?: (event: VideoEvent) => void;
}

interface VideoEvent {
  id: string;
  time: number;
  type: string;
  description: string;
  timestamp: string;
}

export const EventTaggingSection: React.FC<EventTaggingSectionProps> = ({
  currentTime,
  videoUrl,
  onEventAdd
}) => {
  const [events, setEvents] = useState<VideoEvent[]>([]);
  const [eventType, setEventType] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleAddEvent = () => {
    if (!eventType.trim() || !eventDescription.trim()) return;

    const newEvent: VideoEvent = {
      id: Date.now().toString(),
      time: currentTime,
      type: eventType,
      description: eventDescription,
      timestamp: formatTime(currentTime)
    };

    setEvents(prev => [...prev, newEvent]);
    onEventAdd?.(newEvent);
    setEventType('');
    setEventDescription('');
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Event Tagging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="event-type">Event Type</Label>
            <Input
              id="event-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="e.g., Goal, Foul, Corner"
            />
          </div>
          <div>
            <Label htmlFor="current-time">Time</Label>
            <Input
              id="current-time"
              value={formatTime(currentTime)}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="event-description">Description</Label>
          <Input
            id="event-description"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Describe the event..."
          />
        </div>
        
        <Button
          onClick={handleAddEvent}
          disabled={!eventType.trim() || !eventDescription.trim()}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
        
        {events.length > 0 && (
          <div className="space-y-2">
            <Label>Tagged Events ({events.length})</Label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{event.type}</Badge>
                      <span className="text-sm font-medium">{event.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEvent(event.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
