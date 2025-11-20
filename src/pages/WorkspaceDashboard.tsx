import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LayoutDashboard, Plus, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceAnalytics } from "@/components/WorkspaceAnalytics";
import { WorkspaceActivityTimeline } from "@/components/WorkspaceActivityTimeline";
import { FileUploadZone } from "@/components/FileUploadZone";
import { WorkspaceSearch } from "@/components/WorkspaceSearch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Widget {
  id: string;
  widget_type: string;
  is_visible: boolean;
  position: number;
}

const availableWidgets = [
  { type: "analytics", label: "Analytics", component: WorkspaceAnalytics },
  { type: "activity", label: "Activity Timeline", component: WorkspaceActivityTimeline },
  { type: "files", label: "Quick Upload", component: FileUploadZone },
  { type: "search", label: "Search", component: WorkspaceSearch },
];

const WorkspaceDashboard = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<any>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (workspaceId) {
      loadWorkspace();
      loadWidgets();
    }
  }, [workspaceId]);

  const loadWorkspace = async () => {
    const { data } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (data) setWorkspace(data);
  };

  const loadWidgets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("workspace_dashboard_widgets")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .order("position");

    if (data && data.length > 0) {
      setWidgets(data);
    } else {
      // Initialize with default widgets
      const defaultWidgets = availableWidgets.map((w, i) => ({
        workspace_id: workspaceId!,
        user_id: user.id,
        widget_type: w.type,
        position: i,
        is_visible: true,
      }));

      const { data: created } = await supabase
        .from("workspace_dashboard_widgets")
        .insert(defaultWidgets)
        .select();

      if (created) setWidgets(created);
    }
  };

  const handleToggleWidget = async (widgetType: string, visible: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = widgets.find((w) => w.widget_type === widgetType);

    if (existing) {
      await supabase
        .from("workspace_dashboard_widgets")
        .update({ is_visible: visible })
        .eq("id", existing.id);
    } else {
      await supabase.from("workspace_dashboard_widgets").insert({
        workspace_id: workspaceId!,
        user_id: user.id,
        widget_type: widgetType,
        is_visible: visible,
        position: widgets.length,
      });
    }

    await loadWidgets();
    toast({
      title: visible ? "Widget enabled" : "Widget disabled",
      description: `${widgetType} widget ${visible ? "shown" : "hidden"}`,
    });
  };

  if (!workspace || !workspaceId) {
    return <div>Loading...</div>;
  }

  const visibleWidgets = widgets
    .filter((w) => w.is_visible)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/workspaces")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-3xl">{workspace.icon}</span>
              {workspace.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {workspace.description || "Workspace dashboard"}
            </p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Customize Widgets
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customize Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {availableWidgets.map((widget) => {
                const isVisible =
                  widgets.find((w) => w.widget_type === widget.type)?.is_visible ?? true;

                return (
                  <div key={widget.type} className="flex items-center gap-2">
                    <Checkbox
                      id={widget.type}
                      checked={isVisible}
                      onCheckedChange={(checked) =>
                        handleToggleWidget(widget.type, checked as boolean)
                      }
                    />
                    <Label htmlFor={widget.type}>{widget.label}</Label>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {visibleWidgets.map((widget) => {
          const config = availableWidgets.find((w) => w.type === widget.widget_type);
          if (!config) return null;

          const WidgetComponent = config.component;

          return (
            <div key={widget.id} className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{config.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <WidgetComponent workspaceId={workspaceId} />
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {visibleWidgets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No widgets enabled. Click "Customize Widgets" to add some.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkspaceDashboard;
