
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
// import { useNetworkStatus } from './hooks/useNetworkStatus';
// import { usePermissionChecker } from './hooks/usePermissionChecker';

// Import all the page components
import Header from './components/Header';
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
import TrackerInterface from './pages/TrackerInterface';
import Matches from './pages/Matches';
import Statistics from './pages/Statistics';
import Admin from './pages/Admin';
import ProfileListPage from './pages/Admin/ProfileListPage';
import NewVoiceChatPage from './pages/NewVoiceChatPage';
import ChromeExtensionBridge from './pages/ChromeExtensionBridge';
import NotFound from './pages/NotFound';
import VideoTrackerPage from './pages/VideoTrackerPage';
import VideoSetupPage from './pages/Admin/VideoSetupPage';
import Scouting from './pages/Scouting';

const queryClient = new QueryClient();


interface MatchPayload {
  id: string;
  name?: string | null;
  home_team_name?: string | null;
  away_team_name?: string | null;
  status?: string | null;
  [key: string]: any;
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


  return (
    <>
      <Header />
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/extension-bridge" element={<ChromeExtensionBridge />} />

        {/* Protected routes - General Access */}
        <Route path="/" element={
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
            requiredRoles={['admin', 'manager','tracker']}
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

        {/* Video Tracker Route - accessible by trackers and admins */}
        <Route path="/video-tracker" element={
          <RequireAuth
            requiredRoles={['admin', 'tracker']}
          >
            <VideoTrackerPage />
          </RequireAuth>
        } />
        
        {/* Scouting Routes */}
        <Route path="/scouting" element={
          <RequireAuth 
            requiredRoles={['admin', 'manager']}
          >
            <Scouting />
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
                  onClick={() => navigate('/')}
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
    </>
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
