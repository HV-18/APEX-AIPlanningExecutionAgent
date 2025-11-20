import { Button } from "@/components/ui/button";
import { MessageSquare, Briefcase, GraduationCap, FileText, Calendar } from "lucide-react";

type AIMode = "casual" | "interview" | "viva" | "notes" | "study_plan";

interface AIModeSelectProps {
  selectedMode: AIMode;
  onModeChange: (mode: AIMode) => void;
}

const modes = [
  { value: "casual", label: "Casual Chat", icon: MessageSquare, desc: "Friendly conversation" },
  { value: "interview", label: "Interview Prep", icon: Briefcase, desc: "Mock interviews" },
  { value: "viva", label: "Viva Practice", icon: GraduationCap, desc: "Exam questions" },
  { value: "notes", label: "Study Notes", icon: FileText, desc: "Generate notes" },
  { value: "study_plan", label: "Study Plan", icon: Calendar, desc: "Create schedule" },
];

export const AIModeSelector = ({ selectedMode, onModeChange }: AIModeSelectProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selectedMode === mode.value;
        return (
          <Button
            key={mode.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange(mode.value as AIMode)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium">{mode.label}</span>
              <span className="text-[10px] opacity-70">{mode.desc}</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
};
