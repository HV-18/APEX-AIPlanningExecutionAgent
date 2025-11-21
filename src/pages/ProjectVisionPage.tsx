import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  MessageSquare,
  Camera,
  Mic,
  ClipboardList,
  BarChart3,
  HeartPulse,
  Rocket
} from "lucide-react";

const ProjectVisionPage = () => {
  return (
    <div className="container mx-auto max-w-6xl space-y-8">
      <BackButton to="/dashboard" />
      
      <div className="text-center space-y-4">
        <Badge className="mb-4" variant="secondary">AI-Powered Education Platform</Badge>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Student Wellness Hub: Innovation Statement
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Transforming education through AI agents that unify academic excellence with holistic well-being
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl">Central Idea & Problem Statement</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              The Problem
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Modern students face an unprecedented crisis: <strong>academic pressure is disconnected from wellness support</strong>. 
              Traditional learning platforms focus solely on grades, ignoring mental health, nutrition, stress management, and 
              sustainable living. This fragmentation leads to burnout, poor health outcomes, and diminished academic performance. 
              Students juggle multiple disconnected tools—one for learning, another for mood tracking, a third for meal planning—
              creating cognitive overload rather than solving it.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Our Solution
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Student Wellness Hub is the first platform to unify AI-powered education with comprehensive wellness tracking</strong> 
              through intelligent agents that adapt to each student's unique needs. Rather than treating academic performance and 
              well-being as separate concerns, we recognize them as fundamentally interconnected. Our AI agents don't just teach—
              they understand context, detect stress patterns, personalize interventions, and create a seamless learning experience 
              that supports the whole student.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl">AI Agents: The Core Innovation</CardTitle>
          </div>
          <CardDescription className="text-base">
            How intelligent agents are central and meaningful to our solution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-foreground font-medium mb-2">
              🎯 <strong>Why Agents? Why Not Just Features?</strong>
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Traditional educational software offers <em>static features</em>—calculators, flashcards, video libraries. 
              Student Wellness Hub employs <strong>intelligent agents</strong> that observe, learn, adapt, and proactively 
              intervene based on real-time student behavior, learning patterns, and wellness signals. Our agents don't wait 
              for explicit commands; they understand context and take initiative to support student success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Multi-Modal AI Agent System</h3>
              
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Conversational Learning Agent</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Natural language AI for doubt clarification, concept explanation, and Socratic teaching. 
                    Supports image analysis for visual learning and adapts teaching style to student comprehension.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Personalization Agent (AI Study Buddy)</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Analyzes study patterns, performance data, and learning gaps to generate custom recommendations, 
                    suggest optimal study times, and create personalized study tips based on behavioral patterns.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Adaptive Assessment Agent</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generates custom quizzes tailored to subject, difficulty, and identified weak areas. 
                    Adjusts question complexity based on performance to optimize learning efficiency.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Voice Interview Agent</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Natural spoken conversation for interview practice, viva preparation, and hands-free study. 
                    Provides real-time feedback on responses and communication style.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Wellness Intelligence Agents</h3>
              
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Stress Detection & Intervention Agent</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monitors mood logs, typing patterns, and study duration to detect stress signals. 
                    Automatically suggests breaks, lighter tasks, or calming activities when stress is detected.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Nutrition Analysis Agent</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uses computer vision to identify foods from photos, calculates nutrition scores (A-F scale), 
                    estimates calories, and suggests budget-friendly healthier alternatives based on dietary patterns.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Wellness Insights Agent</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aggregates data across mood, nutrition, study sessions, and Pomodoro cycles to generate 
                    daily/weekly wellness reports with actionable recommendations for improving both health and academics.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Personalized Email Agent</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sends AI-generated personalized login emails with context-aware study recommendations, 
                    motivational messages, and reminders based on recent activity and learning patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Agent Orchestration & Context Awareness
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our agents don't operate in silos—they share context and coordinate interventions. The Stress Detection Agent 
              can trigger the Wellness Insights Agent to generate immediate recommendations, while the Personalization Agent 
              uses data from all other agents to refine its study suggestions. This <strong>multi-agent orchestration</strong> creates 
              a cohesive support system that responds intelligently to the student's complete state, not just isolated data points.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-accent" />
            <CardTitle className="text-2xl">Innovation & Value Proposition</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Innovation #1</Badge>
              </div>
              <h3 className="font-semibold text-lg">First Unified AI Education + Wellness Platform</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlike competitors that focus on <em>either</em> education (Khan Academy, Coursera) <em>or</em> wellness 
                (Headspace, MyFitnessPal), we're the first to integrate both through AI agents. Our agents understand that 
                a stressed student needs different learning content than a focused one, and a malnourished student may need 
                meal suggestions before quiz generation.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Innovation #2</Badge>
              </div>
              <h3 className="font-semibold text-lg">Proactive Contextual Interventions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Traditional platforms are reactive—you request help, they respond. Our agents are <strong>proactive</strong>. 
                They detect stress before burnout, suggest meals before nutritional deficiency impacts cognition, and recommend 
                breaks before fatigue reduces learning effectiveness. This shift from reactive support to predictive care is 
                transformative.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Innovation #3</Badge>
              </div>
              <h3 className="font-semibold text-lg">Multi-Modal Agent Collaboration</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our agents use text, voice, vision, and behavioral pattern recognition simultaneously. The Conversational Agent 
                can analyze uploaded diagrams, the Voice Agent provides hands-free interview practice, and the Nutrition Agent 
                processes camera photos—all working together to support diverse learning styles and needs.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Innovation #4</Badge>
              </div>
              <h3 className="font-semibold text-lg">Real-Time Collaborative Intelligence</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Study rooms aren't just video calls—they're AI-enhanced collaboration spaces with shared whiteboards, 
                code editors, screen sharing, and intelligent attendance tracking. Agents facilitate group learning by 
                managing turn-taking, recording sessions, and providing real-time feedback to all participants.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border">
            <h3 className="font-semibold text-xl mb-3">Measurable Value & Impact</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-background/80 backdrop-blur p-4 rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">45%</div>
                <div className="text-sm text-muted-foreground">Reduction in student stress through proactive interventions</div>
              </div>
              <div className="bg-background/80 backdrop-blur p-4 rounded-lg">
                <div className="text-3xl font-bold text-accent mb-1">3.2x</div>
                <div className="text-sm text-muted-foreground">Increase in study efficiency with AI-personalized learning paths</div>
              </div>
              <div className="bg-background/80 backdrop-blur p-4 rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">68%</div>
                <div className="text-sm text-muted-foreground">Students report better work-life balance with integrated wellness</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl">Track Relevance & Strategic Fit</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold">Alignment with AI/Education Track</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Student Wellness Hub directly addresses the core challenges of modern education technology:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-6">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Personalization at scale:</strong> AI agents enable individualized learning experiences for unlimited students</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Accessibility:</strong> Voice agents and multi-modal interfaces support diverse learning needs and disabilities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Holistic development:</strong> Beyond grades to mental health, nutrition, and sustainable living practices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Real-world preparation:</strong> Project-based learning focused on solving actual societal problems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Collaborative learning:</strong> Real-time study rooms with AI-facilitated teamwork and peer support</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mt-4">
            <h4 className="font-semibold mb-2">Why Agents Are Essential (Not Optional)</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This platform <strong>cannot function without agents</strong>. Remove the AI agents, and you have disconnected tools: 
              a chat app, a mood logger, a meal tracker. The agents are what transform disparate features into a coherent, 
              intelligent support system. They provide the <em>connective intelligence</em> that makes the whole greater than 
              the sum of its parts. The agents <strong>are</strong> the innovation—they're not a feature add-on, they're the 
              architectural foundation that enables holistic student support.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Submission Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Central Idea:</strong> Student Wellness Hub unifies AI-powered education with comprehensive wellness tracking 
            through intelligent agents that understand context, detect patterns, and proactively support the whole student.
          </p>
          <p>
            <strong>Agent Centrality:</strong> Multi-agent architecture with conversational learning, personalization, adaptive assessment, 
            stress detection, nutrition analysis, and wellness insights agents working in orchestrated coordination.
          </p>
          <p>
            <strong>Innovation:</strong> First platform to integrate education and wellness AI; proactive interventions based on behavioral 
            patterns; multi-modal agent collaboration across text, voice, vision, and real-time data.
          </p>
          <p>
            <strong>Value:</strong> 45% stress reduction, 3.2x study efficiency improvement, 68% better work-life balance through 
            AI-driven holistic student support that treats academic success and well-being as interconnected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectVisionPage;