import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { VoiceCollaborationProvider } from './context/VoiceCollaborationContext';
import { RequireAuth, AdminOnly, ManagerAccess, TrackerAccess } from "./components/RequireAuth";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ToastAction } from "@/components/ui/toast";

// Import all the page components
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Index from './pages/Index';
import SpeedyGonzales from './pages/SpeedyGonzales';
import MatchAnalysisV2 from './pages/MatchAnalysisV2';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CreateMatch from './pages/CreateMatch';
import MatchTimerPage from './pages/MatchTimerPage';
import VideoAnalysis from './pages/VideoAnalysis';
import DirectVideoAnalyzer from './pages/DirectVideoAnalyzer';
import GPUNetworkManagerPage from './pages/GPUNetworkManager';
import ErrorManagerPage from './pages/ErrorManager';
import TrackerInterface from './pages/TrackerInterface';
import Matches from './pages/Matches';
import UnifiedAnalytics from './pages/UnifiedAnalytics';
import Admin from './pages/Admin';
import ProfileListPage from './pages/Admin/ProfileListPage';
import QualityControlInterface from './pages/QualityControlInterface';
import NewVoiceChatPage from './pages/NewVoiceChatPage';
import ChromeExtensionBridge from './pages/ChromeExtensionBridge';
import NotFound from './pages/NotFound';

import VideoSetupPage from './pages/Admin/VideoSetupPage';
import AdminQualityControl from './pages/Admin/AdminQualityControl';
import KeyboardManager from './pages/Admin/KeyboardManager';
import BusinessDocumentManager from './pages/Admin/BusinessDocumentManager';
import Scouting from './pages/Scouting';
import ClubDetails from './components/scouting/ClubDetails';
import MarketIntelligencePage from './pages/MarketIntelligencePage';
import BusinessPlanPage from './pages/BusinessPlanPage';
import StartupPitchPage from './pages/StartupPitchPage';
import BusinessModelCanvasPage from './pages/BusinessModelCanvas';
import ServiceOfferPage from './pages/ServiceOffer';

// Import business document components
import BusinessModelCanvasDocument from './components/documents/BusinessModelCanvasDocument';
import BusinessPlanDocument from './components/documents/BusinessPlanDocument';
import MarketStudyDocument from './components/documents/MarketStudyDocument';

// Import Data Governance Hub components src/components/business/DataGovernance
import { DataGovernanceHub } from './components/business/DataGovernance/DataGovernanceHub';
import { MasterReferenceManager } from './components/business/DataGovernance/MasterReferenceManager';
import { ReconciliationDashboard } from './components/business/DataGovernance/ReconciliationDashboard';
import { StrategicHypothesesManager } from './components/business/DataGovernance/StrategicHypothesesManager';

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
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/extension-bridge" element={<ChromeExtensionBridge />} />

        {/* Protected routes - General Access */}
        <Route path="/dashboard" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />

        <Route path="/speedy" element={
          <RequireAuth>
            <SpeedyGonzales />
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
        
        <Route path="/match/:matchId/quality-control" element={
          <AdminOnly>
            <QualityControlInterface />
          </AdminOnly>
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
        
        {/* Unified Analytics & Statistics */}
        <Route path="/statistics" element={
          <RequireAuth 
            requiredPermissions={['canViewStatistics']}
          >
            <UnifiedAnalytics />
          </RequireAuth>
        } />
        
        <Route path="/analytics" element={
          <RequireAuth 
            requiredRoles={['admin', 'manager','tracker']}
            requiredPermissions={['canViewAnalytics']}
          >
            <UnifiedAnalytics />
          </RequireAuth>
        } />
        
        <Route path="/match/:matchId/analytics" element={
          <RequireAuth 
            requiredRoles={['admin', 'manager']}
            requiredPermissions={['canViewAnalytics']}
          >
            <UnifiedAnalytics />
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

        <Route path="/admin/quality-control" element={
          <AdminOnly>
            <AdminQualityControl />
          </AdminOnly>
        } />

        <Route path="/admin/keyboard-manager" element={
          <AdminOnly>
            <KeyboardManager />
          </AdminOnly>
        } />

        <Route path="/admin/business-documents" element={
          <AdminOnly>
            <BusinessDocumentManager />
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

        {/* Data Governance Routes */}
        <Route path="/governance" element={
          <RequireAuth requiredRoles={['admin', 'manager']}>
            <DataGovernanceHub />
          </RequireAuth>
        } />
        
        <Route path="/governance/reference-data" element={
          <RequireAuth requiredRoles={['admin', 'manager']}>
            <div className="container mx-auto p-6">
              <MasterReferenceManager />
            </div>
          </RequireAuth>
        } />
        
        <Route path="/governance/reconciliation" element={
          <RequireAuth requiredRoles={['admin', 'manager']}>
            <div className="container mx-auto p-6">
              <ReconciliationDashboard />
            </div>
          </RequireAuth>
        } />
        
        <Route path="/governance/hypotheses" element={
          <RequireAuth requiredRoles={['admin', 'manager']}>
            <div className="container mx-auto p-6">
              <StrategicHypothesesManager />
            </div>
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
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <VoiceCollaborationProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </VoiceCollaborationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
