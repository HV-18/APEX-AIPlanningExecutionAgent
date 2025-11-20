import { useCallback, useState } from "react";
import { Upload, File, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FileUploadZoneProps {
  workspaceId: string;
}

interface UploadedFile {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string | null;
  uploaded_at: string;
  file_path: string;
}

export const FileUploadZone = ({ workspaceId }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const loadFiles = useCallback(async () => {
    const { data } = await supabase
      .from("workspace_files")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("uploaded_at", { ascending: false });

    if (data) setFiles(data);
  }, [workspaceId]);

  useState(() => {
    loadFiles();
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      await uploadFiles(droppedFiles);
    },
    [workspaceId]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        await uploadFiles(selectedFiles);
      }
    },
    [workspaceId]
  );

  const uploadFiles = async (filesToUpload: File[]) => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      for (const file of filesToUpload) {
        const filePath = `${workspaceId}/${user.id}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("workspace-files")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from("workspace_files").insert({
          workspace_id: workspaceId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || null,
        });

        if (dbError) throw dbError;
      }

      toast({ title: "Files uploaded successfully" });
      await loadFiles();
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    try {
      await supabase.storage.from("workspace-files").remove([filePath]);
      await supabase.from("workspace_files").delete().eq("id", fileId);

      await loadFiles();
      toast({ title: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("workspace-files")
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-border"
        }`}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Drop files here</p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse from your device
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <Button asChild disabled={uploading}>
          <label htmlFor="file-upload" className="cursor-pointer">
            {uploading ? "Uploading..." : "Select Files"}
          </label>
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Uploaded Files</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <File className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file_size / 1024).toFixed(2)} KB •{" "}
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.id, file.file_path)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
