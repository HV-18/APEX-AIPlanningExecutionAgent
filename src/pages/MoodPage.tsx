import { useEffect, useState } from "react";
import { Smile, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodTracker } from "@/components/MoodTracker";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type MoodLog = {
  id: string;
  mood_score: number;
  sentiment: string;
  notes?: string;
  created_at: string;
};

const MoodPage = () => {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [avgMood, setAvgMood] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;

      setMoodLogs(data || []);
      
      if (data && data.length > 0) {
        const avg = data.reduce((sum, log) => sum + log.mood_score, 0) / data.length;
        setAvgMood(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error("Error loading mood data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 4) return "😊";
    if (score === 3) return "😐";
    return "😔";
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "positive") return "text-secondary";
    if (sentiment === "neutral") return "text-muted-foreground";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Smile className="w-8 h-8" />
          Mood Tracker
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your emotional wellness and identify patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moodLogs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {avgMood > 0 ? `${avgMood}/5` : "N/A"}
                  {avgMood > 0 && <span className="text-lg">{getMoodEmoji(avgMood)}</span>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  {moodLogs.filter(log => {
                    const logDate = new Date(log.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return logDate >= weekAgo;
                  }).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mood History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Mood Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading mood history...</p>
              ) : moodLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No mood logs yet. Start tracking your mood today!
                </p>
              ) : (
                <div className="space-y-3">
                  {moodLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-2xl">{getMoodEmoji(log.mood_score)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{log.mood_score}/5</span>
                          <span className={`text-sm ${getSentimentColor(log.sentiment)}`}>
                            {log.sentiment}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Mood Tracker */}
        <div>
          <MoodTracker />
          
          <Card className="mt-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">💡 Wellness Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Log your mood daily for better insights</p>
              <p>• Notice patterns in your emotions</p>
              <p>• Take breaks when feeling stressed</p>
              <p>• Practice gratitude and self-care</p>
              <p>• Reach out for support when needed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MoodPage;
