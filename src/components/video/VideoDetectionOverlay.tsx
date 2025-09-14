
import React from 'react';
import { createPortal } from 'react-dom';
import { NetworkGPUDetectionPanel } from '../detection/NetworkGPUDetectionPanel';
import { DetectionFrame } from '@/services/distributedGPUService';

interface VideoDetectionOverlayProps {
  videoId: string;
  isVisible: boolean;
  onClose: () => void;
  onDetectionResults: (results: DetectionFrame[]) => void;
  isFullscreen: boolean;
}

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
