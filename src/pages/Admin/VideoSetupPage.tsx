
import React, { useState } from 'react';
import VideoMatchSetup from '@/components/admin/VideoMatchSetup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

const VideoSetupPage: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center space-x-3">
            <Video className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Video Match Setup</CardTitle>
              <CardDescription>
                Configure YouTube videos for matches, assign trackers, and manage notifications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <VideoMatchSetup
            videoUrl={videoUrl}
            onVideoUrlChange={setVideoUrl}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoSetupPage;
