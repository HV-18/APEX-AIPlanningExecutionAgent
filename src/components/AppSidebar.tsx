import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import {
  Brain,
  MessageSquare,
  Smile,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Leaf,
  Lightbulb,
  Heart,
  Users,
  Camera,
  Music,
  FileText,
  CalendarDays,
  User,
  ClipboardList,
  Mic,
  Image,
  BookText,
  Rocket,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";
  const { t } = useTranslation();

  // Education & Learning (Priority)
  const educationItems = [
    { title: t('dashboard'), url: "/", icon: BarChart3, group: "education" },
    { title: t('chat'), url: "/chat", icon: MessageSquare, group: "education" },
    { title: t('planning'), url: "/study-buddy", icon: Brain, group: "education" },
    { title: t('quiz'), url: "/quiz", icon: ClipboardList, group: "education" },
    { title: t('study'), url: "/study", icon: BookOpen, group: "education" },
    { title: t('voice'), url: "/voice-assistant", icon: Mic, group: "education" },
    { title: t('studyRooms'), url: "/study-rooms", icon: Users, group: "education" },
    { title: t('timetable'), url: "/timetable", icon: Calendar, group: "education" },
    { title: t('projects'), url: "/projects", icon: CalendarDays, group: "education" },
  ];

  // Collaboration & Competition
  const collaborationItems = [
    { title: t('teamChallenges'), url: "/team-challenges", icon: Users, group: "collaboration" },
    { title: t('rewards'), url: "/rewards", icon: BarChart3, group: "collaboration" },
  ];

  // Wellness & Health
  const wellnessItems = [
    { title: t('focus'), url: "/focus", icon: Music, group: "wellness" },
    { title: t('mood'), url: "/mood", icon: Smile, group: "wellness" },
    { title: t('health'), url: "/health", icon: Heart, group: "wellness" },
    { title: t('mealAnalyzer'), url: "/meal-analyzer", icon: Camera, group: "wellness" },
    { title: t('mealPlanner'), url: "/meal-planner", icon: Calendar, group: "wellness" },
    { title: t('wellness'), url: "/wellness-reports", icon: FileText, group: "wellness" },
    { title: t('sustainability'), url: "/sustainability", icon: Leaf, group: "wellness" },
  ];

  // Resources & Information
  const resourceItems = [
    { title: "Image Gallery", url: "/image-gallery", icon: Image, group: "resources" },
    { title: "Project Vision", url: "/project-vision", icon: Rocket, group: "resources" },
    { title: "About APEX", url: "/about", icon: Lightbulb, group: "resources" },
    { title: "Documentation", url: "/docs", icon: BookText, group: "resources" },
  ];

  // User Profile
  const profileItems = [
    { title: t('profile'), url: "/profile", icon: User, group: "profile" },
  ];

  const mainItems = [
    ...educationItems,
    ...collaborationItems,
    ...wellnessItems,
    ...resourceItems,
    ...profileItems,
  ];

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        // We still want to redirect even if there's an error
        toast({
          title: "Signed out",
          description: "You have been signed out.",
        });
      } else {
        toast({
          title: "Signed out successfully",
          description: "See you soon! 👋",
        });
      }
    } catch (error) {
      console.error("Unexpected error signing out:", error);
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    } finally {
      // Always navigate to auth page
      navigate("/auth");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => toast({ title: "APEX Logo", description: "This is the APEX AI Planning & Execution Agent" })}>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">APEX</span>
                    <span className="text-xs text-muted-foreground">AI Planning & Execution</span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>APEX - AI Planning & Execution Agent</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarHeader>

      <SidebarHeader className="border-b p-4">
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {/* Education & Learning Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Education & Learning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider>
                {educationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/"}
                            className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md"
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collaboration Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Collaboration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider>
                {collaborationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md"
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Wellness Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Wellness & Health</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider>
                {wellnessItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md"
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider>
                {resourceItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md"
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Profile Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider>
                {profileItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md"
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to="/settings"
                          className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                          onClick={() => toast({ title: t('settings'), description: "This is the Settings page" })}
                        >
                          <Settings className="w-4 h-4" />
                          <span>{t('settings')}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{t('settings')}</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 space-y-2 overflow-hidden">
        <div className="flex items-center justify-between px-2">
          {!collapsed && <span className="text-sm text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start overflow-hidden"
                size={collapsed ? "icon" : "default"}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="ml-2 truncate">{t('signOut')}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{t('signOut')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarFooter>
    </Sidebar>
  );
}
