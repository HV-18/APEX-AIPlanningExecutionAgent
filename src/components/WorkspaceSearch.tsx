import { useState } from "react";
import { Search, FileText, File, FolderKanban, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkspaceSearchProps {
  workspaceId: string;
}

interface SearchResult {
  id: string;
  type: "note" | "file" | "project";
  title: string;
  content?: string;
  created_at: string;
  author?: string;
}

export const WorkspaceSearch = ({ workspaceId }: WorkspaceSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Enter search query",
        description: "Please enter something to search for",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      const searchLower = query.toLowerCase();

      // Calculate date filter
      let dateThreshold: Date | null = null;
      if (dateFilter === "week") {
        dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - 7);
      } else if (dateFilter === "month") {
        dateThreshold = new Date();
        dateThreshold.setMonth(dateThreshold.getMonth() - 1);
      }

      // Search notes
      if (typeFilter === "all" || typeFilter === "note") {
        let notesQuery = supabase
          .from("study_notes")
          .select("id, topic, content, created_at, user_id")
          .eq("workspace_id", workspaceId)
          .or(`topic.ilike.%${query}%,content.ilike.%${query}%`);

        if (dateThreshold) {
          notesQuery = notesQuery.gte("created_at", dateThreshold.toISOString());
        }

        const { data: notes } = await notesQuery;

        if (notes) {
          searchResults.push(
            ...notes.map((note) => ({
              id: note.id,
              type: "note" as const,
              title: note.topic,
              content: note.content.substring(0, 150) + "...",
              created_at: note.created_at,
              author: note.user_id,
            }))
          );
        }
      }

      // Search files
      if (typeFilter === "all" || typeFilter === "file") {
        let filesQuery = supabase
          .from("workspace_files")
          .select("id, file_name, uploaded_at, user_id")
          .eq("workspace_id", workspaceId)
          .ilike("file_name", `%${query}%`);

        if (dateThreshold) {
          filesQuery = filesQuery.gte("uploaded_at", dateThreshold.toISOString());
        }

        const { data: files } = await filesQuery;

        if (files) {
          searchResults.push(
            ...files.map((file) => ({
              id: file.id,
              type: "file" as const,
              title: file.file_name,
              created_at: file.uploaded_at,
              author: file.user_id,
            }))
          );
        }
      }

      // Search projects
      if (typeFilter === "all" || typeFilter === "project") {
        let projectsQuery = supabase
          .from("learning_projects")
          .select("id, title, description, created_at, user_id")
          .eq("workspace_id", workspaceId)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

        if (dateThreshold) {
          projectsQuery = projectsQuery.gte("created_at", dateThreshold.toISOString());
        }

        const { data: projects } = await projectsQuery;

        if (projects) {
          searchResults.push(
            ...projects.map((project) => ({
              id: project.id,
              type: "project" as const,
              title: project.title,
              content: project.description?.substring(0, 150) + "...",
              created_at: project.created_at,
              author: project.user_id,
            }))
          );
        }
      }

      setResults(searchResults.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Failed to search workspace",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "note":
        return FileText;
      case "file":
        return File;
      case "project":
        return FolderKanban;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search notes, files, and projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
            <SelectItem value="file">Files</SelectItem>
            <SelectItem value="project">Projects</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          {results.map((result) => {
            const Icon = getIcon(result.type);
            return (
              <Card key={`${result.type}-${result.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <h4 className="font-medium">{result.title}</h4>
                        {result.content && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.content}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {result.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(result.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {results.length === 0 && query && !loading && (
        <p className="text-center text-muted-foreground py-8">
          No results found for "{query}"
        </p>
      )}
    </div>
  );
};
