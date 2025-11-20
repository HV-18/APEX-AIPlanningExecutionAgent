import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Linkedin, 
  Share2, 
  Calendar, 
  Heart,
  Leaf,
  BookOpen,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SocialIntegrationsProps {
  userId: string;
  userName: string;
  studyStats: {
    totalSessions: number;
    totalMinutes: number;
    studyStreak: number;
  };
}

export const SocialIntegrations = ({ userId, userName, studyStats }: SocialIntegrationsProps) => {
  const [linking, setLinking] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState(false);

  const handleLinkedInConnect = async () => {
    setLinking(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/profile`,
        }
      });

      if (error) throw error;
      
      toast.success("Redirecting to LinkedIn...");
    } catch (error) {
      console.error("LinkedIn connection error:", error);
      toast.error("Failed to connect LinkedIn. Please try again.");
    } finally {
      setLinking(false);
    }
  };

  const shareToLinkedIn = () => {
    const shareText = `🎓 My Study Progress:\n✅ ${studyStats.totalSessions} Study Sessions\n⏱️ ${studyStats.totalMinutes} Minutes of Learning\n🔥 ${studyStats.studyStreak} Day Streak\n\nStaying focused on education, health & sustainability! 🌱`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const shareToTwitter = () => {
    const shareText = `🎓 Just hit ${studyStats.totalSessions} study sessions with ${studyStats.totalMinutes} minutes of focused learning! 🔥 ${studyStats.studyStreak} day streak!\n\n#Education #SustainableLearning #StudentLife`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=600');
  };

  const integrations = [
    {
      name: "Google Calendar",
      description: "Sync your timetable and study sessions",
      icon: Calendar,
      category: "Education",
      action: () => toast.info("Google Calendar integration coming soon!"),
      connected: false,
    },
    {
      name: "MyFitnessPal",
      description: "Track nutrition and wellness data",
      icon: Heart,
      category: "Health",
      action: () => toast.info("MyFitnessPal integration coming soon!"),
      connected: false,
    },
    {
      name: "Carbon Footprint",
      description: "Track environmental impact",
      icon: Leaf,
      category: "Sustainability",
      action: () => toast.info("Carbon tracking integration coming soon!"),
      connected: false,
    },
    {
      name: "Notion",
      description: "Sync notes and study materials",
      icon: BookOpen,
      category: "Education",
      action: () => toast.info("Notion integration coming soon!"),
      connected: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* LinkedIn Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-[#0077B5]" />
            LinkedIn Integration
          </CardTitle>
          <CardDescription>
            Connect your LinkedIn profile to showcase achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleLinkedInConnect}
              disabled={linking || linkedInConnected}
              variant={linkedInConnected ? "secondary" : "default"}
              className="flex-1"
            >
              <Linkedin className="mr-2 h-4 w-4" />
              {linkedInConnected ? "Connected" : "Connect LinkedIn"}
            </Button>
            <Button
              onClick={shareToLinkedIn}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Progress
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share your academic achievements and connect with peers professionally
          </p>
        </CardContent>
      </Card>

      {/* Social Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Achievements
          </CardTitle>
          <CardDescription>
            Inspire others with your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <Button
              onClick={shareToTwitter}
              variant="outline"
              className="w-full justify-start"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Share to Twitter/X
            </Button>
            <Button
              onClick={shareToLinkedIn}
              variant="outline"
              className="w-full justify-start"
            >
              <Linkedin className="mr-2 h-4 w-4" />
              Share to LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Useful Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Useful Integrations</CardTitle>
          <CardDescription>
            Connect apps for education, health & sustainability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <integration.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{integration.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {integration.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={integration.action}
                  variant={integration.connected ? "secondary" : "outline"}
                  size="sm"
                >
                  {integration.connected ? "Connected" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
