import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
}

export class SecurityMonitor {
  static async logEvent(event: SecurityEvent): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('security_audit_log').insert({
        user_id: user?.id || null,
        action: event.action,
        resource_type: event.resource_type,
        resource_id: event.resource_id,
        details: {
          ...event.details,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  static async logAuthEvent(action: 'login' | 'logout' | 'signup' | 'password_reset', details?: Record<string, any>): Promise<void> {
    await this.logEvent({
      action: `auth_${action}`,
      resource_type: 'authentication',
      details
    });
  }

  static async logDataAccess(resourceType: string, resourceId: string, action: 'read' | 'write' | 'delete'): Promise<void> {
    await this.logEvent({
      action: `data_${action}`,
      resource_type: resourceType,
      resource_id: resourceId,
      details: {
        access_type: action
      }
    });
  }

  static async logPermissionDenied(requiredRole?: string, requiredPermission?: string): Promise<void> {
    await this.logEvent({
      action: 'permission_denied',
      resource_type: 'access_control',
      details: {
        required_role: requiredRole,
        required_permission: requiredPermission
      }
    });
  }

  static async validateSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-session');
      
      if (error || !data?.valid) {
        await this.logEvent({
          action: 'session_validation_failed',
          resource_type: 'auth_session',
          details: { error: error?.message || 'Invalid session' }
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
}

export default SecurityMonitor;