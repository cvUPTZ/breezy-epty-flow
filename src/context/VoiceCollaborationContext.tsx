
import React, { createContext, useContext, ReactNode } from 'react';
import { useNewVoiceCollaboration, VoiceCollaborationState } from '@/hooks/useNewVoiceCollaboration';

const VoiceCollaborationContext = createContext<VoiceCollaborationState | undefined>(undefined);

export const VoiceCollaborationProvider = ({ children }: { children: ReactNode }) => {
  const value = useNewVoiceCollaboration();
  return (
    <VoiceCollaborationContext.Provider value={value}>
      {children}
    </VoiceCollaborationContext.Provider>
  );
};

export function useVoiceCollaborationContext(): VoiceCollaborationState {
  const context = useContext(VoiceCollaborationContext);
  if (!context) {
    throw new Error('useVoiceCollaborationContext must be used within a VoiceCollaborationProvider');
  }
  return context;
}
