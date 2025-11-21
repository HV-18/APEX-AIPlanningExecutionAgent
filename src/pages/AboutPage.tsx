import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Brain, Target, Lightbulb, Sparkles, Users, Heart } from "lucide-react";

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>What We Do</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><strong>The Challenge:</strong> Students face academic pressure while juggling mental health, nutrition, and career prep. Traditional tools focus only on academics.</p>
          <p><strong>Our Solution:</strong> First platform integrating AI education with wellness tracking—personalized learning, collaboration, mood tracking, nutrition analysis, and sustainability features.</p>
          <p><strong>The Impact:</strong> Better grades, reduced stress, healthier habits, and career readiness through holistic student support.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <CardTitle>Core Values</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Education First</h4>
              <p className="text-muted-foreground text-xs">AI-powered personalized learning and collaborative tools</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-destructive" />
              </div>
              <h4 className="font-semibold">Holistic Wellness</h4>
              <p className="text-muted-foreground text-xs">Mental health, nutrition, and stress management integrated</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold">Collaboration</h4>
              <p className="text-muted-foreground text-xs">Real-time study rooms and peer support systems</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>What Makes Us Different</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold">1</span>
              </div>
              <p><strong>AI Personalization:</strong> Adaptive learning paths and intelligent recommendations</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-accent font-semibold">2</span>
              </div>
              <p><strong>Real-Time Collaboration:</strong> Live study rooms with video, whiteboard, and code editor</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold">3</span>
              </div>
              <p><strong>Integrated Wellness:</strong> Mood analysis, nutrition scoring, and comprehensive reports</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-accent font-semibold">4</span>
              </div>
              <p><strong>Sustainability Focus:</strong> Eco-conscious features preparing students for impactful careers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;