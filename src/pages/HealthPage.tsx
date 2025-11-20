import { useState, useEffect } from "react";
import { Heart, Target, Droplets, Moon, Activity, Brain as BrainIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type HealthGoal = {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  streak_days: number;
};

const HealthPage = () => {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [newGoal, setNewGoal] = useState({
    goal_type: "",
    target_value: "",
    unit: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadGoals();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('health-goals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'health_goals' }, () => loadGoals())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("health_goals")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  const addGoal = async () => {
    if (!newGoal.goal_type || !newGoal.target_value || !newGoal.unit) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("health_goals").insert({
        user_id: user.id,
        goal_type: newGoal.goal_type,
        target_value: parseFloat(newGoal.target_value),
        current_value: 0,
        unit: newGoal.unit,
      });

      toast({
        title: "Goal created! 🎯",
        description: "Start tracking your health progress",
      });

      setNewGoal({ goal_type: "", target_value: "", unit: "" });
      loadGoals();
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const updateProgress = async (goalId: string, increment: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newValue = Math.min(goal.current_value + increment, goal.target_value);
      const isComplete = newValue >= goal.target_value;

      await supabase
        .from("health_goals")
        .update({
          current_value: newValue,
          last_updated: new Date().toISOString(),
          streak_days: isComplete ? goal.streak_days + 1 : goal.streak_days,
        })
        .eq("id", goalId);

      if (isComplete) {
        toast({
          title: "Goal achieved! 🎉",
          description: `${goal.streak_days + 1} day streak!`,
        });
      }

      loadGoals();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const getGoalIcon = (type: string) => {
    const icons = {
      exercise: Activity,
      sleep: Moon,
      hydration: Droplets,
      mental_health: BrainIcon,
      nutrition: Heart,
    };
    return icons[type as keyof typeof icons] || Target;
  };

  const getGoalColor = (type: string) => {
    const colors = {
      exercise: "text-secondary",
      sleep: "text-accent",
      hydration: "text-primary",
      mental_health: "text-primary",
      nutrition: "text-secondary",
    };
    return colors[type as keyof typeof colors] || "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="w-8 h-8 text-destructive" />
          Health & Wellness
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your health goals and build sustainable habits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No health goals yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set your first health goal to start tracking your wellness
                </p>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => {
              const Icon = getGoalIcon(goal.goal_type);
              const progressPercent = (goal.current_value / goal.target_value) * 100;

              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${getGoalColor(goal.goal_type)}`} />
                        <span className="capitalize">{goal.goal_type.replace('_', ' ')}</span>
                      </div>
                      {goal.streak_days > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                          🔥 {goal.streak_days} day streak
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">
                          {goal.current_value} / {goal.target_value} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateProgress(goal.id, 1)}
                      >
                        +1
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateProgress(goal.id, goal.target_value * 0.1)}
                      >
                        +10%
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateProgress(goal.id, goal.target_value - goal.current_value)}
                      >
                        Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Set New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Goal Type</label>
                <Select value={newGoal.goal_type} onValueChange={(val) => setNewGoal({ ...newGoal, goal_type: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exercise">🏃 Exercise</SelectItem>
                    <SelectItem value="sleep">😴 Sleep</SelectItem>
                    <SelectItem value="hydration">💧 Hydration</SelectItem>
                    <SelectItem value="mental_health">🧠 Mental Health</SelectItem>
                    <SelectItem value="nutrition">🥗 Nutrition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Daily Target</label>
                <Input
                  type="number"
                  placeholder="e.g., 8"
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Unit</label>
                <Input
                  placeholder="e.g., hours, liters, servings"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                />
              </div>

              <Button onClick={addGoal} className="w-full">
                Create Goal
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="text-lg">💚 Health Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Aim for 7-9 hours of sleep</p>
              <p>• Drink 2-3 liters of water daily</p>
              <p>• Exercise 30 mins, 5x per week</p>
              <p>• Take mental health breaks</p>
              <p>• Eat balanced, affordable meals</p>
              <p>• Practice mindfulness daily</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
