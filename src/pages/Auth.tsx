import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";


const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot" | "update_password">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastNotificationRef = useRef<number>(0);
  const NOTIFICATION_COOLDOWN = 60000; // 1 minute cooldown

  // Prevent any auto-opening of dialogs on mount
  useEffect(() => {
    setShowAuthModal(false);
    setShowHelpDialog(false);

    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setAuthMode("update_password");
        setShowAuthModal(true);
      } else if (session && event === "SIGNED_IN") {
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
        if (error) throw error;
        setShowAuthModal(false);
      } else if (authMode === "update_password") {
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) throw error;

        toast({
          title: "Password updated!",
          description: "Your password has been changed successfully.",
        });
        setAuthMode("signin");
        setShowAuthModal(false);
        navigate("/");
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
            {t('login')}
          </Button>
          <Button
            size="sm"
            onClick={() => openAuthModal("signup")}
            className="bg-white text-black hover:bg-white/90 h-9 px-4 rounded-full font-medium"
          >
            {t('signup')}
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
          <h1
            className="text-4xl md:text-5xl font-medium text-center mb-12 tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowHelpDialog(true)}
          >
            {t('welcome')}
          </h1>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 px-4 text-center text-sm text-white/60 border-t border-white/10">
        <p>
          By accessing APEX services, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-white/80 transition-colors">
            Terms of Service
          </Link>{" "}
          and acknowledge our{" "}
          <Link to="/privacy" className="underline hover:text-white/80 transition-colors">
            Privacy Policy
          </Link>
          . Review{" "}
          <Link to="/cookies" className="underline hover:text-white/80 transition-colors">
            Cookie Settings
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
                ? t('resetPassword')
                : authMode === "signup"
                  ? t('createAccount')
                  : authMode === "update_password"
                    ? t('resetPassword')
                    : t('welcome')}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-center">
              {authMode === "forgot"
                ? t('enterEmail')
                : authMode === "signup"
                  ? t('createAccount')
                  : authMode === "update_password"
                    ? t('newPassword')
                    : t('signIn')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAuth} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                {t('enterEmail')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-[#2F2F2F] border-white/10 text-white placeholder:text-white/40 focus:border-white/30"
              />
            </div>

            {authMode === "update_password" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">
                  {t('newPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <Label htmlFor="confirm-password" className="text-white/90 mt-4 block">
                  {t('reEnterPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    required
                    className="h-12 bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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

            {authMode !== "forgot" && authMode !== "update_password" && (
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
              className={`w-full h-12 font-medium rounded-lg ${authMode === "update_password"
                ? "bg-[#10A37F] hover:bg-[#0E906F] text-white" // OpenAI green
                : "bg-primary hover:bg-primary/90 text-white"
                }`}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : authMode === "forgot"
                  ? t('sendResetLink')
                  : authMode === "signup"
                    ? t('continue')
                    : authMode === "update_password"
                      ? t('resetPasswordButton')
                      : t('loginButton')}
            </Button>

            <div className="space-y-2 text-center text-sm">
              {authMode === "signin" && (
                <button
                  type="button"
                  onClick={() => setAuthMode("forgot")}
                  className="text-white/60 hover:text-white/80 transition-colors block w-full"
                >
                  {t('forgotPassword')}
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
                  ? t('backToLogin')
                  : authMode === "signup"
                    ? t('login')
                    : t('signup')}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="sm:max-w-md bg-[#1A1A1A] border-white/10 text-white z-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">{t('apex')}</DialogTitle>
            <DialogDescription className="text-white/60">
              {t('helpDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Create an account to access comprehensive AI-powered educational tools, productivity features, wellness monitoring, and collaborative study environments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Core Features</h3>
              <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
                <li>AI-powered educational assistance</li>
                <li>Productivity management tools</li>
                <li>Collaborative study environments</li>
                <li>Wellness and nutrition tracking</li>
                <li>Achievement and progress monitoring</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Additional Resources</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Access comprehensive documentation and tutorials through the platform dashboard after authentication.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
