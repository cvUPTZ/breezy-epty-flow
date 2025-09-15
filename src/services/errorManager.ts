import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ErrorDetails {
  errorType: 'frontend' | 'backend' | 'network' | 'auth';
  errorCategory: 'runtime' | 'api' | 'validation' | 'auth' | 'network';
  errorCode?: string;
  errorMessage: string;
  stackTrace?: string;
  componentName?: string;
  functionName?: string;
  url?: string;
  metadata?: Record<string, any>;
  severity?: 'critical' | 'error' | 'warning' | 'info';
}

export class ErrorManager {
  private static instance: ErrorManager;
  private sessionId: string;
  private errorQueue: ErrorDetails[] = [];
  private isOnline = true;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.setupNetworkMonitoring();
  }

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        errorType: 'frontend',
        errorCategory: 'runtime',
        errorMessage: event.message || 'Unknown error',
        stackTrace: event.error?.stack,
        componentName: 'Global',
        url: event.filename,
        metadata: {
          lineno: event.lineno,
          colno: event.colno,
        },
        severity: 'error'
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        errorType: 'frontend',
        errorCategory: 'runtime',
        errorMessage: event.reason?.message || 'Unhandled Promise Rejection',
        stackTrace: event.reason?.stack,
        componentName: 'Promise',
        metadata: {
          reason: event.reason,
        },
        severity: 'error'
      });
    });

    // React errors are now handled by ErrorBoundary components.
    // The console.error wrapper has been removed to avoid duplicate logging.
  }

  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.logError({
        errorType: 'network',
        errorCategory: 'network',
        errorMessage: 'Network connection lost',
        severity: 'warning'
      });
    });
  }

  async logError(errorDetails: ErrorDetails): Promise<void> {
    const enrichedError = {
      ...errorDetails,
      url: errorDetails.url || window.location.href,
      metadata: {
        ...errorDetails.metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
      }
    };

    if (!this.isOnline) {
      this.errorQueue.push(enrichedError);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ errorDetails: enrichedError })
      });

      if (!response.ok) {
        throw new Error(`Failed to log error: ${response.statusText}`);
      }

      // Show user notification for critical errors
      if (enrichedError.severity === 'critical') {
        toast({
          title: "Critical Error",
          description: "A critical error occurred. Our team has been notified.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error logging failed:', error);
      this.errorQueue.push(enrichedError);
    }
  }

  private async flushErrorQueue(): Promise<void> {
    while (this.errorQueue.length > 0 && this.isOnline) {
      const errorToLog = this.errorQueue.shift();
      if (errorToLog) {
        await this.logError(errorToLog);
      }
    }
  }

  // API error handler
  async logApiError(error: any, endpoint: string, method: string = 'GET'): Promise<void> {
    await this.logError({
      errorType: 'backend',
      errorCategory: 'api',
      errorCode: error?.code || error?.status?.toString(),
      errorMessage: error?.message || 'API request failed',
      functionName: endpoint,
      metadata: {
        method,
        endpoint,
        status: error?.status,
        response: error?.data,
      },
      severity: 'error'
    });
  }

  // Network error handler
  async logNetworkError(error: any, url: string): Promise<void> {
    await this.logError({
      errorType: 'network',
      errorCategory: 'network',
      errorMessage: error?.message || 'Network request failed',
      url,
      metadata: {
        networkError: error,
      },
      severity: 'error'
    });
  }

  // Auth error handler
  async logAuthError(error: any, action: string): Promise<void> {
    await this.logError({
      errorType: 'auth',
      errorCategory: 'auth',
      errorCode: error?.code,
      errorMessage: error?.message || 'Authentication error',
      functionName: action,
      metadata: {
        authError: error,
      },
      severity: 'warning'
    });
  }

  // Component error handler
  async logComponentError(error: any, componentName: string, props?: any): Promise<void> {
    await this.logError({
      errorType: 'frontend',
      errorCategory: 'runtime',
      errorMessage: error?.message || 'Component error',
      stackTrace: error?.stack,
      componentName,
      metadata: {
        props,
        componentError: error,
      },
      severity: 'error'
    });
  }
}

// Global instance
export const errorManager = ErrorManager.getInstance();

// Hook for components
export const useErrorHandler = () => {
  const logError = (error: any, context?: string) => {
    errorManager.logComponentError(error, context || 'Unknown Component');
  };

  const logApiError = (error: any, endpoint: string, method?: string) => {
    errorManager.logApiError(error, endpoint, method);
  };

  const logNetworkError = (error: any, url: string) => {
    errorManager.logNetworkError(error, url);
  };

  const logAuthError = (error: any, action: string) => {
    errorManager.logAuthError(error, action);
  };

  return {
    logError,
    logApiError,
    logNetworkError,
    logAuthError
  };
};