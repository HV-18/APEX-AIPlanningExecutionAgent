import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const defaultTemplates = [
  {
    id: "template-1",
    name: "Computer Science Course",
    description: "Perfect for CS courses with notes, projects, and assignments",
    category: "Academic",
    icon: "💻",
    color: "#3b82f6",
  },
  {
    id: "template-2",
    name: "Research Project",
    description: "Organize literature review, experiments, and findings",
    category: "Research",
    icon: "🔬",
    color: "#8b5cf6",
  },
  {
    id: "template-3",
    name: "Language Learning",
    description: "Track vocabulary, practice sessions, and progress",
    category: "Language",
    icon: "🌍",
    color: "#10b981",
  },
  {
    id: "template-4",
    name: "Exam Preparation",
    description: "Plan study schedule, practice tests, and revision notes",
    category: "Exam Prep",
    icon: "📝",
    color: "#f59e0b",
  },
  {
    id: "template-5",
    name: "Thesis Writing",
    description: "Manage chapters, references, and writing milestones",
    category: "Academic",
    icon: "📚",
    color: "#ec4899",
  },
  {
    id: "template-6",
    name: "Group Study Project",
    description: "Collaborate with team members on shared goals",
    category: "Collaboration",
    icon: "👥",
    color: "#06b6d4",
  },
];

