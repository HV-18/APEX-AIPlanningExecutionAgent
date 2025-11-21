import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CookiesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    functional: true,
  });

  const handleSave = () => {
    toast({
      title: "Preferences saved",
      description: "Your cookie preferences have been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-4xl font-bold mb-8">Cookie Preferences</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">About Cookies</h2>
            <p className="text-muted-foreground">
              APEX uses cookies and similar technologies to provide, protect, and improve our services. This page explains what cookies are, how we use them, and your choices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookie Categories</h2>
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="essential" className="text-base font-semibold">
                      Essential Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Required for authentication, security, and core functionality. Cannot be disabled.
                    </p>
                  </div>
                  <Switch
                    id="essential"
                    checked={preferences.essential}
                    disabled
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Examples: Authentication tokens, session management, security features
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="analytics" className="text-base font-semibold">
                      Analytics Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Help us understand how you use APEX to improve features and user experience.
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, analytics: checked })
                    }
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Examples: Page views, feature usage, performance metrics
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="functional" className="text-base font-semibold">
                      Functional Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Remember your preferences like theme, language, and notification settings.
                    </p>
                  </div>
                  <Switch
                    id="functional"
                    checked={preferences.functional}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, functional: checked })
                    }
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Examples: Theme preferences, workspace settings, notification preferences
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
            <p className="text-muted-foreground">
              We use services from trusted partners that may set their own cookies:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Google AI (Gemini) for AI-powered features</li>
              <li>Cloud hosting services for application infrastructure</li>
              <li>Authentication providers for secure login</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
            <p className="text-muted-foreground">
              You can control cookies through your browser settings. Note that disabling certain cookies may affect APEX functionality. Visit your browser's help section for instructions.
            </p>
          </section>

          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Preferences
          </Button>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
