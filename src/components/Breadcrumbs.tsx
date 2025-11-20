import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BreadcrumbItem {
  label: string;
  path: string;
}

export const Breadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const [dynamicLabel, setDynamicLabel] = useState<string>("");

  useEffect(() => {
    const loadDynamicLabel = async () => {
      // Load room name for study room details
      if (location.pathname.startsWith("/study-room/") && params.roomId) {
        const { data } = await supabase
          .from("study_rooms")
          .select("name")
          .eq("id", params.roomId)
          .single();
        
        if (data) setDynamicLabel(data.name);
      }
      
      // Load user name for public profiles
      if (location.pathname.startsWith("/profile/") && params.userId) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", params.userId)
          .single();
        
        if (data) setDynamicLabel(data.full_name);
      }
    };

    loadDynamicLabel();
  }, [location.pathname, params]);

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", path: "/" }
    ];

    const routes: Record<string, string> = {
      "/chat": "AI Study Chat",
      "/mood": "Mood Tracker",
      "/study": "Study Sessions",
      "/timetable": "Timetable",
      "/sustainability": "Sustainability",
      "/projects": "Projects",
      "/health": "Health & Wellness",
      "/profile": "My Profile",
      "/study-rooms": "Study Rooms",
      "/meal-analyzer": "Meal Analyzer",
      "/focus": "Focus Mode",
      "/wellness-reports": "Wellness Reports",
      "/meal-planner": "Meal Planner",
      "/study-buddy": "Study Buddy",
      "/rewards": "Rewards & Badges",
      "/team-challenges": "Team Challenges",
      "/settings": "Settings",
    };

    // Handle dynamic routes
    if (path.startsWith("/study-room/")) {
      breadcrumbs.push({ label: "Study Rooms", path: "/study-rooms" });
      breadcrumbs.push({ label: dynamicLabel || "Room", path });
    } else if (path.startsWith("/profile/") && params.userId) {
      breadcrumbs.push({ label: dynamicLabel || "User Profile", path });
    } else if (routes[path]) {
      breadcrumbs.push({ label: routes[path], path });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground flex items-center gap-1">
              {index === 0 && <Home className="w-4 h-4" />}
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home className="w-4 h-4" />}
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};
