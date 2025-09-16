
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, Target, TrendingUp } from 'lucide-react';

/**
 * @interface AnalysisStatsProps
 * @description Props for the AnalysisStats component.
 * @property {string} videoUrl - The URL of the video being analyzed.
 * @property {number} currentTime - The current playback time of the video.
 */
export interface AnalysisStatsProps {
  videoUrl: string;
  currentTime: number;
}

/**
 * @component AnalysisStats
 * @description A component that displays a set of statistics related to the video analysis.
 * In its current form, it uses mock data to show metrics like total events, events per minute,
 * and timeline progress.
 * @param {AnalysisStatsProps} props The props for the component.
 * @returns {JSX.Element} The rendered AnalysisStats component.
 */
export const AnalysisStats: React.FC<AnalysisStatsProps> = ({
  videoUrl,
  currentTime
}) => {
  // Mock stats data - in a real implementation, this would come from analysis services
  const stats = {
    totalEvents: 15,
    avgEventsPerMinute: 2.3,
    mostCommonEvent: 'Pass',
    timelineProgress: (currentTime / 300) * 100 // Assuming 5min video
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analysis Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.avgEventsPerMinute}</div>
              <div className="text-sm text-gray-600">Events/Min</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Event Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Most Common Event</span>
            <Badge variant="outline">{stats.mostCommonEvent}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Timeline Progress</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 rounded">
                <div 
                  className="h-full bg-blue-500 rounded" 
                  style={{ width: `${Math.min(100, stats.timelineProgress)}%` }}
                />
              </div>
              <span className="text-sm">{Math.round(stats.timelineProgress)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Playback Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Current Time:</span>
              <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span>Video Source:</span>
              <span className="truncate max-w-32" title={videoUrl}>
                {videoUrl.includes('supabase') ? 'Uploaded Video' : 'External URL'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
