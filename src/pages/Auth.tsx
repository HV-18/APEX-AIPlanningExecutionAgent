import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Brain, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent any auto-opening of dialogs on mount
  useEffect(() => {
    setShowAuthModal(false);
    setShowHelpDialog(false);
  }, []);

  // Track last notification to prevent duplicates
  const lastNotificationRef = useRef<number>(0);
  const NOTIFICATION_COOLDOWN = 60000; // 1 minute cooldown

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        // Navigate immediately
        navigate("/");
        
        // Check if we recently sent a notification
        const now = Date.now();
        const timeSinceLastNotification = now - lastNotificationRef.current;
        
        if (timeSinceLastNotification < NOTIFICATION_COOLDOWN) {
          console.log("Skipping notification - sent too recently");
          return;
        }
        
        // Update last notification time
        lastNotificationRef.current = now;
        
        // Send login notification in the background (non-blocking)
        supabase.functions.invoke("send-login-notification", {
          body: {
            userEmail: session.user.email,
            userId: session.user.id,
          },
        }).then(({ data, error }) => {
          if (error) {
            console.error("Error sending login notification:", error);
            // Don't show error to user - it's a background operation
            return;
          }
          
          // Check if rate limited
          if (data?.rateLimited) {
            console.log("Login notification rate limited");
            return;
          }
          
          if (data?.success) {
            toast({
              title: "Welcome back! 📧",
              description: "Check your email for a personalized AI message",
            });
          }
        }).catch((error) => {
          console.error("Error sending login notification:", error);
          // Don't show error to user - it's a background operation
        });
      }
    });
  }, [navigate, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) throw error;

        toast({
          title: "Check your email!",
          description: "We've sent you a password reset link.",
        });
        setAuthMode("signin");
        setShowAuthModal(false);
      } else if (authMode === "signup") {
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
        setShowAuthModal(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        setShowAuthModal(false);
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

  const openAuthModal = (mode: "signin" | "signup") => {
    // Close help dialog if it's open
    setShowHelpDialog(false);
    // Reset form
    setEmail("");
    setPassword("");
    setShowPassword(false);
    // Set mode and open
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D] text-white">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-semibold text-lg">APEX</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openAuthModal("signin")}
            className="text-white hover:bg-white/10 h-9 px-4 rounded-full"
          >
            Log in
          </Button>
          <Button
            size="sm"
            onClick={() => openAuthModal("signup")}
            className="bg-white text-black hover:bg-white/90 h-9 px-4 rounded-full font-medium"
          >
            Sign up for free
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHelpDialog(true)}
            aria-label="Help and Documentation"
            className="text-white hover:bg-white/10 rounded-full h-9 w-9"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="w-full max-w-3xl space-y-8">
          <h1 className="text-4xl md:text-5xl font-medium text-center mb-12">
            Where should we begin?
          </h1>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 px-4 text-center text-sm text-white/60 border-t border-white/10">
        <p>
          By messaging APEX, an AI chatbot, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-white/80">
            Terms
          </Link>{" "}
          and have read our{" "}
          <Link to="/privacy" className="underline hover:text-white/80">
            Privacy Policy
          </Link>
          . See{" "}
          <Link to="/cookies" className="underline hover:text-white/80">
            Cookie Preferences
          </Link>
          .
        </p>
      </div>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md bg-[#1A1A1A] border-white/10 text-white z-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-center">
              {authMode === "forgot"
                ? "Reset Password"
                : authMode === "signup"
                ? "Create your account"
                : "Welcome back"}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-center">
              {authMode === "forgot"
                ? "Enter your email to receive a reset link"
                : authMode === "signup"
                ? "Sign up to start your journey"
                : "Enter your credentials to continue"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAuth} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-[#2F2F2F] border-white/10 text-white placeholder:text-white/40 focus:border-white/30"
              />
            </div>

            {authMode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-[#2F2F2F] border-white/10 text-white placeholder:text-white/40 focus:border-white/30 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
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

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg"
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : authMode === "forgot"
                ? "Send reset link"
                : authMode === "signup"
                ? "Continue"
                : "Log in"}
            </Button>

            <div className="space-y-2 text-center text-sm">
              {authMode === "signin" && (
                <button
                  type="button"
                  onClick={() => setAuthMode("forgot")}
                  className="text-white/60 hover:text-white/80 transition-colors block w-full"
                >
                  Forgot password?
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (authMode === "forgot") {
                    setAuthMode("signin");
                  } else {
                    setAuthMode(authMode === "signup" ? "signin" : "signup");
                  }
                }}
                className="text-white/60 hover:text-white/80 transition-colors"
              >
                {authMode === "forgot"
                  ? "Back to log in"
                  : authMode === "signup"
                  ? "Already have an account? Log in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="sm:max-w-md bg-[#1A1A1A] border-white/10 text-white z-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Help & Support</DialogTitle>
            <DialogDescription className="text-white/60">
              Learn how to use APEX
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-white/70">
                Sign up for free to access all features including AI study assistant, focus tools, mood tracking, and collaborative study rooms.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
                <li>AI-powered study assistance</li>
                <li>Pomodoro timer & focus music</li>
                <li>Study rooms with video chat</li>
                <li>Meal analyzer & wellness tracking</li>
                <li>Gamification & rewards</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Need More Help?</h3>
              <p className="text-sm text-white/70">
                After signing in, visit the docs page for detailed guides and tutorials.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
