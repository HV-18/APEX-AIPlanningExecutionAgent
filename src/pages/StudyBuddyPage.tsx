import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Target, Sparkles, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';

interface StudyPattern {
  best_study_hour: number;
  avg_focus_duration: number;
  preferred_subjects: string[];
  weak_areas: string[];
  streak_days: number;
}

interface StudyTip {
  id: string;
  tip_text: string;
  tip_type: string;
  generated_at: string;
  is_read: boolean;
}

export default function StudyBuddyPage() {
  const [patterns, setPatterns] = useState<StudyPattern | null>(null);
  const [tips, setTips] = useState<StudyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadStudyData();
  }, []);

  const loadStudyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load study patterns
      const { data: patternData } = await supabase
        .from('study_patterns')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (patternData) {
        setPatterns(patternData);
      } else {
        await analyzeStudyPatterns();
      }

      // Load study tips
      const { data: tipData } = await supabase
        .from('study_tips')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(10);

      setTips(tipData || []);
    } catch (error) {
      console.error('Error loading study data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeStudyPatterns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get recent study sessions
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (!sessions || sessions.length === 0) {
        toast({
          title: 'Not enough data',
          description: 'Complete more study sessions to unlock AI insights',
        });
        return;
      }

      // Analyze patterns
      const hourCounts: { [key: number]: number } = {};
      let totalDuration = 0;
      const subjects: { [key: string]: number } = {};

      sessions.forEach((session) => {
        const hour = new Date(session.created_at!).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        totalDuration += session.duration_minutes || 0;
        subjects[session.subject] = (subjects[session.subject] || 0) + 1;
      });

      const bestHour = parseInt(
        Object.keys(hourCounts).reduce((a, b) =>
          hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
        )
      );

      const avgDuration = Math.round(totalDuration / sessions.length);
      const preferredSubjects = Object.keys(subjects)
        .sort((a, b) => subjects[b] - subjects[a])
        .slice(0, 3);

      // Calculate streak
      const today = new Date().toISOString().split('T')[0];
      const lastStudy = sessions[0]?.created_at
        ? new Date(sessions[0].created_at).toISOString().split('T')[0]
        : null;
      const streak = lastStudy === today ? calculateStreak(sessions) : 0;

      const newPattern = {
        user_id: user.id,
        best_study_hour: bestHour,
        avg_focus_duration: avgDuration,
        preferred_subjects: preferredSubjects,
        weak_areas: [],
        streak_days: streak,
        last_study_date: today,
      };

      const { data, error } = await supabase
        .from('study_patterns')
        .upsert(newPattern, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error analyzing patterns:', error);
        throw error;
      }

      setPatterns(data);
      await generatePersonalizedTips(data);

      toast({
        title: 'Analysis complete!',
        description: 'Your study patterns have been analyzed',
      });
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: 'Analysis failed',
        description: 'Unable to analyze study patterns. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const calculateStreak = (sessions: any[]) => {
    const dates = sessions
      .map((s) => new Date(s.created_at!).toISOString().split('T')[0])
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (dates[i] === expectedDateStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const generatePersonalizedTips = async (pattern: StudyPattern) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newTips = [];

    // Time-based tip
    const hour = pattern.best_study_hour;
    const timeOfDay =
      hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    newTips.push({
      user_id: user.id,
      tip_text: `You're most productive in the ${timeOfDay} (around ${hour}:00). Try scheduling your toughest subjects during this time!`,
      tip_type: 'time',
    });

    // Duration tip
    if (pattern.avg_focus_duration < 25) {
      newTips.push({
        user_id: user.id,
        tip_text: `Your average focus time is ${pattern.avg_focus_duration} minutes. Try the Pomodoro Technique to gradually increase your focus stamina!`,
        tip_type: 'technique',
      });
    }

    // Streak tip
    if (pattern.streak_days > 0) {
      newTips.push({
        user_id: user.id,
        tip_text: `Amazing! You're on a ${pattern.streak_days}-day study streak. Keep the momentum going! 🔥`,
        tip_type: 'motivation',
      });
    }

    await supabase.from('study_tips').insert(newTips);
    setTips([...newTips.map((t, i) => ({ ...t, id: `new-${i}`, generated_at: new Date().toISOString(), is_read: false })), ...tips]);
  };

  const createCustomQuiz = async () => {
    if (!patterns?.preferred_subjects.length) {
      toast({
        title: 'No subjects detected',
        description: 'Complete more study sessions first',
      });
      return;
    }

    toast({
      title: 'Generating custom quiz...',
      description: 'This may take a moment',
    });

    try {
      const subject = patterns.preferred_subjects[0];
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          subject,
          difficulty: 'medium',
          weakAreas: patterns.weak_areas,
        },
      });

      if (error) throw error;

      toast({
        title: 'Quiz generated successfully!',
        description: `Created ${data.questions.length} questions for ${subject}. Redirecting...`,
      });

      // Navigate to quiz page after a short delay
      setTimeout(() => {
        navigate('/quiz');
      }, 1000);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: 'Failed to generate quiz',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading your AI Planning & Execution agent...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/dashboard" />
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-8 h-8" />
              AI Planning & Execution
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalized insights and recommendations based on your learning patterns
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Google Gemini AI
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Study Insights</TabsTrigger>
          <TabsTrigger value="tips">Personalized Tips</TabsTrigger>
          <TabsTrigger value="quiz">Custom Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {!patterns ? (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Sparkles className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">Analyze Your Study Patterns</h3>
                <p className="text-muted-foreground">
                  Complete a few study sessions to unlock AI-powered insights about your learning style
                </p>
                <Button onClick={analyzeStudyPatterns}>
                  Analyze My Patterns
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Study Time</p>
                    <p className="text-2xl font-bold">
                      {patterns.best_study_hour}:00
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {patterns.best_study_hour < 12
                        ? 'Morning'
                        : patterns.best_study_hour < 17
                          ? 'Afternoon'
                          : 'Evening'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Focus Duration</p>
                    <p className="text-2xl font-bold">
                      {patterns.avg_focus_duration} min
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Study Streak</p>
                    <p className="text-2xl font-bold">{patterns.streak_days} days</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 md:col-span-2 lg:col-span-3">
                <h3 className="font-semibold mb-3">Preferred Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {patterns.preferred_subjects.map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {patterns && (
            <Button onClick={analyzeStudyPatterns} variant="outline" className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          )}
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          {tips.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">
                No personalized tips yet. Analyze your study patterns to get started!
              </p>
            </Card>
          ) : (
            tips.map((tip) => (
              <Card key={tip.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {tip.tip_type === 'time' && '⏰'}
                    {tip.tip_type === 'technique' && '🎯'}
                    {tip.tip_type === 'motivation' && '💪'}
                    {tip.tip_type === 'health' && '🧘'}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{tip.tip_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(tip.generated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4">
          <Card className="p-6 text-center space-y-4">
            <BookOpen className="w-12 h-12 mx-auto text-primary" />
            <h3 className="text-xl font-semibold">Custom Quiz Generator</h3>
            <p className="text-muted-foreground">
              Generate personalized quizzes based on your study history and weak areas
            </p>
            <Button onClick={createCustomQuiz}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Quiz
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
