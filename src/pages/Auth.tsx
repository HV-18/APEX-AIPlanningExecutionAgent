import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Brain, Users, Heart, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === "SIGNED_IN") {
        try {
          const response = await supabase.functions.invoke("send-login-notification", {
            body: {
              userEmail: session.user.email,
              userId: session.user.id,
            },
          });

          if (!response.error) {
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) throw error;

        toast({
          title: "Check your email!",
          description: "We've sent you a password reset link.",
        });
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Check your email!",
          description: "We've sent you a confirmation link.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                <h2 className="text-2xl font-bold mb-2">
                  {isForgotPassword ? "Reset Password" : "Get Started"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isForgotPassword
                    ? "Enter your email to receive a reset link"
                    : isSignUp
                    ? "Create your account to continue"
                    : "Sign in to your account"}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                {!isForgotPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading
                    ? "Loading..."
                    : isForgotPassword
                    ? "Send Reset Link"
                    : isSignUp
                    ? "Sign Up"
                    : "Sign In"}
                </Button>

                <div className="space-y-2 text-center">
                  {!isForgotPassword && !isSignUp && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors block w-full"
                    >
                      Forgot password?
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setIsForgotPassword(false);
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isForgotPassword
                      ? "Back to sign in"
                      : isSignUp
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
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
