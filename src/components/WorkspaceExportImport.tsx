import { useState } from "react";
import { Download, Upload, FileJson, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkspaceExportImportProps {
  workspaceId: string;
  workspaceName: string;
}

export const WorkspaceExportImport = ({
  workspaceId,
  workspaceName,
}: WorkspaceExportImportProps) => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Gather all workspace data
      const [workspace, notes, files, projects, sessions, quizzes, events] =
        await Promise.all([
          supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
          supabase.from("study_notes").select("*").eq("workspace_id", workspaceId),
          supabase.from("workspace_files").select("*").eq("workspace_id", workspaceId),
          supabase.from("learning_projects").select("*").eq("workspace_id", workspaceId),
          supabase.from("study_sessions").select("*").eq("workspace_id", workspaceId),
          supabase.from("custom_quizzes").select("*").eq("workspace_id", workspaceId),
          supabase.from("timetable_events").select("*").eq("workspace_id", workspaceId),
        ]);

      const exportData = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        workspace: workspace.data,
        notes: notes.data || [],
        files: files.data || [],
        projects: projects.data || [],
        sessions: sessions.data || [],
        quizzes: quizzes.data || [],
        events: events.data || [],
      };

      // Create downloadable JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${workspaceName.replace(/\s+/g, "-")}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Workspace "${workspaceName}" has been exported`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export workspace data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate import data
      if (!importData.workspace || !importData.version) {
        throw new Error("Invalid workspace backup file");
      }

      // Create new workspace
      const { data: newWorkspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          user_id: user.id,
          name: `${importData.workspace.name} (Imported)`,
          description: importData.workspace.description,
          icon: importData.workspace.icon,
          color: importData.workspace.color,
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Import notes
      if (importData.notes?.length > 0) {
        const notesToInsert = importData.notes.map((note: any) => ({
          user_id: user.id,
          workspace_id: newWorkspace.id,
          subject: note.subject,
          topic: note.topic,
          content: note.content,
          ai_generated: note.ai_generated,
        }));
        await supabase.from("study_notes").insert(notesToInsert);
      }

      // Import projects
      if (importData.projects?.length > 0) {
        const projectsToInsert = importData.projects.map((project: any) => ({
          user_id: user.id,
          workspace_id: newWorkspace.id,
          title: project.title,
          description: project.description,
          category: project.category,
          progress: project.progress,
          completed: project.completed,
          skills_learned: project.skills_learned,
          resources: project.resources,
        }));
        await supabase.from("learning_projects").insert(projectsToInsert);
      }

      // Import events
      if (importData.events?.length > 0) {
        const eventsToInsert = importData.events.map((event: any) => ({
          user_id: user.id,
          workspace_id: newWorkspace.id,
          title: event.title,
          description: event.description,
          start_time: event.start_time,
          end_time: event.end_time,
          category: event.category,
        }));
        await supabase.from("timetable_events").insert(eventsToInsert);
      }

      toast({
        title: "Import successful",
        description: `Workspace has been imported as "${newWorkspace.name}"`,
      });

      // Reset file input
      event.target.value = "";
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "Failed to import workspace. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="w-5 h-5" />
          Backup & Restore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Export Workspace</h4>
          <p className="text-sm text-muted-foreground">
            Download all workspace data including notes, files, projects, and settings
            as a JSON file.
          </p>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full"
            variant="outline"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {exporting ? "Exporting..." : "Export Workspace"}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Import Workspace</h4>
          <p className="text-sm text-muted-foreground">
            Restore a workspace from a previously exported backup file. This will
            create a new workspace.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-workspace"
            disabled={importing}
          />
          <Button
            asChild
            disabled={importing}
            className="w-full"
            variant="outline"
          >
            <label htmlFor="import-workspace" className="cursor-pointer">
              {importing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {importing ? "Importing..." : "Import Workspace"}
            </label>
          </Button>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Regular backups help protect your work. Export
            your workspace before making major changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
