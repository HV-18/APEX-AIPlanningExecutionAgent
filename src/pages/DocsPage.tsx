import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  MessageSquare,
  Users,
  Camera,
  Music,
  Heart,
  Leaf,
  Calendar,
  BookOpen,
  Mic,
  ClipboardList,
} from "lucide-react";

const DocsPage = () => {
  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <BackButton to="/dashboard" />

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">APEX Documentation</h1>
        <p className="text-lg text-muted-foreground">
          AI Planning & Execution Agent - Essential features overview
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <MessageSquare className="w-4 h-4 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">AI Chat</h4>
              <p className="text-muted-foreground">Conversational AI for doubts, concepts, and image analysis</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ClipboardList className="w-4 h-4 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Quiz Generator</h4>
              <p className="text-muted-foreground">Generate custom quizzes on any topic with adaptive difficulty</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Brain className="w-4 h-4 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">AI Study Buddy</h4>
              <p className="text-muted-foreground">Personalized recommendations based on study patterns</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Mic className="w-4 h-4 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Voice Assistant</h4>
              <p className="text-muted-foreground">Natural voice conversations for interview practice</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <Users className="w-4 h-4 text-accent mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Study Rooms</h4>
              <p className="text-muted-foreground">Real-time collaboration with video, whiteboard, chat, and screen sharing</p>
            </div>
          </div>
          <div className="flex gap-3">
            <BookOpen className="w-4 h-4 text-accent mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Workspaces</h4>
              <p className="text-muted-foreground">Organize courses/projects with shared notes and tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" />
            Wellness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <Heart className="w-4 h-4 text-destructive mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Mood Tracker</h4>
              <p className="text-muted-foreground">Log mood with stress detection and wellness insights</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Camera className="w-4 h-4 text-destructive mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Meal Analyzer</h4>
              <p className="text-muted-foreground">Photo-based nutrition analysis with A-F scoring</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Music className="w-4 h-4 text-destructive mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Focus Zone</h4>
              <p className="text-muted-foreground">Pomodoro timer with binaural beats and focus music</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Productivity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <Calendar className="w-4 h-4 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Timetable</h4>
              <p className="text-muted-foreground">Smart scheduling with Google Calendar sync</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge className="w-4 h-4 text-primary mt-1 shrink-0">⭐</Badge>
            <div>
              <h4 className="font-semibold">Gamification</h4>
              <p className="text-muted-foreground">Points, badges, and leaderboards for motivation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-accent" />
            Sustainability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 text-sm">
            <Leaf className="w-4 h-4 text-accent mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Transport Tracking</h4>
              <p className="text-muted-foreground">Log transport modes with CO2 and cost tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Complete your profile with study goals</p>
          <p>2. Start with AI Chat to explore capabilities</p>
          <p>3. Join study rooms for collaboration</p>
          <p>4. Track mood and meals for wellness insights</p>
          <p>5. Use workspaces to organize learning</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocsPage;