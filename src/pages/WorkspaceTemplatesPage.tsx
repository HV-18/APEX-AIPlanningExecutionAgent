import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const defaultTemplates = [
  {
    id: "template-1",
    name: "Computer Science Course",
    description: "Perfect for CS courses with notes, projects, and assignments",
    category: "Academic",
    icon: "💻",
    color: "#3b82f6",
  },
  {
    id: "template-2",
    name: "Research Project",
    description: "Organize literature review, experiments, and findings",
    category: "Research",
    icon: "🔬",
    color: "#8b5cf6",
  },
  {
    id: "template-3",
    name: "Language Learning",
    description: "Track vocabulary, practice sessions, and progress",
    category: "Language",
    icon: "🌍",
    color: "#10b981",
  },
  {
    id: "template-4",
    name: "Exam Preparation",
    description: "Plan study schedule, practice tests, and revision notes",
    category: "Exam Prep",
    icon: "📝",
    color: "#f59e0b",
  },
  {
    id: "template-5",
    name: "Thesis Writing",
    description: "Manage chapters, references, and writing milestones",
    category: "Academic",
    icon: "📚",
    color: "#ec4899",
  },
  {
    id: "template-6",
    name: "Group Study Project",
    description: "Collaborate with team members on shared goals",
    category: "Collaboration",
    icon: "👥",
    color: "#06b6d4",
  },
];

const WorkspaceTemplatesPage = () => {
  const [templates, setTemplates] = useState(defaultTemplates);
  const { refreshWorkspaces } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateFromTemplate = async (template: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("workspaces").insert({
        user_id: user.id,
        name: template.name,
        description: template.description,
        icon: template.icon,
        color: template.color,
      });

      if (error) throw error;

      await refreshWorkspaces();
      toast({
        title: "Workspace created",
        description: `Created workspace from ${template.name} template`,
      });
      navigate("/workspaces");
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Copy className="w-8 h-8" />
            Workspace Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Start with a pre-configured workspace template
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
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
                    {template.category}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>
              <Button
                onClick={() => handleCreateFromTemplate(template)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceTemplatesPage;
