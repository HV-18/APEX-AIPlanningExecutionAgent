import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === "SIGNED_IN") {
        // Send AI-powered login notification email
        try {
          console.log("Sending login notification email...");
          const response = await supabase.functions.invoke("send-login-notification", {
            body: {
              userEmail: session.user.email,
              userId: session.user.id,
            },
          });

          if (response.error) {
            console.error("Failed to send login notification:", response.error);
          } else {
            console.log("Login notification sent successfully");
            toast({
              title: "Welcome back! 📧",
              description: "Check your email for a personalized AI message",
            });
          }
        } catch (error) {
          console.error("Error sending login notification:", error);
        }

        navigate("/");
      }
    });
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Student Wellness Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Your AI-powered companion for academic success
          </p>
        </div>
        
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(210 80% 55%)',
                    brandAccent: 'hsl(195 75% 60%)',
                  },
                  radii: {
                    borderRadiusButton: '0.75rem',
                    inputBorderRadius: '0.75rem',
                  },
                },
              },
            }}
            providers={[]}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
