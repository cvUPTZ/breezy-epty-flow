
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, ChevronsUpDown, Download, Upload, Link, X } from 'lucide-react';
import { YouTubeService } from '@/services/youtubeService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { addMinutes, formatISO } from 'date-fns';
import EnhancedVideoPlayer, { VideoPlayerRef } from './EnhancedVideoPlayer';

interface DirectAnalysisInterfaceProps {
  videoUrl: string;
}

interface Timestamp {
  id: string;
  time: number;
  description: string;
}

export const DirectAnalysisInterface: React.FC<DirectAnalysisInterfaceProps> = ({ videoUrl }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [timestampDescription, setTimestampDescription] = useState('');
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>(null);
  const [isYoutubeUrl, setIsYoutubeUrl] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isEventValid, setIsEventValid] = useState(false);
  const [isTimeValid, setIsTimeValid] = useState(false);
  const [isDescriptionValid, setIsDescriptionValid] = useState(false);
  const { toast } = useToast();

  const videoRef = useRef<VideoPlayerRef>(null);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleDurationChange = (durationValue: number) => {
    setDuration(durationValue);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSliderChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleAddTimestamp = () => {
    if (!timestampDescription.trim()) {
      toast({
        title: "Required",
        description: "Description is required",
      })
      return;
    }

    const newTimestamp = {
      id: Date.now().toString(),
      time: currentTime,
      description: timestampDescription,
    };
    setTimestamps([...timestamps, newTimestamp]);
    setTimestampDescription('');
  };

  const handleCopyToClipboard = () => {
    const textToCopy = timestamps.map(ts => `${formatTime(ts.time)} - ${ts.description}`).join('\n');
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied",
          description: "Timestamps copied to clipboard!",
        })
        setTimeout(() => setIsCopied(false), 3000);
      })
      .catch(err => console.error("Could not copy text: ", err));
  };

  const handleTimestampClick = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimestampDelete = (id: string) => {
    setTimestamps(timestamps.filter(ts => ts.id !== id));
    setSelectedTimestamp(null);
  };

  const handleTimestampEdit = (id: string) => {
    setSelectedTimestamp(id);
    const timestampToEdit = timestamps.find(ts => ts.id === id);
    if (timestampToEdit) {
      setCurrentTime(timestampToEdit.time);
      setTimestampDescription(timestampToEdit.description);
    }
  };

  const handleTimestampUpdate = () => {
    if (!selectedTimestamp) return;

    const updatedTimestamps = timestamps.map(ts =>
      ts.id === selectedTimestamp ? { ...ts, time: currentTime, description: timestampDescription } : ts
    );
    setTimestamps(updatedTimestamps);
    setSelectedTimestamp(null);
    setTimestampDescription('');
  };

  const handleYouTubeURL = async () => {
    setIsExtracting(true);
    setExtractionError(null);
    setYoutubeVideoId(null);

    try {
      const extractedVideoId = YouTubeService.extractVideoId(videoUrl);
      if (extractedVideoId) {
        setYoutubeVideoId(extractedVideoId);
        toast({
          title: "Success",
          description: "YouTube URL is valid",
        })
      } else {
        setExtractionError('Could not extract video ID from the URL.');
        toast({
          title: "Error",
          description: "Could not extract video ID from the URL.",
        })
      }
    } catch (error: any) {
      console.error('Error extracting YouTube video ID:', error);
      setExtractionError(error.message || 'Failed to extract video ID.');
      toast({
        title: "Error",
        description: error.message || 'Failed to extract video ID.',
      })
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadTimestamps = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const filename = 'timestamps.txt';
      const text = timestamps.map(ts => `${formatTime(ts.time)} - ${ts.description}`).join('\n');

      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Timestamps downloaded successfully",
      })
    } catch (error: any) {
      console.error('Error downloading timestamps:', error);
      setDownloadError(error.message || 'Failed to download timestamps.');
      toast({
        title: "Error",
        description: error.message || 'Failed to download timestamps.',
      })
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUploadTimestamps = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const file = event.target.files?.[0];
    if (!file) {
      setIsUploading(false);
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const newTimestamps = lines.map(line => {
        const [timePart, description] = line.split(' - ');
        if (!timePart || !description) return null;

        const [minutes, seconds] = timePart.split(':').map(Number);
        if (isNaN(minutes) || isNaN(seconds)) return null;

        const timeInSeconds = minutes * 60 + seconds;
        return {
          id: Date.now().toString(),
          time: timeInSeconds,
          description: description.trim(),
        };
      }).filter(Boolean) as Timestamp[];

      setTimestamps(newTimestamps);
      setUploadSuccess('Timestamps uploaded successfully!');
      toast({
        title: "Success",
        description: "Timestamps uploaded successfully!",
      })
    } catch (error: any) {
      console.error('Error uploading timestamps:', error);
      setUploadError(error.message || 'Failed to upload timestamps.');
      toast({
        title: "Error",
        description: error.message || 'Failed to upload timestamps.',
      })
    } finally {
      setIsUploading(false);
    }
  };

  const handleEventChange = (event: string) => {
    setSelectedEvent(event);
    setIsEventValid(!!event);
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    setIsTimeValid(!!time);
  };

  const handleDescriptionChange = (description: string) => {
    setTimestampDescription(description);
    setIsDescriptionValid(!!description);
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <EnhancedVideoPlayer
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        className="w-full"
      />

      {/* Current Time Display and Slider */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="video-slider">Current Time: {formatTime(currentTime)} / {formatTime(duration)}</Label>
        <Slider
          id="video-slider"
          defaultValue={[0]}
          max={duration}
          step={0.1}
          onValueChange={handleSliderChange}
          aria-label="Video timeline"
        />
      </div>

      {/* Timestamp Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Add Timestamp Section */}
        <Card>
          <CardContent className="space-y-4">
            <h4 className="text-sm font-medium">Add Timestamp</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="event-select">Event</Label>
                <Select onValueChange={handleEventChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goal">Goal</SelectItem>
                    <SelectItem value="foul">Foul</SelectItem>
                    <SelectItem value="corner">Corner</SelectItem>
                    <SelectItem value="substitution">Substitution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time-input">Time</Label>
                <Input
                  type="number"
                  id="time-input"
                  value={currentTime}
                  onChange={(e) => handleTimeChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="timestamp-description">Description</Label>
              <Input
                type="text"
                id="timestamp-description"
                value={timestampDescription}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Enter description"
                className="w-full"
              />
            </div>
            <Button onClick={handleAddTimestamp} disabled={!isEventValid || !isTimeValid || !isDescriptionValid} className="w-full">
              Add Timestamp
            </Button>
          </CardContent>
        </Card>

        {/* Timestamp List Section */}
        <Card>
          <CardContent className="space-y-4">
            <h4 className="text-sm font-medium">Timestamps</h4>
            <ul className="space-y-2">
              {timestamps.map(ts => (
                <li key={ts.id} className="flex items-center justify-between p-2 border rounded-md">
                  <button onClick={() => handleTimestampClick(ts.time)} className="hover:underline">
                    {formatTime(ts.time)} - {ts.description}
                  </button>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleTimestampEdit(ts.id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleTimestampDelete(ts.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Actions Section */}
      <Card>
        <CardContent className="space-y-4">
          <h4 className="text-sm font-medium">Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleCopyToClipboard} disabled={timestamps.length === 0}>
              Copy to Clipboard
              {isCopied && <Check className="ml-2 h-4 w-4" />}
            </Button>
            <Button onClick={handleDownloadTimestamps} disabled={timestamps.length === 0} >
              Download Timestamps
            </Button>
            <div>
              <Input
                type="file"
                id="upload"
                className="hidden"
                onChange={handleUploadTimestamps}
                accept=".txt"
              />
              <Label htmlFor="upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                Upload Timestamps
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* YouTube URL Extraction */}
      <Card>
        <CardContent className="space-y-4">
          <h4 className="text-sm font-medium">YouTube URL</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="url" placeholder="Enter YouTube URL" value={videoUrl} onChange={(e) => setIsYoutubeUrl(!!e.target.value)} />
            <Button onClick={handleYouTubeURL} disabled={isExtracting}>
              {isExtracting ? 'Extracting...' : 'Extract Video ID'}
            </Button>
          </div>
          {youtubeVideoId && <p>YouTube Video ID: {youtubeVideoId}</p>}
          {extractionError && <p className="text-red-500">{extractionError}</p>}
        </CardContent>
      </Card>

      {/* Date Range Picker */}
      <Card>
        <CardContent className="space-y-4">
          <h4 className="text-sm font-medium">Date Range</h4>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                pagedNavigation
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
    </div>
  );
};
