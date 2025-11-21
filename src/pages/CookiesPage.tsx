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

        <h1 className="text-4xl font-bold mb-2 tracking-tight">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">Cookie Technology Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              APEX utilizes cookies and similar tracking technologies to deliver, secure, and optimize platform services. This policy outlines cookie definitions, implementation purposes, and user control mechanisms for managing cookie preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookie Categories</h2>
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="essential" className="text-base font-semibold tracking-tight">
                      Essential Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Necessary for authentication protocols, security measures, and fundamental platform functionality. These cookies are mandatory and cannot be disabled as they are essential for service delivery.
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
                    <Label htmlFor="analytics" className="text-base font-semibold tracking-tight">
                      Analytics Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Enable platform usage analysis to optimize features and enhance user experience through behavioral pattern identification.
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
                    <Label htmlFor="functional" className="text-base font-semibold tracking-tight">
                      Functional Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Store user preferences including interface themes, language settings, and notification configurations for enhanced personalization.
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
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">Third-Party Service Providers</h2>
            <p className="text-muted-foreground leading-relaxed">
              APEX integrates with certified third-party service providers who may deploy their proprietary cookies:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 ml-4">
              <li className="leading-relaxed">Google AI Services (Gemini) for artificial intelligence capabilities</li>
              <li className="leading-relaxed">Cloud infrastructure providers for application hosting and data storage</li>
              <li className="leading-relaxed">Authentication service providers for secure identity verification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">Cookie Management</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users may control cookie settings through browser configuration tools. Please note that disabling certain cookie categories may impact platform functionality and user experience. Consult your browser documentation for specific cookie management procedures.
            </p>
          </section>

          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Cookie Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
