import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
} from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const mainItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "AI Chat", url: "/chat", icon: MessageSquare },
  { title: "Mood Tracker", url: "/mood", icon: Smile },
  { title: "Study Sessions", url: "/study", icon: BookOpen },
  { title: "Timetable", url: "/timetable", icon: Calendar },
  { title: "Sustainability", url: "/sustainability", icon: Leaf },
  { title: "Real Projects", url: "/projects", icon: Lightbulb },
  { title: "Health Goals", url: "/health", icon: Heart },
  { title: "Study Rooms", url: "/study-rooms", icon: Users },
  { title: "Focus Zone", url: "/focus", icon: Music },
  { title: "Meal Analyzer", url: "/meal-analyzer", icon: Camera },
  { title: "Wellness Reports", url: "/wellness-reports", icon: FileText },
  { title: "Meal Planner", url: "/meal-planner", icon: CalendarDays },
  { title: "AI Study Buddy", url: "/study-buddy", icon: Brain },
  { title: "Rewards", url: "/rewards", icon: BarChart3 },
  { title: "Team Challenges", url: "/team-challenges", icon: Users },
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Wellness Hub</span>
              <span className="text-xs text-muted-foreground">Student AI</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
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
