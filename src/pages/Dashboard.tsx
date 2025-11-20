import { Sparkles, Leaf, Lightbulb, MessageSquare, Settings as SettingsIcon } from "lucide-react";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentActivity } from "@/components/RecentActivity";
import { MoodTracker } from "@/components/MoodTracker";
import { StudyTools } from "@/components/StudyTools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your wellness overview
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered</span>
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity />
          
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
            <CardHeader>
              <CardTitle>🚀 Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/chat")}
              >
                <MessageSquare className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <p className="font-semibold">AI Chat</p>
                  <p className="text-xs text-muted-foreground">Ask questions</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/sustainability")}
              >
                <Leaf className="w-6 h-6 text-secondary" />
                <div className="text-center">
                  <p className="font-semibold">Log Green Trip</p>
                  <p className="text-xs text-muted-foreground">Track eco-choices</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/projects")}
              >
                <Lightbulb className="w-6 h-6 text-accent" />
                <div className="text-center">
                  <p className="font-semibold">Start Project</p>
                  <p className="text-xs text-muted-foreground">Solve real problems</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/settings")}
              >
                <SettingsIcon className="w-6 h-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-semibold">Settings</p>
                  <p className="text-xs text-muted-foreground">Customize app</p>
                </div>
              </Button>
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
