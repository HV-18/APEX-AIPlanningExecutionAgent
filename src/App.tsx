import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
import StudyRoomsPage from "./pages/StudyRoomsPage";
import StudyRoomDetail from "./pages/StudyRoomDetail";
import MealAnalyzerPage from "./pages/MealAnalyzerPage";
import FocusPage from "./pages/FocusPage";
import WellnessReportsPage from "./pages/WellnessReportsPage";
import MealPlannerPage from "./pages/MealPlannerPage";
import StudyBuddyPage from "./pages/StudyBuddyPage";
import GamificationPage from "./pages/GamificationPage";
import TeamChallengesPage from "./pages/TeamChallengesPage";
import NotFound from "./pages/NotFound";
import { NotificationProvider } from "./components/NotificationProvider";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          <header className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
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
          <NotificationProvider>
            <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/chat" element={<ProtectedLayout><ChatPage /></ProtectedLayout>} />
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
            <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
