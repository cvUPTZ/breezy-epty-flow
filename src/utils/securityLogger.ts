// Security logging utility for monitoring sensitive actions
import { supabase } from '@/integrations/supabase/client';

export class SecurityLogger {
  // Log security events to the audit log
  static async logSecurityEvent(
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      // Call the security logging function
      const { error } = await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_details: details || {}
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      // Don't let logging errors break the application
      console.error('Security logging error:', error);
    }
  }

  // Log authentication events
  static async logAuthEvent(action: 'login' | 'logout' | 'failed_login', details?: Record<string, any>) {
    await this.logSecurityEvent(action, 'auth', undefined, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...details
    });
  }

  // Log permission violations
  static async logPermissionViolation(action: string, resourceType: string, resourceId?: string) {
    await this.logSecurityEvent('permission_violation', resourceType, resourceId, {
      attempted_action: action,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }

  // Log sensitive data access
  static async logDataAccess(resourceType: string, resourceId: string, action: 'read' | 'write' | 'delete') {
    await this.logSecurityEvent(`data_${action}`, resourceType, resourceId, {
      timestamp: new Date().toISOString()
    });
  }

  // Log voice room moderation actions
  static async logModerationAction(roomId: string, targetUserId: string, action: string) {
    await this.logSecurityEvent('voice_moderation', 'voice_room', roomId, {
      target_user_id: targetUserId,
      moderation_action: action,
      timestamp: new Date().toISOString()
    });
  }
}