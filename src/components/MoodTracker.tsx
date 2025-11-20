import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const moodOptions = [
  { score: 5, icon: Smile, label: "Great", color: "text-secondary" },
  { score: 4, icon: Smile, label: "Good", color: "text-accent" },
  { score: 3, icon: Meh, label: "Okay", color: "text-muted-foreground" },
  { score: 2, icon: Frown, label: "Not great", color: "text-destructive" },
  { score: 1, icon: Frown, label: "Stressed", color: "text-destructive" },
];

export const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const saveMood = async () => {
    if (!selectedMood) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("mood_logs").insert({
        user_id: user.id,
        mood_score: selectedMood,
        notes: notes || null,
        sentiment: selectedMood <= 2 ? "stressed" : selectedMood <= 3 ? "neutral" : "positive",
      });

      if (error) throw error;

      toast({
        title: "Mood logged! 💚",
        description: selectedMood <= 2 
          ? "Remember to take breaks and practice self-care!"
          : "Keep up the great energy!",
      });

      setSelectedMood(null);
      setNotes("");
    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save mood log",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg">How are you feeling?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between gap-2">
          {moodOptions.map((mood) => {
            const Icon = mood.icon;
            return (
              <Button
                key={mood.score}
                variant={selectedMood === mood.score ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMood(mood.score)}
                className="flex-1 flex-col h-auto py-3"
              >
                <Icon className={`w-6 h-6 mb-1 ${mood.color}`} />
                <span className="text-xs">{mood.label}</span>
              </Button>
            );
          })}
        </div>

        <Textarea
          placeholder="Any notes about your mood? (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <Button onClick={saveMood} disabled={!selectedMood} className="w-full">
          Log Mood
        </Button>
      </CardContent>
    </Card>
  );
};
