import { useState } from "react";
import { Plus, Timer, Smile, BookOpen, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const QuickActionsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: Timer, label: "Start Timer", path: "/focus", color: "bg-blue-500" },
    { icon: Smile, label: "Log Mood", path: "/mood", color: "bg-purple-500" },
    { icon: BookOpen, label: "Study Session", path: "/study", color: "bg-green-500" },
    { icon: Camera, label: "Analyze Meal", path: "/meal-analyzer", color: "bg-orange-500" },
  ];

  const handleAction = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 flex flex-col gap-3 z-50 md:hidden">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleAction(action.path)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-full shadow-lg text-white transition-all",
                  action.color,
                  "animate-in slide-in-from-bottom-5"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="fixed bottom-6 right-4 h-14 w-14 rounded-full shadow-lg z-50 md:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </>
  );
};
