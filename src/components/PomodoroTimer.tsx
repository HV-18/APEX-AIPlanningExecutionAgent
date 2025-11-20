import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const { toast } = useToast();

  const workDuration = 25 * 60;
  const breakDuration = 5 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (!isBreak) {
      // Work session completed
      setSessionsCompleted((prev) => prev + 1);
      
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('pomodoro_sessions').insert({
          user_id: user.id,
          duration_minutes: 25,
          break_minutes: 5,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }

      toast({
        title: '🎉 Focus Session Complete!',
        description: 'Great work! Time for a well-deserved break.',
      });
      
      setIsBreak(true);
      setTimeLeft(breakDuration);
    } else {
      // Break completed
      toast({
        title: '☕ Break Complete!',
        description: 'Ready to tackle another session?',
      });
      
      setIsBreak(false);
      setTimeLeft(workDuration);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? breakDuration : workDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((isBreak ? breakDuration : workDuration) - timeLeft) / 
                   (isBreak ? breakDuration : workDuration) * 100;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-3 mb-6">
        <Timer className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Pomodoro Timer</h3>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Timer Display */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              className="text-primary transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isBreak && <Coffee className="w-6 h-6 text-primary mb-2" />}
            <span className="text-4xl font-bold text-foreground">{formatTime(timeLeft)}</span>
            <span className="text-sm text-muted-foreground mt-1">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="min-w-[120px]"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Sessions Today</p>
          <p className="text-2xl font-bold text-foreground">{sessionsCompleted}</p>
        </div>
      </div>
    </Card>
  );
}