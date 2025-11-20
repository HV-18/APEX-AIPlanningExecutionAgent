import { Check, FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNavigate } from "react-router-dom";

export const WorkspaceSwitcher = () => {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <span className="text-lg">{activeWorkspace?.icon || "📚"}</span>
          <span className="flex-1 truncate text-left">
            {activeWorkspace?.name || "Select Workspace"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg">{workspace.icon}</span>
            <span className="flex-1">{workspace.name}</span>
            {activeWorkspace?.id === workspace.id && (
              <Check className="w-4 h-4" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/workspaces")}
          className="cursor-pointer"
        >
          <FolderKanban className="w-4 h-4 mr-2" />
          Manage Workspaces
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/workspaces/new")}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
