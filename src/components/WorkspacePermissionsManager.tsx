import { useState, useEffect } from "react";
import { Shield, UserCog, Eye, Edit3, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkspacePermissionsManagerProps {
  workspaceId: string;
}

interface Member {
  id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer";
  joined_at: string;
}

const roleIcons = {
  owner: Crown,
  editor: Edit3,
  viewer: Eye,
};

const roleDescriptions = {
  owner: "Full control - manage members, delete workspace",
  editor: "Edit content, upload files, create notes",
  viewer: "View-only access to workspace content",
};

export const WorkspacePermissionsManager = ({
  workspaceId,
}: WorkspacePermissionsManagerProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
    loadOwner();
  }, [workspaceId]);

  const loadOwner = async () => {
    const { data } = await supabase
      .from("workspaces")
      .select("user_id")
      .eq("id", workspaceId)
      .single();

    if (data) setOwner(data);
  };

  const loadMembers = async () => {
    const { data } = await supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("joined_at");

    if (data) setMembers(data as Member[]);
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      await loadMembers();
      toast({
        title: "Role updated",
        description: "Member permissions have been updated",
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Permissions Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Role Descriptions</h4>
            {Object.entries(roleDescriptions).map(([role, desc]) => {
              const Icon = roleIcons[role as keyof typeof roleIcons];
              return (
                <div key={role} className="flex items-start gap-2 text-sm">
                  <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <span className="font-medium capitalize">{role}:</span>{" "}
                    <span className="text-muted-foreground">{desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {owner && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCog className="w-4 h-4" />
                  <span className="text-sm font-medium">Workspace Owner</span>
                </div>
                <Badge variant="default">
                  <Crown className="w-3 h-3 mr-1" />
                  Owner
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The owner has full control and cannot be changed
              </p>
            </div>
          )}

          {members.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Team Members</h4>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{member.user_id.slice(0, 8)}...</span>
                  </div>
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No team members yet. Share this workspace to collaborate.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
