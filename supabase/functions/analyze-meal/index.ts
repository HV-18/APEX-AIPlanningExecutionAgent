import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Use Lovable AI with vision capability
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Analyze food images and provide detailed nutritional information in JSON format.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this meal and provide: 1) Meal name 2) Estimated calories 3) Nutrition score (A-F) 4) Estimated cost in USD 5) Is it sustainable? 6) Healthier budget-friendly alternatives. Return ONLY valid JSON with keys: mealName, calories, nutritionScore, estimatedCost, isSustainable, healthierAlternatives (array of strings), analysisNotes.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error('Failed to analyze meal');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    let analysis;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/```json\n?(.*?)\n?```/s) || content.match(/\{.*\}/s);
      analysis = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse meal analysis');
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});