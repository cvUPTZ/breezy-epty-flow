
import React from 'react';
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
import { Video, Target } from 'lucide-react';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const menuItems = useMenuItems();
  
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
      </SidebarContent>
    </Sidebar>
  );
}
