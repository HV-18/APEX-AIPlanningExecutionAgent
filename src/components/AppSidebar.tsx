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

const mainItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Project Vision", url: "/project-vision", icon: Rocket },
  { title: "About", url: "/about", icon: Lightbulb },
  { title: "Documentation", url: "/docs", icon: BookText },
  { title: "AI Chat", url: "/chat", icon: MessageSquare },
  { title: "Quiz Generator", url: "/quiz", icon: ClipboardList },
  { title: "Voice Assistant", url: "/voice-assistant", icon: Mic },
  { title: "Image Gallery", url: "/image-gallery", icon: Image },
  { title: "Mood Tracker", url: "/mood", icon: Smile },
  { title: "Study Sessions", url: "/study", icon: BookOpen },
  { title: "Timetable", url: "/timetable", icon: Calendar },
  { title: "Sustainability", url: "/sustainability", icon: Leaf },
  { title: "Real Projects", url: "/projects", icon: CalendarDays },
  { title: "Health Goals", url: "/health", icon: Heart },
  { title: "Study Rooms", url: "/study-rooms", icon: Users },
  { title: "Focus Zone", url: "/focus", icon: Music },
  { title: "Meal Analyzer", url: "/meal-analyzer", icon: Camera },
  { title: "Wellness Reports", url: "/wellness-reports", icon: FileText },
  { title: "Meal Planner", url: "/meal-planner", icon: Calendar },
  { title: "AI Study Buddy", url: "/study-buddy", icon: Brain },
  { title: "Rewards", url: "/rewards", icon: BarChart3 },
  { title: "Team Challenges", url: "/team-challenges", icon: Users },
  { title: "My Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { toast } = useToast();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "See you soon! 👋",
    });
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
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/"}
                            className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md"
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                            onClick={() => toast({ title: item.title, description: `This is the ${item.title} page` })}
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
                          onClick={() => toast({ title: "Settings", description: "This is the Settings page" })}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 space-y-2">
        <div className="flex items-center justify-between px-2">
          {!collapsed && <span className="text-sm text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start"
          size={collapsed ? "icon" : "default"}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
