
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoMatchSetup from '@/components/admin/VideoMatchSetup';

/**
 * @interface VideoSetupSectionProps
 * @description Props for the VideoSetupSection component.
 * @property {string} videoUrl - The current URL of the video for the match.
 * @property {(url: string) => void} onVideoUrlChange - Callback function to handle changes to the video URL.
 */
interface VideoSetupSectionProps {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
}

/**
 * @component VideoSetupSection
 * @description A form section component for configuring the video source for a match.
 * It acts as a wrapper around the `VideoMatchSetup` component, presenting it within a card for use in a larger form.
 * @param {VideoSetupSectionProps} props The props for the component.
 * @returns {JSX.Element} The rendered VideoSetupSection component.
 */
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
