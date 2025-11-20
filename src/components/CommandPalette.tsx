import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Smile,
  BookOpen,
  Calendar,
  Leaf,
  Briefcase,
  Heart,
  User,
  Users,
  Camera,
  Timer,
  FileText,
  Utensils,
  Brain,
  Trophy,
  Flag,
  Settings,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface Command {
  id: string;
  label: string;
  icon: any;
  path: string;
  category: string;
  keywords?: string[];
}

const commands: Command[] = [
  { id: "home", label: "Dashboard", icon: Home, path: "/", category: "Navigation", keywords: ["home", "main"] },
  { id: "chat", label: "AI Study Chat", icon: MessageSquare, path: "/chat", category: "Study", keywords: ["ai", "assistant", "help"] },
  { id: "mood", label: "Mood Tracker", icon: Smile, path: "/mood", category: "Wellness", keywords: ["feelings", "emotions"] },
  { id: "study", label: "Study Sessions", icon: BookOpen, path: "/study", category: "Study", keywords: ["learn", "sessions"] },
  { id: "timetable", label: "Timetable", icon: Calendar, path: "/timetable", category: "Study", keywords: ["schedule", "calendar"] },
  { id: "sustainability", label: "Sustainability", icon: Leaf, path: "/sustainability", category: "Lifestyle", keywords: ["eco", "green", "transport"] },
  { id: "projects", label: "Projects", icon: Briefcase, path: "/projects", category: "Study", keywords: ["work", "assignments"] },
  { id: "health", label: "Health & Wellness", icon: Heart, path: "/health", category: "Wellness", keywords: ["fitness", "exercise"] },
  { id: "profile", label: "My Profile", icon: User, path: "/profile", category: "Account", keywords: ["settings", "account"] },
  { id: "study-rooms", label: "Study Rooms", icon: Users, path: "/study-rooms", category: "Study", keywords: ["collaborate", "group"] },
  { id: "meal-analyzer", label: "Meal Analyzer", icon: Camera, path: "/meal-analyzer", category: "Wellness", keywords: ["food", "nutrition"] },
  { id: "focus", label: "Focus Mode", icon: Timer, path: "/focus", category: "Study", keywords: ["pomodoro", "concentrate"] },
  { id: "wellness-reports", label: "Wellness Reports", icon: FileText, path: "/wellness-reports", category: "Wellness", keywords: ["analytics", "stats"] },
  { id: "meal-planner", label: "Meal Planner", icon: Utensils, path: "/meal-planner", category: "Wellness", keywords: ["food", "diet"] },
  { id: "study-buddy", label: "Study Buddy", icon: Brain, path: "/study-buddy", category: "Study", keywords: ["ai", "quiz", "practice"] },
  { id: "rewards", label: "Rewards & Badges", icon: Trophy, path: "/rewards", category: "Gamification", keywords: ["points", "achievements"] },
  { id: "team-challenges", label: "Team Challenges", icon: Flag, path: "/team-challenges", category: "Gamification", keywords: ["compete", "teams"] },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings", category: "Account", keywords: ["preferences", "config"] },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const groupedCommands = commands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedCommands).map(([category, items], index) => (
          <div key={category}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={category}>
              {items.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <CommandItem
                    key={cmd.id}
                    onSelect={() => handleSelect(cmd.path)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{cmd.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
