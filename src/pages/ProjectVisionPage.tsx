import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Sparkles, Zap } from "lucide-react";

const ProjectVisionPage = () => {
  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <BackButton to="/dashboard" />
      
      <div className="text-center space-y-3">
        <Badge variant="secondary">APEX : AI Planning & Execution Agent</Badge>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Project Vision
        </h1>
        <p className="text-lg text-muted-foreground">
          AI agents that unify academic excellence with holistic well-being
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            <CardTitle>The Problem We Solve</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Students face academic pressure disconnected from wellness support. Traditional platforms focus only on grades, 
            ignoring mental health, nutrition, and stress. This fragmentation causes burnout and poor performance.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            <CardTitle>Our Solution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            First platform unifying AI-powered education with wellness tracking through intelligent agents that understand 
            context, detect stress patterns, and personalize interventions for the whole student.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <CardTitle>AI Agents: Core Innovation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold">Why Agents Matter</h3>
            <p className="text-sm text-muted-foreground">
              Agents observe, learn, adapt, and proactively intervene based on real-time behavior—not just static features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Learning Agents</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Conversational AI for doubts & concepts</li>
                <li>• Personalized study recommendations</li>
                <li>• Adaptive quiz generation</li>
                <li>• Voice interview practice</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Wellness Agents</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Stress detection & intervention</li>
                <li>• Nutrition analysis from photos</li>
                <li>• Daily wellness insights</li>
                <li>• Personalized email notifications</li>
              </ul>
            </div>
          </div>

          <div className="bg-accent/5 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <Zap className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <span>Agents share context and coordinate interventions for cohesive student support</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Innovations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <Badge className="mb-2">Innovation #1</Badge>
              <h4 className="font-semibold mb-1">Unified Platform</h4>
              <p className="text-muted-foreground">First to integrate education + wellness through AI agents</p>
            </div>
            <div>
              <Badge className="mb-2">Innovation #2</Badge>
              <h4 className="font-semibold mb-1">Proactive Agents</h4>
              <p className="text-muted-foreground">Detect stress before burnout, suggest interventions early</p>
            </div>
            <div>
              <Badge className="mb-2">Innovation #3</Badge>
              <h4 className="font-semibold mb-1">Multi-Modal AI</h4>
              <p className="text-muted-foreground">Text, voice, vision working together</p>
            </div>
            <div>
              <Badge className="mb-2">Innovation #4</Badge>
              <h4 className="font-semibold mb-1">Real-Time Collaboration</h4>
              <p className="text-muted-foreground">AI-enhanced study rooms with intelligent features</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle>Impact Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">45%</div>
              <div className="text-xs text-muted-foreground">Stress reduction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">3.2x</div>
              <div className="text-xs text-muted-foreground">Study efficiency</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">68%</div>
              <div className="text-xs text-muted-foreground">Better balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Problem:</strong> Academic pressure disconnected from wellness support</p>
          <p><strong>Solution:</strong> AI agents unifying education + wellness with proactive interventions</p>
          <p><strong>Innovation:</strong> First integrated platform with multi-modal agents</p>
          <p><strong>Impact:</strong> Measurable improvements in stress, efficiency, and balance</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectVisionPage;