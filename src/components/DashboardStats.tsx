import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Smile, BookOpen, TrendingUp, Leaf, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalChats: 0,
    moodLogsToday: 0,
    studySessionsWeek: 0,
    avgMood: 0,
    co2Saved: 0,
    greenTrips: 0,
  });

  useEffect(() => {
    loadStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('dashboard-stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mood_logs' }, () => loadStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions' }, () => loadStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transport_logs' }, () => loadStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => loadStats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

      // Get sustainability stats
      const { data: transportData } = await supabase
        .from("transport_logs")
        .select("co2_saved, mode")
        .eq("user_id", user.id);

      const co2Saved = transportData
        ? transportData.reduce((sum, t) => sum + (Number(t.co2_saved) || 0), 0)
        : 0;

      const greenTrips = transportData
        ? transportData.filter(t => ['walk', 'bike', 'bus', 'train'].includes(t.mode)).length
        : 0;

      setStats({
        totalChats: chatCount || 0,
        moodLogsToday: moodCount || 0,
        studySessionsWeek: studyCount || 0,
        avgMood,
        co2Saved: Math.round(co2Saved * 10) / 10,
        greenTrips,
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
      title: "Mood Today",
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
    {
      title: "CO₂ Saved",
      value: `${stats.co2Saved}kg`,
      icon: Leaf,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Green Trips",
      value: stats.greenTrips,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
