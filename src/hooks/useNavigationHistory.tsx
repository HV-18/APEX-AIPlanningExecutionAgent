import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface HistoryItem {
  path: string;
  title: string;
  timestamp: number;
}

const getPageTitle = (path: string): string => {
  const routes: Record<string, string> = {
    "/": "Dashboard",
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

  // Check for dynamic routes
  if (path.startsWith("/study-room/")) return "Study Room";
  if (path.startsWith("/profile/")) return "User Profile";

  return routes[path] || "Page";
};

export const useNavigationHistory = () => {
  const location = useLocation();
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("navigationHistory");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const currentPath = location.pathname;
    const title = getPageTitle(currentPath);
    const timestamp = Date.now();

    setHistory((prev) => {
      // Don't add duplicate consecutive entries
      if (prev.length > 0 && prev[0].path === currentPath) {
        return prev;
      }

      // Add new entry at the beginning
      const newHistory = [
        { path: currentPath, title, timestamp },
        ...prev.filter((item) => item.path !== currentPath), // Remove duplicates
      ].slice(0, 20); // Keep only last 20 items

      // Save to localStorage
      localStorage.setItem("navigationHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  }, [location.pathname]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("navigationHistory");
  };

  return { history, clearHistory };
};
