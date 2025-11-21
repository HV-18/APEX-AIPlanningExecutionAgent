import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import * as React from 'https://esm.sh/react@18.3.1';
import { render } from 'https://esm.sh/@react-email/render@1.0.1';
import { LoginNotificationEmail } from './_templates/login-notification.tsx';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginNotificationRequest {
  userEmail: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userId }: LoginNotificationRequest = await req.json();
    console.log("Processing login notification for:", userEmail);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    const userName = profile?.full_name || "Student";

    // Fetch recent study activity
    const { data: recentSessions } = await supabase
      .from("study_sessions")
      .select("subject, duration_minutes, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: recentNotes } = await supabase
      .from("study_notes")
      .select("subject, topic")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    const { data: projects } = await supabase
      .from("learning_projects")
      .select("title, progress")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    // Build context for AI
    const studyContext = {
      recentSessions: recentSessions?.map(s => `${s.subject} (${s.duration_minutes} mins)`) || [],
      recentNotes: recentNotes?.map(n => `${n.subject}: ${n.topic}`) || [],
      projects: projects?.map(p => `${p.title} (${p.progress}% complete)`) || [],
    };

    // Generate AI content
    const aiPrompt = `Generate a personalized welcome message for ${userName} who just logged into their study platform. 

Recent activity:
- Study sessions: ${studyContext.recentSessions.join(", ") || "No recent sessions"}
- Recent notes: ${studyContext.recentNotes.join(", ") || "No recent notes"}
- Active projects: ${studyContext.projects.join(", ") || "No active projects"}

Respond with a JSON object containing:
{
  "greeting": "A warm, personalized greeting (2-3 sentences)",
  "recommendations": "3-4 specific study recommendations based on their activity (use bullet points with • character)",
  "motivation": "An inspiring message to motivate them for today (2-3 sentences)"
}`;

    console.log("Calling Lovable AI for personalized content...");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an enthusiastic AI study assistant. Generate personalized, encouraging content."
          },
          {
            role: "user",
            content: aiPrompt
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI Gateway error:", aiResponse.status);
      throw new Error("Failed to generate AI content");
    }

    const aiData = await aiResponse.json();
    const aiContent = JSON.parse(aiData.choices[0].message.content);
    
    console.log("AI content generated:", aiContent);

    // Format login time
    const loginTime = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    // Format recommendations array to string
    const recommendationsText = Array.isArray(aiContent.recommendations) 
      ? aiContent.recommendations.join('\n')
      : aiContent.recommendations;

    // Render email template
    const html = await render(
      React.createElement(LoginNotificationEmail, {
        userName,
        aiGreeting: aiContent.greeting,
        aiRecommendations: recommendationsText,
        aiMotivation: aiContent.motivation,
        loginTime,
      })
    );

    // Send email
    console.log("Sending email to:", userEmail);
    const { data, error } = await resend.emails.send({
      from: "APEX <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Welcome back, ${userName}! APEX has insights for you 🎓`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Login notification sent successfully",
        emailId: data?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-login-notification:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
