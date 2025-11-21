import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIInsight {
  type: 'strength' | 'opportunity' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
}

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user data for analysis
      const [sessionsRes, pomodorosRes, moodRes] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('pomodoro_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('mood_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const sessions = sessionsRes.data || [];
      const pomodoros = pomodorosRes.data || [];
      const moodLogs = moodRes.data || [];

      // Build context for AI
      const context = {
        totalStudyMinutes: sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
        completionRate: sessions.length > 0 ? (sessions.filter(s => s.completed).length / sessions.length) * 100 : 0,
        avgPomodoroLength: pomodoros.length > 0 ? pomodoros.reduce((sum, p) => sum + p.duration_minutes, 0) / pomodoros.length : 0,
        avgMoodScore: moodLogs.length > 0 ? moodLogs.reduce((sum, m) => sum + m.mood_score, 0) / moodLogs.length : 0,
        subjects: Array.from(new Set(sessions.map(s => s.subject))),
      };

      // Generate AI insights
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are an AI study analytics expert. Analyze student data and provide 3-5 specific, actionable insights. Respond ONLY with a JSON array of insights in this exact format:
[
  {
    "type": "strength|opportunity|warning",
    "title": "Brief insight title",
    "description": "Specific actionable recommendation",
    "actionable": true
  }
]`
            },
            {
              role: 'user',
              content: `Analyze this study data and provide insights: ${JSON.stringify(context)}`
            }
          ],
          model: 'google/gemini-2.5-flash'
        }
      });

      if (error) throw error;

      const aiResponse = data.choices[0].message.content;
      const parsedInsights = JSON.parse(aiResponse);
      setInsights(parsedInsights);

    } catch (error) {
      console.error('Error generating insights:', error);
      // Fallback insights
      setInsights([
        {
          type: 'opportunity',
          title: 'Maintain Consistency',
          description: 'Schedule regular study sessions at the same time each day to build a strong routine.',
          actionable: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={generateInsights}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-start gap-3">
                {getIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
