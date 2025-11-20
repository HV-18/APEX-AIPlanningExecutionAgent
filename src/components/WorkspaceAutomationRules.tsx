import { useState, useEffect } from "react";
import { Zap, Plus, Trash2, Power, PowerOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkspaceAutomationRulesProps {
  workspaceId: string;
}

interface Rule {
  id: string;
  rule_name: string;
  trigger_type: string;
  action_type: string;
  is_enabled: boolean;
  created_at: string;
}

const triggerTypes = [
  { value: "file_upload", label: "File Upload" },
  { value: "deadline_approaching", label: "Deadline Approaching" },
  { value: "content_age", label: "Content Age" },
  { value: "task_complete", label: "Task Complete" },
  { value: "tag_added", label: "Tag Added" },
];

const actionTypes = [
  { value: "auto_tag", label: "Auto Tag" },
  { value: "send_notification", label: "Send Notification" },
  { value: "archive_content", label: "Archive Content" },
  { value: "create_task", label: "Create Task" },
  { value: "update_status", label: "Update Status" },
];

export const WorkspaceAutomationRules = ({
  workspaceId,
}: WorkspaceAutomationRulesProps) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    trigger: "",
    action: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
  }, [workspaceId]);

  const loadRules = async () => {
    const { data } = await supabase
      .from("workspace_automation_rules")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (data) setRules(data);
  };

  const handleCreateRule = async () => {
    if (!newRule.name || !newRule.trigger || !newRule.action) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("workspace_automation_rules").insert({
        workspace_id: workspaceId,
        rule_name: newRule.name,
        trigger_type: newRule.trigger,
        action_type: newRule.action,
        created_by: user.id,
      });

      if (error) throw error;

      await loadRules();
      setDialogOpen(false);
      setNewRule({ name: "", trigger: "", action: "" });
      toast({ title: "Automation rule created successfully" });
    } catch (error) {
      console.error("Error creating rule:", error);
      toast({
        title: "Error",
        description: "Failed to create automation rule",
        variant: "destructive",
      });
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("workspace_automation_rules")
        .update({ is_enabled: enabled })
        .eq("id", ruleId);

      if (error) throw error;

      await loadRules();
      toast({
        title: enabled ? "Rule enabled" : "Rule disabled",
        description: `Automation rule ${enabled ? "activated" : "deactivated"}`,
      });
    } catch (error) {
      console.error("Error toggling rule:", error);
      toast({
        title: "Error",
        description: "Failed to update rule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from("workspace_automation_rules")
        .delete()
        .eq("id", ruleId);

      if (error) throw error;

      await loadRules();
      toast({ title: "Automation rule deleted" });
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Automation Rules
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Automation Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input
                    placeholder="e.g., Auto-tag uploaded PDFs"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trigger Event</Label>
                  <Select
                    value={newRule.trigger}
                    onValueChange={(value) => setNewRule({ ...newRule, trigger: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select
                    value={newRule.action}
                    onValueChange={(value) => setNewRule({ ...newRule, action: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateRule} className="w-full">
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                {rule.is_enabled ? (
                  <Power className="w-4 h-4 text-green-500" />
                ) : (
                  <PowerOff className="w-4 h-4 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{rule.rule_name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {triggerTypes.find((t) => t.value === rule.trigger_type)?.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">→</span>
                    <Badge variant="outline" className="text-xs">
                      {actionTypes.find((a) => a.value === rule.action_type)?.label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.is_enabled}
                  onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRule(rule.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {rules.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No automation rules yet. Create rules to automate your workspace.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
