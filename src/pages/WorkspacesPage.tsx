import { useState, useEffect } from "react";
import { FolderKanban, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const emojiOptions = ["📚", "💼", "🎓", "🔬", "🎨", "💻", "📊", "🏆", "🌟", "🚀"];
const colorOptions = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"
];

const WorkspacesPage = () => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
    icon: "📚",
    color: "#3b82f6",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { refreshWorkspaces } = useWorkspace();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    if (data) setWorkspaces(data);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingId) {
        await supabase
          .from("workspaces")
          .update(newWorkspace)
          .eq("id", editingId);
        
        toast({ title: "Workspace updated successfully" });
      } else {
        await supabase.from("workspaces").insert({
          ...newWorkspace,
          user_id: user.id,
        });

        toast({ title: "Workspace created successfully" });
      }

      await loadWorkspaces();
      await refreshWorkspaces();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving workspace:", error);
      toast({
        title: "Error",
        description: "Failed to save workspace",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workspace?")) return;

    try {
      await supabase.from("workspaces").delete().eq("id", id);
      await loadWorkspaces();
      await refreshWorkspaces();
      
      toast({ title: "Workspace deleted successfully" });
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast({
        title: "Error",
        description: "Failed to delete workspace",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (workspace: any) => {
    setEditingId(workspace.id);
    setNewWorkspace({
      name: workspace.name,
      description: workspace.description || "",
      icon: workspace.icon,
      color: workspace.color,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewWorkspace({
      name: "",
      description: "",
      icon: "📚",
      color: "#3b82f6",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderKanban className="w-8 h-8" />
            Workspaces
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize your studies into separate contexts
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Workspace" : "Create New Workspace"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex gap-2 flex-wrap">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewWorkspace({ ...newWorkspace, icon: emoji })}
                      className={`text-2xl p-2 rounded-lg transition-colors ${
                        newWorkspace.icon === emoji ? "bg-primary/20" : "hover:bg-muted"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewWorkspace({ ...newWorkspace, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newWorkspace.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingId ? "Update Workspace" : "Create Workspace"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Card key={workspace.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span
                  className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: workspace.color + "20" }}
                >
                  {workspace.icon}
                </span>
                <span className="flex-1">{workspace.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workspace.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {workspace.description}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(workspace)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(workspace.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkspacesPage;
