import FocusMusicPlayer from '@/components/FocusMusicPlayer';
import PomodoroTimer from '@/components/PomodoroTimer';
import { BackButton } from "@/components/BackButton";

export default function FocusPage() {
  return (
    <div className="container mx-auto p-6">
      <BackButton to="/dashboard" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">APEX Focus Zone</h1>
        <p className="text-muted-foreground mt-1">
          AI Planning & Execution Agent - Use the Pomodoro timer and focus music to maximize your productivity
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PomodoroTimer />
        <FocusMusicPlayer />
      </div>
    </div>
  );
}
