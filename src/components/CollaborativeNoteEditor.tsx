import { useState, useEffect, useCallback } from "react";
import { Users, Save, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CollaborativeNoteEditorProps {
  noteId: string;
  workspaceId: string;
  initialContent: string;
  onSave: (content: string) => void;
}

interface ActiveUser {
  user_id: string;
  name: string;
  color: string;
}

export const CollaborativeNoteEditor = ({
  noteId,
  workspaceId,
  initialContent,
  onSave,
}: CollaborativeNoteEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeSession();
    return () => {
      leaveSession();
    };
  }, [noteId]);

  const initializeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create editing session
      let { data: session } = await supabase
        .from("collaborative_editing_sessions")
        .select("*")
        .eq("note_id", noteId)
        .eq("workspace_id", workspaceId)
        .single();

      if (!session) {
        const { data: newSession, error } = await supabase
          .from("collaborative_editing_sessions")
          .insert({
            note_id: noteId,
            workspace_id: workspaceId,
            current_content: initialContent,
            active_users: [{ user_id: user.id, name: "You", color: "#3b82f6" }],
          })
          .select()
          .single();

        if (error) throw error;
        session = newSession;
      } else {
        // Add self to active users
        const users = session.active_users as any[];
        if (!users.find((u) => u.user_id === user.id)) {
          users.push({ user_id: user.id, name: "You", color: "#3b82f6" });
          await supabase
            .from("collaborative_editing_sessions")
            .update({ active_users: users })
            .eq("id", session.id);
        }
      }

      setSessionId(session.id);
      setActiveUsers(session.active_users as ActiveUser[]);

      // Subscribe to real-time updates
      subscribeToSession(session.id);
    } catch (error) {
      console.error("Error initializing session:", error);
    }
  };

  const subscribeToSession = (sessionId: string) => {
    const channel = supabase
      .channel(`editing-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collaborative_editing_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new) {
            const session = payload.new as any;
            setActiveUsers(session.active_users || []);
            setContent(session.current_content || content);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "editing_operations",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          applyOperation(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const applyOperation = (operation: any) => {
    // Simple CRDT-like operation application
    const { operation_type, position, content: opContent } = operation;

    setContent((current) => {
      if (operation_type === "insert") {
        return current.slice(0, position) + opContent + current.slice(position);
      } else if (operation_type === "delete") {
        return current.slice(0, position) + current.slice(position + (opContent?.length || 1));
      } else if (operation_type === "replace") {
        return opContent;
      }
      return current;
    });
  };

  const leaveSession = async () => {
    if (!sessionId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Remove self from active users
    const updatedUsers = activeUsers.filter((u) => u.user_id !== user.id);
    await supabase
      .from("collaborative_editing_sessions")
      .update({ active_users: updatedUsers })
      .eq("id", sessionId);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (sessionId) {
        await supabase
          .from("collaborative_editing_sessions")
          .update({
            current_content: content,
            version: Date.now(),
          })
          .eq("id", sessionId);
      }

      onSave(content);
      toast({ title: "Note saved successfully" });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Collaborative Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 3).map((user, i) => (
                <Avatar
                  key={user.user_id}
                  className="w-8 h-8 border-2 border-background"
                  style={{ backgroundColor: user.color }}
                >
                  <AvatarFallback className="text-xs text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {activeUsers.length > 3 && (
              <Badge variant="secondary">+{activeUsers.length - 3}</Badge>
            )}
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[400px] font-mono"
          placeholder="Start typing... Your changes will be visible to all collaborators in real-time."
        />
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Eye className="w-3 h-3" />
          <span>{activeUsers.length} active collaborator{activeUsers.length !== 1 ? "s" : ""}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborativeNoteEditor;
