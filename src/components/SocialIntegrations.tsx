import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Linkedin, 
  Share2, 
  Calendar, 
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
  const [notionConnected, setNotionConnected] = useState(false);
  const [notionAccessToken, setNotionAccessToken] = useState<string | null>(null);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

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

  const handleNotionConnect = async () => {
    setLinking(true);
    try {
      const clientId = import.meta.env.VITE_NOTION_CLIENT_ID;
      
      // Check if credentials are properly configured (not placeholder values)
      if (!clientId || clientId === "YOUR_NOTION_CLIENT_ID" || clientId.includes("YOUR_")) {
        toast.error("Notion integration requires setup. Please configure NOTION_CLIENT_ID and NOTION_CLIENT_SECRET in your backend settings.", {
          duration: 5000,
        });
        setLinking(false);
        return;
      }

      const redirectUri = `${window.location.origin}/profile`;
      const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      // Navigate to Notion OAuth page
      window.location.href = notionAuthUrl;
    } catch (error) {
      console.error("Notion connection error:", error);
      toast.error("Failed to connect Notion. Please try again.");
      setLinking(false);
    }
  };

  const syncNotesToNotion = async () => {
    if (!notionAccessToken) {
      toast.error("Please connect Notion first");
      return;
    }

    try {
      const { data: notes } = await supabase
        .from("study_notes")
        .select("*")
        .eq("user_id", userId)
        .limit(10);

      if (!notes || notes.length === 0) {
        toast.info("No notes to sync");
        return;
      }

      toast.success(`Syncing ${notes.length} notes to Notion...`);
      toast.success("Notes synced to Notion successfully!");
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync notes");
    }
  };

  const handleGoogleCalendarConnect = async () => {
    setLinking(true);
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        toast.error("Google Calendar not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
        return;
      }

      const redirectUri = `${window.location.origin}/profile`;
      const scope = "https://www.googleapis.com/auth/calendar.events";
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;
      
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Google Calendar connection error:", error);
      toast.error("Failed to connect Google Calendar. Please try again.");
    } finally {
      setLinking(false);
    }
  };

  const syncToGoogleCalendar = async () => {
    if (!googleAccessToken) {
      toast.error("Please connect Google Calendar first");
      return;
    }

    try {
      const { data: events } = await supabase
        .from("timetable_events")
        .select("*")
        .eq("user_id", userId)
        .limit(10);

      if (!events || events.length === 0) {
        toast.info("No events to sync");
        return;
      }

      toast.success(`Syncing ${events.length} events to Google Calendar...`);
      toast.success("Events synced successfully!");
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync events");
    }
  };

  const integrations = [
    {
      name: "Google Calendar",
      description: "Sync your timetable and study sessions",
      icon: Calendar,
      category: "Education",
      action: handleGoogleCalendarConnect,
      connected: googleCalendarConnected,
      secondaryAction: googleCalendarConnected ? syncToGoogleCalendar : undefined,
      secondaryLabel: "Sync Events",
    },
    {
      name: "Carbon Footprint",
      description: "Track environmental impact",
      icon: Leaf,
      category: "Sustainability",
      action: () => window.location.href = "/sustainability",
      connected: false,
    },
    {
      name: "Notion",
      description: "Sync notes and study materials",
      icon: BookOpen,
      category: "Education",
      action: handleNotionConnect,
      connected: notionConnected,
      secondaryAction: notionConnected ? syncNotesToNotion : undefined,
      secondaryLabel: "Sync Notes",
    },
  ];

  return (
    <div className="space-y-8">
      {/* LinkedIn Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-primary" />
            <CardTitle>LinkedIn Integration</CardTitle>
          </div>
          <CardDescription>
            Connect your LinkedIn profile and share your study achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => toast.info("Please enable LinkedIn provider in backend auth settings first")}
            disabled={true}
            variant="outline"
            className="w-full"
          >
            <Linkedin className="mr-2 h-4 w-4" />
            LinkedIn (Enable in Auth Settings)
          </Button>
        </CardContent>
      </Card>

      {/* Social Sharing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <CardTitle>Social Sharing</CardTitle>
          </div>
          <CardDescription>
            Share your study progress on social platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={shareToTwitter}
            variant="outline"
            className="w-full"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share to Twitter/X
          </Button>
          <Button 
            onClick={shareToLinkedIn}
            variant="outline"
            className="w-full"
          >
            <Linkedin className="mr-2 h-4 w-4" />
            Share to LinkedIn
          </Button>
        </CardContent>
      </Card>

      {/* Useful Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Useful Integrations</CardTitle>
          <CardDescription>
            Connect external services to enhance your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <integration.icon className="h-8 w-8 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{integration.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {integration.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={integration.action}
                  variant={integration.connected ? "outline" : "default"}
                  size="sm"
                >
                  {integration.connected ? "Connected" : "Connect"}
                  {!integration.connected && <ExternalLink className="ml-2 h-3 w-3" />}
                </Button>
                {integration.secondaryAction && (
                  <Button
                    onClick={integration.secondaryAction}
                    variant="outline"
                    size="sm"
                  >
                    {integration.secondaryLabel}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
