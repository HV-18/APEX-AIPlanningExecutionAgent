import { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage = () => {
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
        title: "Profile updated! ✅",
        description: "Your changes have been saved",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
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
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <Button onClick={updateProfile} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications and reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mood-reminders">Mood Check Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get daily reminders to log your mood
                </p>
              </div>
              <Switch
                id="mood-reminders"
                checked={notifications.moodReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, moodReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="study-reminders">Study Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for scheduled study sessions
                </p>
              </div>
              <Switch
                id="study-reminders"
                checked={notifications.studyReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, studyReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-reports">Weekly Progress Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly summaries of your progress
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, weeklyReports: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="achievements">Achievement Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you earn badges and rewards
                </p>
              </div>
              <Switch
                id="achievements"
                checked={notifications.achievements}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, achievements: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="study-streaks">Study Streak Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when your study streak is at risk
                </p>
              </div>
              <Switch
                id="study-streaks"
                checked={notifications.studyStreaks}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, studyStreaks: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="meal-reminders">Meal Planning Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders to log meals and plan nutrition
                </p>
              </div>
              <Switch
                id="meal-reminders"
                checked={notifications.mealReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, mealReminders: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Advanced Settings
            </CardTitle>
            <CardDescription>
              Configure advanced features and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-backup">Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup your data daily
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={advanced.autoBackup}
                onCheckedChange={(checked) =>
                  setAdvanced({ ...advanced, autoBackup: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-sync">Real-time Data Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Sync data across devices in real-time
                </p>
              </div>
              <Switch
                id="data-sync"
                checked={advanced.dataSync}
                onCheckedChange={(checked) =>
                  setAdvanced({ ...advanced, dataSync: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai-personalization">AI Personalization</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to learn from your patterns for better recommendations
                </p>
              </div>
              <Switch
                id="ai-personalization"
                checked={advanced.aiPersonalization}
                onCheckedChange={(checked) =>
                  setAdvanced({ ...advanced, aiPersonalization: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Force Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Override system theme preference
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={advanced.darkMode}
                onCheckedChange={(checked) =>
                  setAdvanced({ ...advanced, darkMode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
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

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Wellness Hub - Student AI Platform v1.0</p>
            <p>© 2024 All rights reserved</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
