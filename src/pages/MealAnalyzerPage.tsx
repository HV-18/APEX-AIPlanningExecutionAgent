import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2 } from 'lucide-react';
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

export default function MealAnalyzerPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

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
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{analysis.mealName}</h2>
                <p className="text-sm text-muted-foreground mt-1">{analysis.analysisNotes}</p>
              </div>
              <div className={`${gradeColors[analysis.nutritionScore]} text-white text-3xl font-bold rounded-lg w-16 h-16 flex items-center justify-center`}>
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
    </div>
  );
}