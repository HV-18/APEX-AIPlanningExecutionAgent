import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load workspaces
      const { data: workspacesData } = await supabase
        .from("workspaces")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at");

      if (workspacesData) {
        setWorkspaces(workspacesData);

        // Load active workspace
        const { data: settings } = await supabase
          .from("user_workspace_settings")
          .select("active_workspace_id")
          .eq("user_id", user.id)
          .single();

        if (settings?.active_workspace_id) {
          const active = workspacesData.find((w) => w.id === settings.active_workspace_id);
          if (active) {
            setActiveWorkspaceState(active);
          }
        } else if (workspacesData.length > 0) {
          // Set first workspace as active if none is set
          setActiveWorkspaceState(workspacesData[0]);
        }
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const setActiveWorkspace = async (workspaceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update active workspace in database
      await supabase
        .from("user_workspace_settings")
        .upsert({
          user_id: user.id,
          active_workspace_id: workspaceId,
          updated_at: new Date().toISOString(),
        });

      // Update local state
      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (workspace) {
        setActiveWorkspaceState(workspace);
      }
    } catch (error) {
      console.error("Error setting active workspace:", error);
    }
  };

  useEffect(() => {
    refreshWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        refreshWorkspaces,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
