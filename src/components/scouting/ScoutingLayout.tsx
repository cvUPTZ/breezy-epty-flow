import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import MatchAnalysisSidebar from '@/components/match/MatchAnalysisSidebar';

interface ScoutingLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export const ScoutingLayout = ({ children, title, description }: ScoutingLayoutProps) => {
  const menuItems: any[] = [];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <MatchAnalysisSidebar menuItems={menuItems} groupLabel="Navigation" />
        <SidebarInset className="flex-1">
          <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                {description && (
                  <p className="text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            </div>
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
