import { useState, useEffect } from "react";
import { Store, Download, Star, TrendingUp, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  author_name: string;
  downloads_count: number;
  rating: number;
}

const TemplatesMarketplace = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const { workspaces, refreshWorkspaces } = useWorkspace();
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase
      .from("marketplace_templates")
      .select("*")
      .eq("is_published", true)
      .order("downloads_count", { ascending: false });

    if (data) setTemplates(data);
  };

  const handleDownloadTemplate = async (template: Template) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create workspace from template
      const { error } = await supabase.from("workspaces").insert({
        user_id: user.id,
        name: template.name,
        description: template.description,
        icon: template.icon,
        color: template.color,
      });

      if (error) throw error;

      // Increment download count
      await supabase
        .from("marketplace_templates")
        .update({ downloads_count: template.downloads_count + 1 })
        .eq("id", template.id);

      await refreshWorkspaces();
      await loadTemplates();
      
      toast({
        title: "Template downloaded",
        description: `Created workspace "${template.name}" from template`,
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const handlePublishTemplate = async (workspaceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (!workspace) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("marketplace_templates").insert({
        name: workspace.name,
        description: workspace.description,
        category: "User Created",
        icon: workspace.icon,
        color: workspace.color,
        author_id: user.id,
        author_name: profile?.full_name || "Anonymous",
        template_data: { workspace },
        is_published: true,
      });

      if (error) throw error;

      await loadTemplates();
      setPublishDialogOpen(false);
      
      toast({
        title: "Template published",
        description: "Your workspace template is now available in the marketplace",
      });
    } catch (error) {
      console.error("Error publishing template:", error);
      toast({
        title: "Error",
        description: "Failed to publish template",
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="w-8 h-8" />
            Templates Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and share workspace templates with the community
          </p>
        </div>

        <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Publish Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish Your Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share your workspace structure with other students
              </p>
              {workspaces.map((workspace) => (
                <Button
                  key={workspace.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handlePublishTemplate(workspace.id)}
                >
                  <span className="text-lg mr-2">{workspace.icon}</span>
                  {workspace.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search templates..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span
                  className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: template.color + "20" }}
                >
                  {template.icon}
                </span>
                <div className="flex-1">
                  <div>{template.name}</div>
                  <div className="text-xs font-normal text-muted-foreground">
                    by {template.author_name}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{template.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">{template.downloads_count}</span>
                </div>
              </div>
              <Button
                onClick={() => handleDownloadTemplate(template)}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? "No templates found" : "No templates available yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplatesMarketplace;
