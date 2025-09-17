
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissionChecker, type RolePermissions } from '@/hooks/usePermissionChecker';
import { Loader2 } from 'lucide-react';

/**
 * @component RequireAuth
 * @description A wrapper component that protects routes based on authentication status,
 * user roles, and specific permissions. It handles loading states and redirects
 * unauthenticated or unauthorized users appropriately.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render if authorization is successful.
 * @param {Array<'admin' | 'tracker' | 'viewer' | 'user' | 'manager' | 'teacher'>} [props.requiredRoles] - An optional array of roles that are allowed access.
 * @param {Array<keyof RolePermissions>} [props.requiredPermissions] - An optional array of specific permissions required for access.
 * @returns {React.FC} The child components if authorized, or a loading/error/redirect component.
 */
type UserRole = 'admin' | 'tracker' | 'viewer' | 'user' | 'manager' | 'teacher';

export const RequireAuth: React.FC<{ 
  children: React.ReactNode;
  requiredRoles?: Array<UserRole>;
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
    if (!role || !requiredRoles.includes(role as UserRole)) {
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

/**
 * @component AdminOnly
 * @description A convenience wrapper for RequireAuth that restricts access to users with the 'admin' role.
 * @param {{ children: React.ReactNode }} props - The component props.
 * @returns {React.FC} The wrapped children, accessible only to admins.
 */
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RequireAuth requiredRoles={['admin']}>
      {children}
    </RequireAuth>
  );
};

/**
 * @component ManagerAccess
 * @description A convenience wrapper for RequireAuth that restricts access to users with 'admin' or 'manager' roles.
 * @param {{ children: React.ReactNode }} props - The component props.
 * @returns {React.FC} The wrapped children, accessible only to admins and managers.
 */
export const ManagerAccess: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RequireAuth requiredRoles={['admin', 'manager']}>
      {children}
    </RequireAuth>
  );
};

/**
 * @component TrackerAccess
 * @description A convenience wrapper for RequireAuth that restricts access to users with 'admin' or 'tracker' roles.
 * @param {{ children: React.ReactNode }} props - The component props.
 * @returns {React.FC} The wrapped children, accessible only to admins and trackers.
 */
export const TrackerAccess: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RequireAuth requiredRoles={['admin', 'tracker']}>
      {children}
    </RequireAuth>
  );
};
