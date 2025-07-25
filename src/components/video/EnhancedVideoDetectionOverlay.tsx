
import React from 'react';
import { createPortal } from 'react-dom';
import { ProductionPlayerBallDetectionPanel } from '../detection/ProductionPlayerBallDetectionPanel';
import { DetectionResult } from '@/services/enhancedPythonDetectionService';

interface EnhancedVideoDetectionOverlayProps {
  videoId: string;
  isVisible: boolean;
  onClose: () => void;
  onDetectionResults: (results: DetectionResult[]) => void;
  isFullscreen: boolean;
}

export const EnhancedVideoDetectionOverlay: React.FC<EnhancedVideoDetectionOverlayProps> = ({
  videoId,
  isVisible,
  onClose,
  onDetectionResults,
  isFullscreen,
}) => {
  if (!isVisible) return null;

  const overlay = (
    <div 
      className="absolute top-16 left-4 w-96 bg-black/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
      style={{ zIndex: isFullscreen ? 2147483647 : 50 }}
    >
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-blue-900/30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-white text-sm">AI Detection Pro</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-lg font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all duration-200"
        >
          ×
        </button>
      </div>
      <div className="p-4">
        <ProductionPlayerBallDetectionPanel
          videoId={videoId}
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
