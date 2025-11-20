import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

type Activity = {
  id: string;
  type: "mood" | "study" | "chat";
  title: string;
  time: string;
  description?: string;
};

export const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get recent mood logs
      const { data: moodData } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      // Get recent study sessions
      const { data: studyData } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      const allActivities: Activity[] = [];

      if (moodData) {
        moodData.forEach((mood) => {
          allActivities.push({
            id: mood.id,
            type: "mood",
            title: "Mood logged",
            time: formatDistanceToNow(new Date(mood.created_at), { addSuffix: true }),
            description: `${mood.mood_score}/5 - ${mood.sentiment}`,
          });
        });
      }

      if (studyData) {
        studyData.forEach((study) => {
          allActivities.push({
            id: study.id,
            type: "study",
            title: study.subject,
            time: formatDistanceToNow(new Date(study.created_at), { addSuffix: true }),
            description: `${study.duration_minutes} minutes`,
          });
        });
      }

      // Sort by most recent
      allActivities.sort((a, b) => {
        const aTime = a.time;
        const bTime = b.time;
        return aTime.localeCompare(bTime);
      });

      setActivities(allActivities.slice(0, 5));
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "mood":
        return "bg-secondary/10 text-secondary";
      case "study":
        return "bg-accent/10 text-accent";
      case "chat":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No recent activity. Start by logging your mood or studying!
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(activity.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
