import { useState, useEffect } from "react";
import { Zap, Plus, Trash2, Power } from "lucide-react";
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

interface WorkspaceAutomationProps {
  workspaceId: string;
}

interface Rule {
  id: string;
  rule_name: string;
  trigger_type: string;
  action_type: string;
  is_enabled: boolean;
}

export const WorkspaceAutomation = ({ workspaceId }: WorkspaceAutomationProps) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState({
    name: "",
    trigger: "file_upload",
    action: "notify",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
  }, [workspaceId]);

  const loadRules = async () => {
    const { data } = await supabase
      .from("workspace_automation_rules")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at");

    if (data) setRules(data);
  };

  const createRule = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("workspace_automation_rules")
      .insert({
        workspace_id: workspaceId,
        created_by: user.id,
        rule_name: newRule.name,
        trigger_type: newRule.trigger,
        action_type: newRule.action,
        is_enabled: true,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create rule",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Rule created",
      description: "Automation rule has been created",
    });

    setNewRule({ name: "", trigger: "file_upload", action: "notify" });
    setDialogOpen(false);
    loadRules();
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    await supabase
      .from("workspace_automation_rules")
      .update({ is_enabled: enabled })
      .eq("id", ruleId);

    loadRules();
    
    toast({
      title: enabled ? "Rule enabled" : "Rule disabled",
      description: `Automation rule has been ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const deleteRule = async (ruleId: string) => {
    await supabase
      .from("workspace_automation_rules")
      .delete()
      .eq("id", ruleId);

    loadRules();
    
    toast({
      title: "Rule deleted",
      description: "Automation rule has been removed",
    });
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
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Automation Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="Auto-tag uploaded files"
                  />
                </div>
                
                <div>
                  <Label>Trigger</Label>
                  <Select
                    value={newRule.trigger}
                    onValueChange={(value) => setNewRule({ ...newRule, trigger: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file_upload">File Upload</SelectItem>
                      <SelectItem value="note_created">Note Created</SelectItem>
                      <SelectItem value="deadline_approaching">Deadline Approaching</SelectItem>
                      <SelectItem value="task_completed">Task Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Action</Label>
                  <Select
                    value={newRule.action}
                    onValueChange={(value) => setNewRule({ ...newRule, action: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notify">Send Notification</SelectItem>
                      <SelectItem value="auto_tag">Auto Tag</SelectItem>
                      <SelectItem value="archive">Archive Old Content</SelectItem>
                      <SelectItem value="email">Send Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={createRule} className="w-full">
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No automation rules yet. Create one to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{rule.rule_name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {rule.trigger_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rule.action_type}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_enabled}
                      onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                    />
                    <Power className={`w-4 h-4 ${rule.is_enabled ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
