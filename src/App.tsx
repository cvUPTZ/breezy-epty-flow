import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, AdminOnly, ManagerAccess, TrackerAccess } from "./components/RequireAuth";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ToastAction } from "@/components/ui/toast";

// Import all the page components
import Header from './components/Header';
import { AppSidebar } from './components/AppSidebar';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Index from './pages/Index';
import MatchAnalysisV2 from './pages/MatchAnalysisV2';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CreateMatch from './pages/CreateMatch';
import MatchTimerPage from './pages/MatchTimerPage';
import VideoAnalysis from './pages/VideoAnalysis';
import DirectVideoAnalyzer from './pages/DirectVideoAnalyzer';
import GPUNetworkManagerPage from './pages/GPUNetworkManager';
import ErrorManagerPage from './pages/ErrorManager';
import ErrorBoundary from './components/ErrorBoundary';

import TrackerInterface from './pages/TrackerInterface';
import Matches from './pages/Matches';
import Statistics from './pages/Statistics';
import Admin from './pages/Admin';
import ProfileListPage from './pages/Admin/ProfileListPage';
import NewVoiceChatPage from './pages/NewVoiceChatPage';
import ChromeExtensionBridge from './pages/ChromeExtensionBridge';
import NotFound from './pages/NotFound';

import VideoSetupPage from './pages/Admin/VideoSetupPage';
import Scouting from './pages/Scouting';
import ClubDetails from './components/scouting/ClubDetails';
import MarketIntelligencePage from './pages/MarketIntelligencePage';
import BusinessPlanPage from './pages/BusinessPlanPage';
import StartupPitchPage from './pages/StartupPitchPage';
import BusinessModelCanvasPage from './pages/BusinessModelCanvas';
import ServiceOfferPage from './pages/ServiceOffer';
import RealCodebaseVisualizer from './components/CodeVisualizer';

// Import Business Document Components
import BusinessModelCanvasDocument from './components/documents/BusinessModelCanvasDocument';
import BusinessPlanDocument from './components/documents/BusinessPlanDocument';
import MarketStudyDocument from './components/documents/MarketStudyDocument';

const queryClient = new QueryClient();

interface MatchPayload {
  id: string;
  name?: string | null;
  home_team_name?: string | null;
  away_team_name?: string | null;
  status?: string | null;
  [key: string]: unknown;
}

const AppContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          // Service Worker registered successfully
        } catch (error) {
          // Service Worker registration failed silently
        }
      };
      
      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker);
        return () => window.removeEventListener('load', registerServiceWorker);
      }
    }
  }, []); 

  const noSidebarPaths = ['/auth', '/extension-bridge', '/unauthorized'];
  // Force hide sidebar for all paths to remove the divided layout
  const showSidebar = false; // Changed from the original logic to always false

  const AppRoutes = (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/extension-bridge" element={<ChromeExtensionBridge />} />

      {/* Protected routes - General Access */}
      <Route path="/dashboard" element={
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      } />

      <Route path="/settings" element={
        <RequireAuth>
          <Settings />
        </RequireAuth>
      } />

      {/* Match Management Routes */}
      <Route path="/match" element={
        <RequireAuth
          requiredRoles={['admin', 'tracker']}
          requiredPermissions={['canViewMatches']}
        >
          <Index />
        </RequireAuth>
      } />

      <Route path="/match/:matchId" element={
        <RequireAuth
          requiredRoles={['admin', 'tracker']}
          requiredPermissions={['canTrackMatches']}
        >
          <MatchAnalysisV2 />
        </RequireAuth>
      } />

      <Route path="/match/:matchId/analytics" element={
        <RequireAuth
          requiredRoles={['admin', 'manager']}
          requiredPermissions={['canViewAnalytics']}
        >
          <AnalyticsDashboard />
        </RequireAuth>
      } />

      <Route path="/match/:matchId/edit" element={
        <RequireAuth
          requiredRoles={['admin']}
          requiredPermissions={['canEditMatches']}
        >
          <CreateMatch />
        </RequireAuth>
      } />

      <Route path="/match/:matchId/timer" element={
        <RequireAuth
          requiredRoles={['admin']}
          requiredPermissions={['canManageMatchTimer']}
        >
          <MatchTimerPage />
        </RequireAuth>
      } />

      {/* Video Analysis Routes */}
      <Route path="/video-analysis" element={
        <RequireAuth
          requiredRoles={['admin', 'manager']}
          requiredPermissions={['canAnalyzeVideos']}
        >
          <VideoAnalysis />
        </RequireAuth>
      } />

      <Route path="/direct-analyzer" element={
         <DirectVideoAnalyzer />
      } />

      {/* Tracker Routes */}
      <Route path="/tracker" element={
        <TrackerAccess>
          <TrackerInterface />
        </TrackerAccess>
      } />

      <Route path="/tracker-interface" element={
        <TrackerAccess>
          <TrackerInterface />
        </TrackerAccess>
      } />

      {/* Management Routes */}
      <Route path="/matches" element={
        <RequireAuth
          requiredRoles={['admin', 'manager']}
          requiredPermissions={['canViewMatches']}
        >
          <Matches />
        </RequireAuth>
      } />

      <Route path="/create-match" element={
        <RequireAuth
          requiredRoles={['admin']}
          requiredPermissions={['canCreateMatches']}
        >
          <CreateMatch />
        </RequireAuth>
      } />

      {/* Analytics & Statistics */}
      <Route path="/statistics" element={
        <RequireAuth
          requiredPermissions={['canViewStatistics']}
        >
          <Statistics />
        </RequireAuth>
      } />

      <Route path="/analytics" element={
        <RequireAuth
          requiredRoles={['admin', 'manager', 'tracker']}
          requiredPermissions={['canViewAnalytics']}
        >
          <AnalyticsDashboard />
        </RequireAuth>
      } />

      {/* Administrative Routes */}
      <Route path="/admin" element={
        <AdminOnly>
          <Admin />
        </AdminOnly>
      } />

      <Route path="/admin/profiles" element={
        <RequireAuth
          requiredRoles={['admin']}
          requiredPermissions={['canManageUsers']}
        >
          <ProfileListPage />
        </RequireAuth>
      } />
      <Route path="/admin/video-setup" element={
        <AdminOnly>
          <VideoSetupPage />
        </AdminOnly>
      } />

      <Route path="/admin/gpu-network" element={
        <AdminOnly>
          <GPUNetworkManagerPage />
        </AdminOnly>
      } />

      <Route path="/admin/error-manager" element={
        <AdminOnly>
          <ErrorManagerPage />
        </AdminOnly>
      } />

      {/* Scouting Routes */}
      <Route path="/scouting" element={
        <RequireAuth
          requiredRoles={['admin', 'manager']}
        >
          <Scouting />
        </RequireAuth>
      } />
      <Route path="/scouting/club/:clubId" element={
          <RequireAuth
              requiredRoles={['admin', 'manager']}
          >
              <ClubDetails />
          </RequireAuth>
      } />

      {/* Business Routes */}
      <Route path="/business/market-intelligence" element={
        <RequireAuth requiredRoles={['admin', 'manager']}>
          <MarketIntelligencePage />
        </RequireAuth>
      } />
      <Route path="/business/plan" element={
        <RequireAuth requiredRoles={['admin', 'manager']}>
          <BusinessPlanPage />
        </RequireAuth>
      } />
      <Route path="/business/pitch" element={
        <RequireAuth requiredRoles={['admin', 'manager']}>
          <StartupPitchPage />
        </RequireAuth>
      } />
      <Route path="/business/canvas" element={
        <RequireAuth requiredRoles={['admin', 'manager']}>
          <BusinessModelCanvasPage />
        </RequireAuth>
      } />
      <Route path="/business/service-offer" element={
        <RequireAuth requiredRoles={['admin', 'manager']}>
          <ServiceOfferPage />
        </RequireAuth>
      } />

      {/* Business Document Routes */}
      <Route path="/documents/business-model-canvas" element={
        <RequireAuth requiredRoles={['admin', 'manager']}>
          <BusinessModelCanvasDocument />
        </RequireAuth>
      } />
      <Route path="/documents/business-plan" element={
        <RequireAuth requiredRoles={['admin', 'manager']}>
          <BusinessPlanDocument />
        </RequireAuth>
      } />
      <Route path="/documents/market-study" element={
        <RequireAuth requiredRoles={['admin', 'manager']}>
          <MarketStudyDocument />
        </RequireAuth>
      } />

      {/* Communication Routes */}
      <Route path="/match/:matchId/voice-chat" element={
        <RequireAuth
          requiredPermissions={['canUseVoiceChat']}
        >
          <NewVoiceChatPage />
        </RequireAuth>
      } />

      {/* Development Tools */}
      <Route path="/code-visualizer" element={
        <RequireAuth requiredRoles={['admin', 'manager']}>
          <RealCodebaseVisualizer />
        </RequireAuth>
      } />

      {/* Utility Routes */}
      <Route path="/visualization" element={<RealCodebaseVisualizer />} />

      {/* Fallback Routes */}
      <Route path="/unauthorized" element={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4 p-8">
            <h1 className="text-4xl font-bold text-foreground">403</h1>
            <h2 className="text-2xl font-semibold text-muted-foreground">Unauthorized</h2>
            <p className="text-muted-foreground max-w-md">
              You don't have permission to access this resource.
              Please contact your administrator if you believe this is an error.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                Go Back
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar is now always hidden by setting showSidebar to false */}
      {showSidebar && <AppSidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {AppRoutes}
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
