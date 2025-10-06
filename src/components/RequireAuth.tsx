
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissionChecker, type RolePermissions } from '@/hooks/usePermissionChecker';
import { Loader2 } from 'lucide-react';

export const RequireAuth: React.FC<{ 
  children: React.ReactNode;
  requiredRoles?: Array<'admin' | 'tracker' | 'viewer' | 'user' | 'manager' | 'teacher'>;
  requiredPermissions?: Array<keyof RolePermissions>;
}> = ({ 
  children, 
  requiredRoles,
  requiredPermissions
}) => {
  const { user, loading } = useAuth();
  const { role, hasPermission, isLoading: permissionsLoading, error } = usePermissionChecker();
  const location = useLocation();

  const isLoading = loading || permissionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  // If user is not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If there's an error loading permissions, show error message
  if (error) {
    console.error('Permission check error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading permissions</p>
          <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // If specific roles are required, check user's role
  if (requiredRoles && requiredRoles.length > 0) {
    if (!role || !requiredRoles.includes(role as any)) {
      // Log permission denied event
      console.warn(`Access denied: User role '${role}' not in required roles: ${requiredRoles.join(', ')}`);
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-2">Access Denied</p>
            <p className="text-sm text-muted-foreground">
              You need one of these roles: {requiredRoles.join(', ')}
            </p>
            <p className="text-sm text-muted-foreground">Your role: {role || 'none'}</p>
          </div>
        </div>
      );
    }
  }

  // If specific permissions are required, check user's permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
    if (!hasAllPermissions) {
      console.warn(`Access denied: User missing required permissions: ${requiredPermissions.join(', ')}`);
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-2">Access Denied</p>
            <p className="text-sm text-muted-foreground">
              You don't have the required permissions
            </p>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required role (if any)
  return <>{children}</>;
};

// Helper components for specific access levels
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RequireAuth requiredRoles={['admin']}>
      {children}
    </RequireAuth>
  );
};

export const ManagerAccess: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RequireAuth requiredRoles={['admin', 'manager']}>
      {children}
    </RequireAuth>
  );
};

export const TrackerAccess: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RequireAuth requiredRoles={['admin', 'tracker']}>
      {children}
    </RequireAuth>
  );
};
