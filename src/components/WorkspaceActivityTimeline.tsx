import { useState, useEffect } from "react";
import { Activity, Filter, User, FileText, Upload, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface WorkspaceActivityTimelineProps {
  workspaceId: string;
}

interface ActivityItem {
  id: string;
  user_name: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
  metadata: any;
}

const activityIcons: Record<string, any> = {
  create: FileText,
  edit: Edit,
  upload: Upload,
  delete: FileText,
  share: User,
};

export const WorkspaceActivityTimeline = ({
  workspaceId,
}: WorkspaceActivityTimelineProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    loadActivities();
    subscribeToActivities();
  }, [workspaceId, typeFilter, userFilter]);

  const loadActivities = async () => {
    let query = supabase
      .from("workspace_activities")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (typeFilter !== "all") {
      query = query.eq("activity_type", typeFilter);
    }

    if (userFilter !== "all") {
      query = query.eq("user_name", userFilter);
    }

    const { data } = await query;

    if (data) {
      setActivities(data);
      const uniqueUsers = Array.from(new Set(data.map((a) => a.user_name)));
      setUsers(uniqueUsers);
    }
  };

  const subscribeToActivities = () => {
    const channel = supabase
      .channel(`activities-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workspace_activities",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getActivityIcon = (type: string) => {
    return activityIcons[type] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      create: "text-green-500",
      edit: "text-blue-500",
      upload: "text-purple-500",
      delete: "text-red-500",
      share: "text-yellow-500",
    };
    return colors[type] || "text-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="create">Created</SelectItem>
                <SelectItem value="edit">Edited</SelectItem>
                <SelectItem value="upload">Uploaded</SelectItem>
                <SelectItem value="delete">Deleted</SelectItem>
                <SelectItem value="share">Shared</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.activity_type);
            const colorClass = getActivityColor(activity.activity_type);

            return (
              <div key={activity.id} className="flex gap-3">
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${colorClass}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{activity.user_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {activity.activity_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.activity_description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}

          {activities.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No activity yet in this workspace
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
