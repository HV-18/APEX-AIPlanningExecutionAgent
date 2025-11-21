import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Brain, Target, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  studyTrends: Array<{ date: string; minutes: number }>;
  subjectDistribution: Array<{ subject: string; count: number }>;
  productivityScore: number;
  weeklyGoalProgress: number;
  focusTimeAverage: number;
  streakDays: number;
}

export default function AdvancedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();

    const channel = supabase
      .channel('analytics-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions' }, loadAnalytics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pomodoro_sessions' }, loadAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch study sessions for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      const { data: pomodoros } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Calculate study trends
      const trendMap = new Map<string, number>();
      sessions?.forEach(session => {
        const date = new Date(session.created_at).toLocaleDateString();
        trendMap.set(date, (trendMap.get(date) || 0) + (session.duration_minutes || 0));
      });

      const studyTrends = Array.from(trendMap.entries())
        .map(([date, minutes]) => ({ date, minutes }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate subject distribution
      const subjectMap = new Map<string, number>();
      sessions?.forEach(session => {
        subjectMap.set(session.subject, (subjectMap.get(session.subject) || 0) + 1);
      });

      const subjectDistribution = Array.from(subjectMap.entries())
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate productivity metrics
      const totalMinutes = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
      const completedSessions = sessions?.filter(s => s.completed).length || 0;
      const totalSessions = sessions?.length || 0;
      const productivityScore = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

      const avgFocusTime = pomodoros?.reduce((sum, p) => sum + p.duration_minutes, 0) || 0;
      const focusTimeAverage = pomodoros && pomodoros.length > 0 ? Math.round(avgFocusTime / pomodoros.length) : 25;

      setAnalytics({
        studyTrends,
        subjectDistribution,
        productivityScore,
        weeklyGoalProgress: Math.min(Math.round((totalMinutes / 1200) * 100), 100), // 1200 mins = 20 hrs/week goal
        focusTimeAverage,
        streakDays: 0, // Will be calculated from consecutive days
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Productivity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {analytics.productivityScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Session completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {analytics.weeklyGoalProgress}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              20 hours target
            </p>
          </CardContent>
        </Card>

        <Card className="border-secondary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Avg Focus Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {analytics.focusTimeAverage}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per Pomodoro session
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {analytics.streakDays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Consecutive days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Study Time Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.studyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Top Study Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.subjectDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="subject" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
