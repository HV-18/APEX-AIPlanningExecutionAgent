import { useState, useEffect } from "react";
import { FileText, Download, TrendingUp, Users, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface WorkspaceAnalyticsReportProps {
  workspaceId: string;
  workspaceName: string;
}

export const WorkspaceAnalyticsReport = ({
  workspaceId,
  workspaceName,
}: WorkspaceAnalyticsReportProps) => {
  const [reportData, setReportData] = useState({
    totalStudyTime: 0,
    completedProjects: 0,
    teamContributions: [] as any[],
    productivityTrend: [] as any[],
    goalAchievement: 0,
  });
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [workspaceId]);

  const loadReportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get study sessions
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("duration_minutes, completed, created_at, user_id")
        .eq("workspace_id", workspaceId);

      const totalTime = (sessions || []).reduce(
        (sum, s) => sum + (s.duration_minutes || 0),
        0
      );

      // Get projects
      const { data: projects } = await supabase
        .from("learning_projects")
        .select("completed, progress")
        .eq("workspace_id", workspaceId);

      const completedCount = (projects || []).filter((p) => p.completed).length;
      const avgProgress = projects && projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
        : 0;

      // Get team contributions (mock data for now)
      const contributions = [
        { name: "You", contributions: sessions?.filter(s => s.user_id === user.id).length || 0 },
        { name: "Team", contributions: sessions?.filter(s => s.user_id !== user.id).length || 0 },
      ];

      // Productivity trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      const trend = last7Days.map((date) => ({
        date,
        minutes: (sessions || [])
          .filter((s) => s.created_at.startsWith(date))
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
      }));

      setReportData({
        totalStudyTime: totalTime,
        completedProjects: completedCount,
        teamContributions: contributions,
        productivityTrend: trend,
        goalAchievement: avgProgress,
      });
    } catch (error) {
      console.error("Error loading report data:", error);
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const reportElement = document.getElementById("analytics-report");
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${workspaceName}-analytics-report.pdf`);

      toast({
        title: "Report generated",
        description: "Your analytics report has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Analytics Report
          </CardTitle>
          <Button onClick={generatePDF} disabled={generating}>
            <Download className="w-4 h-4 mr-2" />
            {generating ? "Generating..." : "Export PDF"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div id="analytics-report" className="space-y-6 p-6">
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold">{workspaceName}</h2>
            <p className="text-muted-foreground">Workspace Analytics Report</p>
            <p className="text-sm text-muted-foreground mt-2">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Study Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.floor(reportData.totalStudyTime / 60)}h{" "}
                      {reportData.totalStudyTime % 60}m
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Target className="w-8 h-8 text-green-500" />
                  <div className="text-2xl font-bold">
                    {reportData.completedProjects}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Goal Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="w-8 h-8 text-purple-500" />
                  <div className="text-2xl font-bold">
                    {reportData.goalAchievement.toFixed(0)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Productivity Trend (Last 7 Days)</h3>
            <div className="space-y-2">
              {reportData.productivityTrend.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="text-sm w-24">{day.date}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${Math.min((day.minutes / 120) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm w-16 text-right">{day.minutes}m</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Team Contributions</h3>
            {reportData.teamContributions.map((contributor) => (
              <div key={contributor.name} className="flex items-center justify-between">
                <span className="text-sm">{contributor.name}</span>
                <span className="font-medium">{contributor.contributions} sessions</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
