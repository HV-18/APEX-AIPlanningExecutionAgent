import { useState, useEffect } from "react";
import { Tag, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkspaceTagsManagerProps {
  workspaceId: string;
}

interface WorkspaceTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

const colorOptions = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", 
  "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#a855f7"
];

export const WorkspaceTagsManager = ({ workspaceId }: WorkspaceTagsManagerProps) => {
  const [tags, setTags] = useState<WorkspaceTag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const { toast } = useToast();

  useEffect(() => {
    loadTags();
  }, [workspaceId]);

  const loadTags = async () => {
    const { data } = await supabase
      .from("workspace_tags")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at");

    if (data) setTags(data);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Tag name required",
        description: "Please enter a tag name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("workspace_tags").insert({
        workspace_id: workspaceId,
        name: newTagName.trim(),
        color: selectedColor,
        created_by: user.id,
      });

      if (error) throw error;

      await loadTags();
      setNewTagName("");
      toast({ title: "Tag created successfully" });
    } catch (error: any) {
      console.error("Error creating tag:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from("workspace_tags")
        .delete()
        .eq("id", tagId);

      if (error) throw error;

      await loadTags();
      toast({ title: "Tag deleted successfully" });
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Tags & Labels
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
            />
            <div className="flex gap-1">
              {colorOptions.slice(0, 5).map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Button onClick={handleCreateTag} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
                style={{
                  backgroundColor: tag.color + "20",
                  borderColor: tag.color,
                  color: tag.color,
                }}
              >
                <Tag className="w-3 h-3" />
                {tag.name}
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          {tags.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tags yet. Create tags to organize your workspace content.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
