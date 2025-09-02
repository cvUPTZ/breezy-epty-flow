import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import SecurityMonitor from '@/services/securityMonitor';

export const useSecurityMonitor = () => {
  const { user } = useAuth();

  const logDataAccess = useCallback(async (resourceType: string, resourceId: string, action: 'read' | 'write' | 'delete') => {
    if (!user) return;
    await SecurityMonitor.logDataAccess(resourceType, resourceId, action);
  }, [user]);

  const logPermissionDenied = useCallback(async (requiredRole?: string, requiredPermission?: string) => {
    await SecurityMonitor.logPermissionDenied(requiredRole, requiredPermission);
  }, []);

  const validateSession = useCallback(async () => {
    return await SecurityMonitor.validateSession();
  }, []);

  const logCustomEvent = useCallback(async (action: string, details?: Record<string, any>) => {
    await SecurityMonitor.logEvent({
      action,
      resource_type: 'application',
      details
    });
  }, []);

  return {
    logDataAccess,
    logPermissionDenied,
    validateSession,
    logCustomEvent
  };
};

export default useSecurityMonitor;