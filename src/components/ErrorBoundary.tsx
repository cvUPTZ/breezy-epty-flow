import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { errorManager } from '@/services/errorManager';

/**
 * @interface Props
 * @description Props for the ErrorBoundary component.
 * @property {ReactNode} children - The child components that the boundary will wrap.
 * @property {ReactNode} [fallback] - An optional custom fallback UI to render on error.
 * @property {string} [componentName] - An optional name for the component being wrapped, used for logging.
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

/**
 * @interface State
 * @description State for the ErrorBoundary component.
 * @property {boolean} hasError - True if an error has been caught.
 * @property {Error} [error] - The caught error object.
 * @property {ErrorInfo} [errorInfo] - The component stack trace information.
 */
interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * @class ErrorBoundary
 * @extends Component<Props, State>
 * @description A React class component that catches JavaScript errors anywhere in its child
 * component tree, logs those errors, and displays a fallback UI instead of the crashed component tree.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });

    // Log error to our error management system
    errorManager.logComponentError(
      error,
      this.props.componentName || 'ErrorBoundary',
      {
        componentStack: errorInfo.componentStack,
        errorInfo
      }
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
              <CardDescription>
                An error occurred in the {this.props.componentName || 'application'}. 
                The error has been logged and will be reviewed by our team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-muted p-3 rounded-md text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development Mode)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs bg-background p-2 rounded mt-1 overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs bg-background p-2 rounded mt-1 overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * @function withErrorBoundary
 * @description A Higher-Order Component (HOC) that wraps a given component with the ErrorBoundary.
 * This is a convenient way to apply error handling to functional components.
 * @template P - The props of the component to be wrapped.
 * @param {React.ComponentType<P>} Component - The React component to wrap.
 * @param {string} [componentName] - An optional name for the component, used for logging. If not provided, the component's `name` property is used.
 * @returns {React.FC<P>} A new component that renders the original component inside an ErrorBoundary.
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary componentName={componentName || Component.name}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${componentName || Component.name})`;
  
  return WrappedComponent;
};