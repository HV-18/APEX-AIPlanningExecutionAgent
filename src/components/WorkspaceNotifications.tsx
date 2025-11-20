import { useEffect, useState } from "react";
import { Bell, BellOff, AtSign, FileUp, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkspaceNotificationsProps {
  workspaceId: string;
}

interface NotificationSettings {
  mentions: boolean;
  file_uploads: boolean;
  task_assignments: boolean;
  email_enabled: boolean;
}

export const WorkspaceNotifications = ({
  workspaceId,
}: WorkspaceNotificationsProps) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    mentions: true,
    file_uploads: true,
    task_assignments: true,
    email_enabled: false,
  });
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    subscribeToNotifications();
  }, [workspaceId]);

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) setRecentNotifications(data);
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel(`workspace-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workspace_files",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        async (payload) => {
          if (settings.file_uploads) {
            await createNotification(
              "file_upload",
              "New File Uploaded",
              `A new file was uploaded to the workspace: ${payload.new.file_name}`
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createNotification = async (
    type: string,
    title: string,
    message: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("notifications").insert({
      user_id: user.id,
      type,
      title,
      message,
      data: { workspace_id: workspaceId },
    });

    if (!error) {
      await loadNotifications();
      toast({ title, description: message });
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    toast({
      title: "Settings updated",
      description: `Notification preference has been updated`,
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "mention":
        return AtSign;
      case "file_upload":
        return FileUp;
      case "task_assignment":
        return CheckSquare;
      default:
        return Bell;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mentions" className="flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  @Mentions
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when someone mentions you
                </p>
              </div>
              <Switch
                id="mentions"
                checked={settings.mentions}
                onCheckedChange={(checked) => handleSettingChange("mentions", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="files" className="flex items-center gap-2">
                  <FileUp className="w-4 h-4" />
                  File Uploads
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when files are uploaded
                </p>
              </div>
              <Switch
                id="files"
                checked={settings.file_uploads}
                onCheckedChange={(checked) =>
                  handleSettingChange("file_uploads", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tasks" className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Task Assignments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when tasks are assigned to you
                </p>
              </div>
              <Switch
                id="tasks"
                checked={settings.task_assignments}
                onCheckedChange={(checked) =>
                  handleSettingChange("task_assignments", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Email Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email"
                checked={settings.email_enabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("email_enabled", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {recentNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <Icon className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{notification.title}</p>
                        {!notification.is_read && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
