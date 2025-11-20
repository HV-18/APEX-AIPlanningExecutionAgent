import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NavigationHistory } from "@/components/NavigationHistory";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { CommandPalette } from "@/components/CommandPalette";
import { QuickActionsButton } from "@/components/QuickActionsButton";
import { VoiceCommandsButton } from "@/components/VoiceCommandsButton";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useGestureNavigation } from "@/hooks/useGestureNavigation";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "next-themes";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import MoodPage from "./pages/MoodPage";
import StudyPage from "./pages/StudyPage";
import TimetablePage from "./pages/TimetablePage";
import SustainabilityPage from "./pages/SustainabilityPage";
import ProjectsPage from "./pages/ProjectsPage";
import HealthPage from "./pages/HealthPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import StudyRoomsPage from "./pages/StudyRoomsPage";
import StudyRoomDetail from "./pages/StudyRoomDetail";
import MealAnalyzerPage from "./pages/MealAnalyzerPage";
import FocusPage from "./pages/FocusPage";
import WellnessReportsPage from "./pages/WellnessReportsPage";
import MealPlannerPage from "./pages/MealPlannerPage";
import StudyBuddyPage from "./pages/StudyBuddyPage";
import GamificationPage from "./pages/GamificationPage";
import TeamChallengesPage from "./pages/TeamChallengesPage";
import KeyboardShortcutsSettings from "./pages/KeyboardShortcutsSettings";
import WorkspacesPage from "@/pages/WorkspacesPage";
import WorkspaceTemplatesPage from "@/pages/WorkspaceTemplatesPage";
import WorkspaceDashboard from "@/pages/WorkspaceDashboard";
import QuizPage from "@/pages/QuizPage";
import VoiceAssistantPage from "@/pages/VoiceAssistantPage";
import NotFound from "./pages/NotFound";
import { NotificationProvider } from "./components/NotificationProvider";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  
  // Enable keyboard shortcuts with help modal
  useKeyboardShortcuts(() => setShowShortcutsModal(true));
  
  // Enable gesture navigation
  useGestureNavigation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <VoiceCommandsButton />
              <NavigationHistory />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
      <KeyboardShortcutsModal open={showShortcutsModal} onOpenChange={setShowShortcutsModal} />
      <CommandPalette />
      <QuickActionsButton />
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <WorkspaceProvider>
            <NotificationProvider>
              <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/chat" element={<ProtectedLayout><ChatPage /></ProtectedLayout>} />
            <Route path="/quiz" element={<ProtectedLayout><QuizPage /></ProtectedLayout>} />
            <Route path="/voice-assistant" element={<ProtectedLayout><VoiceAssistantPage /></ProtectedLayout>} />
            <Route path="/mood" element={<ProtectedLayout><MoodPage /></ProtectedLayout>} />
            <Route path="/study" element={<ProtectedLayout><StudyPage /></ProtectedLayout>} />
            <Route path="/timetable" element={<ProtectedLayout><TimetablePage /></ProtectedLayout>} />
            <Route path="/sustainability" element={<ProtectedLayout><SustainabilityPage /></ProtectedLayout>} />
            <Route path="/projects" element={<ProtectedLayout><ProjectsPage /></ProtectedLayout>} />
            <Route path="/health" element={<ProtectedLayout><HealthPage /></ProtectedLayout>} />
            <Route path="/study-rooms" element={<ProtectedLayout><StudyRoomsPage /></ProtectedLayout>} />
            <Route path="/study-room/:roomId" element={<ProtectedLayout><StudyRoomDetail /></ProtectedLayout>} />
            <Route path="/meal-analyzer" element={<ProtectedLayout><MealAnalyzerPage /></ProtectedLayout>} />
            <Route path="/focus" element={<ProtectedLayout><FocusPage /></ProtectedLayout>} />
            <Route path="/wellness-reports" element={<ProtectedLayout><WellnessReportsPage /></ProtectedLayout>} />
            <Route path="/meal-planner" element={<ProtectedLayout><MealPlannerPage /></ProtectedLayout>} />
            <Route path="/study-buddy" element={<ProtectedLayout><StudyBuddyPage /></ProtectedLayout>} />
            <Route path="/rewards" element={<ProtectedLayout><GamificationPage /></ProtectedLayout>} />
            <Route path="/team-challenges" element={<ProtectedLayout><TeamChallengesPage /></ProtectedLayout>} />
            <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
            <Route path="/profile/:userId" element={<PublicProfilePage />} />
            <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
            <Route path="/settings/keyboard-shortcuts" element={<ProtectedLayout><KeyboardShortcutsSettings /></ProtectedLayout>} />
            <Route path="/workspaces" element={<ProtectedLayout><WorkspacesPage /></ProtectedLayout>} />
            <Route path="/workspace-templates" element={<ProtectedLayout><WorkspaceTemplatesPage /></ProtectedLayout>} />
            <Route path="/workspace/:workspaceId/dashboard" element={<ProtectedLayout><WorkspaceDashboard /></ProtectedLayout>} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationProvider>
          </WorkspaceProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
