
import React from 'react';
import { createPortal } from 'react-dom';
import { NetworkGPUDetectionPanel } from '../detection/NetworkGPUDetectionPanel';
import { DetectionFrame } from '@/services/distributedGPUService';

/**
 * @interface VideoDetectionOverlayProps
 * @description Props for the VideoDetectionOverlay component.
 * @property {string} videoId - The YouTube video ID to run detection on.
 * @property {boolean} isVisible - Whether the overlay is currently visible.
 * @property {() => void} onClose - Callback function to close the overlay.
 * @property {(results: DetectionFrame[]) => void} onDetectionResults - Callback function to handle the detection results from the panel.
 * @property {boolean} isFullscreen - Whether the video player is in fullscreen mode, which affects rendering via a portal.
 */
interface VideoDetectionOverlayProps {
  videoId: string;
  isVisible: boolean;
  onClose: () => void;
  onDetectionResults: (results: DetectionFrame[]) => void;
  isFullscreen: boolean;
}

/**
 * @component VideoDetectionOverlay
 * @description An overlay component designed to house the `NetworkGPUDetectionPanel`.
 * It floats on top of a video player and uses a React portal to ensure it remains visible and functional
 * even when the video is in fullscreen mode.
 * @param {VideoDetectionOverlayProps} props The props for the component.
 * @returns {JSX.Element | null} The rendered overlay component, or null if it's not visible.
 */
export const VideoDetectionOverlay: React.FC<VideoDetectionOverlayProps> = ({
  videoId,
  isVisible,
  onClose,
  onDetectionResults,
  isFullscreen,
}) => {
  if (!isVisible) return null;

  const overlay = (
    <div 
      className="absolute top-16 left-4 w-96 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden"
      style={{ zIndex: isFullscreen ? 2147483647 : 50 }}
    >
      <div className="p-3 border-b border-white/10 bg-black/30 flex justify-between items-center">
        <h3 className="font-medium text-white text-sm">Network GPU Detection</h3>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
        >
          ×
        </button>
      </div>
      <div className="p-3">
        <NetworkGPUDetectionPanel
          videoUrl={`https://www.youtube.com/watch?v=${videoId}`}
          onDetectionResults={onDetectionResults}
        />
      </div>
    </div>
  );

  // Render in portal when in fullscreen to ensure it appears above the video
  if (isFullscreen) {
    return createPortal(overlay, document.body);
  }

  return overlay;
};
