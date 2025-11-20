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
    weeklyReports: false,
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

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mood Check-in Reminders</p>
                <p className="text-sm text-muted-foreground">Daily reminders to log your mood</p>
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
                <p className="font-medium">Study Session Reminders</p>
                <p className="text-sm text-muted-foreground">Notifications for scheduled study time</p>
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
                <p className="font-medium">Weekly Progress Reports</p>
                <p className="text-sm text-muted-foreground">Get weekly insights on your progress</p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, weeklyReports: checked })
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
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Clear All Data</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete all your chat history, mood logs, study sessions, and other data. This action cannot be undone.
              </p>
              <Button variant="destructive" onClick={clearAllData}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Student Wellness Hub v1.0</p>
            <p>Your AI-powered companion for academic success and wellness</p>
            <p className="pt-4 text-xs">© 2025 All rights reserved</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
