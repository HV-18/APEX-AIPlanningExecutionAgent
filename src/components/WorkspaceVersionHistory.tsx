import { useState, useEffect } from "react";
import { History, RotateCcw, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WorkspaceVersionHistoryProps {
  workspaceId: string;
  contentType: "note" | "project";
  contentId: string;
}

interface Version {
  id: string;
  version_number: number;
  content_snapshot: any;
  changed_by: string;
  change_description: string | null;
  created_at: string;
}

export const WorkspaceVersionHistory = ({
  workspaceId,
  contentType,
  contentId,
}: WorkspaceVersionHistoryProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVersions();
  }, [workspaceId, contentType, contentId]);

  const loadVersions = async () => {
    const { data } = await supabase
      .from("workspace_versions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("version_number", { ascending: false });

    if (data) setVersions(data);
  };

  const handleRestore = async (version: Version) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current content
      const tableName = contentType === "note" ? "study_notes" : "learning_projects";
      
      // Create new version before restoring
      const { data: currentData } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", contentId)
        .single();

      if (currentData) {
        // Save current state as new version
        const maxVersion = Math.max(...versions.map((v) => v.version_number), 0);
        await supabase.from("workspace_versions").insert({
          workspace_id: workspaceId,
          content_type: contentType,
          content_id: contentId,
          version_number: maxVersion + 1,
          content_snapshot: currentData,
          changed_by: user.id,
          change_description: `Auto-save before restore to v${version.version_number}`,
        });

        // Restore the selected version
        const { error } = await supabase
          .from(tableName)
          .update(version.content_snapshot)
          .eq("id", contentId);

        if (error) throw error;

        await loadVersions();
        toast({
          title: "Version restored",
          description: `Restored to version ${version.version_number}`,
        });
      }
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      Version {version.version_number}
                    </span>
                    {version.version_number === versions[0]?.version_number && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  {version.change_description && (
                    <p className="text-xs text-muted-foreground">
                      {version.change_description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(version.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVersion(version)}
                    >
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Version {version.version_number}</DialogTitle>
                    </DialogHeader>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(version.content_snapshot, null, 2)}
                    </pre>
                  </DialogContent>
                </Dialog>
                {version.version_number !== versions[0]?.version_number && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(version)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          ))}

          {versions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No version history available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
