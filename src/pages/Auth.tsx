import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Brain, Users, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AgeVerificationModal } from "@/components/AgeVerificationModal";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAgeVerification, setShowAgeVerification] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === "SIGNED_IN") {
        // Check if age verification is needed
        const { data: profile } = await supabase
          .from("profiles")
          .select("age_verified")
          .eq("id", session.user.id)
          .single();

        if (!profile?.age_verified) {
          setShowAgeVerification(true);
          return;
        }

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

  const handleAgeVerificationClose = () => {
    setShowAgeVerification(false);
    navigate("/");
  };

  return (
    <>
      <AgeVerificationModal 
        open={showAgeVerification} 
        onClose={handleAgeVerificationClose}
      />
      
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted to-accent/10">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Value Proposition */}
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center justify-center md:justify-start w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
                APEX : AI Planning & Execution Agent
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Your intelligent companion for academic success and wellness
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI-Powered Learning</h3>
                  <p className="text-sm text-muted-foreground">Personalized study buddy, quiz generation, and conversational AI for academic support</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-Time Collaboration</h3>
                  <p className="text-sm text-muted-foreground">Live study rooms with video, whiteboard, code editor, and screen sharing</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold">Wellness Tracking</h3>
                  <p className="text-sm text-muted-foreground">Mood analysis, nutrition scoring, Pomodoro integration, and comprehensive wellness reports</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth Form */}
          <div className="w-full max-w-md mx-auto">
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
      </div>

      {/* Footer with Quick Stats */}
      <div className="border-t bg-card/50 backdrop-blur-sm p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">20+</div>
              <div className="text-sm text-muted-foreground">Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">AI-Powered</div>
              <div className="text-sm text-muted-foreground">Learning Tools</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Real-Time</div>
              <div className="text-sm text-muted-foreground">Collaboration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">Holistic</div>
              <div className="text-sm text-muted-foreground">Wellness Focus</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Auth;
