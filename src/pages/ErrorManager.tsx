import React from 'react';
import ErrorManager from '@/components/admin/ErrorManager';
import { RequireAuth } from '@/components/RequireAuth';
import ErrorBoundary from '@/components/ErrorBoundary';

const ErrorManagerPage: React.FC = () => {
  return (
    <RequireAuth>
      <ErrorBoundary componentName="ErrorManagerPage">
        <div className="container mx-auto px-4 py-8">
          <ErrorManager />
        </div>
      </ErrorBoundary>
    </RequireAuth>
  );
};

export default ErrorManagerPage;