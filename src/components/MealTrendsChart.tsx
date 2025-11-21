import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface TrendData {
  date: string;
  calories: number;
  cost: number;
  nutritionScore: number;
}

export default function MealTrendsChart() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();

    const channel = supabase
      .channel('meal-trends')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meals' }, loadTrends)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTrends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: meals } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (!meals || meals.length === 0) {
        setTrendData([]);
        return;
      }

      // Group by date
      const dateMap = new Map<string, { calories: number[]; costs: number[]; scores: number[] }>();

      meals.forEach(meal => {
        const date = new Date(meal.created_at).toLocaleDateString();
        if (!dateMap.has(date)) {
          dateMap.set(date, { calories: [], costs: [], scores: [] });
        }
        const entry = dateMap.get(date)!;
        if (meal.calories) entry.calories.push(meal.calories);
        if (meal.cost) entry.costs.push(meal.cost);
        if (meal.nutrition_score) {
          // Convert letter grade to number
          const scoreMap: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, F: 1 };
          entry.scores.push(scoreMap[meal.nutrition_score] || 3);
        }
      });

      // Calculate averages per day
      const trends: TrendData[] = Array.from(dateMap.entries()).map(([date, data]) => ({
        date,
        calories: data.calories.length > 0 ? Math.round(data.calories.reduce((a, b) => a + b, 0) / data.calories.length) : 0,
        cost: data.costs.length > 0 ? Math.round((data.costs.reduce((a, b) => a + b, 0) / data.costs.length) * 100) / 100 : 0,
        nutritionScore: data.scores.length > 0 ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10 : 0,
      }));

      setTrendData(trends);
    } catch (error) {
      console.error('Error loading meal trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Nutrition Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (trendData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Nutrition Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Track more meals to see your nutrition trends
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Nutrition Trends (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
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
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="calories" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Avg Calories"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="nutritionScore" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              name="Nutrition Score (1-5)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="cost" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              name="Avg Cost ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
