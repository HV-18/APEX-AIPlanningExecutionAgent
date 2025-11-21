import { Sparkles, Leaf, Lightbulb, MessageSquare, Settings as SettingsIcon, RefreshCw } from "lucide-react";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentActivity } from "@/components/RecentActivity";
import { MoodTracker } from "@/components/MoodTracker";
import { StudyTools } from "@/components/StudyTools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Dashboard = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to APEX - Your AI Planning & Execution Agent
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chat")}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </Button>
        </div>
      </div>

      <DashboardStats key={refreshKey} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity />
          
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
            <CardHeader>
              <CardTitle>🚀 Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => {
                        toast({ title: "AI Chat", description: "This is the AI Chat - Ask questions and get intelligent responses" });
                        navigate("/chat");
                      }}
                    >
                      <MessageSquare className="w-6 h-6 text-primary" />
                      <div className="text-center">
                        <p className="font-semibold">AI Chat</p>
                        <p className="text-xs text-muted-foreground">Ask questions</p>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open AI Chat Assistant</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => {
                        toast({ title: "Sustainability", description: "This is the Sustainability page - Track eco-friendly transportation" });
                        navigate("/sustainability");
                      }}
                    >
                      <Leaf className="w-6 h-6 text-secondary" />
                      <div className="text-center">
                        <p className="font-semibold">Log Green Trip</p>
                        <p className="text-xs text-muted-foreground">Track eco-choices</p>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Track your sustainable transportation</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => {
                        toast({ title: "Real Projects", description: "This is the Real Projects page - Create and manage learning projects" });
                        navigate("/projects");
                      }}
                    >
                      <Lightbulb className="w-6 h-6 text-accent" />
                      <div className="text-center">
                        <p className="font-semibold">Start Project</p>
                        <p className="text-xs text-muted-foreground">Solve real problems</p>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create real-world learning projects</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => {
                        toast({ title: "Settings", description: "This is the Settings page - Customize your APEX experience" });
                        navigate("/settings");
                      }}
                    >
                      <SettingsIcon className="w-6 h-6 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-semibold">Settings</p>
                        <p className="text-xs text-muted-foreground">Customize app</p>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configure your preferences</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <MoodTracker />
          <StudyTools />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
