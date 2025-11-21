import { useState, useEffect } from "react";
import { GitBranch, Cloud, Database, Link2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkspaceIntegrationsProps {
  workspaceId: string;
}

interface Integration {
  id: string;
  integration_type: string;
  is_enabled: boolean;
  last_sync: string | null;
  settings: any;
}

const integrationConfig = {
  github: {
    name: "GitHub",
    icon: GitBranch,
    description: "Sync workspace files with GitHub repositories",
    color: "text-gray-900 dark:text-gray-100",
  },
  google_drive: {
    name: "Google Drive",
    icon: Cloud,
    description: "Connect Google Drive for file storage",
    color: "text-blue-500",
  },
  dropbox: {
    name: "Dropbox",
    icon: Database,
    description: "Integrate with Dropbox for file syncing",
    color: "text-blue-600",
  },
};

export const WorkspaceIntegrations = ({
  workspaceId,
}: WorkspaceIntegrationsProps) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, [workspaceId]);

  const loadIntegrations = async () => {
    const { data } = await supabase
      .from("workspace_integrations")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (data) setIntegrations(data);
  };

  const handleToggleIntegration = async (
    integrationType: string,
    enabled: boolean
  ) => {
    try {
      const existing = integrations.find(
        (i) => i.integration_type === integrationType
      );

      if (existing) {
        await supabase
          .from("workspace_integrations")
          .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("workspace_integrations").insert({
          workspace_id: workspaceId,
          integration_type: integrationType,
          is_enabled: enabled,
        });
      }

      await loadIntegrations();
      
      if (integrationType === "github") {
        toast({
          title: "GitHub Integration",
          description: "To connect GitHub, use the GitHub button in the top menu to enable native GitHub integration.",
        });
      } else {
        toast({
          title: enabled ? "Integration enabled" : "Integration disabled",
          description: `${integrationConfig[integrationType as keyof typeof integrationConfig].name} ${
            enabled ? "enabled" : "disabled"
          } successfully`,
        });
      }
    } catch (error) {
      console.error("Error toggling integration:", error);
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
    }
  };

  const isIntegrationEnabled = (type: string) => {
    return integrations.find((i) => i.integration_type === type)?.is_enabled || false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          External Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(integrationConfig).map(([key, config]) => {
          const Icon = config.icon;
          const enabled = isIntegrationEnabled(key);
          const integration = integrations.find((i) => i.integration_type === key);

          return (
            <div
              key={key}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex items-start gap-3 flex-1">
                <Icon className={`w-6 h-6 mt-1 ${config.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{config.name}</h4>
                    {enabled && (
                      <Badge variant="default" className="text-xs">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {config.description}
                  </p>
                  {enabled && integration?.last_sync && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(integration.last_sync).toLocaleString()}
                    </p>
                  )}
                  {key === "github" && (
                    <div className="mt-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-xs"
                        asChild
                      >
                        <a
                          href="https://docs.lovable.dev/tips-tricks/github"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Learn about GitHub integration
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    handleToggleIntegration(key, checked)
                  }
                />
              </div>
            </div>
          );
        })}

        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Note:</strong> GitHub integration is available natively. Click the GitHub button in the top menu to connect your GitHub
            account and enable two-way sync.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
