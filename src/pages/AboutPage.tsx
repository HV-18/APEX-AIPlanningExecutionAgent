import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Brain, Target, Lightbulb, Users, Heart, Sparkles } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <BackButton to="/dashboard" />
      
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          About Student Wellness Hub
        </h1>
        <p className="text-lg text-muted-foreground">
          AI-powered platform for academic excellence and holistic well-being
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <CardTitle>Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Revolutionize student learning by integrating AI-powered education tools with wellness tracking, 
              supporting both academic achievement and personal well-being.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              <CardTitle>Our Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Become the leading AI-powered platform where every student has access to personalized AI tutoring, 
              real-time collaboration tools, and wellness support—all integrated.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What We Do
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><strong>The Challenge:</strong> Students face academic pressure while juggling mental health, nutrition, and career prep. Traditional tools focus only on academics.</p>
          <p><strong>Our Solution:</strong> First platform integrating AI education with wellness tracking—personalized learning, collaboration, mood tracking, nutrition analysis, and sustainability features.</p>
          <p><strong>The Impact:</strong> Better grades, reduced stress, healthier habits, and career readiness through holistic student support.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Core Values
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Education First</h4>
              </div>
              <p className="text-muted-foreground">AI-powered personalized learning and collaborative tools</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-destructive" />
                <h4 className="font-semibold">Holistic Wellness</h4>
              </div>
              <p className="text-muted-foreground">Mental health, nutrition, and stress management integrated</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-accent" />
                <h4 className="font-semibold">Collaboration</h4>
              </div>
              <p className="text-muted-foreground">Real-time study rooms and peer support systems</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <CardHeader>
          <CardTitle>What Makes Us Different</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>1. AI Personalization:</strong> Adaptive learning paths and intelligent recommendations</p>
            <p><strong>2. Real-Time Collaboration:</strong> Live study rooms with video, whiteboard, and code editor</p>
            <p><strong>3. Integrated Wellness:</strong> Mood analysis, nutrition scoring, and comprehensive reports</p>
            <p><strong>4. Sustainability Focus:</strong> Eco-conscious features preparing students for impactful careers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;