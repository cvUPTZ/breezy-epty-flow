import { createContext, useContext, type ReactNode } from 'react';
import { useNewVoiceCollaboration } from '@/hooks/useNewVoiceCollaboration';
import { useAuth } from './AuthContext';

// Prepare the context value type based on the hook return
type VoiceCollabContextType = ReturnType<typeof useNewVoiceCollaboration>;

const VoiceCollaborationContext = createContext<VoiceCollabContextType | undefined>(undefined);

export const VoiceCollaborationProvider = ({ children }: { children: ReactNode }) => {
  const { user, userRole } = useAuth();
  const participantName = user?.user_metadata?.full_name || user?.app_metadata?.full_name || 'Anonymous';

  const value = useNewVoiceCollaboration({
    userId: user?.id || '',
    userName: participantName,
    userRole: userRole || '',
  });

  return (
    <VoiceCollaborationContext.Provider value={value}>
      {children}
    </VoiceCollaborationContext.Provider>
  );
};

export function useVoiceCollaborationContext() {
  const context = useContext(VoiceCollaborationContext);
  if (!context) {
    throw new Error('useVoiceCollaborationContext must be used within a VoiceCollaborationProvider');
  }
  return context;
}