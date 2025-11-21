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

// Rate limiting: Track recent notifications
const recentNotifications = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// Cleanup old entries periodically
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentNotifications.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW) {
      recentNotifications.delete(key);
    }
  }
}, 30000); // Cleanup every 30 seconds

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

    // Rate limiting check
    const notificationKey = `${userId}:${userEmail}`;
    const lastNotification = recentNotifications.get(notificationKey);
    const now = Date.now();

    if (lastNotification && (now - lastNotification) < RATE_LIMIT_WINDOW) {
      console.log("Rate limit: Notification already sent recently for", userEmail);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Notification already sent recently",
          rateLimited: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update rate limit tracker
    recentNotifications.set(notificationKey, now);

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

    // Render email template with error handling
    let html: string;
    try {
      html = await render(
        React.createElement(LoginNotificationEmail, {
          userName,
          aiGreeting: aiContent.greeting,
          aiRecommendations: recommendationsText,
          aiMotivation: aiContent.motivation,
          loginTime,
        })
      );
    } catch (renderError) {
      console.error("Email template render error:", renderError);
      // Fallback to simple HTML if React template fails
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to APEX</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.5;
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background-color: #ffffff;
              }
              .container {
                max-width: 560px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              .logo {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 32px;
              }
              .logo-icon {
                width: 24px;
                height: 24px;
                color: #10A37F; /* OpenAI green */
              }
              .logo-text {
                font-weight: 600;
                font-size: 16px;
                color: #1a1a1a;
              }
              h1 {
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 24px;
                letter-spacing: -0.5px;
                color: #1a1a1a;
              }
              p {
                font-size: 16px;
                margin: 0 0 16px;
                color: #404040;
              }
              .section-title {
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #666;
                margin: 32px 0 16px;
              }
              .recommendation-box {
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
                border: 1px solid #eee;
              }
              .btn {
                display: inline-block;
                background-color: #10A37F; /* OpenAI green */
                color: #ffffff;
                font-size: 16px;
                font-weight: 500;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                margin-top: 24px;
              }
              .footer {
                margin-top: 48px;
                padding-top: 24px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #888;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <span class="logo-text">APEX</span>
              </div>
              
              <h1>Welcome back, ${userName}</h1>
              
              <p>${aiContent.greeting}</p>
              
              <div class="section-title">Today's Focus</div>
              <div class="recommendation-box">
                <p style="white-space: pre-line; margin: 0;">${recommendationsText}</p>
              </div>
              
              <div class="section-title">Daily Motivation</div>
              <p>${aiContent.motivation}</p>
              
              <a href="https://apex-study-buddy.lovable.app" class="btn">Go to Dashboard</a>
              
              <div class="footer">
                <p style="margin: 0;">Login detected at ${loginTime}</p>
                <p style="margin: 8px 0 0;">© ${new Date().getFullYear()} APEX AI Study Platform</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    // Send email with retry logic for rate limiting
    console.log("Sending email to:", userEmail);
    let emailData;
    let emailError;

    try {
      const result = await resend.emails.send({
        from: "APEX <onboarding@resend.dev>",
        to: [userEmail],
        subject: `Welcome back, ${userName}! APEX has insights for you 🎓`,
        html,
      });
      emailData = result.data;
      emailError = result.error;
    } catch (error: any) {
      emailError = error;
    }

    if (emailError) {
      console.error("Resend error:", emailError);

      // If it's a rate limit error, return success with rate limited flag
      if (emailError.statusCode === 429 || emailError.name === "rate_limit_exceeded") {
        console.log("Resend API rate limit hit, silently skipping notification");
        return new Response(
          JSON.stringify({
            success: true,
            message: "Rate limit reached, notification skipped",
            rateLimited: true
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw emailError;
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login notification sent successfully",
        emailId: emailData?.id
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
        error: error.message || "Failed to send notification",
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