const WorkspaceTemplatesPage = () => {
  const [templates, setTemplates] = useState(defaultTemplates);
  const { refreshWorkspaces } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getTemplateContent = (templateId: string) => {
    const content: Record<string, any> = {
      "template-1": { // Computer Science Course
        notes: [
          { subject: "Data Structures", topic: "Arrays & Lists", content: "Arrays are contiguous memory blocks. Lists can be singly or doubly linked." },
          { subject: "Algorithms", topic: "Sorting", content: "Bubble sort O(n²), Quick sort O(n log n), Merge sort O(n log n)" },
          { subject: "OOP", topic: "Fundamentals", content: "Encapsulation, Inheritance, Polymorphism, Abstraction" }
        ],
        projects: [
          { title: "Final Project", category: "Programming", description: "Build a full-stack web application with database", progress: 0 },
          { title: "Algorithm Assignments", category: "Assignments", description: "Weekly coding challenges", progress: 25 }
        ],
        sessions: [
          { subject: "Lecture Notes", duration_minutes: 60 },
          { subject: "Lab Work", duration_minutes: 90 }
        ]
      },
      "template-2": { // Research Project
        notes: [
          { subject: "Literature Review", topic: "Key Papers", content: "Summarize 10-15 relevant research papers in your field" },
          { subject: "Methodology", topic: "Research Design", content: "Qualitative vs Quantitative approaches, sampling methods" },
          { subject: "Data Analysis", topic: "Statistical Tools", content: "SPSS, R, Python for data analysis" }
        ],
        projects: [
          { title: "Data Collection Phase", category: "Research", description: "Survey design and participant recruitment", progress: 0 },
          { title: "Paper Writing", category: "Writing", description: "Draft chapters and manuscript", progress: 10 }
        ],
        sessions: [
          { subject: "Reading & Review", duration_minutes: 120 },
          { subject: "Data Processing", duration_minutes: 90 }
        ]
      },
      "template-3": { // Language Learning
        notes: [
          { subject: "Vocabulary", topic: "Essential Words", content: "Start with 100 most common words. Track daily: hello, goodbye, thank you, please, yes, no..." },
          { subject: "Grammar", topic: "Present Tense", content: "Subject + Verb conjugation. Practice regular and irregular verbs daily." },
          { subject: "Grammar", topic: "Past Tense", content: "Formation rules and common irregular verbs. Practice with storytelling." },
          { subject: "Pronunciation", topic: "Difficult Sounds", content: "Record yourself, compare with native speakers. Focus on challenging phonemes." },
          { subject: "Conversation", topic: "Common Phrases", content: "How are you? Where is...? I would like... Can you help me?" }
        ],
        projects: [
          { title: "30-Day Speaking Challenge", category: "Speaking", description: "Practice speaking 15 minutes daily with language partner or tutor", progress: 0 },
          { title: "Reading Milestone", category: "Reading", description: "Read 5 short stories or articles per week in target language", progress: 0 },
          { title: "Vocabulary Builder", category: "Vocabulary", description: "Learn 20 new words daily using spaced repetition", progress: 0 }
        ],
        sessions: [
          { subject: "Listening Practice", duration_minutes: 30 },
          { subject: "Speaking Practice", duration_minutes: 30 },
          { subject: "Writing Exercise", duration_minutes: 45 },
          { subject: "Grammar Study", duration_minutes: 25 }
        ]
      },
      "template-4": { // Exam Preparation
        notes: [
          { subject: "Study Schedule", topic: "Timeline", content: "Break down syllabus by weeks. Allocate more time to weak areas." },
          { subject: "Key Concepts", topic: "Must Know", content: "List critical topics, formulas, definitions for quick revision" },
          { subject: "Practice Tests", topic: "Mock Exams", content: "Track scores and identify patterns in mistakes" }
        ],
        projects: [
          { title: "Revision Plan", category: "Planning", description: "Systematic coverage of all exam topics", progress: 0 },
          { title: "Practice Papers", category: "Practice", description: "Complete 10 full-length mock tests", progress: 0 }
        ],
        sessions: [
          { subject: "Topic Review", duration_minutes: 60 },
          { subject: "Practice Questions", duration_minutes: 45 },
          { subject: "Mock Test", duration_minutes: 120 }
        ]
      },
      "template-5": { // Thesis Writing
        notes: [
          { subject: "Chapter 1", topic: "Introduction", content: "Background, research questions, significance of study" },
          { subject: "Chapter 2", topic: "Literature Review", content: "Theoretical framework and previous research" },
          { subject: "Chapter 3", topic: "Methodology", content: "Research design, data collection methods, analysis plan" },
          { subject: "References", topic: "Bibliography", content: "Track all sources in proper citation format" }
        ],
        projects: [
          { title: "Chapter Drafts", category: "Writing", description: "Complete first draft of all chapters", progress: 15 },
          { title: "Research & Analysis", category: "Research", description: "Conduct experiments and analyze results", progress: 30 },
          { title: "Revisions", category: "Editing", description: "Incorporate advisor feedback and polish manuscript", progress: 0 }
        ],
        sessions: [
          { subject: "Writing", duration_minutes: 120 },
          { subject: "Research", duration_minutes: 90 },
          { subject: "Advisor Meeting Prep", duration_minutes: 60 }
        ]
      },
      "template-6": { // Group Study Project
        notes: [
          { subject: "Project Plan", topic: "Overview", content: "Goals, deliverables, timeline, and team member roles" },
          { subject: "Meeting Notes", topic: "Team Discussions", content: "Document decisions, action items, and next steps from meetings" },
          { subject: "Resources", topic: "Shared Materials", content: "Links to useful articles, videos, and reference documents" }
        ],
        projects: [
          { title: "Team Deliverable", category: "Collaboration", description: "Main project output - assign tasks to members", progress: 0 },
          { title: "Presentation", category: "Communication", description: "Prepare slides and practice group presentation", progress: 0 }
        ],
        sessions: [
          { subject: "Team Meeting", duration_minutes: 60 },
          { subject: "Individual Work", duration_minutes: 90 },
          { subject: "Review Session", duration_minutes: 45 }
        ]
      }
    };
    return content[templateId] || {};
  };

  const handleCreateFromTemplate = async (template: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          icon: template.icon,
          color: template.color,
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Get template content
      const content = getTemplateContent(template.id);

      // Add notes
      if (content.notes && content.notes.length > 0) {
        const notesWithWorkspace = content.notes.map((note: any) => ({
          ...note,
          user_id: user.id,
          workspace_id: workspace.id,
          ai_generated: false,
        }));
        await supabase.from("study_notes").insert(notesWithWorkspace);
      }

      // Add projects
      if (content.projects && content.projects.length > 0) {
        const projectsWithWorkspace = content.projects.map((project: any) => ({
          ...project,
          user_id: user.id,
          workspace_id: workspace.id,
        }));
        await supabase.from("learning_projects").insert(projectsWithWorkspace);
      }

      // Add study sessions
      if (content.sessions && content.sessions.length > 0) {
        const sessionsWithWorkspace = content.sessions.map((session: any) => ({
          ...session,
          user_id: user.id,
          workspace_id: workspace.id,
        }));
        await supabase.from("study_sessions").insert(sessionsWithWorkspace);
      }

      await refreshWorkspaces();
      toast({
        title: "Workspace created! 🎉",
        description: `${template.name} workspace with starter content is ready`,
      });
      navigate("/workspaces");
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Copy className="w-8 h-8" />
            Workspace Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Start with a pre-configured workspace template
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span
                  className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: template.color + "20" }}
                >
                  {template.icon}
                </span>
                <div className="flex-1">
                  <div>{template.name}</div>
                  <div className="text-xs font-normal text-muted-foreground">
                    {template.category}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>
              <Button
                onClick={() => handleCreateFromTemplate(template)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceTemplatesPage;
