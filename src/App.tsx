import React, { useEffect, useState, Suspense, lazy } from "react";
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
import { NotificationProvider } from "./components/NotificationProvider";
import { LanguageSelector } from "@/components/LanguageSelector";
import "./i18n"; // Initialize i18n

// Lazy load pages for performance optimization
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const MoodPage = lazy(() => import("./pages/MoodPage"));
const StudyPage = lazy(() => import("./pages/StudyPage"));
const TimetablePage = lazy(() => import("./pages/TimetablePage"));
const SustainabilityPage = lazy(() => import("./pages/SustainabilityPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const HealthPage = lazy(() => import("./pages/HealthPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const StudyRoomsPage = lazy(() => import("./pages/StudyRoomsPage"));
const StudyRoomDetail = lazy(() => import("./pages/StudyRoomDetail"));
const MealAnalyzerPage = lazy(() => import("./pages/MealAnalyzerPage"));
const FocusPage = lazy(() => import("./pages/FocusPage"));
const WellnessReportsPage = lazy(() => import("./pages/WellnessReportsPage"));
const MealPlannerPage = lazy(() => import("./pages/MealPlannerPage"));
const StudyBuddyPage = lazy(() => import("./pages/StudyBuddyPage"));
const GamificationPage = lazy(() => import("./pages/GamificationPage"));
const TeamChallengesPage = lazy(() => import("./pages/TeamChallengesPage"));
const KeyboardShortcutsSettings = lazy(() => import("./pages/KeyboardShortcutsSettings"));
const WorkspacesPage = lazy(() => import("@/pages/WorkspacesPage"));
const WorkspaceTemplatesPage = lazy(() => import("@/pages/WorkspaceTemplatesPage"));
const WorkspaceDashboard = lazy(() => import("@/pages/WorkspaceDashboard"));
const QuizPage = lazy(() => import("@/pages/QuizPage"));
const VoiceAssistantPage = lazy(() => import("@/pages/VoiceAssistantPage"));
const ImageGalleryPage = lazy(() => import("@/pages/ImageGalleryPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const DocsPage = lazy(() => import("@/pages/DocsPage"));
const ProjectVisionPage = lazy(() => import("@/pages/ProjectVisionPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const CookiesPage = lazy(() => import("@/pages/CookiesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
              <LanguageSelector />
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

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <p className="text-muted-foreground animate-pulse">Loading APEX...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <WorkspaceProvider>
            <NotificationProvider>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
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
                  <Route path="/quiz" element={<ProtectedLayout><QuizPage /></ProtectedLayout>} />
                  <Route path="/voice-assistant" element={<ProtectedLayout><VoiceAssistantPage /></ProtectedLayout>} />
                  <Route path="/image-gallery" element={<ProtectedLayout><ImageGalleryPage /></ProtectedLayout>} />
                  <Route path="/about" element={<ProtectedLayout><AboutPage /></ProtectedLayout>} />
                  <Route path="/docs" element={<ProtectedLayout><DocsPage /></ProtectedLayout>} />
                  <Route path="/project-vision" element={<ProtectedLayout><ProjectVisionPage /></ProtectedLayout>} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/cookies" element={<CookiesPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </NotificationProvider>
          </WorkspaceProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
