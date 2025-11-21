import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Brain, Target, Lightbulb, Users, Heart, Sparkles } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="container mx-auto max-w-6xl space-y-8">
      <BackButton to="/dashboard" />
      
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          About Student Wellness Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Empowering students to achieve academic excellence while maintaining holistic well-being
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-primary" />
              <CardTitle>Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              To revolutionize student learning by integrating AI-powered education tools with wellness tracking, 
              creating a comprehensive platform that supports both academic achievement and personal well-being.
            </p>
            <p className="text-muted-foreground">
              We believe that academic success isn't just about studying harder—it's about studying smarter while 
              maintaining mental, physical, and emotional health.
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-6 h-6 text-accent" />
              <CardTitle>Our Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              To become the leading AI-powered educational platform that transforms how students learn, collaborate, 
              and thrive in their academic journey.
            </p>
            <p className="text-muted-foreground">
              We envision a future where every student has access to personalized AI tutoring, real-time collaboration 
              tools, and wellness support—all in one integrated platform.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            Why Student Wellness Hub?
          </CardTitle>
          <CardDescription>The problem we're solving and why it matters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">The Challenge</h3>
            <p className="text-muted-foreground">
              Students today face unprecedented academic pressure while juggling mental health, nutrition, 
              sustainability awareness, and career preparation. Traditional learning tools focus only on academics, 
              ignoring the holistic needs of modern students.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Our Solution</h3>
            <p className="text-muted-foreground">
              Student Wellness Hub is the first platform to integrate AI-powered education with comprehensive wellness tracking. 
              We combine personalized learning, real-time collaboration, mood tracking, nutrition analysis, and 
              sustainability features into one seamless experience.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">The Impact</h3>
            <p className="text-muted-foreground">
              By addressing both academic performance and personal well-being, we help students achieve better grades, 
              reduce stress, develop healthier habits, and prepare for sustainable, successful careers—all while 
              fostering a supportive learning community.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Users className="w-6 h-6 text-accent" />
            Core Values
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Education First</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Academic excellence through AI-powered personalized learning, collaborative study tools, and adaptive content.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold">Holistic Wellness</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Mental health, nutrition tracking, mood analysis, and stress management integrated into daily learning.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Community & Collaboration</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time study rooms, team challenges, and peer support systems that foster collaborative learning.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <CardHeader>
          <CardTitle>What Makes Us Different?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">AI-Powered Personalization</h4>
                <p className="text-sm text-muted-foreground">
                  Adaptive learning paths, AI-generated study materials, personalized quiz generation, and intelligent study recommendations.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Real-Time Collaboration</h4>
                <p className="text-sm text-muted-foreground">
                  Live study rooms with video, whiteboard, code editor, screen sharing, and synchronized learning experiences.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Integrated Wellness Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Mood analysis, nutrition scoring, stress detection, Pomodoro integration, and comprehensive wellness reports.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold">4</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Sustainability & Social Impact</h4>
                <p className="text-sm text-muted-foreground">
                  Transport tracking, eco-conscious features, and real-world project focus preparing students for impactful careers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;