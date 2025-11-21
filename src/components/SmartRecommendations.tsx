import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb, Clock, Book, Target, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Recommendation {
  icon: any;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export default function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();

    const channel = supabase
      .channel('recommendations-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions' }, generateRecommendations)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_patterns' }, generateRecommendations)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const generateRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [patternsRes, sessionsRes, projectsRes] = await Promise.all([
        supabase
          .from('study_patterns')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('learning_projects')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', false),
      ]);

      const patterns = patternsRes.data;
      const sessions = sessionsRes.data || [];
      const projects = projectsRes.data || [];

      const recs: Recommendation[] = [];

      // Best study hour recommendation
      if (patterns?.best_study_hour !== null) {
        const hour = patterns.best_study_hour;
        const timeStr = hour >= 12 ? `${hour - 12 || 12}:00 PM` : `${hour}:00 AM`;
        recs.push({
          icon: Clock,
          title: 'Optimal Study Time',
          description: `Your best study hour is around ${timeStr}. Schedule important sessions then.`,
          priority: 'high',
        });
      }

      // Weak areas focus
      if (patterns?.weak_areas && patterns.weak_areas.length > 0) {
        recs.push({
          icon: Target,
          title: 'Focus Areas Detected',
          description: `Consider reviewing: ${patterns.weak_areas.slice(0, 2).join(', ')}`,
          priority: 'high',
        });
      }

      // Study streak
      if (patterns?.streak_days && patterns.streak_days > 0) {
        recs.push({
          icon: TrendingUp,
          title: `${patterns.streak_days}-Day Streak!`,
          description: 'Maintain your momentum by studying today.',
          priority: 'medium',
        });
      }

      // Incomplete projects
      if (projects.length > 0) {
        const project = projects[0];
        recs.push({
          icon: Book,
          title: 'Active Project',
          description: `Continue "${project.title}" - ${project.progress}% complete`,
          priority: 'medium',
        });
      }

      // Session completion rate
      const completedSessions = sessions.filter(s => s.completed).length;
      const completionRate = sessions.length > 0 ? (completedSessions / sessions.length) * 100 : 0;
      if (completionRate < 60 && sessions.length >= 5) {
        recs.push({
          icon: Lightbulb,
          title: 'Improve Completion Rate',
          description: `You complete ${Math.round(completionRate)}% of sessions. Try shorter, focused sessions.`,
          priority: 'low',
        });
      }

      // Add time-based recommendations
      const currentHour = new Date().getHours();
      if (currentHour >= 6 && currentHour <= 10) {
        recs.push({
          icon: Clock,
          title: 'Morning Study Session',
          description: 'Morning hours are great for complex problem-solving and deep learning.',
          priority: 'medium',
        });
      }

      setRecommendations(recs.slice(0, 4)); // Show top 4
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Complete more study sessions to receive personalized recommendations
          </p>
        ) : (
          recommendations.map((rec, idx) => {
            const Icon = rec.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{rec.title}</h4>
                      <Badge variant="outline" className={priorityColors[rec.priority]}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
