import { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Trash2, Keyboard, Palette, Zap, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/BackButton";

type SettingsSection = 'profile' | 'notifications' | 'security' | 'keyboard' | 'appearance' | 'advanced' | 'support';

const settingsSections = [
  { id: 'profile' as SettingsSection, label: 'Profile', icon: User },
  { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell },
  { id: 'security' as SettingsSection, label: 'Security & Privacy', icon: Shield },
  { id: 'keyboard' as SettingsSection, label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'appearance' as SettingsSection, label: 'Appearance', icon: Palette },
  { id: 'advanced' as SettingsSection, label: 'Advanced', icon: Zap },
  { id: 'support' as SettingsSection, label: 'Contact Support', icon: Mail },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [profile, setProfile] = useState({ full_name: "", email: "" });
  const [notifications, setNotifications] = useState({
    moodReminders: true,
    studyReminders: true,
    weeklyReports: true,
    achievements: true,
    studyStreaks: true,
    mealReminders: false,
  });
  const [advanced, setAdvanced] = useState({
    autoBackup: true,
    dataSync: true,
    aiPersonalization: true,
    darkMode: false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setProfile({
        full_name: data?.full_name || "",
        email: user.email || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: profile.full_name })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm("Are you sure you want to delete all your data? This cannot be undone.")) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await Promise.all([
        supabase.from("chat_messages").delete().eq("user_id", user.id),
        supabase.from("mood_logs").delete().eq("user_id", user.id),
        supabase.from("study_sessions").delete().eq("user_id", user.id),
        supabase.from("timetable_events").delete().eq("user_id", user.id),
        supabase.from("study_notes").delete().eq("user_id", user.id),
        supabase.from("interview_sessions").delete().eq("user_id", user.id),
        supabase.from("ai_modes").delete().eq("user_id", user.id),
      ]);

      toast({
        title: "Data cleared",
        description: "All your data has been deleted",
      });
    } catch (error) {
      console.error("Error clearing data:", error);
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-border bg-muted/30 p-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 px-3 py-2 text-foreground">
            <Settings className="w-5 h-5" />
            Settings
          </h2>
        </div>
        
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-3xl mx-auto space-y-6">
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and email preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>
                <Button onClick={updateProfile} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mood Check-in Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Daily reminders to log your mood
                      </p>
                    </div>
                    <Switch
                      checked={notifications.moodReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, moodReminders: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Study Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Reminders for scheduled study sessions
                      </p>
                    </div>
                    <Switch
                      checked={notifications.studyReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, studyReminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Summary of your weekly progress
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, weeklyReports: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Achievement Unlocked</Label>
                      <p className="text-sm text-muted-foreground">
                        Celebrate your milestones and badges
                      </p>
                    </div>
                    <Switch
                      checked={notifications.achievements}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, achievements: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Study Streaks</Label>
                      <p className="text-sm text-muted-foreground">
                        Don't break the streak notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.studyStreaks}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, studyStreaks: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Meal Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Healthy eating reminders
                      </p>
                    </div>
                    <Switch
                      checked={notifications.mealReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, mealReminders: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Shield className="w-5 h-5" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>
                  Manage your data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Clear All Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete all your study sessions, mood logs, and other data.
                      This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={clearAllData}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'keyboard' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription>
                  Quick access keys for faster navigation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm font-medium">Go Home</span>
                    <kbd className="px-3 py-1.5 bg-muted rounded-md text-xs font-semibold">Alt + H</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm font-medium">Open Chat</span>
                    <kbd className="px-3 py-1.5 bg-muted rounded-md text-xs font-semibold">Alt + C</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm font-medium">Study Rooms</span>
                    <kbd className="px-3 py-1.5 bg-muted rounded-md text-xs font-semibold">Alt + S</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm font-medium">Profile</span>
                    <kbd className="px-3 py-1.5 bg-muted rounded-md text-xs font-semibold">Alt + P</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm font-medium">Timetable</span>
                    <kbd className="px-3 py-1.5 bg-muted rounded-md text-xs font-semibold">Alt + T</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm font-medium">Command Palette</span>
                    <kbd className="px-3 py-1.5 bg-muted rounded-md text-xs font-semibold">Ctrl + K</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">View All Shortcuts</span>
                    <kbd className="px-3 py-1.5 bg-muted rounded-md text-xs font-semibold">?</kbd>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable dark theme for reduced eye strain
                    </p>
                  </div>
                  <Switch
                    checked={advanced.darkMode}
                    onCheckedChange={(checked) =>
                      setAdvanced({ ...advanced, darkMode: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'advanced' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>
                  Configure advanced features and integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup your data daily
                      </p>
                    </div>
                    <Switch
                      checked={advanced.autoBackup}
                      onCheckedChange={(checked) =>
                        setAdvanced({ ...advanced, autoBackup: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Cloud Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Sync data across all your devices
                      </p>
                    </div>
                    <Switch
                      checked={advanced.dataSync}
                      onCheckedChange={(checked) =>
                        setAdvanced({ ...advanced, dataSync: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI Personalization</Label>
                      <p className="text-sm text-muted-foreground">
                        Let AI learn and adapt to your study patterns
                      </p>
                    </div>
                    <Switch
                      checked={advanced.aiPersonalization}
                      onCheckedChange={(checked) =>
                        setAdvanced({ ...advanced, aiPersonalization: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'support' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Get help with APEX : AI Planning & Execution Agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Email Support</Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      Send us an email and we'll get back to you within 24 hours
                    </p>
                    <Button variant="outline" className="gap-2" asChild>
                      <a href="mailto:support@apex-ai.com">
                        <Mail className="w-4 h-4" />
                        support@apex-ai.com
                      </a>
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Label className="text-base">Documentation</Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      Browse our documentation for quick answers
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = '/docs'}>
                      View Documentation
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Label className="text-base">Project Information</Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      Learn more about APEX and our vision
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = '/about'}>
                      About APEX
                    </Button>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Response Time:</strong> We typically respond within 24 hours during business days. For urgent issues, please mark your email as high priority.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
