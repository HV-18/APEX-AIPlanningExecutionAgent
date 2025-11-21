import { Check, FolderKanban, Plus, ChevronDown } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

export const WorkspaceSwitcher = () => {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleWorkspaceSwitch = (workspaceId: string, workspaceName: string) => {
    setActiveWorkspace(workspaceId);
    toast({
      title: "Workspace Switched",
      description: `Now working in: ${workspaceName}`,
    });
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between gap-2 hover:bg-accent transition-colors">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span 
                    className="text-lg flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: activeWorkspace?.color ? `${activeWorkspace.color}20` : 'hsl(var(--primary) / 0.1)' }}
                  >
                    {activeWorkspace?.icon || "📚"}
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium truncate">
                      {activeWorkspace?.name || "Select Workspace"}
                    </div>
                    {activeWorkspace?.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {activeWorkspace.description}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Switch between your workspaces</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="font-semibold">Your Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="max-h-[400px] overflow-y-auto">
            {workspaces.length === 0 ? (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                No workspaces yet. Create one to get started!
              </div>
            ) : (
              workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleWorkspaceSwitch(workspace.id, workspace.name)}
                  className="flex items-start gap-3 cursor-pointer p-3 hover:bg-accent transition-colors"
                >
                  <span 
                    className="text-xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg mt-0.5"
                    style={{ backgroundColor: workspace.color ? `${workspace.color}20` : 'hsl(var(--primary) / 0.1)' }}
                  >
                    {workspace.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{workspace.name}</div>
                    {workspace.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {workspace.description}
                      </div>
                    )}
                  </div>
                  {activeWorkspace?.id === workspace.id && (
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => {
              navigate("/workspaces");
              toast({
                title: "Workspaces",
                description: "Manage all your workspaces",
              });
            }}
            className="cursor-pointer hover:bg-accent transition-colors"
          >
            <FolderKanban className="w-4 h-4 mr-2" />
            <span className="font-medium">Manage All Workspaces</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => {
              navigate("/workspaces");
              toast({
                title: "Create Workspace",
                description: "Set up a new study workspace",
              });
            }}
            className="cursor-pointer text-primary hover:bg-accent transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="font-medium">Create New Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};
