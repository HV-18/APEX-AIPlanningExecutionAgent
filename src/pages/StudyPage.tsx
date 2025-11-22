import { useEffect, useState } from "react";
import { BookOpen, Clock, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudyTools } from "@/components/StudyTools";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BackButton } from "@/components/BackButton";
import { useTranslation } from "react-i18next";

type StudySession = {
  id: string;
  subject: string;
  duration_minutes: number;
  notes?: string;
  completed: boolean;
  created_at: string;
};

const StudyPage = () => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    totalMinutes: 0,
    thisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudyData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('study-sessions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions' }, () => loadStudyData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStudyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setSessions(data || []);

      if (data) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const totalMinutes = data.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        const weekSessions = data.filter(s => new Date(s.created_at) >= weekAgo);

        setStats({
          total: data.length,
          totalMinutes,
          thisWeek: weekSessions.length,
        });
      }
    } catch (error) {
      console.error("Error loading study data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          {t('Study')}
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your study time and stay productive
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  {stats.total}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  {formatDuration(stats.totalMinutes)}
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
                  {stats.thisWeek}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Study Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading sessions...</p>
              ) : sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No study sessions yet. Start your first session!
                </p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-start justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{session.subject}</span>
                          <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {formatDuration(session.duration_minutes)}
                          </span>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{session.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(session.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      {session.completed && (
                        <div className="text-secondary">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Study Tools */}
        <div>
          <StudyTools />

          <Card className="mt-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">🎯 Study Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use the Pomodoro technique (25min + 5min break)</p>
              <p>• Remove distractions before studying</p>
              <p>• Take notes while learning</p>
              <p>• Review material regularly</p>
              <p>• Stay hydrated and take breaks</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;
