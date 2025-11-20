import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Smile, BookOpen, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalChats: 0,
    moodLogsToday: 0,
    studySessionsWeek: 0,
    avgMood: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get chat count
      const { count: chatCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get today's mood logs
      const { count: moodCount } = await supabase
        .from("mood_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", today.toISOString());

      // Get week's study sessions
      const { count: studyCount } = await supabase
        .from("study_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", weekAgo.toISOString());

      // Get average mood
      const { data: moodData } = await supabase
        .from("mood_logs")
        .select("mood_score")
        .eq("user_id", user.id)
        .gte("created_at", weekAgo.toISOString());

      const avgMood = moodData && moodData.length > 0
        ? Math.round(moodData.reduce((sum, log) => sum + log.mood_score, 0) / moodData.length)
        : 0;

      setStats({
        totalChats: chatCount || 0,
        moodLogsToday: moodCount || 0,
        studySessionsWeek: studyCount || 0,
        avgMood,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const statCards = [
    {
      title: "AI Conversations",
      value: stats.totalChats,
      icon: Brain,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Mood Check-ins Today",
      value: stats.moodLogsToday,
      icon: Smile,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Study Sessions (7d)",
      value: stats.studySessionsWeek,
      icon: BookOpen,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Average Mood",
      value: stats.avgMood > 0 ? `${stats.avgMood}/5` : "N/A",
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
