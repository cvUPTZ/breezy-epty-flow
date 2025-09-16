
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Video, Target, Users, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const menuItems = useMenuItems();
  const { signIn, user, userRole, signOut } = useAuth();
  const [switchingAccount, setSwitchingAccount] = useState(false);
  
  const isCollapsed = state === 'collapsed';
  const currentPath = location.pathname;

  // Add direct analyzer to menu items
  const allMenuItems = [
    ...menuItems,
    {
      value: 'direct-analyzer',
      label: 'Direct Video Analyzer',
      icon: Video,
      path: '/direct-analyzer'
    }
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    return currentPath === path;
  };

  const handleAccountSwitch = async () => {
    if (switchingAccount) return;
    
    setSwitchingAccount(true);
    try {
      // Determine which account to switch to based on current user
      const isCurrentlyAdmin = user?.email === 'adminzack@efoot.com';
      const targetEmail = isCurrentlyAdmin ? 'excelzed@gmail.com' : 'adminzack@efoot.com';
      const targetPassword = '123456';
      const targetRole = isCurrentlyAdmin ? 'tracker' : 'admin';
      
      // Sign out current user
      await signOut();
      
      // Sign in with target account
      await signIn(targetEmail, targetPassword);
      
      toast.success(`Switched to ${targetRole} account: ${targetEmail}`);
    } catch (error) {
      console.error('Account switch error:', error);
      toast.error('Failed to switch account');
    } finally {
      setSwitchingAccount(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Target className="w-8 h-8 text-primary" />
          {!isCollapsed && (
            <span className="font-bold text-lg">Sports Tracker</span>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={isCollapsed ? item.label : undefined}
                    >
                      <NavLink
                        to={item.path || '/'}
                        className={({ isActive }) =>
                          `flex items-center gap-2 ${
                            isActive
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>MVP Section</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/mvp/matches')}>
                  <NavLink to="/mvp/matches" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {!isCollapsed && <span>MVP Matches</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account Switcher */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 space-y-2">
                <div className="text-xs text-muted-foreground">
                  Current: {user.email} ({userRole})
                </div>
                <Button
                  onClick={handleAccountSwitch}
                  disabled={switchingAccount}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  {user.email === 'adminzack@efoot.com' ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      {!isCollapsed && "Switch to Tracker"}
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      {!isCollapsed && "Switch to Admin"}
                    </>
                  )}
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
