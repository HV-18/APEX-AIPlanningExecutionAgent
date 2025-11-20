import { useState, useEffect } from "react";
import { Lightbulb, Plus, Target, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Project = {
  id: string;
  title: string;
  description?: string;
  category: string;
  real_world_problem?: string;
  impact_goal?: string;
  progress: number;
  skills_learned?: string[];
  completed: boolean;
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "",
    real_world_problem: "",
    impact_goal: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('learning-projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_projects' }, () => loadProjects())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("learning_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const addProject = async () => {
    if (!newProject.title || !newProject.category) {
      toast({
        title: "Missing information",
        description: "Please fill in title and category",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("learning_projects").insert({
        user_id: user.id,
        ...newProject,
      });

      toast({
        title: "Project created! 🚀",
        description: "Start making real-world impact",
      });

      setNewProject({ title: "", description: "", category: "", real_world_problem: "", impact_goal: "" });
      setIsOpen(false);
      loadProjects();
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const updateProgress = async (id: string, newProgress: number) => {
    try {
      await supabase
        .from("learning_projects")
        .update({ progress: newProgress, completed: newProgress >= 100 })
        .eq("id", id);

      if (newProgress >= 100) {
        toast({
          title: "Project completed! 🎉",
          description: "Congratulations on making an impact!",
        });
      }

      loadProjects();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const realWorldProblems = [
    { title: "Reduce Food Waste", description: "Create an app to connect students with leftover dining hall food", impact: "Environmental" },
    { title: "Mental Health Support", description: "Design a peer support network for student wellness", impact: "Health" },
    { title: "Affordable Textbooks", description: "Build a textbook sharing platform to reduce costs", impact: "Education" },
    { title: "Campus Sustainability", description: "Implement recycling optimization on campus", impact: "Environmental" },
    { title: "Study Group Matcher", description: "AI-powered study buddy matching system", impact: "Education" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-accent" />
            Real-World Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Solve actual problems and build your portfolio
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start a Real-World Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Project Title *</Label>
                <Input
                  placeholder="e.g., Campus Food Waste Reduction"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Input
                  placeholder="e.g., Environmental, Health, Education"
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                />
              </div>
              <div>
                <Label>Real-World Problem</Label>
                <Textarea
                  placeholder="What problem are you solving?"
                  value={newProject.real_world_problem}
                  onChange={(e) => setNewProject({ ...newProject, real_world_problem: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Impact Goal</Label>
                <Textarea
                  placeholder="What positive change do you want to create?"
                  value={newProject.impact_goal}
                  onChange={(e) => setNewProject({ ...newProject, impact_goal: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your project approach..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={addProject} className="w-full">
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Problem Ideas */}
      <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Problem Ideas to Tackle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {realWorldProblems.map((problem, idx) => (
              <div key={idx} className="p-3 bg-card rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{problem.title}</h4>
                  <Badge variant="outline" className="text-xs">{problem.impact}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{problem.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Projects</h2>
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start a project to solve real-world problems and build your skills
              </p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className={project.completed ? "border-secondary/50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {project.title}
                      {project.completed && <Badge className="bg-secondary">Completed</Badge>}
                    </CardTitle>
                    <Badge variant="outline" className="mt-2">{project.category}</Badge>
                  </div>
                  {project.skills_learned && project.skills_learned.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {project.skills_learned.length} skills
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.real_world_problem && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">🎯 Problem</h4>
                    <p className="text-sm text-muted-foreground">{project.real_world_problem}</p>
                  </div>
                )}
                {project.impact_goal && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">💫 Impact Goal</h4>
                    <p className="text-sm text-muted-foreground">{project.impact_goal}</p>
                  </div>
                )}
                {project.description && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">📝 Description</h4>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Progress
                    </h4>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  {!project.completed && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateProgress(project.id, Math.min(project.progress + 10, 100))}
                      >
                        +10%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateProgress(project.id, Math.min(project.progress + 25, 100))}
                      >
                        +25%
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateProgress(project.id, 100)}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
