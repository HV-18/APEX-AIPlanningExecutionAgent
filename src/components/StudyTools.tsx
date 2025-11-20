import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const StudyTools = () => {
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const { toast } = useToast();

  const startStudySession = async () => {
    if (!subject || !duration) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("study_sessions").insert({
        user_id: user.id,
        subject,
        duration_minutes: parseInt(duration),
        completed: false,
      });

      toast({
        title: "Study session started! 📚",
        description: `${duration} minutes of ${subject}. Stay focused!`,
      });

      setSubject("");
      setDuration("");
    } catch (error) {
      console.error("Error starting session:", error);
      toast({
        title: "Error",
        description: "Failed to start study session",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Study Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Subject (e.g., Math, Chemistry)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <Button onClick={startStudySession} className="w-full" disabled={!subject || !duration}>
          <Clock className="w-4 h-4 mr-2" />
          Start Session
        </Button>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            💡 Tip: Try 25-minute focused sessions with 5-minute breaks (Pomodoro technique)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
