import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPTS = {
  casual: `You are a supportive AI study companion for students. You help with:
- Academic questions and doubts in a casual, friendly way
- Study planning and organization
- Motivation and stress management
- General student wellness advice

Be warm, encouraging, and conversational like talking to a friend. Keep responses concise but helpful.`,

  interview: `You are an expert interview coach conducting a mock interview. Your role:
- Ask relevant interview questions (technical, behavioral, or situational)
- Provide constructive feedback on answers
- Give tips on communication and presentation
- Rate responses on clarity, content, and delivery
- Build confidence through positive reinforcement

Be professional yet supportive. Ask one question at a time and wait for answers.`,

  viva: `You are an experienced examiner conducting a viva voce examination. Your role:
- Ask probing academic questions to test understanding
- Challenge assumptions to deepen knowledge
- Provide detailed feedback on responses
- Assess depth of understanding, not just recall
- Guide toward better explanations when needed

Be thorough and academic, but fair. Help students think critically.`,

  notes: `You are an expert study notes generator. Your role:
- Create clear, structured study notes on topics
- Break down complex concepts into digestible points
- Include key definitions, formulas, and examples
- Use bullet points, headings, and formatting
- Add memory tips and mnemonics where helpful

Generate comprehensive yet concise notes that aid learning.`,

  study_plan: `You are a study planning expert. Your role:
- Create personalized study schedules
- Balance multiple subjects and deadlines
- Incorporate breaks and wellness time
- Suggest effective study techniques
- Adapt plans to student's needs and constraints

Be practical and realistic. Consider student wellbeing.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = 'casual', context } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Handle image generation mode (using Gemini imagen API)
    if (mode === 'image_generation') {
      const prompt = messages[0]?.content || '';
      console.log('Generating image with prompt:', prompt);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate an image: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Image generation error:", response.status, errorText);
        throw new Error(`Failed to generate image: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        throw new Error("No image generated");
      }

      // Save to database if user is authenticated
      if (userId) {
        try {
          // Extract base64 data from data URL
          const base64Data = imageUrl.split(',')[1];
          const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          // Generate unique filename
          const filename = `${userId}/${Date.now()}.png`;
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(filename, buffer, {
              contentType: 'image/png',
              upsert: false
            });
          
          if (uploadError) {
            console.error('Storage upload error:', uploadError);
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('generated-images')
              .getPublicUrl(filename);
            
            // Save record to database
            await supabase.from('generated_images').insert({
              user_id: userId,
              image_url: urlData.publicUrl,
              prompt: prompt
            });
            
            console.log('Image saved to storage and database');
          }
        } catch (saveError) {
          console.error('Error saving image:', saveError);
          // Don't fail the request if saving fails
        }
      }

      return new Response(
        JSON.stringify({ imageUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing AI chat in ${mode} mode for user:`, userId);

    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.casual;
    const contextNote = context ? `\n\nContext: ${context}` : '';

    // Transform messages to support vision
    const transformedMessages = messages.map((msg: any) => {
      if (msg.images && msg.images.length > 0) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            ...msg.images.map((img: string) => ({
              type: 'image_url',
              image_url: { url: img }
            }))
          ]
        };
      }
      return { role: msg.role, content: msg.content };
    });

    // Convert messages to Gemini format
    const geminiMessages = [
      { role: "user", parts: [{ text: systemPrompt + contextNote }] },
      ...transformedMessages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: Array.isArray(msg.content) 
          ? msg.content.map((c: any) => c.type === 'text' ? { text: c.text } : { inlineData: { mimeType: 'image/jpeg', data: c.image_url.url.split(',')[1] } })
          : [{ text: msg.content }]
      }))
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Gemini API rate limit hit");
        return new Response(
          JSON.stringify({ error: "Gemini API rate limit reached. Please wait 30-60 seconds before trying again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error("Gemini API error");
    }

    // Store user message and mode if authenticated
    if (userId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        await supabase.from('chat_messages').insert({
          user_id: userId,
          role: 'user',
          content: lastMessage.content,
        });
        
        // Log the AI mode being used
        await supabase.from('ai_modes').insert({
          user_id: userId,
          mode,
          context: context || null,
        });
      }
    }

    // Transform Gemini SSE format to OpenAI format for compatibility
    if (!response.body) {
      throw new Error("No response body from Gemini API");
    }
    
    const transformedStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const data = JSON.parse(jsonStr);
              
              if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                const content = data.candidates[0].content.parts[0].text;
                const openaiFormat = {
                  choices: [{
                    delta: { content },
                    index: 0,
                    finish_reason: data.candidates[0].finishReason === 'STOP' ? 'stop' : null
                  }]
                };
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openaiFormat)}\n\n`));
              }
            } catch (e) {
              console.error('Transform error:', e);
            }
          }
        }
      }
    });

    return new Response(response.body.pipeThrough(transformedStream), {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
