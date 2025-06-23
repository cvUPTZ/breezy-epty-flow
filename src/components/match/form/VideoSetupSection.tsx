
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoMatchSetup from '@/components/admin/VideoMatchSetup';

interface VideoSetupSectionProps {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
}

const VideoSetupSection: React.FC<VideoSetupSectionProps> = ({
  videoUrl,
  onVideoUrlChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <VideoMatchSetup
          simplifiedView={true}
          videoUrl={videoUrl}
          onVideoUrlChange={onVideoUrlChange}
        />
      </CardContent>
    </Card>
  );
};

export default VideoSetupSection;
