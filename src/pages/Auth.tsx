import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Brain, Users, Heart } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: Value Proposition */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center lg:justify-start">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Brain className="w-9 h-9 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                  APEX
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                AI Planning & Execution Agent for your academic journey
              </p>
              <p className="text-base text-muted-foreground/80 max-w-xl mx-auto lg:mx-0">
                Transform your study experience with personalized AI assistance, collaborative tools, and wellness tracking
              </p>
            </div>

            <div className="grid gap-4 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base mb-1">AI-Powered Learning</h3>
                  <p className="text-sm text-muted-foreground">Personalized study assistance with quiz generation and conversational AI</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-accent/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base mb-1">Real-Time Collaboration</h3>
                  <p className="text-sm text-muted-foreground">Live study rooms with video, whiteboard, and screen sharing</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-base mb-1">Holistic Wellness</h3>
                  <p className="text-sm text-muted-foreground">Track mood, nutrition, and study patterns for balanced success</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth Form */}
          <div className="w-full max-w-md mx-auto order-1 lg:order-2">
            <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border/50 backdrop-blur-sm">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Get Started</h2>
                <p className="text-sm text-muted-foreground">Create your account or sign in to continue</p>
              </div>
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
                  className: {
                    button: 'font-medium',
                    input: 'border-input',
                  },
                }}
                providers={['google', 'apple']}
                socialLayout="vertical"
                theme="light"
                redirectTo={window.location.origin}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-card/30 backdrop-blur-sm py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">20+</div>
              <div className="text-sm text-muted-foreground">Integrated Features</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">AI</div>
              <div className="text-sm text-muted-foreground">Smart Learning</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Live</div>
              <div className="text-sm text-muted-foreground">Collaboration</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">360°</div>
              <div className="text-sm text-muted-foreground">Wellness</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Help Center</a>
            <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
