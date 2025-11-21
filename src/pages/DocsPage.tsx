import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  MessageSquare,
  Users,
  Camera,
  Music,
  Heart,
  Leaf,
  BarChart3,
  Calendar,
  BookOpen,
  Lightbulb,
  Mic,
  Image,
  ClipboardList,
} from "lucide-react";

const DocsPage = () => {
  const coreFeatures = [
    {
      icon: Brain,
      title: "AI Study Buddy",
      category: "AI-Powered",
      description: "Personalized learning recommendations based on your study patterns and performance.",
      features: [
        "Analyzes study sessions and learning gaps",
        "Suggests optimal study times based on productivity patterns",
        "Generates custom study tips tailored to your needs",
        "Tracks learning progress over time",
      ],
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      category: "AI-Powered",
      description: "Conversational AI for doubt clarification, concept explanation, and study support.",
      features: [
        "Natural language doubt resolution",
        "Image upload and analysis for visual learning",
        "Context-aware responses based on study history",
        "Multiple AI modes: conversational, interview, viva practice",
      ],
    },
    {
      icon: ClipboardList,
      title: "Quiz Generator",
      category: "AI-Powered",
      description: "AI-powered custom quiz generation for targeted practice and assessment.",
      features: [
        "Generate quizzes on any subject or topic",
        "Adaptive difficulty based on performance",
        "Multiple question types and formats",
        "Instant scoring and detailed feedback",
      ],
    },
    {
      icon: Mic,
      title: "Voice Assistant",
      category: "AI-Powered",
      description: "Conversational AI with natural voice interaction for hands-free learning.",
      features: [
        "Voice-based doubt clarification",
        "Natural spoken conversations with AI",
        "Interview and viva practice with voice feedback",
        "Hands-free study support",
      ],
    },
  ];

  const collaborationFeatures = [
    {
      icon: Users,
      title: "Collaborative Study Rooms",
      category: "Collaboration",
      description: "Real-time team learning with comprehensive collaboration tools.",
      features: [
        "Live video calls for face-to-face study",
        "Shared whiteboard for visual collaboration",
        "Screen sharing for presentations and demos",
        "Real-time text chat and file sharing",
        "Virtual hand raise with turn-taking system",
        "Session recording for later review",
        "Attendance tracking and reporting",
        "Breakout rooms for group discussions",
        "Collaborative code editor for programming",
      ],
    },
    {
      icon: BookOpen,
      title: "Workspace Organization",
      category: "Collaboration",
      description: "Organize study contexts with workspace system for different courses or projects.",
      features: [
        "Separate workspaces for courses/projects",
        "Shared notes and tasks with classmates",
        "Template cloning for pre-configured structures",
        "Time tracking and productivity analytics",
        "File management and organization",
        "Version history and backup",
        "Tag and label system",
        "External integrations (Google Drive, GitHub, Dropbox)",
      ],
    },
  ];

  const wellnessFeatures = [
    {
      icon: Heart,
      title: "Mood & Wellness Tracking",
      category: "Wellness",
      description: "Comprehensive mood and wellness tracking with actionable insights.",
      features: [
        "Daily mood logging with sentiment analysis",
        "Stress detection via typing patterns",
        "Automatic task switching when stressed",
        "Wellness reports (daily/weekly)",
        "Health goals and streak tracking",
        "Motivational micro-messages",
      ],
    },
    {
      icon: Camera,
      title: "AI Meal Analyzer",
      category: "Wellness",
      description: "Photo-based nutrition analysis and budget-friendly meal recommendations.",
      features: [
        "Camera-based food recognition",
        "A-F nutrition scoring",
        "Calorie estimation and tracking",
        "Budget-friendly meal suggestions",
        "Expense tracking over time",
        "Weekly meal planning",
      ],
    },
    {
      icon: Music,
      title: "Focus Zone",
      category: "Wellness",
      description: "Pomodoro timer with integrated focus music for productive study sessions.",
      features: [
        "Customizable Pomodoro intervals",
        "Binaural beats and lo-fi playlists",
        "Nature sounds and white noise",
        "Automatic break music",
        "Session tracking and statistics",
      ],
    },
  ];

  const productivityFeatures = [
    {
      icon: Calendar,
      title: "Smart Timetable",
      category: "Productivity",
      description: "Personalized timetable with AI-suggested optimal study schedules.",
      features: [
        "Drag-and-drop event management",
        "Color-coded categories",
        "Workspace integration",
        "Calendar view and filters",
        "Google Calendar sync",
      ],
    },
    {
      icon: BarChart3,
      title: "Gamification & Rewards",
      category: "Productivity",
      description: "Points, badges, and leaderboards to boost motivation and engagement.",
      features: [
        "Points for completing sessions",
        "Achievement badges and milestones",
        "Weekly and all-time leaderboards",
        "Team challenges and competitions",
        "Social sharing of progress",
      ],
    },
    {
      icon: Lightbulb,
      title: "Real-World Projects",
      category: "Productivity",
      description: "Project-based learning focused on real-world problems and impact.",
      features: [
        "Project creation and tracking",
        "Collaboration with team members",
        "Skills learned documentation",
        "Impact goal setting",
        "Resource management",
        "Progress tracking and deadlines",
      ],
    },
  ];

  const sustainabilityFeatures = [
    {
      icon: Leaf,
      title: "Sustainability Tracking",
      category: "Impact",
      description: "Track transport modes, carbon footprint, and sustainable choices.",
      features: [
        "Transport mode logging (walk, bike, bus, etc.)",
        "CO2 savings calculation",
        "Cost comparison between modes",
        "Budget tracking integration",
        "Eco-friendly choice recommendations",
        "Sustainability dashboard and metrics",
      ],
    },
  ];

  const renderFeatureSection = (features: any[], title: string) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {feature.category}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{feature.description}</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Key Features:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {feature.features.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl space-y-8">
      <BackButton to="/dashboard" />

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Feature Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive guide to all features and capabilities
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai">AI Features</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-6">
          {renderFeatureSection(coreFeatures, "AI-Powered Learning")}
        </TabsContent>

        <TabsContent value="collaboration" className="mt-6">
          {renderFeatureSection(collaborationFeatures, "Collaboration & Teamwork")}
        </TabsContent>

        <TabsContent value="wellness" className="mt-6">
          {renderFeatureSection(wellnessFeatures, "Health & Wellness")}
        </TabsContent>

        <TabsContent value="productivity" className="mt-6">
          {renderFeatureSection(productivityFeatures, "Productivity & Learning")}
        </TabsContent>

        <TabsContent value="sustainability" className="mt-6">
          {renderFeatureSection(sustainabilityFeatures, "Sustainability & Impact")}
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick tips to make the most of Student Wellness Hub</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><strong>1. Complete your profile:</strong> Add your study goals and preferred subjects for personalized recommendations.</p>
          <p><strong>2. Start with AI Chat:</strong> Ask questions, upload images, or practice interviews to explore AI capabilities.</p>
          <p><strong>3. Join or create study rooms:</strong> Collaborate with peers in real-time with video, whiteboard, and chat.</p>
          <p><strong>4. Track your wellness:</strong> Log mood, meals, and Pomodoro sessions for comprehensive wellness insights.</p>
          <p><strong>5. Organize with workspaces:</strong> Create separate workspaces for different courses or projects.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocsPage;