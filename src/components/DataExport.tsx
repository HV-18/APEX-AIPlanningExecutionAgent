import { useState } from "react";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DataExport = () => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const exportData = async (format: "json" | "csv") => {
    try {
      setExporting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all user data
      const [sessions, moods, chats] = await Promise.all([
        supabase.from("study_sessions").select("*").eq("user_id", user.id),
        supabase.from("mood_logs").select("*").eq("user_id", user.id),
        supabase.from("chat_messages").select("*").eq("user_id", user.id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        study_sessions: sessions.data || [],
        mood_logs: moods.data || [],
        chat_history: chats.data || [],
      };

      if (format === "json") {
        downloadJSON(exportData);
      } else {
        downloadCSV(exportData);
      }

      toast({ title: `Data exported as ${format.toUpperCase()} successfully!` });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const downloadJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `study-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: any) => {
    // Create separate CSV files for each data type
    const csvFiles = [
      {
        name: "study_sessions",
        data: data.study_sessions,
        headers: ["id", "subject", "duration_minutes", "completed", "created_at", "notes"],
      },
      {
        name: "mood_logs",
        data: data.mood_logs,
        headers: ["id", "mood_score", "sentiment", "notes", "created_at"],
      },
      {
        name: "chat_history",
        data: data.chat_history,
        headers: ["id", "role", "content", "created_at"],
      },
    ];

    csvFiles.forEach(({ name, data: items, headers }) => {
      if (items.length === 0) return;

      const csv = [
        headers.join(","),
        ...items.map((item: any) =>
          headers.map((h) => {
            const value = item[h] || "";
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          }).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Your Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Download all your study sessions, mood logs, and chat history for backup purposes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => exportData("json")}
            disabled={exporting}
            variant="outline"
            className="flex-1"
          >
            <FileJson className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
          <Button
            onClick={() => exportData("csv")}
            disabled={exporting}
            variant="outline"
            className="flex-1"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export as CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
