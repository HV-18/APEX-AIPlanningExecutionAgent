import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, TrendingUp, Activity, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WellnessReport {
  id: string;
  report_date: string;
  report_type: string;
  pomodoro_count: number;
  study_minutes: number;
  avg_mood_score: number;
  meals_logged: number;
  avg_nutrition_score: string;
  sustainability_score: number;
  recommendations: string[];
  insights: any;
}

export default function WellnessReportsPage() {
  const [reports, setReports] = useState<WellnessReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wellness_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('report_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: 'daily' | 'weekly') => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const daysBack = type === 'daily' ? 1 : 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch all data
      const [pomodoroRes, moodRes, mealsRes, studyRes] = await Promise.all([
        supabase.from('pomodoro_sessions').select('*').eq('user_id', user.id).gte('created_at', startDate.toISOString()),
        supabase.from('mood_logs').select('mood_score').eq('user_id', user.id).gte('created_at', startDate.toISOString()),
        supabase.from('meals').select('nutrition_score, is_sustainable').eq('user_id', user.id).gte('created_at', startDate.toISOString()),
        supabase.from('study_sessions').select('duration_minutes').eq('user_id', user.id).gte('created_at', startDate.toISOString()),
      ]);

      const pomodoroCount = pomodoroRes.data?.length || 0;
      const studyMinutes = studyRes.data?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
      const avgMoodScore = moodRes.data?.length
        ? moodRes.data.reduce((sum, m) => sum + m.mood_score, 0) / moodRes.data.length
        : 0;
      const mealsLogged = mealsRes.data?.length || 0;
      
      // Calculate nutrition grade average
      const nutritionScores = mealsRes.data?.filter((m) => m.nutrition_score).map((m) => m.nutrition_score) || [];
      const avgNutrition = nutritionScores.length ? nutritionScores[Math.floor(nutritionScores.length / 2)] : 'N/A';
      
      const sustainabilityScore = mealsRes.data?.filter((m) => m.is_sustainable).length || 0;

      // Generate recommendations
      const recommendations = [];
      if (pomodoroCount < 4 && type === 'daily') recommendations.push('Try to complete at least 4 Pomodoro sessions for better focus');
      if (avgMoodScore < 3) recommendations.push('Your mood is below average. Consider meditation or talking to someone');
      if (mealsLogged < 2 && type === 'daily') recommendations.push('Log more meals to track your nutrition better');
      if (sustainabilityScore < mealsLogged / 2) recommendations.push('Consider choosing more sustainable meal options');
      if (studyMinutes < 120 && type === 'daily') recommendations.push('Aim for at least 2 hours of focused study time');

      // Save report
      const { error } = await supabase.from('wellness_reports').insert({
        user_id: user.id,
        report_date: today,
        report_type: type,
        pomodoro_count: pomodoroCount,
        study_minutes: studyMinutes,
        avg_mood_score: avgMoodScore,
        meals_logged: mealsLogged,
        avg_nutrition_score: avgNutrition,
        sustainability_score: sustainabilityScore,
        recommendations,
        insights: {
          productivity: pomodoroCount > 4 ? 'excellent' : 'needs improvement',
          wellness: avgMoodScore > 3.5 ? 'good' : 'needs attention',
          nutrition: avgNutrition === 'A' || avgNutrition === 'B' ? 'healthy' : 'could be better',
        },
      });

      if (error) throw error;

      toast({ title: `${type === 'daily' ? 'Daily' : 'Weekly'} report generated!` });
      loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({ title: 'Failed to generate report', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wellness Reports</h1>
          <p className="text-muted-foreground mt-1">Track your holistic well-being and get actionable insights</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => generateReport('daily')} disabled={generating}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Daily
          </Button>
          <Button onClick={() => generateReport('weekly')} disabled={generating} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Weekly
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : reports.length === 0 ? (
        <Card className="p-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
          <p className="text-muted-foreground mb-4">Generate your first wellness report to see insights</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {report.report_type === 'daily' ? 'Daily' : 'Weekly'} Report
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.report_date).toLocaleDateString()}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Pomodoros</p>
                  <p className="text-2xl font-bold text-foreground">{report.pomodoro_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Study Time</p>
                  <p className="text-2xl font-bold text-foreground">{report.study_minutes}m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Mood</p>
                  <p className="text-2xl font-bold text-foreground">{report.avg_mood_score.toFixed(1)}/5</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nutrition</p>
                  <p className="text-2xl font-bold text-foreground">{report.avg_nutrition_score}</p>
                </div>
              </div>

              {report.recommendations.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground">Recommendations</h4>
                  </div>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}