import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Clock, TrendingUp, Target, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface WorkspaceAnalyticsProps {
  workspaceId: string;
}

export const WorkspaceAnalytics = ({ workspaceId }: WorkspaceAnalyticsProps) => {
  const [analytics, setAnalytics] = useState({
    totalStudyTime: 0,
    completedSessions: 0,
    totalNotes: 0,
    projectsProgress: 0,
    thisWeekTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [workspaceId]);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Get study sessions data
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("duration_minutes, completed, created_at")
        .eq("workspace_id", workspaceId);

      // Get pomodoro sessions data
      const { data: pomodoros } = await supabase
        .from("pomodoro_sessions")
        .select("duration_minutes, completed, created_at")
        .eq("user_id", user.id);

      // Get notes count
      const { data: notes, count: notesCount } = await supabase
        .from("study_notes")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId);

      // Get projects data
      const { data: projects } = await supabase
        .from("learning_projects")
        .select("progress")
        .eq("workspace_id", workspaceId);

      const totalStudyTime = (sessions || []).reduce(
        (sum, s) => sum + (s.duration_minutes || 0),
        0
      );

      const completedSessions = (sessions || []).filter((s) => s.completed).length;

      const thisWeekTime = (sessions || [])
        .filter((s) => new Date(s.created_at) > oneWeekAgo)
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      const avgProgress = projects && projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
        : 0;

      setAnalytics({
        totalStudyTime,
        completedSessions,
        totalNotes: notesCount || 0,
        projectsProgress: avgProgress,
        thisWeekTime,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor(analytics.totalStudyTime / 60)}h {analytics.totalStudyTime % 60}m
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics.thisWeekTime} min this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.completedSessions}</div>
          <p className="text-xs text-muted-foreground">Study sessions finished</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Notes</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalNotes}</div>
          <p className="text-xs text-muted-foreground">Notes created</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projects Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.projectsProgress.toFixed(0)}%</div>
          <Progress value={analytics.projectsProgress} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};
