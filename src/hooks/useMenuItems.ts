
import { useMemo } from 'react';
import { LayoutDashboard, Play, Calendar, BarChart3, TrendingUp, Target, Eye, Network, AlertTriangle, Briefcase, DollarSign, ClipboardCheck, Keyboard, AppWindow } from 'lucide-react';
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

    // Add business pages for admins and managers
    if (isAdmin() || hasPermission('canViewAnalytics')) { // Using same logic as scouting
      items.push({
        value: 'business-plan',
        label: 'Business Plan',
        icon: Briefcase,
        path: '/business/plan'
      });
      items.push({
        value: 'market-intelligence',
        label: 'Market Study',
        icon: Eye, // Using Eye icon like scouting
        path: '/business/market-intelligence'
      });
      items.push({
        value: 'pitch-deck',
        label: 'Presentation',
        icon: TrendingUp, // Using TrendingUp icon like analytics
        path: '/business/pitch'
      });
      items.push({
        value: 'business-canvas',
        label: 'Business Canvas',
        icon: LayoutDashboard, // Using Dashboard icon
        path: '/business/canvas'
      });
      items.push({
        value: 'service-offer',
        label: 'Service Offer',
        icon: DollarSign,
        path: '/business/service-offer'
      });
    }
    
    if (isAdmin()) {
      items.push({ 
        value: 'quality-control', 
        label: 'Quality Control', 
        icon: ClipboardCheck, 
        path: '/admin/quality-control'
      });
      
      items.push({ 
        value: 'keyboard-manager', 
        label: 'Keyboard Manager', 
        icon: Keyboard, 
        path: '/admin/keyboard-manager'
      });
      
      items.push({ 
        value: 'gpu-network', 
        label: 'GPU Network', 
        icon: Network, 
        path: '/admin/gpu-network'
      });
      
      items.push({ 
        value: 'error-manager', 
        label: 'Error Manager', 
        icon: AlertTriangle, 
        path: '/admin/error-manager'
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
