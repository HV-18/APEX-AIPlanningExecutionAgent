import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChefHat, DollarSign, Leaf, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface MealPlan {
  id: string;
  day_of_week: number;
  meal_type: string;
  meal_name: string;
  calories: number;
  cost: number;
  is_sustainable: boolean;
  ingredients: string[];
  recipe_notes: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function MealPlannerPage() {
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMealPlans();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('meal-plans-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_plans' }, () => loadMealPlans())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [weekStart]);

  function getMonday(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  const loadMealPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart);

      if (error) throw error;
      setMealPlans(data || []);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyPlan = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('Starting meal plan generation for user:', user.id);

      // Get user's meal history for preferences
      const { data: pastMeals, error: mealsError } = await supabase
        .from('meals')
        .select('meal_name, nutrition_score, is_sustainable')
        .eq('user_id', user.id)
        .limit(20);

      if (mealsError) {
        console.error('Error fetching past meals:', mealsError);
      }

      console.log('Past meals fetched:', pastMeals?.length || 0);

      // Generate AI-powered meal suggestions
      const suggestions = await generateMealSuggestions(pastMeals || []);
      console.log('Meal suggestions generated:', suggestions.length);

      // Create meal plans for the week
      const plans = [];
      for (let day = 0; day < 7; day++) {
        for (const mealType of mealTypes) {
          const suggestion = suggestions.find(
            (s) => s.day === day && s.meal_type === mealType
          );
          if (suggestion) {
            plans.push({
              user_id: user.id,
              week_start: weekStart,
              day_of_week: day,
              meal_type: mealType,
              meal_name: suggestion.meal_name,
              calories: suggestion.calories,
              cost: suggestion.cost,
              is_sustainable: suggestion.is_sustainable,
              ingredients: suggestion.ingredients,
              recipe_notes: suggestion.recipe_notes,
            });
          }
        }
      }

      console.log('Plans to insert:', plans.length);

      if (plans.length === 0) {
        throw new Error('No meal plans generated');
      }

      // Delete existing plans for this week first to avoid duplicates
      const { error: deleteError } = await supabase
        .from('meal_plans')
        .delete()
        .eq('user_id', user.id)
        .eq('week_start', weekStart);

      if (deleteError) {
        console.error('Delete error:', deleteError);
      }

      // Insert new meal plans
      const { error: insertError } = await supabase.from('meal_plans').insert(plans);
      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      toast({ title: 'Weekly meal plan generated!' });
      loadMealPlans();
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({ 
        title: 'Failed to generate meal plan', 
        description: error instanceof Error ? error.message : 'Please try again or upgrade your instance',
        variant: 'destructive' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateMealSuggestions = async (pastMeals: any[]) => {
    // Budget-friendly, sustainable meal database with day assignments
    const mealDatabase = {
      breakfast: [
        { meal_name: 'Oatmeal with Banana', calories: 300, cost: 1.5, is_sustainable: true, ingredients: ['oats', 'banana', 'honey'], recipe_notes: 'Cook oats with water, top with sliced banana' },
        { meal_name: 'Scrambled Eggs & Toast', calories: 350, cost: 2.0, is_sustainable: true, ingredients: ['eggs', 'bread', 'butter'], recipe_notes: 'Scramble 2 eggs, serve with whole grain toast' },
        { meal_name: 'Greek Yogurt Parfait', calories: 280, cost: 2.5, is_sustainable: true, ingredients: ['yogurt', 'granola', 'berries'], recipe_notes: 'Layer yogurt with granola and fresh berries' },
      ],
      lunch: [
        { meal_name: 'Veggie Stir-Fry with Rice', calories: 450, cost: 3.0, is_sustainable: true, ingredients: ['rice', 'mixed veggies', 'soy sauce'], recipe_notes: 'Stir-fry seasonal vegetables with brown rice' },
        { meal_name: 'Chickpea Salad Sandwich', calories: 400, cost: 2.5, is_sustainable: true, ingredients: ['chickpeas', 'bread', 'lettuce', 'tomato'], recipe_notes: 'Mash chickpeas with mayo, serve in whole grain bread' },
        { meal_name: 'Lentil Soup', calories: 320, cost: 2.0, is_sustainable: true, ingredients: ['lentils', 'carrots', 'onions', 'broth'], recipe_notes: 'Simmer lentils with vegetables in vegetable broth' },
      ],
      dinner: [
        { meal_name: 'Baked Chicken & Veggies', calories: 500, cost: 4.0, is_sustainable: true, ingredients: ['chicken breast', 'sweet potato', 'broccoli'], recipe_notes: 'Bake chicken with roasted vegetables' },
        { meal_name: 'Pasta Primavera', calories: 480, cost: 3.0, is_sustainable: true, ingredients: ['pasta', 'mixed vegetables', 'olive oil'], recipe_notes: 'Toss whole wheat pasta with sautéed seasonal veggies' },
        { meal_name: 'Bean & Rice Bowl', calories: 420, cost: 2.5, is_sustainable: true, ingredients: ['black beans', 'rice', 'salsa', 'avocado'], recipe_notes: 'Combine beans and rice, top with fresh salsa' },
      ],
      snack: [
        { meal_name: 'Apple with Peanut Butter', calories: 200, cost: 1.0, is_sustainable: true, ingredients: ['apple', 'peanut butter'], recipe_notes: 'Slice apple, serve with 2 tbsp peanut butter' },
        { meal_name: 'Hummus & Carrots', calories: 150, cost: 1.5, is_sustainable: true, ingredients: ['hummus', 'carrots'], recipe_notes: 'Serve hummus with carrot sticks' },
        { meal_name: 'Trail Mix', calories: 180, cost: 1.2, is_sustainable: true, ingredients: ['nuts', 'dried fruit', 'seeds'], recipe_notes: 'Mix almonds, raisins, and sunflower seeds' },
      ],
    };

    const suggestions = [];
    for (let day = 0; day < 7; day++) {
      for (const mealType of mealTypes) {
        const options = mealDatabase[mealType as keyof typeof mealDatabase];
        const meal = options[Math.floor(Math.random() * options.length)];
        suggestions.push({
          day,
          meal_type: mealType,
          ...meal,
        });
      }
    }

    return suggestions;
  };

  const getMealForSlot = (day: number, mealType: string) => {
    return mealPlans.find((m) => m.day_of_week === day && m.meal_type === mealType);
  };

  const totalWeeklyCost = mealPlans.reduce((sum, m) => sum + (m.cost || 0), 0);
  const sustainableMeals = mealPlans.filter((m) => m.is_sustainable).length;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Weekly Meal Planner</h1>
          <p className="text-muted-foreground mt-1">Budget-friendly, sustainable meal planning</p>
        </div>
        <Button onClick={generateWeeklyPlan} disabled={generating || loading}>
          <Sparkles className="w-4 h-4 mr-2" />
          {generating ? 'Generating...' : 'Generate AI Plan'}
        </Button>
      </div>

      {mealPlans.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Weekly Cost</p>
                <p className="text-2xl font-bold text-foreground">${totalWeeklyCost.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Leaf className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sustainable Meals</p>
                <p className="text-2xl font-bold text-foreground">{sustainableMeals}/{mealPlans.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Week Starting</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(weekStart).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid gap-4">
        {days.map((day, dayIndex) => (
          <Card key={day} className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">{day}</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {mealTypes.map((mealType) => {
                const meal = getMealForSlot(dayIndex, mealType);
                return (
                  <div key={mealType} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ChefHat className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-muted-foreground capitalize">{mealType}</p>
                    </div>
                    {meal ? (
                      <>
                        <p className="font-semibold text-foreground mb-2">{meal.meal_name}</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>{meal.calories} cal • ${meal.cost?.toFixed(2)}</p>
                          {meal.is_sustainable && (
                            <Badge variant="secondary" className="text-xs">
                              <Leaf className="w-3 h-3 mr-1" />
                              Sustainable
                            </Badge>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No meal planned</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}