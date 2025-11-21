import { Check, FolderKanban, Plus, ChevronDown, Search, Star } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export const WorkspaceSwitcher = () => {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setUserId(user.id);

    const { data } = await supabase
      .from("workspace_favorites")
      .select("workspace_id")
      .eq("user_id", user.id);

    if (data) {
      setFavorites(new Set(data.map((f) => f.workspace_id)));
    }
  };

  const toggleFavorite = async (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userId) return;

    try {
      if (favorites.has(workspaceId)) {
        await supabase
          .from("workspace_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("workspace_id", workspaceId);

        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(workspaceId);
          return newSet;
        });

        toast({
          title: "Removed from favorites",
          description: "Workspace unpinned",
        });
      } else {
        await supabase
          .from("workspace_favorites")
          .insert({ user_id: userId, workspace_id: workspaceId });

        setFavorites((prev) => new Set([...prev, workspaceId]));

        toast({
          title: "Added to favorites",
          description: "Workspace pinned to top",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const filteredWorkspaces = useMemo(() => {
    const filtered = workspaces.filter((workspace) =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort: favorites first, then alphabetically
    return filtered.sort((a, b) => {
      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [workspaces, searchQuery, favorites]);

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
        
        <DropdownMenuContent align="start" className="w-80 bg-popover z-50">
          <DropdownMenuLabel className="font-semibold">Your Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Search Input */}
          <div className="px-2 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <div className="max-h-[400px] overflow-y-auto">
            {filteredWorkspaces.length === 0 ? (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                {searchQuery ? "No matching workspaces found" : "No workspaces yet. Create one to get started!"}
              </div>
            ) : (
              filteredWorkspaces.map((workspace) => (
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
                    <div className="font-medium truncate flex items-center gap-1">
                      {workspace.name}
                      {favorites.has(workspace.id) && (
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    {workspace.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {workspace.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => toggleFavorite(workspace.id, e)}
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          favorites.has(workspace.id) 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                    {activeWorkspace?.id === workspace.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
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
