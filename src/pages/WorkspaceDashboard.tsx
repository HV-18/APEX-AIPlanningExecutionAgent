import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LayoutDashboard, Plus, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
      const defaultWidgets = [
        { widget_type: "analytics", position: 0, is_visible: true },
        { widget_type: "activity", position: 1, is_visible: true },
        { widget_type: "files", position: 2, is_visible: true },
        { widget_type: "search", position: 3, is_visible: true },
      ].map((w) => ({
        workspace_id: workspaceId!,
        user_id: user.id,
        ...w,
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/workspaces")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-2xl">{workspace.icon}</span>
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-muted-foreground">{workspace.description}</p>
            )}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Customize Widgets
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customize Dashboard Widgets</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {["analytics", "activity", "files", "search"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={widgets.some(
                      (w) => w.widget_type === type && w.is_visible
                    )}
                    onCheckedChange={(checked) =>
                      handleToggleWidget(type, checked as boolean)
                    }
                  />
                  <Label htmlFor={type} className="capitalize">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {visibleWidgets.map((widget) => (
          <Card key={widget.id}>
            <CardHeader>
              <CardTitle className="capitalize">{widget.widget_type}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {widget.widget_type} widget content will be displayed here
              </p>
            </CardContent>
          </Card>
        ))}

        {visibleWidgets.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No widgets enabled. Click "Customize Widgets" to add some.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDashboard;
