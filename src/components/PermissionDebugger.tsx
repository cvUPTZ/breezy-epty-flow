// Debug component to help troubleshoot permissions
import React from 'react';
import { usePermissionChecker } from '@/hooks/usePermissionChecker';
import { useAuth } from '@/context/AuthContext';

/**
 * @component PermissionDebugger
 * @description A debugging tool for developers to inspect the current user's
 * permissions and roles. It displays the user's role, all their granted permissions,
 * and the routes they are allowed to access based on the permissions system.
 * This component should only be used for development and troubleshooting purposes.
 * @returns {React.FC} A React functional component.
 */
const PermissionDebugger = () => {
  const { user } = useAuth();
  const { role, permissions, hasPermission, isLoading, error, getAllowedRoutes } = usePermissionChecker();

  if (isLoading) return <div>Loading permissions...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-4">Permission Debug Info</h3>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>Role:</strong> {role || 'No role'}</p>
        <p><strong>Can View Analytics (role-based):</strong> {['admin', 'manager'].includes(role || '') ? 'Yes' : 'No'}</p>
        <p><strong>Can View Analytics (permission):</strong> {hasPermission('canViewAnalytics') ? 'Yes' : 'No'}</p>
        <p><strong>Combined Check:</strong> {(['admin', 'manager'].includes(role || '') || hasPermission('canViewAnalytics')) ? 'Yes' : 'No'}</p>
        
        <div className="mt-4">
          <strong>All Permissions:</strong>
          <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(permissions, null, 2)}
          </pre>
        </div>
        
        <div className="mt-4">
          <strong>Allowed Routes:</strong>
          <ul className="list-disc list-inside">
            {getAllowedRoutes().map(route => (
              <li key={route}>{route}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PermissionDebugger;
