
import { useMemo } from 'react';
import { LayoutDashboard, Play, Calendar, BarChart3, TrendingUp, Target, Eye, Network } from 'lucide-react';
import { usePermissionChecker } from './usePermissionChecker';
import { type RolePermissions } from './useUserPermissions';

interface MenuItem {
  value: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  permission?: keyof RolePermissions;
}

export const useMenuItems = () => {
  const { hasPermission, isAdmin } = usePermissionChecker();

  const menuItems = useMemo(() => {
    const items: MenuItem[] = [
      { 
        value: 'dashboard', 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        path: '/',
        permission: 'canViewDashboard'
      }
    ];
  
    if (hasPermission('canViewMatches')) {
      items.push({ 
        value: 'new-match', 
        label: 'New Match', 
        icon: Play, 
        path: '/match',
        permission: 'canViewMatches'
      });
    }
    
    if (hasPermission('canViewMatches')) {
      items.push({ 
        value: 'match-history', 
        label: 'Match History', 
        icon: Calendar, 
        path: '/matches',
        permission: 'canViewMatches'
      });
    }
    
    if (hasPermission('canViewStatistics')) {
      items.push({ 
        value: 'statistics', 
        label: 'Statistics', 
        icon: BarChart3, 
        path: '/statistics',
        permission: 'canViewStatistics'
      });
    }
    
    if (hasPermission('canViewAnalytics')) {
      items.push({ 
        value: 'analytics', 
        label: 'Analytics', 
        icon: TrendingUp, 
        path: '/analytics',
        permission: 'canViewAnalytics'
      });
    }
    
    // Add scouting for admins and managers
    if (isAdmin() || hasPermission('canViewAnalytics')) {
      items.push({ 
        value: 'scouting', 
        label: 'Scouting', 
        icon: Eye, 
        path: '/scouting'
      });
    }
    
    if (isAdmin()) {
      items.push({ 
        value: 'gpu-network', 
        label: 'GPU Network', 
        icon: Network, 
        path: '/admin/gpu-network'
      });
      
      items.push({ 
        value: 'admin', 
        label: 'Admin Panel', 
        icon: Target, 
        path: '/admin',
        permission: 'canAccessAdmin'
      });
    }

    return items;
  }, [hasPermission, isAdmin]);

  return menuItems;
};
