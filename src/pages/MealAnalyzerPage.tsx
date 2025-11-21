import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface MealAnalysis {
  mealName: string;
  calories: number;
  nutritionScore: string;
  estimatedCost: number;
  isSustainable: boolean;
  healthierAlternatives: string[];
  analysisNotes: string;
}

interface SavedMeal {
  id: string;
  meal_name: string;
  calories: number | null;
  nutrition_score: string | null;
  cost: number | null;
  is_sustainable: boolean | null;
  notes: string | null;
  created_at: string;
}

export default function MealAnalyzerPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mealHistory, setMealHistory] = useState<SavedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load meal history
  useEffect(() => {
    loadMealHistory();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('meals-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meals',
        },
        (payload) => {
          setMealHistory((prev) => [payload.new as SavedMeal, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMealHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMealHistory(data || []);
    } catch (error) {
      console.error('Error loading meal history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze image
    setAnalyzing(true);
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      // Call AI analysis
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: { imageBase64: base64 },
      });

      if (error) throw error;

      setAnalysis(data);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('meals').insert({
          user_id: user.id,
          meal_name: data.mealName,
          calories: data.calories,
          nutrition_score: data.nutritionScore,
          cost: data.estimatedCost,
          is_sustainable: data.isSustainable,
          notes: data.analysisNotes,
        });
      }

      toast({
        title: 'Analysis Complete!',
        description: `${data.mealName} - Grade ${data.nutritionScore}`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze meal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const gradeColors: Record<string, string> = {
    A: 'bg-green-500',
    B: 'bg-green-400',
    C: 'bg-yellow-500',
    D: 'bg-orange-500',
    F: 'bg-red-500',
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">AI Meal Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Upload a photo of your meal for instant nutrition analysis
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-border rounded-lg">
          {imagePreview ? (
            <div className="w-full">
              <img
                src={imagePreview}
                alt="Meal preview"
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  Upload a meal photo
                </p>
                <p className="text-sm text-muted-foreground">
                  Get instant nutrition analysis, calorie count, and healthier alternatives
                </p>
              </div>
              <Button onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Choose Photo
              </Button>
            </div>
          )}
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
        </div>
      </Card>

      {analyzing && (
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-medium text-foreground">Analyzing your meal...</p>
            <p className="text-sm text-muted-foreground">
              AI is identifying ingredients and calculating nutrition
            </p>
          </div>
        </Card>
      )}

      {analysis && !analyzing && (
        <div className="space-y-4 mb-6">
          <Card className="p-6 border-primary/50 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{analysis.mealName}</h2>
                <p className="text-sm text-muted-foreground mt-1">{analysis.analysisNotes}</p>
              </div>
              <div className={`${gradeColors[analysis.nutritionScore]} text-white text-3xl font-bold rounded-lg w-16 h-16 flex items-center justify-center shadow-md`}>
                {analysis.nutritionScore}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Calories</p>
                <p className="text-2xl font-bold text-foreground">{analysis.calories}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Cost</p>
                <p className="text-2xl font-bold text-foreground">${analysis.estimatedCost.toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Sustainability</p>
                <Badge variant={analysis.isSustainable ? 'default' : 'secondary'}>
                  {analysis.isSustainable ? '✓ Sustainable' : '⚠ Not Sustainable'}
                </Badge>
              </div>
            </div>
          </Card>

          {analysis.healthierAlternatives?.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Healthier Budget-Friendly Alternatives
              </h3>
              <ul className="space-y-2">
                {analysis.healthierAlternatives.map((alt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-foreground">{alt}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Meal History Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Recent Meal Analysis</h2>
        {loading ? (
          <Card className="p-8">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </Card>
        ) : mealHistory.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              No meals analyzed yet. Upload your first meal photo above!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {mealHistory.map((meal) => (
              <Card key={meal.id} className="p-4 hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{meal.meal_name}</h3>
                      {meal.nutrition_score && (
                        <Badge className={`${gradeColors[meal.nutrition_score]}`}>
                          Grade {meal.nutrition_score}
                        </Badge>
                      )}
                      {meal.is_sustainable && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          ♻ Sustainable
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {meal.calories && (
                        <span className="flex items-center gap-1">
                          🔥 {meal.calories} cal
                        </span>
                      )}
                      {meal.cost && (
                        <span className="flex items-center gap-1">
                          💰 ${meal.cost.toFixed(2)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(meal.created_at).toLocaleDateString()} at {new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {meal.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {meal.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}